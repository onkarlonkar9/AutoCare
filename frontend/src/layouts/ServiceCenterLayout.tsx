import { useEffect, useMemo, useState } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useDashboardTheme } from '@/hooks/useDashboardTheme';
import { motion, AnimatePresence } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard, ClipboardList, Users, Wrench, Search, BarChart3, Settings,
  LogOut, Bell, Menu, X, Activity, IndianRupee, Clock, ChevronRight, Puzzle, Package,
  Building2, ChevronDown, Check, CircleDot, Shield
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { AnimatedBrandLogo } from '@/components/shared/AnimatedBrandLogo';
import { useJobCards, useMechanics } from '@/hooks/useData';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import {
  DEFAULT_SC_EXTENSION_PACKS,
  DEFAULT_SC_FEATURE_TOGGLES,
  getSCExtensionPacks,
  getSCFeatureToggles,
  SCFeatureKey,
  SCFeatureToggles,
  SCExtensionPacks,
} from '@/lib/featureExtensions';
import type { JobCardRow, MechanicRow } from '@/types/backendRows';
import {
  applyServiceCenterConfigToLocalStorage,
  collectServiceCenterConfigFromLocalStorage,
  loadServiceCenterConfig,
  saveServiceCenterConfigPatch,
} from '@/lib/serviceCenterConfigSync';

type Branch = {
  id: string;
  name: string;
  address: string;
};

const featureNavItems: Array<{ title: string; url: string; icon: LucideIcon; featureKey: SCFeatureKey }> = [
  { title: 'Dashboard', url: '/service-center', icon: LayoutDashboard, featureKey: 'dashboard' },
  { title: 'Job Cards', url: '/service-center/jobs', icon: ClipboardList, featureKey: 'jobs' },
  { title: 'Customers', url: '/service-center/customers', icon: Users, featureKey: 'customers' },
  { title: 'Mechanics', url: '/service-center/mechanics', icon: Wrench, featureKey: 'mechanics' },
  { title: 'Lookup', url: '/service-center/lookup', icon: Search, featureKey: 'lookup' },
  { title: 'Analytics', url: '/service-center/analytics', icon: BarChart3, featureKey: 'analytics' },
  { title: 'Supplies', url: '/service-center/supplies', icon: Package, featureKey: 'inventory' },
];

const systemNavItems = [
  { title: 'Settings', url: '/service-center/settings', icon: Settings },
  { title: 'Extensions', url: '/service-center/extensions', icon: Puzzle },
  { title: 'Alignment', url: '/service-center/wheel-alignment', icon: CircleDot },
  { title: 'Plans', url: '/payment', icon: Shield },
];

function useActiveRoute() {
  const location = useLocation();
  return (url: string) => {
    if (url === '/service-center') return location.pathname === '/service-center';
    return location.pathname.startsWith(url);
  };
}

