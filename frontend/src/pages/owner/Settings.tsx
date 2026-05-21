import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Badge } from '@/components/ui/badge';

const SettingsPage = () => {
  const { profile, role } = useAuth();
  const { theme } = useTheme();

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground text-sm">Manage your account and preferences</p>
      </div>

      <div className="glass-card rounded-xl p-6 space-y-4">
        <h2 className="font-semibold">Profile</h2>
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <div><span className="text-muted-foreground">Name:</span> <span className="font-medium">{profile?.name || 'Not set'}</span></div>
          <div><span className="text-muted-foreground">Email:</span> <span className="font-medium">{profile?.email || 'Not set'}</span></div>
          <div><span className="text-muted-foreground">Phone:</span> <span className="font-medium">{profile?.phone || 'Not set'}</span></div>
          <div><span className="text-muted-foreground">Role:</span> <Badge variant="outline" className="ml-1 capitalize">{role || 'owner'}</Badge></div>
        </div>
      </div>

      <div className="glass-card rounded-xl p-6 space-y-4">
        <h2 className="font-semibold">Appearance</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm">Theme</p>
            <p className="text-xs text-muted-foreground">Currently using {theme} mode</p>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
