import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export interface AuthClaims {
  sub: string;
  role: "admin" | "owner" | "service_center";
}

export function signToken(payload: AuthClaims) {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: "7d" });
}

export function verifyToken(token: string): AuthClaims {
  return jwt.verify(token, env.jwtSecret) as AuthClaims;
}
