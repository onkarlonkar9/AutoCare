export type AppRole = "admin" | "owner" | "service_center";

export interface BackendUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  role: AppRole;
  planName: string;
  subscription: string;
  trialEndsAt: string | null;
  currentPeriodEnd: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  user: BackendUser;
}
