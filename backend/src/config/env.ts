import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load both backend and root environment files so local dev and Docker both work.
const envPaths = [
  path.resolve(__dirname, "../.env"),
  path.resolve(__dirname, "../../.env"),
];
for (const envPath of envPaths) {
  dotenv.config({ path: envPath });
}

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
  aiGatewayModel: process.env.AI_GATEWAY_MODEL ?? "gemini-flash-latest",
  googleClientId: process.env.GOOGLE_CLIENT_ID ?? "",
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
  googleRedirectUri: process.env.GOOGLE_REDIRECT_URI ?? "http://localhost:4000/api/auth/google/callback",
};
