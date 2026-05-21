import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { AnimatedBrandLogo } from '@/components/shared/AnimatedBrandLogo';
import { getDefaultAppRoute } from '@/lib/authRoutes';
import { toast } from 'sonner';
import { API_BASE_URL } from '@/integrations/backend/client';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginMethod] = useState<'password' | 'otp'>('password');
  const [otpSent, setOtpSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const {
    login,
    signInWithOtp,
    verifyOtp,
    isAuthenticated,
    isAccessAllowed,
    loading: authLoading,
    role,
  } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectPath = (location.state as { from?: string } | null)?.from;

  useEffect(() => {
    if (!authLoading && isAuthenticated && isAccessAllowed && role) {
      navigate(redirectPath || getDefaultAppRoute(role), { replace: true });
    }
  }, [authLoading, isAuthenticated, isAccessAllowed, navigate, redirectPath, role]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (loginMethod === 'otp' && !otpSent && cooldown > 0) {
      toast.error(`Please wait ${cooldown} seconds before requesting another OTP.`);
      return;
    }

    setLoading(true);

    let result;
    if (loginMethod === 'password') {
      result = await login(email, password);
    } else if (!otpSent) {
      result = await signInWithOtp(email);
      if (!result.error) {
        setOtpSent(true);
        setCooldown(60);
        toast.success('OTP request successful. Check your email.');

        const timer = setInterval(() => {
          setCooldown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        setLoading(false);
        return;
      }
    } else {
      result = await verifyOtp(email, otp);
    }

    setLoading(false);
    if (result?.error) {
      if (result.error.includes('rate_limit')) {
        toast.error('Too many requests. Please wait a moment.');
      } else {
        toast.error(result.error);
      }
    } else if (result && loginMethod === 'password') {
      toast.success('Signed in successfully.');
    }
  };

  const handleGoogleLogin = () => {
    const url = `${API_BASE_URL}/auth/google/start?intent=login`;
    window.location.assign(url);
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 gradient-primary relative items-center justify-center p-12">
        <div className="text-primary-foreground max-w-md">
          <h2 className="text-3xl font-bold mb-4 flex items-center gap-3">
            <Sparkles className="w-8 h-8" /> Welcome back
          </h2>
          <p className="text-primary-foreground/70 text-lg">
            Your vehicles are waiting. Check maintenance predictions, service history, and more.
          </p>
        </div>
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
      </div>

      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <div className="absolute top-4 right-4"><ThemeToggle /></div>
        <div className="w-full max-w-sm space-y-8">
          <div className="text-center">
            <Link to="/" className="inline-flex items-center gap-3 font-bold text-2xl mb-8 group">
              <AnimatedBrandLogo className="w-14 h-14 rounded-2xl border border-white/10 shadow-lg group-hover:scale-110 transition-transform" />
              <span className="gradient-text">AutoCare AI</span>
            </Link>
            <h1 className="text-3xl font-bold">Sign In</h1>
            <p className="text-muted-foreground text-sm mt-2">Enter your credentials to access your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={otpSent}
              />
            </div>

            {loginMethod === 'password' ? (
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="********"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            ) : otpSent ? (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                <div className="space-y-2">
                  <Label htmlFor="otp">Enter 6-digit OTP</Label>
                  <Input id="otp" placeholder="123456" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value)} required />
                </div>
                <button type="button" onClick={() => setOtpSent(false)} className="text-xs text-primary hover:underline">
                  Resend OTP?
                </button>
              </div>
            ) : null}

            <Button
              type="submit"
              className="w-full py-6 rounded-xl font-bold text-lg gradient-primary text-primary-foreground"
              disabled={loading || (loginMethod === 'otp' && !otpSent && cooldown > 0)}
            >
              {loading ? 'Processing...' : (otpSent ? 'Verify OTP' : (loginMethod === 'otp' ? (cooldown > 0 ? `Wait ${cooldown}s` : 'Send OTP') : 'Sign In'))}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border/50" /></div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-4 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <Button variant="outline" className="w-full py-6 rounded-xl border-border/50 hover:bg-secondary/80 gap-3" onClick={handleGoogleLogin}>
            <svg className="h-5 w-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Google
          </Button>
          <p className="text-center text-xs text-muted-foreground">Continue with Google to sign in.</p>

          <p className="text-center text-sm text-muted-foreground">
            New here?{' '}
            <Link to="/signup" className="text-primary font-bold hover:underline">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
