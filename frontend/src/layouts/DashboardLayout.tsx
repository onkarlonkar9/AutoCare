import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useDashboardTheme } from '@/hooks/useDashboardTheme';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Car, History, BarChart3, Bell, Settings, LogOut,
  Search, ChevronRight, Activity, Calendar, Shield, X, Menu,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { AnimatedBrandLogo } from '@/components/shared/AnimatedBrandLogo';
import { useVehicles, useServiceRecords } from '@/hooks/useData';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

type DashboardVehicle = {
  id: string;
  name: string;
  health_score: number;
  next_service_date: string | null;
};

type DashboardServiceRecord = {
  cost: number | string;
};

const navItems = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Vehicles', url: '/dashboard/vehicles', icon: Car },
  { title: 'Services', url: '/dashboard/services', icon: History },
  { title: 'Analytics', url: '/dashboard/analytics', icon: BarChart3 },
  { title: 'Alerts', url: '/dashboard/notifications', icon: Bell },
  { title: 'Settings', url: '/dashboard/settings', icon: Settings },
  { title: 'Plans', url: '/payment', icon: Shield },
];

function useActiveRoute() {
  const location = useLocation();
  return (url: string) => {
    if (url === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname.startsWith(url);
  };
}

// ===== Right Context Panel =====
function ContextPanel({ vehicles, records, onClose }: {
  vehicles: DashboardVehicle[];
  records: DashboardServiceRecord[];
  onClose: () => void;
}) {
  const avgHealth = vehicles.length > 0
    ? Math.round(vehicles.reduce((a, v) => a + v.health_score, 0) / vehicles.length)
    : 0;
  const upcoming = vehicles.filter((v) => v.next_service_date).length;
  const totalCost = records.reduce((a, r) => a + Number(r.cost), 0);

  return (
    <motion.aside
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="w-[280px] border-l border-border/50 bg-card/50 backdrop-blur-xl flex flex-col overflow-y-auto flex-shrink-0"
    >
      <div className="flex items-center justify-between p-4 border-b border-border/40">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Quick View</span>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Health Overview */}
        <div className="space-y-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Fleet Health</p>
          <div className="glass-card rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-muted-foreground">Average Score</span>
              <span className={`text-lg font-display font-bold ${
                avgHealth >= 80 ? 'text-success' : avgHealth >= 50 ? 'text-warning' : 'text-destructive'
              }`}>{vehicles.length > 0 ? `${avgHealth}%` : '—'}</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-secondary overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${avgHealth}%` }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className={`h-full rounded-full ${
                  avgHealth >= 80 ? 'bg-success' : avgHealth >= 50 ? 'bg-warning' : 'bg-destructive'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="space-y-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Overview</p>
          {[
            { icon: Car, label: 'Vehicles', value: vehicles.length },
            { icon: Activity, label: 'Service Records', value: records.length },
            { icon: Calendar, label: 'Upcoming Services', value: upcoming },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-3 p-2.5 rounded-lg bg-secondary/40">
              <item.icon className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground flex-1">{item.label}</span>
              <span className="text-xs font-semibold">{item.value}</span>
            </div>
          ))}
        </div>

        {/* Spending */}
        <div className="space-y-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Spending</p>
          <div className="glass-card rounded-xl p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">Total Maintenance Cost</p>
            <p className="text-xl font-display font-bold">₹{totalCost.toLocaleString()}</p>
          </div>
        </div>

        {/* Vehicles needing attention */}
        {vehicles.filter((v) => v.health_score < 70).length > 0 && (
          <div className="space-y-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <Shield className="h-3 w-3" /> Needs Attention
            </p>
            {vehicles.filter((v) => v.health_score < 70).slice(0, 3).map((v) => (
              <Link key={v.id} to={`/dashboard/vehicles/${v.id}`}>
                <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-warning/5 border border-warning/10 hover:bg-warning/10 transition-colors">
                  <div className="w-6 h-6 rounded-md bg-warning/10 flex items-center justify-center">
                    <Car className="h-3 w-3 text-warning" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-medium truncate">{v.name}</p>
                    <p className="text-[10px] text-muted-foreground">Score: {v.health_score}</p>
                  </div>
                  <ChevronRight className="h-3 w-3 text-muted-foreground" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </motion.aside>
  );
}

// ===== Main Layout =====
export default function DashboardLayout() {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = useActiveRoute();
  const { data: vehicles = [] } = useVehicles();
  const { data: records = [] } = useServiceRecords();
  const [contextOpen, setContextOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const themeProps = useDashboardTheme();
  const { isTrialExpired } = useAuth();

  useEffect(() => {
    if (isTrialExpired() && location.pathname !== '/payment') {
      toast.error('Your free trial has expired. Please upgrade to continue.');
      navigate('/payment');
    }
  }, [isTrialExpired, navigate, location.pathname]);

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div 
      className={`${themeProps.className} min-h-screen flex flex-col bg-background`}
      style={themeProps.style}
    >
      {/* ===== TOP NAV BAR ===== */}
      <header className="h-12 flex items-center justify-between px-4 border-b border-border/50 bg-card/60 backdrop-blur-xl sticky top-0 z-30 flex-shrink-0">
        {/* Left: Logo + Mobile menu */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileNavOpen(o => !o)}
            className="lg:hidden text-muted-foreground hover:text-foreground"
          >
            <Menu className="h-4.5 w-4.5" />
          </button>
          <Link to="/dashboard" className="flex items-center gap-2.5 font-display font-bold text-sm">
            <AnimatedBrandLogo className="w-8 h-8 rounded-xl border border-white/20" />
            <span className="hidden sm:inline">AutoCare AI</span>
          </Link>
        </div>

        {/* Center: Search */}
        <div className="flex-1 max-w-md mx-4 hidden md:block">
          <button
            onClick={() => toast.info('Search is coming soon.')}
            className="w-full flex items-center gap-2 px-3 py-1.5 rounded-xl bg-secondary/60 text-xs text-muted-foreground hover:bg-secondary transition-colors"
          >
            <Search className="h-3.5 w-3.5" />
            <span>Search vehicles, services...</span>
            <kbd className="ml-auto text-[10px] bg-background/60 px-1.5 py-0.5 rounded font-mono">⌘K</kbd>
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setContextOpen(o => !o)}
            className="hidden lg:flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded-lg hover:bg-secondary transition-colors"
          >
            <Activity className="h-3.5 w-3.5" />
            <span className="hidden xl:inline">Context</span>
          </button>

          <ThemeToggle />

          <Link to="/dashboard/notifications">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-xl relative">
              <Bell className="h-3.5 w-3.5" />
            </Button>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-xl hover:bg-secondary transition-colors">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="bg-secondary text-foreground text-[10px] font-medium">
                    {profile?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs font-medium hidden sm:inline max-w-[80px] truncate">{profile?.name?.split(' ')[0]}</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-xl">
              <div className="px-3 py-2">
                <p className="text-xs font-medium">{profile?.name}</p>
                <p className="text-[10px] text-muted-foreground truncate">{profile?.email || user?.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/dashboard/settings')} className="text-xs">
                <Settings className="h-3.5 w-3.5 mr-2" /> Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} className="text-xs text-destructive">
                <LogOut className="h-3.5 w-3.5 mr-2" /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="flex flex-1 min-h-0">
        {/* ===== LEFT ICON RAIL ===== */}
        <aside className="hidden lg:flex w-16 flex-col items-center py-4 gap-2 border-r border-border/40 bg-card/40 backdrop-blur-sm sticky top-12 self-start max-h-[calc(100vh-3rem)] overflow-y-auto flex-shrink-0">
          {navItems.map(item => {
            const active = isActive(item.url);
            return (
              <Link
                key={item.url}
                to={item.url}
                className={`group relative w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200 ${
                  active
                    ? 'bg-accent/10 text-accent'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                }`}
              >
                <item.icon className="h-[18px] w-[18px]" />
                {active && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full bg-accent"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
                {/* Tooltip */}
                <div className="absolute left-full ml-2 px-2 py-1 rounded-lg bg-foreground text-background text-[10px] font-medium opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                  {item.title}
                </div>
              </Link>
            );
          })}
        </aside>

        {/* ===== MOBILE NAV OVERLAY ===== */}
        <AnimatePresence>
          {mobileNavOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileNavOpen(false)}
                className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40 lg:hidden"
              />
              <motion.aside
                initial={{ x: -200 }}
                animate={{ x: 0 }}
                exit={{ x: -200 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="fixed left-0 top-12 bottom-0 w-56 bg-card border-r border-border/50 z-50 p-4 lg:hidden"
              >
                <nav className="space-y-1">
                  {navItems.map(item => {
                    const active = isActive(item.url);
                    return (
                      <Link
                        key={item.url}
                        to={item.url}
                        onClick={() => setMobileNavOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                          active ? 'bg-accent/10 text-accent font-medium' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                        }`}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.title}
                      </Link>
                    );
                  })}
                </nav>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* ===== MAIN WORKSPACE ===== */}
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>

        {/* ===== RIGHT CONTEXT PANEL ===== */}
        <AnimatePresence>
          {contextOpen && (
            <ContextPanel
              vehicles={vehicles}
              records={records}
              onClose={() => setContextOpen(false)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
