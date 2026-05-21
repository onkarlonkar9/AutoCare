import { useMemo, useState } from 'react';
import { 
  Puzzle, 
  Settings2, 
  Link as LinkIcon, 
  LayoutDashboard, 
  Radar, 
  FileText, 
  Palette, 
  Type, 
  Search, 
  ChevronRight, 
  GripVertical, 
  Users, 
  Wrench, 
  Car, 
  ClipboardList, 
  BarChart,
  ArrowRight,
  Sparkles,
  Zap,
  Building2,
  Trash2,
  MapPin,
  Phone
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  DEFAULT_SC_EXTENSION_PACKS,
  DEFAULT_SC_FEATURE_TOGGLES,
  getSCExtensionPacks,
  getSCFeatureToggles,
  SC_FEATURES,
  SC_EXTENSIONS,
  SCExtensionPacks,
  SCFeatureKey,
  SCFeatureToggles,
  SCExtensionKey,
  setSCExtensionPacks,
  setSCFeatureToggles,
} from '@/lib/featureExtensions';
import {
  DASHBOARD_THEME_PRESETS,
  persistDashboardThemeConfig,
  type DashboardThemeConfig,
  type DashboardThemePreset,
  getDashboardThemeConfig,
} from '@/lib/dashboardTheme';
import { ThemeCustomizerPanel } from '@/components/service-center/theme/ThemeCustomizerPanel';

const ALIGNMENT_MACHINE_CONFIG_KEY = 'sc-wheel-alignment-machine-config-v1';
const ANALYTICS_REPORT_CONFIG_KEY = 'sc-analytics-report-config-v1';

type ExtensionDialogKey =
  | 'dashboardLayoutDragDrop'
  | 'wheelAlignmentMachineConnect'
  | 'workshopAnalyticsReportGenerator'
  | 'dashboardThemeCustomizer'
  | 'serviceBayCustomNames'
  | 'multiBranchManagement'
  | 'advancedVehicleDiagnostics'
  | null;

type WheelMachineConfig = {
  endpoint: string;
  apiKey: string;
  machineName: string;
};

const DEFAULT_WHEEL_MACHINE_CONFIG: WheelMachineConfig = {
  endpoint: '',
  apiKey: '',
  machineName: '',
};

type AnalyticsReportConfig = {
  reportTitle: string;
  includeRecommendations: boolean;
  generatedBy: string;
};

const DEFAULT_ANALYTICS_REPORT_CONFIG: AnalyticsReportConfig = {
  reportTitle: 'Workshop Analytics Report',
  includeRecommendations: true,
  generatedBy: 'Workshop Admin',
};

const ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard,
  ClipboardList,
  Users,
  Wrench,
  Car,
  BarChart,
  GripVertical,
  Radar,
  FileText,
  Palette,
  Type,
  Building2
};

const BRANCHES_CONFIG_KEY = 'sc-multi-branch-config-v1';

type BranchInfo = {
  id: string;
  name: string;
  address: string;
  phone: string;
  isMain: boolean;
};

const DEFAULT_BRANCHES: BranchInfo[] = [
  { id: '1', name: 'Main Workshop HQ', address: '123 Tech Park, North', phone: '+91 98765 43210', isMain: true },
];

