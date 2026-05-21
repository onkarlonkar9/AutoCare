import dotenv from "dotenv";

dotenv.config();

const required = ["DATABASE_URL", "JWT_SECRET"] as const;
for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing env: ${key}`);
  }
}

export const env = {
  port: Number(process.env.PORT ?? 4000),
  databaseUrl: process.env.DATABASE_URL as string,
  jwtSecret: process.env.JWT_SECRET as string,
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:8080",
  frontendUrl: process.env.FRONTEND_URL ?? "http://localhost:8080",
  aiGatewayUrl: process.env.AI_GATEWAY_URL ?? "",
  aiGatewayApiKey: process.env.AI_GATEWAY_API_KEY ?? "",
  aiGatewayModel: process.env.AI_GATEWAY_MODEL ?? "google/gemini-3-flash-preview",
  googleClientId: process.env.GOOGLE_CLIENT_ID ?? "",
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
  googleRedirectUri: process.env.GOOGLE_REDIRECT_URI ?? "http://localhost:4000/api/auth/google/callback",
};
