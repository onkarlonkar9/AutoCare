import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

const AUTH_TOKEN_KEY = "autocare_backend_token";

const errorLabels: Record<string, string> = {
  google_not_configured: "Google auth is not configured yet.",
  google_code_missing: "Google did not return an auth code.",
  google_token_exchange_failed: "Google token exchange failed.",
  google_token_missing: "Google access token missing.",
  google_userinfo_failed: "Failed to load Google profile.",
  google_email_not_verified: "Your Google email must be verified.",
  account_not_found: "No account found. Please sign up first.",
};

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");
    const error = searchParams.get("error");

    if (token) {
      localStorage.setItem(AUTH_TOKEN_KEY, token);
      window.location.replace("/");
      return;
    }

    if (error) {
      toast.error(errorLabels[error] ?? "Google sign-in failed.");
    }

    navigate("/login", { replace: true });
  }, [navigate, searchParams]);

  return <div className="min-h-screen grid place-items-center text-sm text-muted-foreground">Completing sign-in...</div>;
}