// ===== Right Context Panel =====
function WorkshopContextPanel({ jobs, mechanics, onClose }: {
  jobs: JobCardRow[];
  mechanics: MechanicRow[];
  onClose: () => void;
}) {
  const activeJobs = jobs.filter((j) => j.status !== 'delivered');
  const pendingJobs = jobs.filter((j) => j.status === 'pending');
  const availableMechanics = mechanics.filter((m) => m.status === 'available');
  const totalRevenue = jobs.filter((j) => j.actual_cost).reduce((a: number, j) => a + Number(j.actual_cost || 0), 0);

  return (
    <motion.aside
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="w-[280px] border-l border-border/50 bg-card/50 backdrop-blur-xl flex flex-col overflow-y-auto flex-shrink-0"
    >
      <div className="flex items-center justify-between p-4 border-b border-border/40">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Workshop</span>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Job Overview */}
        <div className="space-y-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Today's Overview</p>
          {[
            { icon: ClipboardList, label: 'Active Jobs', value: activeJobs.length, color: 'text-accent' },
            { icon: Clock, label: 'Pending', value: pendingJobs.length, color: 'text-warning' },
            { icon: Wrench, label: 'Available Mechanics', value: availableMechanics.length, color: 'text-success' },
            { icon: IndianRupee, label: 'Revenue', value: `₹${totalRevenue.toLocaleString()}`, color: 'text-foreground' },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-3 p-2.5 rounded-lg bg-secondary/40">
              <item.icon className={`h-3.5 w-3.5 ${item.color}`} />
              <span className="text-xs text-muted-foreground flex-1">{item.label}</span>
              <span className="text-xs font-semibold">{item.value}</span>
            </div>
          ))}
        </div>

        {/* Pending Jobs */}
        {pendingJobs.length > 0 && (
          <div className="space-y-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">⚡ Pending Jobs</p>
            {pendingJobs.slice(0, 4).map((job) => (
              <Link key={job.id} to={`/service-center/jobs/${job.id}`}>
                <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-warning/5 border border-warning/10 hover:bg-warning/10 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-medium truncate">{job.customer_name}</p>
                    <p className="text-[10px] text-muted-foreground font-mono">{job.vehicle_number}</p>
                  </div>
                  <ChevronRight className="h-3 w-3 text-muted-foreground" />
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Mechanic Status */}
        {mechanics.length > 0 && (
          <div className="space-y-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Team</p>
            {mechanics.slice(0, 5).map((m) => (
              <div key={m.id} className="flex items-center gap-2.5 p-2 rounded-lg">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  m.status === 'available' ? 'bg-success' : m.status === 'busy' ? 'bg-warning' : 'bg-muted-foreground'
                }`} />
                <span className="text-[11px] flex-1 truncate">{m.name}</span>
                <Badge variant="outline" className="text-[9px] h-4 capitalize">{m.status.replace('_', ' ')}</Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.aside>
  );
}

// ===== Main Layout =====
export default function ServiceCenterLayout() {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();
  const isActive = useActiveRoute();
  const { data: jobs = [] } = useJobCards();
  const { data: mechanics = [] } = useMechanics();
  const [contextOpen, setContextOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [featureToggles, setFeatureToggles] = useState<SCFeatureToggles>(DEFAULT_SC_FEATURE_TOGGLES);
  const [extensionPacks, setExtensionPacks] = useState<SCExtensionPacks>(DEFAULT_SC_EXTENSION_PACKS);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [currentBranchId, setCurrentBranchId] = useState<string>('1');
  const themeProps = useDashboardTheme();
  const { isTrialExpired } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (isTrialExpired() && location.pathname !== '/payment') {
      toast.error('Your workshop trial has expired. Please upgrade to keep your business running.');
      navigate('/payment');
    }
  }, [isTrialExpired, navigate, location.pathname]);
  
  const currentBranch = useMemo<Branch>(() =>
    branches.find(b => b.id === currentBranchId) || branches[0] || { id: 'main', name: 'Main Workshop', address: '' }
  , [branches, currentBranchId]);

  useEffect(() => {
    setFeatureToggles(getSCFeatureToggles());
    setExtensionPacks(getSCExtensionPacks());

    const loadBranches = () => {
      const raw = localStorage.getItem('sc-multi-branch-config-v1');
      if (!raw) return;
      try {
        const parsed = JSON.parse(raw) as Branch[];
        if (Array.isArray(parsed)) setBranches(parsed);
      } catch {
        setBranches([]);
      }
    };
    loadBranches();

    const syncToggles = () => {
      setFeatureToggles(getSCFeatureToggles());
      setExtensionPacks(getSCExtensionPacks());
      loadBranches();
    };
    window.addEventListener('storage', syncToggles);
    window.addEventListener('sc-feature-toggles-updated', syncToggles as EventListener);
    return () => {
      window.removeEventListener('storage', syncToggles);
      window.removeEventListener('sc-feature-toggles-updated', syncToggles as EventListener);
    };
  }, []);

  useEffect(() => {
    if (!user) return;

    let stopped = false;
    let lastSnapshot = '';

    const syncFromBackend = async () => {
      const remote = await loadServiceCenterConfig();
      if (stopped) return;
      if (remote) {
        applyServiceCenterConfigToLocalStorage(remote);
        window.dispatchEvent(new CustomEvent('sc-feature-toggles-updated'));
        window.dispatchEvent(new CustomEvent('sc-extension-packs-updated'));
      }
    };

    const syncToBackend = async () => {
      const snapshot = collectServiceCenterConfigFromLocalStorage();
      const nextSerialized = JSON.stringify(snapshot);
      if (nextSerialized === lastSnapshot) return;
      lastSnapshot = nextSerialized;
      await saveServiceCenterConfigPatch(snapshot);
    };

    void syncFromBackend();
    const interval = window.setInterval(() => {
      void syncToBackend();
    }, 5000);

    return () => {
      stopped = true;
      window.clearInterval(interval);
    };
  }, [user]);

  const navItems = useMemo(() => {
    const enabledFeatures = featureNavItems.filter((item) => featureToggles[item.featureKey]);
    return [...enabledFeatures, ...systemNavItems];
  }, [featureToggles]);

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div 
      className={`${themeProps.className} min-h-screen flex flex-col bg-background`}
      style={themeProps.style}
    >
      {/* ===== TOP NAV BAR ===== */}
      <header className="h-12 flex items-center justify-between px-4 border-b border-border/50 bg-card/60 backdrop-blur-xl sticky top-0 z-30 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => setMobileNavOpen(o => !o)} className="lg:hidden text-muted-foreground hover:text-foreground">
            <Menu className="h-4.5 w-4.5" />
          </button>
          <Link to="/service-center" className="flex items-center gap-2.5 font-display font-bold text-sm">
            <AnimatedBrandLogo className="w-8 h-8 rounded-xl border border-white/20" />
            <span className="hidden sm:inline">AutoCare Pro</span>
          </Link>

          {/* Branch Switcher (Conditional) */}
          {extensionPacks.multiBranchManagement && branches.length > 0 && (
            <div className="hidden sm:block ml-2 pl-2 border-l border-border/40">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-secondary/60 transition-colors group">
                    <div className="p-1 rounded bg-primary/10 text-primary">
                      <Building2 className="h-3 w-3" />
                    </div>
                    <div className="text-left hidden xl:block">
                      <p className="text-[10px] uppercase font-bold text-muted-foreground leading-none mb-0.5">Location</p>
                      <p className="text-[11px] font-bold leading-none truncate max-w-[120px]">{currentBranch.name}</p>
                    </div>
                    <ChevronDown className="h-3 w-3 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56 rounded-xl p-1.5">
                  <p className="text-[10px] font-bold text-muted-foreground px-2 py-1.5 uppercase tracking-wider">Switch Workshop Branch</p>
                  {branches.map(branch => (
                    <DropdownMenuItem 
                      key={branch.id} 
                      onClick={() => {
                        setCurrentBranchId(branch.id);
                        toast.success(`Switched to ${branch.name}`);
                      }}
                      className="rounded-lg flex items-center justify-between"
                    >
                      <div className="flex flex-col">
                        <span className="text-xs font-medium">{branch.name}</span>
                        <span className="text-[10px] text-muted-foreground">{branch.address.split(',')[0]}</span>
                      </div>
                      {currentBranchId === branch.id && <Check className="h-3 w-3 text-primary" />}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/service-center/extensions')} className="text-xs text-primary font-medium">
                    <Puzzle className="h-3.5 w-3.5 mr-2" /> Manage Branches
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        <div className="flex-1 max-w-md mx-4 hidden md:block">
          <div className="w-full flex items-center gap-2 px-3 py-1.5 rounded-xl bg-secondary/60 text-xs text-muted-foreground">
            <Search className="h-3.5 w-3.5" />
            <span>Search jobs, customers...</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setContextOpen(o => !o)}
            className="hidden lg:flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded-lg hover:bg-secondary transition-colors"
          >
            <Activity className="h-3.5 w-3.5" />
            <span className="hidden xl:inline">Workshop</span>
          </button>

          <ThemeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-xl hover:bg-secondary transition-colors">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="bg-secondary text-foreground text-[10px] font-medium">
                    {profile?.name?.split(' ').map(n => n[0]).join('') || 'SC'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs font-medium hidden sm:inline max-w-[80px] truncate">{profile?.name?.split(' ')[0]}</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-xl">
              <div className="px-3 py-2">
                <p className="text-xs font-medium">{profile?.name || 'Service Center'}</p>
                <p className="text-[10px] text-muted-foreground truncate">{profile?.email || user?.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/service-center/settings')} className="text-xs">
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
        <aside className="hidden lg:flex w-14 flex-col items-center py-3 gap-1 border-r border-border/40 bg-card/30 flex-shrink-0">
          {/* Sidebar Branch Switcher */}
          {extensionPacks.multiBranchManagement && branches.length > 0 && (
            <div className="mb-2 pb-2 border-b border-border/40 w-full flex justify-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-all group relative">
                    <Building2 className="h-5 w-5 transition-transform group-hover:scale-110" />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-background rounded-full border border-border flex items-center justify-center">
                      <ChevronDown className="h-2 w-2 text-muted-foreground" />
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="right" align="start" className="w-56 rounded-xl p-1.5 ml-2">
                  <p className="text-[10px] font-bold text-muted-foreground px-2 py-1.5 uppercase tracking-wider">Switch Workshop Branch</p>
                  {branches.map(branch => (
                    <DropdownMenuItem 
                      key={branch.id} 
                      onClick={() => {
                        setCurrentBranchId(branch.id);
                        toast.success(`Switched to ${branch.name}`);
                      }}
                      className="rounded-lg flex items-center justify-between"
                    >
                      <div className="flex flex-col">
                        <span className="text-xs font-medium">{branch.name}</span>
                        <span className="text-[10px] text-muted-foreground">{branch.address.split(',')[0]}</span>
                      </div>
                      {currentBranchId === branch.id && <Check className="h-3 w-3 text-primary" />}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/service-center/extensions')} className="text-xs text-primary font-medium">
                    <Puzzle className="h-3.5 w-3.5 mr-2" /> Manage Branches
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          {navItems.map(item => {
            const active = isActive(item.url);
            return (
              <Link
                key={item.url}
                to={item.url}
                className={`group relative w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200 ${
                  active ? 'bg-accent/10 text-accent' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                }`}
              >
                <item.icon className="h-[18px] w-[18px]" />
                {active && (
                  <motion.div
                    layoutId="sc-nav-indicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full bg-accent"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
                <div className="absolute left-full ml-2 px-2 py-1 rounded-lg bg-foreground text-background text-[10px] font-medium opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                  {item.title}
                </div>
              </Link>
            );
          })}
        </aside>

        {/* ===== MOBILE NAV ===== */}
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
            <WorkshopContextPanel
              jobs={jobs}
              mechanics={mechanics}
              onClose={() => setContextOpen(false)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