const Extensions = () => {
  const [toggles, setToggles] = useState<SCFeatureToggles>(() => getSCFeatureToggles());
  const [extensionPacks, setExtensionPacks] = useState<SCExtensionPacks>(() => getSCExtensionPacks());
  const [activeDialog, setActiveDialog] = useState<ExtensionDialogKey>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [wheelMachineConfig, setWheelMachineConfig] = useState<WheelMachineConfig>(() => {
    try {
      const raw = localStorage.getItem(ALIGNMENT_MACHINE_CONFIG_KEY);
      if (!raw) return DEFAULT_WHEEL_MACHINE_CONFIG;
      const parsed = JSON.parse(raw) as Partial<WheelMachineConfig>;
      return {
        endpoint: parsed.endpoint || '',
        apiKey: parsed.apiKey || '',
        machineName: parsed.machineName || '',
      };
    } catch {
      localStorage.removeItem(ALIGNMENT_MACHINE_CONFIG_KEY);
      return DEFAULT_WHEEL_MACHINE_CONFIG;
    }
  });

  const [analyticsReportConfig, setAnalyticsReportConfig] = useState<AnalyticsReportConfig>(() => {
    try {
      const raw = localStorage.getItem(ANALYTICS_REPORT_CONFIG_KEY);
      if (!raw) return DEFAULT_ANALYTICS_REPORT_CONFIG;
      const parsed = JSON.parse(raw) as Partial<AnalyticsReportConfig>;
      return {
        reportTitle: parsed.reportTitle || DEFAULT_ANALYTICS_REPORT_CONFIG.reportTitle,
        includeRecommendations: parsed.includeRecommendations ?? DEFAULT_ANALYTICS_REPORT_CONFIG.includeRecommendations,
        generatedBy: parsed.generatedBy || DEFAULT_ANALYTICS_REPORT_CONFIG.generatedBy,
      };
    } catch {
      localStorage.removeItem(ANALYTICS_REPORT_CONFIG_KEY);
      return DEFAULT_ANALYTICS_REPORT_CONFIG;
    }
  });

  const [branches, setBranches] = useState<BranchInfo[]>(() => {
    try {
      const raw = localStorage.getItem(BRANCHES_CONFIG_KEY);
      if (!raw) return DEFAULT_BRANCHES;
      return JSON.parse(raw);
    } catch {
      return DEFAULT_BRANCHES;
    }
  });
  
  const [newBranch, setNewBranch] = useState<Partial<BranchInfo>>({ name: '', address: '', phone: '' });
  
  const [dashboardThemeConfig, setDashboardThemeConfig] = useState<DashboardThemeConfig>(() => getDashboardThemeConfig());

  const stats = useMemo(() => {
    const modulesCount = Object.values(toggles).filter(Boolean).length;
    const extensionsCount = Object.values(extensionPacks).filter(Boolean).length;
    const totalEnabled = modulesCount + extensionsCount;
    const completionPercentage = Math.round((totalEnabled / (SC_FEATURES.length + SC_EXTENSIONS.length)) * 100);
    
    return {
      modulesCount,
      extensionsCount,
      totalEnabled,
      completionPercentage
    };
  }, [toggles, extensionPacks]);

  const filteredFeatures = useMemo(() => {
    return SC_FEATURES.filter(f => 
      f.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
      f.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const filteredExtensions = useMemo(() => {
    return SC_EXTENSIONS.filter(e => 
      e.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
      e.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const updateToggle = (key: SCFeatureKey, value: boolean) => {
    const next = { ...toggles, [key]: value };
    setToggles(next);
    setSCFeatureToggles(next);
    toast.success(value ? `${key.charAt(0).toUpperCase() + key.slice(1)} module enabled` : `${key.charAt(0).toUpperCase() + key.slice(1)} module disabled`);
  };

  const handleEnableAll = () => {
    setToggles(DEFAULT_SC_FEATURE_TOGGLES);
    setSCFeatureToggles(DEFAULT_SC_FEATURE_TOGGLES);
    setExtensionPacks(DEFAULT_SC_EXTENSION_PACKS);
    setSCExtensionPacks(DEFAULT_SC_EXTENSION_PACKS);
    toast.success('All professional features enabled');
  };

  const handleDisableAll = () => {
    const next: SCFeatureToggles = {
      dashboard: false,
      jobs: false,
      customers: false,
      mechanics: false,
      lookup: false,
      analytics: false,
      inventory: false,
    };

    setToggles(next);
    setSCFeatureToggles(next);
    setExtensionPacks(DEFAULT_SC_EXTENSION_PACKS);
    setSCExtensionPacks(DEFAULT_SC_EXTENSION_PACKS);
    toast.success('All feature modules disabled');
  };

  const updateExtensionPack = (key: SCExtensionKey, value: boolean, options?: { silent?: boolean }) => {
    const next = { ...extensionPacks, [key]: value };
    setExtensionPacks(next);
    setSCExtensionPacks(next);
    if (!options?.silent) {
      toast.success(value ? 'Extension activated' : 'Extension deactivated');
    }
  };

  const saveWheelMachineDetails = (enabled: boolean) => {
    if (enabled && !wheelMachineConfig.endpoint.trim()) {
      toast.error('Machine endpoint link is required');
      return;
    }
    updateExtensionPack('wheelAlignmentMachineConnect', enabled);
    localStorage.setItem(ALIGNMENT_MACHINE_CONFIG_KEY, JSON.stringify(wheelMachineConfig));
    setActiveDialog(null);
  };

  const saveAnalyticsReportDetails = (enabled: boolean) => {
    if (enabled && !analyticsReportConfig.reportTitle.trim()) {
      toast.error('Report title is required');
      return;
    }
    updateExtensionPack('workshopAnalyticsReportGenerator', enabled);
    localStorage.setItem(ANALYTICS_REPORT_CONFIG_KEY, JSON.stringify(analyticsReportConfig));
    setActiveDialog(null);
  };

  const applyThemePreset = (preset: DashboardThemePreset) => {
    const config = DASHBOARD_THEME_PRESETS[preset];
    const next = { preset, ...config };
    setDashboardThemeConfig(next);
    updateExtensionPack('dashboardThemeCustomizer', true, { silent: true });
    persistDashboardThemeConfig(next);
    window.dispatchEvent(new CustomEvent('sc-dashboard-theme-config-updated'));
  };

  const updateDashboardThemeConfig = (next: DashboardThemeConfig) => {
    setDashboardThemeConfig(next);
    updateExtensionPack('dashboardThemeCustomizer', true, { silent: true });
    persistDashboardThemeConfig(next);
    window.dispatchEvent(new CustomEvent('sc-dashboard-theme-config-updated'));
  };

  const saveDashboardThemeDetails = (enabled: boolean) => {
    updateExtensionPack('dashboardThemeCustomizer', enabled);
    setActiveDialog(null);
  };

  const addBranch = () => {
    if (!newBranch.name || !newBranch.address) {
      toast.error('Name and address are required');
      return;
    }
    const branch: BranchInfo = {
      id: Math.random().toString(36).substr(2, 9),
      name: newBranch.name!,
      address: newBranch.address!,
      phone: newBranch.phone || '',
      isMain: false,
    };
    const next = [...branches, branch];
    setBranches(next);
    localStorage.setItem(BRANCHES_CONFIG_KEY, JSON.stringify(next));
    setNewBranch({ name: '', address: '', phone: '' });
    toast.success('Branch added successfully');
  };

  const removeBranch = (id: string) => {
    const next = branches.filter(b => b.id !== id);
    setBranches(next);
    localStorage.setItem(BRANCHES_CONFIG_KEY, JSON.stringify(next));
    toast.success('Branch removed');
  };

  const saveBranchDetails = (enabled: boolean) => {
    updateExtensionPack('multiBranchManagement', enabled);
    setActiveDialog(null);
  };

  const toggleAll = (type: 'features' | 'extensions', value: boolean) => {
    if (type === 'features') {
      const next = { ...toggles };
      Object.keys(next).forEach(k => next[k as SCFeatureKey] = value);
      setToggles(next);
      setSCFeatureToggles(next);
    } else {
      const next = { ...extensionPacks };
      Object.keys(next).forEach(k => next[k as SCExtensionKey] = value);
      setExtensionPacks(next);
      setSCExtensionPacks(next);
    }
    toast.success(`All ${type} ${value ? 'enabled' : 'disabled'}`);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 max-w-7xl pb-20"
    >
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Extension Options</h1>
          </div>
          <p className="text-muted-foreground flex items-center gap-1.5">
            Personalize your workshop experience with modular feature packs.
            <Badge variant="secondary" className="ml-2 bg-primary/5 text-primary text-[10px] uppercase font-bold tracking-wider">PRO</Badge>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search features..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-11 rounded-xl glass-card border-none ring-1 ring-border/40 focus-visible:ring-primary/40"
            />
          </div>
          <Button onClick={handleEnableAll} variant="outline" className="h-11 rounded-xl px-4 gap-2 border-none ring-1 ring-border/40 hover:bg-primary/5">
            <Zap className="h-4 w-4 text-amber-500 fill-amber-500" /> Enable All
          </Button>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Feature Access', value: stats.modulesCount, icon: Settings2, color: 'text-blue-500' },
          { label: 'Active Extensions', value: stats.extensionsCount, icon: Puzzle, color: 'text-emerald-500' },
          { label: 'Total Syncs', value: stats.totalEnabled, icon: LinkIcon, color: 'text-purple-500' },
          { label: 'Completion', value: stats.completionPercentage + '%', icon: Zap, color: 'text-amber-500' },
        ].map((stat, i) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card rounded-2xl p-5 border-none ring-1 ring-border/40"
          >
            <div className="flex items-center justify-between mb-2">
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
              {i === 3 && (
                <div className="h-1.5 w-16 bg-muted rounded-full overflow-hidden">
                   <div className="h-full bg-amber-500 transition-all duration-1000" style={{ width: stat.value }} />
                </div>
              )}
            </div>
            <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Modules & Extensions Grid */}
      <div className="grid lg:grid-cols-12 gap-8">
        {/* Core Modules (Left Side) - 7 cols */}
        <div className="lg:col-span-12 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
              <Settings2 className="h-5 w-5 text-primary" /> Core Workshop Modules
            </h2>
            <div className="flex gap-2">
              <Button variant="ghost" className="h-7 text-[10px] uppercase font-bold" onClick={() => toggleAll('features', true)}>Enable All</Button>
              <Button variant="ghost" className="h-7 text-[10px] uppercase font-bold" onClick={() => toggleAll('features', false)}>Disable All</Button>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredFeatures.map((feature, i) => {
                const Icon = ICON_MAP[feature.icon] || Settings2;
                return (
                  <motion.div
                    key={feature.key}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.05 }}
                    className={`glass-card rounded-2xl p-5 border-none ring-1 transition-all duration-300 ${
                      toggles[feature.key] 
                        ? 'ring-primary/30 bg-primary/[0.02]' 
                        : 'ring-border/40 grayscale-[0.2]'
                    } hover:ring-primary/50 hover:shadow-xl hover:shadow-primary/5`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`h-12 w-12 rounded-xl flex items-center justify-center transition-colors ${
                        toggles[feature.key] ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                      }`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <Switch 
                        checked={toggles[feature.key]} 
                        onCheckedChange={(checked) => updateToggle(feature.key, checked)}
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-lg leading-tight">{feature.label}</h3>
                        <Badge variant="outline" className="text-[9px] h-4 py-0 uppercase bg-muted/50">{feature.category}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{feature.description}</p>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* Extension Packs (Full width below features) */}
        <div className="lg:col-span-12 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
              <Puzzle className="h-5 w-5 text-primary" /> Advanced Extension Packs
            </h2>
            <div className="flex gap-2">
              <Button variant="ghost" className="h-7 text-[10px] uppercase font-bold" onClick={() => toggleAll('extensions', true)}>Enable All</Button>
              <Button variant="ghost" className="h-7 text-[10px] uppercase font-bold" onClick={() => toggleAll('extensions', false)}>Disable All</Button>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredExtensions.map((ext, i) => {
                const Icon = ICON_MAP[ext.icon] || Puzzle;
                const isEnabled = extensionPacks[ext.key];
                return (
                  <motion.div
                    key={ext.key}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.1 }}
                    className={`group glass-card rounded-2xl p-6 border-none ring-1 transition-all duration-300 ${
                      isEnabled 
                        ? 'ring-primary/40 bg-gradient-to-br from-primary/[0.02] to-transparent shadow-lg shadow-primary/5' 
                        : 'ring-border/40'
                    } hover:ring-primary/60 hover:translate-y-[-4px]`}
                  >
                    <div className="flex items-start justify-between mb-5">
                      <div className={`h-14 w-14 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 duration-500 ${
                        isEnabled ? 'bg-primary/10 text-primary shadow-inner shadow-primary/10' : 'bg-muted text-muted-foreground'
                      }`}>
                        <Icon className="h-7 w-7" />
                      </div>
                      <Badge 
                        variant={isEnabled ? 'default' : 'outline'} 
                        className={`h-6 px-3 rounded-full text-[10px] uppercase font-bold transition-all ${
                          isEnabled ? 'bg-primary shadow-md shadow-primary/20' : 'border-dashed opacity-50'
                        }`}
                      >
                        {isEnabled ? 'Active' : 'Disabled'}
                      </Badge>
                    </div>
                    
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold text-xl tracking-tight leading-tight">{ext.label}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed h-10 overflow-hidden text-ellipsis line-clamp-2">
                        {ext.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 pt-4 border-t border-border/40">
                      <Button
                        className={`flex-1 h-11 rounded-xl transition-all font-semibold ${
                          isEnabled ? 'bg-primary/5 hover:bg-primary/10 text-primary border-none ring-1 ring-primary/20' : 'bg-primary shadow-lg shadow-primary/15'
                        }`}
                        onClick={() => setActiveDialog(ext.key as ExtensionDialogKey)}
                      >
                        {isEnabled ? 'Configure Pack' : 'Activate & Setup'}
                        <ArrowRight className="h-4 w-4 ml-2 opacity-70 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Dialogs - Modularized and Polished */}
      
      {/* 1. Dashboard Drag & Drop */}
      <Dialog open={activeDialog === 'dashboardLayoutDragDrop'} onOpenChange={(open) => !open && setActiveDialog(null)}>
        <DialogContent className="rounded-3xl border-none shadow-2xl p-8">
          <DialogHeader className="mb-6">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <GripVertical className="h-6 w-6 text-primary" />
            </div>
            <DialogTitle className="text-2xl font-bold">Dashboard Layout Control</DialogTitle>
            <DialogDescription className="text-base">
              Enable full customization of the dashboard. Reorder metrics, hide charts, and pin important bays.
            </DialogDescription>
          </DialogHeader>

          <div className="glass-card rounded-2xl p-5 border-none ring-1 ring-border/40 flex items-center justify-between mb-8">
            <div className="space-y-0.5">
              <p className="text-sm font-bold">Drag & Drop Capability</p>
              <p className="text-xs text-muted-foreground">Allows rearranging sections in real-time</p>
            </div>
            <Switch
              checked={extensionPacks.dashboardLayoutDragDrop}
              onCheckedChange={(checked) => updateExtensionPack('dashboardLayoutDragDrop', checked)}
            />
          </div>

          <DialogFooter>
            <Button variant="ghost" className="rounded-xl h-12" onClick={() => setActiveDialog(null)}>Dismiss</Button>
            <Button className="rounded-xl h-12 px-8 bg-primary shadow-lg shadow-primary/15" onClick={() => setActiveDialog(null)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 2. Wheel Alignment Machine */}
      <Dialog open={activeDialog === 'wheelAlignmentMachineConnect'} onOpenChange={(open) => !open && setActiveDialog(null)}>
        <DialogContent className="rounded-3xl border-none shadow-2xl p-8 max-w-lg">
          <DialogHeader className="mb-6">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <Radar className="h-6 w-6 text-primary" />
            </div>
            <DialogTitle className="text-2xl font-bold">Hunter/Hofmann Integration</DialogTitle>
            <DialogDescription className="text-base">
              Sync live technical data directly from your wheel alignment machines.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 mb-8">
            <div className="glass-card rounded-2xl p-4 border-none ring-1 ring-border/40 flex items-center justify-between">
              <p className="text-sm font-bold">Active Connection</p>
              <Switch
                checked={extensionPacks.wheelAlignmentMachineConnect}
                onCheckedChange={(checked) => updateExtensionPack('wheelAlignmentMachineConnect', checked)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Machine Label</label>
              <Input
                placeholder="Hunter Elite WA-470"
                value={wheelMachineConfig.machineName}
                onChange={(e) => setWheelMachineConfig((prev) => ({ ...prev, machineName: e.target.value }))}
                className="h-12 rounded-xl glass-card border-none ring-1 ring-border/40"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">API Endpoint</label>
              <Input
                placeholder="http://192.168.1.100/api/inspection"
                value={wheelMachineConfig.endpoint}
                onChange={(e) => setWheelMachineConfig((prev) => ({ ...prev, endpoint: e.target.value }))}
                className="h-12 rounded-xl glass-card border-none ring-1 ring-border/40"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" className="rounded-xl h-12" onClick={() => setActiveDialog(null)}>Cancel</Button>
            <Button className="rounded-xl h-12 px-8 bg-primary shadow-lg shadow-primary/15" onClick={() => saveWheelMachineDetails(extensionPacks.wheelAlignmentMachineConnect)}>Save Config</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 3. Analytics Report Generator */}
      <Dialog open={activeDialog === 'workshopAnalyticsReportGenerator'} onOpenChange={(open) => !open && setActiveDialog(null)}>
        <DialogContent className="rounded-3xl border-none shadow-2xl p-8 max-w-lg">
          <DialogHeader className="mb-6">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <DialogTitle className="text-2xl font-bold">Report Configuration</DialogTitle>
            <DialogDescription className="text-base">
              Customize how your management PDF reports are initialized.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 mb-8">
            <div className="glass-card rounded-2xl p-4 border-none ring-1 ring-border/40 flex items-center justify-between">
              <p className="text-sm font-bold">Automatic Generation</p>
              <Switch
                checked={extensionPacks.workshopAnalyticsReportGenerator}
                onCheckedChange={(checked) => updateExtensionPack('workshopAnalyticsReportGenerator', checked)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Report Heading</label>
              <Input
                placeholder="Monthly Performance Digest"
                value={analyticsReportConfig.reportTitle}
                onChange={(e) => setAnalyticsReportConfig((prev) => ({ ...prev, reportTitle: e.target.value }))}
                className="h-12 rounded-xl glass-card border-none ring-1 ring-border/40"
              />
            </div>

            <div className="glass-card rounded-2xl p-4 border-none ring-1 ring-border/40 flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-sm font-bold">AI Recommendations</p>
                <p className="text-xs text-muted-foreground">Auto-suggest shop improvements</p>
              </div>
              <Switch
                checked={analyticsReportConfig.includeRecommendations}
                onCheckedChange={(checked) => setAnalyticsReportConfig((prev) => ({ ...prev, includeRecommendations: checked }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" className="rounded-xl h-12" onClick={() => setActiveDialog(null)}>Cancel</Button>
            <Button className="rounded-xl h-12 px-8 bg-primary shadow-lg shadow-primary/15" onClick={() => saveAnalyticsReportDetails(extensionPacks.workshopAnalyticsReportGenerator)}>Save & Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 4. Dashboard Theme Customizer (Special Large Dialog) */}
      <Dialog open={activeDialog === 'dashboardThemeCustomizer'} onOpenChange={(open) => !open && setActiveDialog(null)}>
        <DialogContent className="left-2 right-2 top-2 translate-x-0 translate-y-0 w-auto max-w-none h-[calc(100vh-1rem)] sm:left-[50%] sm:right-auto sm:top-[50%] sm:translate-x-[-50%] sm:translate-y-[-50%] sm:w-[98vw] sm:max-w-5xl sm:h-[90vh] overflow-hidden p-0 grid-rows-[auto_minmax(0,1fr)_auto] gap-0 border-none shadow-2xl rounded-3xl">
          <DialogHeader className="px-8 pt-8 pb-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Palette className="h-6 w-6 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold">Appearance Customizer</DialogTitle>
                <DialogDescription className="text-base">
                  Design a unique dashboard experience for your brand.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="overflow-y-auto px-8 pb-4 min-h-0">
            <div className="glass-card rounded-2xl p-4 border-none ring-1 ring-border/40 flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                <p className="text-sm font-bold">Theme Overrides Enabled</p>
              </div>
              <Switch
                checked={extensionPacks.dashboardThemeCustomizer}
                onCheckedChange={(checked) => updateExtensionPack('dashboardThemeCustomizer', checked)}
              />
            </div>

            <ThemeCustomizerPanel
              value={dashboardThemeConfig}
              onChange={updateDashboardThemeConfig}
              onSelectPreset={applyThemePreset}
            />
          </div>

          <DialogFooter className="px-8 py-6 border-t border-border/40 bg-background/95 backdrop-blur-xl">
            <Button variant="ghost" className="rounded-xl h-12 px-6" onClick={() => setActiveDialog(null)}>Discard</Button>
            <Button className="rounded-xl h-12 px-10 bg-primary shadow-lg shadow-primary/15" onClick={() => saveDashboardThemeDetails(extensionPacks.dashboardThemeCustomizer)}>Apply Brand Styles</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 5. Service Bay Custom Names */}
      <Dialog open={activeDialog === 'serviceBayCustomNames'} onOpenChange={(open) => !open && setActiveDialog(null)}>
        <DialogContent className="rounded-3xl border-none shadow-2xl p-8">
          <DialogHeader className="mb-6">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <Type className="h-6 w-6 text-primary" />
            </div>
            <DialogTitle className="text-2xl font-bold">Custom Bay Naming</DialogTitle>
            <DialogDescription className="text-base">
              Identify workshop areas more effectively by renaming generic bays.
            </DialogDescription>
          </DialogHeader>

          <div className="glass-card rounded-2xl p-5 border-none ring-1 ring-border/40 flex items-center justify-between mb-8">
            <div className="space-y-0.5">
              <p className="text-sm font-bold">Override Defaults</p>
              <p className="text-xs text-muted-foreground">Allows "Bay 1" to become "Denting Section"</p>
            </div>
            <Switch
              checked={extensionPacks.serviceBayCustomNames}
              onCheckedChange={(checked) => updateExtensionPack('serviceBayCustomNames', checked)}
            />
          </div>

          <DialogFooter>
            <Button variant="ghost" className="rounded-xl h-12" onClick={() => setActiveDialog(null)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 6. Multi-Branch Management */}
      <Dialog open={activeDialog === 'multiBranchManagement'} onOpenChange={(open) => !open && setActiveDialog(null)}>
        <DialogContent className="rounded-3xl border-none shadow-2xl p-8 max-w-lg overflow-y-auto max-h-[90vh]">
          <DialogHeader className="mb-6">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <DialogTitle className="text-2xl font-bold">Multi-Branch Setup</DialogTitle>
            <DialogDescription className="text-base">
              Link multiple workshop locations to sync inventory and manage team rotation.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mb-8">
            <div className="glass-card rounded-2xl p-4 border-none ring-1 ring-border/40 flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-sm font-bold">Multi-Location Mode</p>
                <p className="text-xs text-muted-foreground">Activates branch switcher in header</p>
              </div>
              <Switch
                checked={extensionPacks.multiBranchManagement}
                onCheckedChange={(checked) => updateExtensionPack('multiBranchManagement', checked)}
              />
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Current Branches</h4>
              <div className="space-y-2">
                {branches.map(branch => (
                  <div key={branch.id} className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 border border-border/40">
                    <div>
                      <p className="text-sm font-bold flex items-center gap-1.5">
                        {branch.name}
                        {branch.isMain && <Badge className="text-[8px] h-3.5 px-1 bg-primary/20 text-primary">Main</Badge>}
                      </p>
                      <p className="text-[10px] text-muted-foreground">{branch.address}</p>
                    </div>
                    {!branch.isMain && (
                      <Button variant="ghost" size="icon" onClick={() => removeBranch(branch.id)} className="h-8 w-8 text-destructive hover:bg-destructive/10">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-border/40">
              <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Add New Branch</h4>
              <Input 
                placeholder="Branch Name" 
                value={newBranch.name}
                onChange={(e) => setNewBranch({...newBranch, name: e.target.value})}
                className="h-11 rounded-xl glass-card border-none ring-1 ring-border/40"
              />
              <Input 
                placeholder="Address" 
                value={newBranch.address}
                onChange={(e) => setNewBranch({...newBranch, address: e.target.value})}
                className="h-11 rounded-xl glass-card border-none ring-1 ring-border/40"
              />
              <div className="flex gap-2">
                <Input 
                  placeholder="Phone (Optional)" 
                  value={newBranch.phone}
                  onChange={(e) => setNewBranch({...newBranch, phone: e.target.value})}
                  className="h-11 rounded-xl glass-card border-none ring-1 ring-border/40"
                />
                <Button onClick={addBranch} className="h-11 px-6 rounded-xl gradient-primary text-white">Add</Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" className="rounded-xl h-12" onClick={() => setActiveDialog(null)}>Close</Button>
            <Button className="rounded-xl h-12 px-8 bg-primary shadow-lg shadow-primary/15" onClick={() => saveBranchDetails(extensionPacks.multiBranchManagement)}>Save All Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 7. Advanced Vehicle Diagnostics */}
      <Dialog open={activeDialog === 'advancedVehicleDiagnostics'} onOpenChange={(open) => !open && setActiveDialog(null)}>
        <DialogContent className="rounded-3xl border-none shadow-2xl p-8 max-w-lg">
          <DialogHeader className="mb-6">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <DialogTitle className="text-2xl font-bold">Advanced Vehicle Diagnostics</DialogTitle>
            <DialogDescription className="text-base">
              Enable high-fidelity 360° vehicle mapping and interactive damage tracking.
            </DialogDescription>
          </DialogHeader>

          <div className="glass-card rounded-2xl p-5 border-none ring-1 ring-border/40 flex items-center justify-between mb-8">
            <div className="space-y-0.5">
              <p className="text-sm font-bold">Inspection Map v2.0</p>
              <p className="text-xs text-muted-foreground">Realistic car diagrams for detailed check-ins</p>
            </div>
            <Switch
              checked={extensionPacks.advancedVehicleDiagnostics}
              onCheckedChange={(checked) => updateExtensionPack('advancedVehicleDiagnostics', checked)}
            />
          </div>

          <DialogFooter>
            <Button variant="ghost" className="rounded-xl h-12" onClick={() => setActiveDialog(null)}>Dismiss</Button>
            <Button className="rounded-xl h-12 px-8 bg-primary shadow-lg shadow-primary/15" onClick={() => setActiveDialog(null)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default Extensions;
