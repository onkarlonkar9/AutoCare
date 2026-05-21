import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../services/jwt.js";

export type AppRole = "admin" | "owner" | "service_center";

export interface AuthenticatedRequest extends Request {
  auth?: {
    userId: string;
    role: AppRole;
  };
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "Missing auth token" });
  }

  try {
    const claims = verifyToken(token);
    req.auth = { userId: claims.sub, role: claims.role };
    return next();
  } catch {
    return res.status(401).json({ error: "Invalid auth token" });
  }
}

export function requireRole(...roles: AppRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.auth) return res.status(401).json({ error: "Unauthenticated" });
    if (!roles.includes(req.auth.role)) return res.status(403).json({ error: "Forbidden" });
    return next();
  };
}
