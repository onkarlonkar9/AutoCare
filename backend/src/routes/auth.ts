import { Router } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "../config/prisma.js";
import { env } from "../config/env.js";
import { signToken } from "../services/jwt.js";
import { requireAuth, AuthenticatedRequest } from "../middleware/auth.js";
import { sanitizeUser } from "../utils/serializers.js";

const router = Router();

const signupSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["admin", "owner", "service_center"]),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const googleStartSchema = z.object({
  intent: z.enum(["signup", "login"]).default("login"),
  role: z.enum(["owner", "service_center"]).optional(),
});

function ensureGoogleConfigured() {
  return Boolean(env.googleClientId && env.googleClientSecret && env.googleRedirectUri);
}

router.get("/google/start", async (req, res) => {
  if (!ensureGoogleConfigured()) {
    return res.status(500).json({ error: "Google auth is not configured on backend" });
  }

  const parsed = googleStartSchema.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const nonce = crypto.randomBytes(12).toString("hex");
  const statePayload = {
    nonce,
    intent: parsed.data.intent,
    role: parsed.data.role ?? "owner",
  };
  const state = Buffer.from(JSON.stringify(statePayload)).toString("base64url");

  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", env.googleClientId);
  url.searchParams.set("redirect_uri", env.googleRedirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("prompt", "select_account");
  url.searchParams.set("state", state);

  return res.redirect(url.toString());
});

router.get("/google/callback", async (req, res) => {
  if (!ensureGoogleConfigured()) {
    return res.redirect(`${env.frontendUrl}/login?error=google_not_configured`);
  }

  const code = typeof req.query.code === "string" ? req.query.code : "";
  const state = typeof req.query.state === "string" ? req.query.state : "";
  if (!code) return res.redirect(`${env.frontendUrl}/login?error=google_code_missing`);

  let role: "owner" | "service_center" = "owner";
  let intent: "signup" | "login" = "login";
  try {
    if (state) {
      const decoded = JSON.parse(Buffer.from(state, "base64url").toString("utf8")) as {
        role?: "owner" | "service_center";
        intent?: "signup" | "login";
      };
      role = decoded.role === "service_center" ? "service_center" : "owner";
      intent = decoded.intent === "signup" ? "signup" : "login";
    }
  } catch {
    // Ignore bad state; fallback defaults.
  }

  const tokenResp = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: env.googleClientId,
      client_secret: env.googleClientSecret,
      code,
      grant_type: "authorization_code",
      redirect_uri: env.googleRedirectUri,
    }),
  });

  if (!tokenResp.ok) return res.redirect(`${env.frontendUrl}/login?error=google_token_exchange_failed`);

  const tokenData = (await tokenResp.json()) as { access_token?: string };
  const accessToken = tokenData.access_token;
  if (!accessToken) return res.redirect(`${env.frontendUrl}/login?error=google_token_missing`);

  const userResp = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!userResp.ok) return res.redirect(`${env.frontendUrl}/login?error=google_userinfo_failed`);

  const userInfo = (await userResp.json()) as {
    email?: string;
    name?: string;
    picture?: string;
    email_verified?: boolean;
  };

  if (!userInfo.email || !userInfo.email_verified) {
    return res.redirect(`${env.frontendUrl}/login?error=google_email_not_verified`);
  }

  const existing = await prisma.user.findUnique({ where: { email: userInfo.email } });
  if (intent === "login" && !existing) {
    return res.redirect(`${env.frontendUrl}/signup?error=account_not_found`);
  }

  const user = existing ?? await prisma.user.create({
    data: {
      name: userInfo.name?.trim() || userInfo.email.split("@")[0] || "Google User",
      email: userInfo.email,
      phone: null,
      avatarUrl: userInfo.picture ?? null,
      passwordHash: await bcrypt.hash(crypto.randomBytes(24).toString("hex"), 12),
      role,
      trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
  });

  const token = signToken({ sub: user.id, role: user.role });
  return res.redirect(`${env.frontendUrl}/auth/callback?token=${encodeURIComponent(token)}`);
});

router.post("/signup", async (req, res) => {
  const parsed = signupSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { name, email, password, role } = parsed.data;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(409).json({ error: "Email already exists" });

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role,
      trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
  });

  const token = signToken({ sub: user.id, role: user.role });
  return res.status(201).json({ token, user: sanitizeUser(user) });
});

router.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  const token = signToken({ sub: user.id, role: user.role });
  return res.json({ token, user: sanitizeUser(user) });
});

router.get("/me", requireAuth, async (req: AuthenticatedRequest, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.auth!.userId } });
  if (!user) return res.status(404).json({ error: "User not found" });
  return res.json({ user: sanitizeUser(user) });
});

export default router;
