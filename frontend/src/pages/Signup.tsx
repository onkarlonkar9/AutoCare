import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
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

type SignupRole = 'owner' | 'service_center' | 'admin';

const Signup = () => {
  const [searchParams] = useSearchParams();
  const defaultRole = (searchParams.get('role') as SignupRole) || 'owner';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<SignupRole>(defaultRole);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { signup, isAuthenticated, isAccessAllowed, loading: authLoading, role: appRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && isAuthenticated && isAccessAllowed && appRole) {
      navigate(getDefaultAppRoute(appRole), { replace: true });
    }
  }, [appRole, authLoading, isAuthenticated, isAccessAllowed, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);

    const result = await signup(name, email, password, role);
    setLoading(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Account created. Check your email if verification is required.');
    }
  };

  const handleGoogleSignup = () => {
    const url = `${API_BASE_URL}/auth/google/start?intent=signup&role=${encodeURIComponent(role)}`;
    window.location.assign(url);
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 gradient-primary relative items-center justify-center p-12">
        <div className="text-primary-foreground max-w-md">
          <h2 className="text-3xl font-bold mb-4 flex items-center gap-3">
            <Sparkles className="w-8 h-8" /> Join AutoCare AI
          </h2>
          <p className="text-primary-foreground/70 text-lg">
            Start tracking your vehicle maintenance with AI-powered predictions and smart reminders.
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
            <h1 className="text-3xl font-bold">Create Account</h1>
            <p className="text-muted-foreground text-sm mt-2">Choose your account type to get started</p>
          </div>

          <div className="flex p-1 bg-secondary/50 rounded-xl">
            <button
              type="button"
              onClick={() => setRole('owner')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${role === 'owner' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'}`}
            >
              Owner
            </button>
            <button
              type="button"
              onClick={() => setRole('service_center')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${role === 'service_center' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'}`}
            >
              Workshop
            </button>
            <button
              type="button"
              onClick={() => setRole('admin')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${role === 'admin' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'}`}
            >
              Admin
            </button>
          </div>
          {role === 'admin' && (
            <p className="text-xs text-primary-foreground mt-2">
              Admin accounts receive full access to all features and plans without payment.
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{role === 'service_center' ? 'Business Name' : 'Full Name'}</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder={role === 'service_center' ? 'Workshop name' : 'John Doe'} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Create Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="********"
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full py-6 rounded-xl font-bold text-lg gradient-primary text-primary-foreground" disabled={loading}>
              {loading ? 'Processing...' : 'Create Account'}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border/50" /></div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-4 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <Button variant="outline" className="w-full py-6 rounded-xl border-border/50 hover:bg-secondary/80 gap-3" onClick={handleGoogleSignup}>
            <svg className="h-5 w-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Google
          </Button>
          <p className="text-center text-xs text-muted-foreground">Continue with Google to create your account.</p>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-bold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
