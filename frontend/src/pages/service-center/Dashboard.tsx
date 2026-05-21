import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import { format, isSameDay, subDays } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, Users, ClipboardList, Wrench, Plus, IndianRupee, Car, ArrowRight, AlertTriangle, CheckCircle2, GripVertical, RotateCcw, Eye, EyeOff, Clock3, Gauge, Minus, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { useJobCards, useCustomers, useMechanics, useUpdateJobStatus } from '@/hooks/useData';
import { DailyRevenueChart, MonthlyServicesChart } from '@/components/dashboard/SCCharts';
import { AnalyticsExportButton } from '@/components/dashboard/AnalyticsExportButton';
import { ServiceBaysBoard } from '@/components/service-center/ServiceBaysBoard';
import { JobQueueBoard } from '@/components/service-center/JobQueueBoard';
import { WorkshopPageHeader } from '@/components/service-center/WorkshopPageHeader';
import { computeWorkshopAnalytics } from '@/lib/workshopAnalytics';
import { getSCExtensionPacks } from '@/lib/featureExtensions';
import { toast } from 'sonner';
import { DemoLink as Link } from '@/hooks/useAppRouter';

// Map DB statuses to Kanban columns
const COLUMNS = [
  { id: 'pending', title: 'Pending', color: 'bg-warning/60', dotColor: 'bg-warning' },
  { id: 'in_progress', title: 'In Progress', color: 'bg-accent/60', dotColor: 'bg-accent' },
  { id: 'waiting_parts', title: 'Waiting Parts', color: 'bg-destructive/60', dotColor: 'bg-destructive' },
  { id: 'completed', title: 'Ready for Delivery', color: 'bg-success/60', dotColor: 'bg-success' },
] as const;

const DAY_SPECIALTIES: Record<number, string> = {
  0: 'Service Sunday',
  1: 'Maintenance Monday',
  2: 'Tune-up Tuesday',
  3: 'Wheel Wednesday',
  4: 'Tech Thursday',
  5: 'Filter Friday',
  6: 'Spare Saturday',
};

type ColumnId = typeof COLUMNS[number]['id'];
type DashboardSectionId = 'quick-stats' | 'health' | 'service-bays' | 'job-queue' | 'attention' | 'board' | 'team' | 'charts' | 'tip';
type DashboardSectionSize = 'sm' | 'md' | 'lg';

const SECTION_SIZE_ORDER: DashboardSectionSize[] = ['sm', 'md', 'lg'];

type DashboardLayoutConfig = {
  order: DashboardSectionId[];
  hidden: DashboardSectionId[];
  sizes: Record<DashboardSectionId, DashboardSectionSize>;
};

const DASHBOARD_LAYOUT_KEY = 'sc-dashboard-layout-config-v2';
const DASHBOARD_LAYOUT_ORDER_KEY_LEGACY = 'sc-dashboard-layout-order-v1';
const DEFAULT_DASHBOARD_LAYOUT: DashboardSectionId[] = ['quick-stats', 'health', 'service-bays', 'job-queue', 'attention', 'board', 'team', 'charts', 'tip'];

const DEFAULT_SECTION_SIZES: Record<DashboardSectionId, DashboardSectionSize> = {
  'quick-stats': 'md',
  health: 'md',
  'service-bays': 'md',
  'job-queue': 'md',
  attention: 'md',
  board: 'md',
  team: 'md',
  charts: 'md',
  tip: 'md',
};

const DEFAULT_LAYOUT_CONFIG: DashboardLayoutConfig = {
  order: DEFAULT_DASHBOARD_LAYOUT,
  hidden: [],
  sizes: DEFAULT_SECTION_SIZES,
};

const SECTION_LABELS: Record<DashboardSectionId, string> = {
  'quick-stats': 'Quick Stats',
  health: 'Health Summary',
  'service-bays': 'Service Bays',
  'job-queue': 'Job Queue',
  attention: 'Attention Needed',
  board: 'Job Board',
  team: 'Team Status',
  charts: 'Charts',
  tip: 'Performance Tip',
};


const SCDashboard = () => {
  const { data: jobCards = [], isLoading: jLoading } = useJobCards();
  const { data: customers = [] } = useCustomers();
  const { data: mechanics = [] } = useMechanics();
  const updateStatus = useUpdateJobStatus();
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const filteredJobsForStats = useMemo(() => {
    return jobCards.filter(job => {
      // For general stats like revenue, we care about when it was completed or created
      const date = job.completed_at ? new Date(job.completed_at) : new Date(job.created_at);
      return isSameDay(date, selectedDate);
    });
  }, [jobCards, selectedDate]);

  const analytics = useMemo(() => computeWorkshopAnalytics(jobCards, customers, mechanics), [jobCards, customers, mechanics]);
  
  const dailyStats = useMemo(() => {
    const dayJobs = jobCards.filter(job => {
      const date = job.completed_at ? new Date(job.completed_at) : new Date(job.created_at);
      return isSameDay(date, selectedDate);
    });

    const completed = dayJobs.filter(j => j.status === 'completed' || j.status === 'delivered');
    const revenue = completed.reduce((sum, j) => sum + (j.actual_cost || j.estimated_cost || 0), 0);
    
    return {
      revenue,
      completedCount: completed.length,
      newJobs: dayJobs.filter(j => j.status === 'pending').length
    };
  }, [jobCards, selectedDate]);
  const [layoutExtensionEnabled, setLayoutExtensionEnabled] = useState(false);
  const [sectionOrder, setSectionOrder] = useState<DashboardSectionId[]>(DEFAULT_DASHBOARD_LAYOUT);
  const [hiddenSections, setHiddenSections] = useState<DashboardSectionId[]>([]);
  const [sectionSizes, setSectionSizes] = useState<Record<DashboardSectionId, DashboardSectionSize>>(DEFAULT_SECTION_SIZES);
  const [draggingSection, setDraggingSection] = useState<DashboardSectionId | null>(null);

  useEffect(() => {
    const syncExtensions = () => {
      const packs = getSCExtensionPacks();
      setLayoutExtensionEnabled(Boolean(packs.dashboardLayoutDragDrop));
    };

    syncExtensions();
    window.addEventListener('storage', syncExtensions);
    window.addEventListener('sc-extension-packs-updated', syncExtensions as EventListener);
    return () => {
      window.removeEventListener('storage', syncExtensions);
      window.removeEventListener('sc-extension-packs-updated', syncExtensions as EventListener);
    };
  }, []);


  useEffect(() => {
    const raw = localStorage.getItem(DASHBOARD_LAYOUT_KEY);
    const legacyOrder = localStorage.getItem(DASHBOARD_LAYOUT_ORDER_KEY_LEGACY);

    if (!raw && legacyOrder) {
      try {
        const parsedLegacy = JSON.parse(legacyOrder) as DashboardSectionId[];
        if (Array.isArray(parsedLegacy) && parsedLegacy.length === DEFAULT_DASHBOARD_LAYOUT.length) {
          const nextConfig: DashboardLayoutConfig = { order: parsedLegacy, hidden: [], sizes: DEFAULT_SECTION_SIZES };
          localStorage.setItem(DASHBOARD_LAYOUT_KEY, JSON.stringify(nextConfig));
          setSectionOrder(parsedLegacy);
          setHiddenSections([]);
          setSectionSizes(DEFAULT_SECTION_SIZES);
          return;
        }
      } catch {
        localStorage.removeItem(DASHBOARD_LAYOUT_ORDER_KEY_LEGACY);
      }
    }

    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as DashboardLayoutConfig;
      const parsedOrder = Array.isArray(parsed?.order) ? parsed.order : [];
      const parsedHidden = Array.isArray(parsed?.hidden) ? parsed.hidden : [];
      const parsedSizes = parsed?.sizes || DEFAULT_SECTION_SIZES;
      const validOrder = parsedOrder.filter((item): item is DashboardSectionId => DEFAULT_DASHBOARD_LAYOUT.includes(item as DashboardSectionId));
      const validHidden = parsedHidden.filter((item): item is DashboardSectionId => DEFAULT_DASHBOARD_LAYOUT.includes(item as DashboardSectionId));

      const validSizes = DEFAULT_DASHBOARD_LAYOUT.reduce((acc, sectionId) => {
        const size = parsedSizes[sectionId];
        acc[sectionId] = SECTION_SIZE_ORDER.includes(size) ? size : 'md';
        return acc;
      }, {} as Record<DashboardSectionId, DashboardSectionSize>);

      if (validOrder.length === DEFAULT_DASHBOARD_LAYOUT.length) {
        setSectionOrder(validOrder);
        setHiddenSections(validHidden);
        setSectionSizes(validSizes);
      }
    } catch {
      localStorage.removeItem(DASHBOARD_LAYOUT_KEY);
    }
  }, []);

  const persistLayoutConfig = (
    order: DashboardSectionId[],
    hidden: DashboardSectionId[],
    sizes: Record<DashboardSectionId, DashboardSectionSize>
  ) => {
    const nextConfig: DashboardLayoutConfig = { order, hidden, sizes };
    localStorage.setItem(DASHBOARD_LAYOUT_KEY, JSON.stringify(nextConfig));
  };

  const stats = useMemo(() => {
    const activeJobs = jobCards.filter(j => j.status !== 'delivered');
    const totalRevenue = dailyStats.revenue;
    const waitingParts = activeJobs.filter(j => j.status === 'waiting_parts').length;
    const pendingJobs = activeJobs.filter(j => j.status === 'pending').length;
    const availableMechanics = mechanics.filter(m => m.status === 'available').length;
    const busyMechanics = mechanics.filter(m => m.status === 'busy').length;
    const avgTicket = analytics.avgTicket;

    const today = new Date();
    const todayStr = today.toDateString();
    const completedToday = jobCards.filter((j) => {
      if (!j.completed_at) return false;
      return isSameDay(new Date(j.completed_at), selectedDate);
    }).length;

    return {
      activeJobs,
      totalRevenue,
      waitingParts,
      pendingJobs,
      availableMechanics,
      busyMechanics,
      avgTicket,
      completedToday,
    };
  }, [jobCards, mechanics, dailyStats.revenue, analytics.avgTicket, selectedDate]);

  const quickStats = useMemo(
    () => [
      { label: 'Customers', value: customers.length, icon: Users, subtitle: 'Total registered' },
      { label: 'Active Jobs', value: stats.activeJobs.length, icon: ClipboardList, subtitle: 'Open cards' },
      { label: 'Mechanics', value: mechanics.length, icon: Wrench, subtitle: 'On team' },
      { 
        label: 'Revenue', 
        value: `Rs.${stats.totalRevenue.toLocaleString()}`, 
        icon: IndianRupee, 
        subtitle: isSameDay(selectedDate, new Date()) ? "Today's earnings" : `Earnings on ${format(selectedDate, 'dd MMM')}` 
      },
    ],
    [customers.length, stats.activeJobs.length, mechanics.length, stats.totalRevenue, selectedDate]
  );

  const dashboardPulse = useMemo(() => {
    if (stats.activeJobs.length === 0) return 'No active jobs right now';
    if (stats.waitingParts > 0) return `${stats.waitingParts} jobs waiting for parts`;
    if (stats.pendingJobs > 0) return `${stats.pendingJobs} jobs still pending assignment`;
    return 'Operations running smoothly';
  }, [stats.activeJobs.length, stats.waitingParts, stats.pendingJobs]);

  const columnJobs = useMemo(() => {
    return COLUMNS.reduce((acc, col) => {
      acc[col.id] = stats.activeJobs.filter(j => j.status === col.id);
      return acc;
    }, {} as Record<ColumnId, typeof jobCards>);
  }, [stats.activeJobs]);

  const staleJobs = useMemo(() => {
    const now = Date.now();
    return stats.activeJobs
      .filter((j) => j.status === 'pending' || j.status === 'waiting_parts')
      .filter((j) => (now - new Date(j.created_at).getTime()) / (1000 * 60 * 60 * 24) >= 2)
      .slice(0, 3);
  }, [stats.activeJobs]);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    if (result.destination.droppableId === result.source.droppableId) return;

    const { draggableId, destination } = result;
    const newStatus = destination.droppableId as ColumnId;

    const jobData = jobCards.find(j => j.id === draggableId);
    updateStatus.mutate(
      { 
        id: draggableId, 
        status: newStatus,
        actual_cost: jobData?.actual_cost || jobData?.estimated_cost
      },
      { onSuccess: () => toast.success(`Job moved to ${COLUMNS.find(c => c.id === newStatus)?.title}`) }
    );
  };

  const handleDropSection = (target: DashboardSectionId) => {
    if (!draggingSection || draggingSection === target) return;

    setSectionOrder((prev) => {
      const from = prev.indexOf(draggingSection);
      const to = prev.indexOf(target);
      if (from < 0 || to < 0) return prev;
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      persistLayoutConfig(next, hiddenSections, sectionSizes);
      return next;
    });
  };

  const handleToggleSectionVisibility = (sectionId: DashboardSectionId, visible: boolean) => {
    setHiddenSections((prev) => {
      const next = visible ? prev.filter((id) => id !== sectionId) : [...new Set([...prev, sectionId])];
      persistLayoutConfig(sectionOrder, next, sectionSizes);
      return next;
    });
  };

  const handleSectionSizeStep = (sectionId: DashboardSectionId, step: -1 | 1) => {
    setSectionSizes((prev) => {
      const currentIndex = SECTION_SIZE_ORDER.indexOf(prev[sectionId] || 'md');
      const nextIndex = Math.min(SECTION_SIZE_ORDER.length - 1, Math.max(0, currentIndex + step));
      if (nextIndex === currentIndex) return prev;
      const next = { ...prev, [sectionId]: SECTION_SIZE_ORDER[nextIndex] };
      persistLayoutConfig(sectionOrder, hiddenSections, next);
      return next;
    });
  };

  const handleResetLayout = () => {
    setSectionOrder(DEFAULT_LAYOUT_CONFIG.order);
    setHiddenSections(DEFAULT_LAYOUT_CONFIG.hidden);
    setSectionSizes(DEFAULT_LAYOUT_CONFIG.sizes);
    persistLayoutConfig(DEFAULT_LAYOUT_CONFIG.order, DEFAULT_LAYOUT_CONFIG.hidden, DEFAULT_LAYOUT_CONFIG.sizes);
    toast.success('Dashboard layout reset to default');
  };

  const handleShowAllSections = () => {
    setHiddenSections([]);
    persistLayoutConfig(sectionOrder, [], sectionSizes);
    toast.success('All dashboard sections are now visible');
  };

  const getSectionSizeClass = (sectionId: DashboardSectionId) => `dashboard-section-size-${sectionSizes[sectionId] || 'md'}`;

  const visibleSectionOrder = useMemo(
    () => sectionOrder.filter((sectionId) => !hiddenSections.includes(sectionId)),
    [sectionOrder, hiddenSections]
  );

  const renderSection = (sectionId: DashboardSectionId) => {
    if (sectionId === 'quick-stats') {
      return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {quickStats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="glass-card rounded-2xl p-5 flex items-start gap-4"
            >
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
                <p className="text-xl font-display font-bold tracking-tight mt-0.5">{stat.value}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{stat.subtitle}</p>
              </div>
            </motion.div>
          ))}
        </div>
      );
    }

    if (sectionId === 'health') {
      return (
        <div className="grid md:grid-cols-3 gap-4">
          <div className="glass-card rounded-2xl p-4">
            <p className="text-[11px] text-muted-foreground mb-1">Queue Health</p>
            <p className="text-lg font-display font-semibold">{stats.pendingJobs} pending, {stats.waitingParts} waiting parts</p>
            <p className="text-xs text-muted-foreground mt-1">Use board drag-and-drop to keep jobs moving</p>
          </div>
          <div className="glass-card rounded-2xl p-4">
            <p className="text-[11px] text-muted-foreground mb-1">Team Utilization</p>
            <p className="text-lg font-display font-semibold">{stats.busyMechanics} busy / {stats.availableMechanics} available</p>
            <p className="text-xs text-muted-foreground mt-1">Balance assignment to avoid bottlenecks</p>
          </div>
          <div className="glass-card rounded-2xl p-4">
            <p className="text-[11px] text-muted-foreground mb-1">Delivery Performance</p>
            <p className="text-lg font-display font-semibold">{stats.completedToday} completed today</p>
            <p className="text-xs text-muted-foreground mt-1">Avg ticket size: Rs.{Math.round(stats.avgTicket).toLocaleString()}</p>
          </div>
        </div>
      );
    }

    if (sectionId === 'attention') {
      if (staleJobs.length === 0) return null;
      return (
        <div className="glass-card rounded-2xl p-4 border border-warning/30 bg-warning/5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <h3 className="text-sm font-semibold">Attention Needed</h3>
          </div>
          <div className="space-y-2">
            {staleJobs.map((job) => (
              <Link key={job.id} to={`/service-center/jobs/${job.id}`} className="block">
                <div className="rounded-lg bg-background/70 p-2.5 hover:bg-background transition-colors">
                  <p className="text-xs font-medium">{job.customer_name} • {job.vehicle_number}</p>
                  <p className="text-[11px] text-muted-foreground">Open since {new Date(job.created_at).toLocaleDateString('en-IN')}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      );
    }

    if (sectionId === 'service-bays') {
      return <ServiceBaysBoard />;
    }

    if (sectionId === 'job-queue') {
      return <JobQueueBoard mechanics={mechanics} />;
    }

    if (sectionId === 'board') {
      return (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-sm">Job Board</h2>
            <Link to="/service-center/jobs" className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
              All jobs <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {jLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1,2,3,4].map(i => <Skeleton key={i} className="h-64 rounded-2xl" />)}
            </div>
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {COLUMNS.map(col => (
                  <KanbanColumn
                    key={col.id}
                    column={col}
                    jobs={columnJobs[col.id] || []}
                  />
                ))}
              </div>
            </DragDropContext>
          )}
        </div>
      );
    }

    if (sectionId === 'team') {
      if (mechanics.length === 0) return null;
      return (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="glass-card rounded-2xl p-6"
        >
          <h3 className="font-display font-semibold text-sm mb-4 flex items-center gap-2">
            <Wrench className="h-4 w-4 text-muted-foreground" /> Team Status
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {mechanics.map(m => (
              <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  m.status === 'available' ? 'bg-success' : m.status === 'busy' ? 'bg-warning' : 'bg-muted-foreground'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{m.name}</p>
                  <p className="text-[10px] text-muted-foreground">{m.specialization}</p>
                </div>
                <Badge variant="outline" className="text-[10px] capitalize h-5">{m.status.replace('_', ' ')}</Badge>
              </div>
            ))}
          </div>
        </motion.div>
      );
    }

    if (sectionId === 'charts') {
      return (
        <div className="grid lg:grid-cols-2 gap-6">
          <DailyRevenueChart data={analytics.dailyRevenue} />
          <MonthlyServicesChart data={analytics.monthlyServices} />
        </div>
      );
    }

    return (
      <div className="glass-card rounded-2xl p-4">
        <div className="flex items-center gap-2 text-sm">
          <CheckCircle2 className="h-4 w-4 text-success" />
          <span className="font-medium">Tip:</span>
          <span className="text-muted-foreground">Mark completed jobs as delivered the same day to keep backlog and cash flow metrics accurate.</span>
        </div>
      </div>
    );
  };

  return (
    <div className="sc-themed-dashboard max-w-[1400px] space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <WorkshopPageHeader
          eyebrow="Workshop"
          title="Service Dashboard"
          description="Track workload, team utilization, delivery health, and the jobs that need your attention today."
          meta={
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="rounded-full px-3 py-1 text-[11px] font-medium">
                {isSameDay(selectedDate, new Date())
                  ? 'Today'
                  : isSameDay(selectedDate, subDays(new Date(), 1))
                    ? 'Yesterday'
                    : format(selectedDate, 'dd MMM yyyy')}
              </Badge>
              <Badge variant="secondary" className="rounded-full px-3 py-1 text-[11px] font-medium">
                {DAY_SPECIALTIES[selectedDate.getDay()]}
              </Badge>
            </div>
          }
          actions={
            <>
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="h-10 rounded-xl border-border/50 bg-background px-4">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    Change date
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto rounded-2xl border-none p-0 shadow-2xl" align="end">
                  <div className="flex items-center justify-between border-b bg-secondary/30 p-3">
                    <p className="text-xs font-semibold">Filter Dashboard</p>
                    <div className="flex gap-1">
                      <Button variant="secondary" size="sm" className="h-7 rounded-lg px-2 text-[10px]" onClick={() => { setSelectedDate(new Date()); setIsCalendarOpen(false); }}>Today</Button>
                      <Button variant="secondary" size="sm" className="h-7 rounded-lg px-2 text-[10px]" onClick={() => { setSelectedDate(subDays(new Date(), 1)); setIsCalendarOpen(false); }}>Yesterday</Button>
                    </div>
                  </div>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => { if (date) { setSelectedDate(date); setIsCalendarOpen(false); } }}
                    initialFocus
                    className="rounded-b-2xl"
                  />
                </PopoverContent>
              </Popover>
              <AnalyticsExportButton 
                jobCards={jobCards}
                customers={customers}
                mechanics={mechanics}
              />
              <Link to="/service-center/jobs/create">
                <Button className="h-10 rounded-xl bg-foreground px-4 text-background hover:bg-foreground/90">
                  <Plus className="mr-1.5 h-3.5 w-3.5" /> New Job Card
                </Button>
              </Link>
              <Link to="/service-center/customers">
                <Button variant="outline" className="h-10 rounded-xl border-border/50">Customers</Button>
              </Link>
              <Link to="/service-center/mechanics">
                <Button variant="outline" className="h-10 rounded-xl border-border/50">Mechanics</Button>
              </Link>
            </>
          }
        />
      </motion.div>

      <div className="glass-card rounded-3xl border border-border/50 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Operations Pulse</p>
          <p className="text-sm sm:text-base font-semibold mt-1 flex items-center gap-2">
            <Gauge className="h-4 w-4 text-accent" /> {dashboardPulse}
          </p>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <Clock3 className="h-3.5 w-3.5" />
          <span>Completed today: {stats.completedToday}</span>
          <span className="hidden sm:inline">•</span>
          <span>Avg ticket: Rs.{Math.round(stats.avgTicket).toLocaleString()}</span>
        </div>
      </div>

      {layoutExtensionEnabled && (
        <div className="glass-card rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Dashboard Layout Editor</p>
            <span className="text-[11px] text-muted-foreground">Reorder, hide, and restore sections</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={handleShowAllSections} className="h-7 text-[11px] gap-1.5">
              <Eye className="h-3 w-3" /> Show All
            </Button>
            <Button variant="outline" onClick={handleResetLayout} className="h-7 text-[11px] gap-1.5">
              <RotateCcw className="h-3 w-3" /> Reset Layout
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {sectionOrder.map((sectionId) => (
              <button
                key={sectionId}
                type="button"
                draggable
                onDragStart={() => setDraggingSection(sectionId)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  handleDropSection(sectionId);
                  setDraggingSection(null);
                }}
                onDragEnd={() => setDraggingSection(null)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-colors ${
                  draggingSection === sectionId
                    ? 'border-accent text-accent bg-accent/10'
                    : hiddenSections.includes(sectionId)
                      ? 'border-border text-muted-foreground/60 bg-secondary/30'
                      : 'border-border text-muted-foreground bg-background hover:bg-secondary/50'
                }`}
              >
                  <GripVertical className="h-3 w-3" /> {SECTION_LABELS[sectionId]}
                {hiddenSections.includes(sectionId) && <EyeOff className="h-3 w-3" />}
              </button>
            ))}
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2 pt-1">
            {sectionOrder.map((sectionId) => {
              const isVisible = !hiddenSections.includes(sectionId);
              const size = sectionSizes[sectionId] || 'md';
              return (
                <div key={`toggle-${sectionId}`} className="rounded-lg border border-border/50 px-3 py-2 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-medium truncate">{SECTION_LABELS[sectionId]}</p>
                    <Switch
                      checked={isVisible}
                      onCheckedChange={(checked) => handleToggleSectionVisibility(sectionId, checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] text-muted-foreground">Card Size: {size.toUpperCase()}</span>
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="outline"
                        className="h-6 w-6 p-0"
                        onClick={() => handleSectionSizeStep(sectionId, -1)}
                        disabled={size === 'sm'}
                        aria-label={`Decrease ${SECTION_LABELS[sectionId]} size`}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-6 w-6 p-0"
                        onClick={() => handleSectionSizeStep(sectionId, 1)}
                        disabled={size === 'lg'}
                        aria-label={`Increase ${SECTION_LABELS[sectionId]} size`}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {visibleSectionOrder.map((sectionId) => (
        <div key={sectionId} className={getSectionSizeClass(sectionId)}>
          {renderSection(sectionId)}
        </div>
      ))}
    </div>
  );
};

// ===== Kanban Column =====
function KanbanColumn({ column, jobs }: {
  column: typeof COLUMNS[number];
  jobs: Array<{
    id: string; customer_name: string; customer_phone: string;
    vehicle_number: string; vehicle_model: string; problem_description: string;
    mechanic_name: string | null; estimated_cost: number; created_at: string;
  }>;
}) {
  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-2 h-2 rounded-full ${column.dotColor}`} />
        <span className="text-xs font-semibold">{column.title}</span>
        <span className="text-[10px] text-muted-foreground ml-auto bg-secondary rounded-full w-5 h-5 flex items-center justify-center font-medium">
          {jobs.length}
        </span>
      </div>

      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 min-h-[200px] rounded-2xl p-2 transition-colors duration-200 ${
              snapshot.isDraggingOver ? 'bg-accent/5 ring-1 ring-accent/20' : 'bg-secondary/30'
            }`}
          >
            <div className="space-y-2">
              {jobs.map((job, index) => (
                <Draggable key={job.id} draggableId={job.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`${snapshot.isDragging ? 'shadow-xl rotate-[1deg] scale-[1.02]' : ''}`}
                    >
                      <JobCard job={job} />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
              {jobs.length === 0 && (
                <p className="text-[10px] text-muted-foreground/50 text-center py-8">No jobs</p>
              )}
            </div>
          </div>
        )}
      </Droppable>
    </div>
  );
}

// ===== Job Card =====
function JobCard({ job }: {
  job: {
    id: string; customer_name: string; customer_phone: string;
    vehicle_number: string; vehicle_model: string; problem_description: string;
    mechanic_name: string | null; estimated_cost: number; created_at: string;
  };
}) {
  return (
    <Link to={`/service-center/jobs/${job.id}`}>
      <div className="glass-card rounded-xl p-3.5 cursor-pointer hover:border-accent/20 transition-all duration-200 hover:shadow-md group">
        <div className="flex items-start justify-between mb-2">
          <p className="text-xs font-semibold truncate flex-1">{job.customer_name}</p>
          <span className="text-[10px] font-medium text-accent ml-2">Rs.{job.estimated_cost.toLocaleString()}</span>
        </div>

        <div className="flex items-center gap-1.5 mb-2">
          <Car className="h-3 w-3 text-muted-foreground flex-shrink-0" />
          <span className="text-[10px] text-muted-foreground truncate">{job.vehicle_model}</span>
          <span className="text-[10px] font-mono text-muted-foreground/70 ml-auto">{job.vehicle_number}</span>
        </div>

        <p className="text-[10px] text-muted-foreground leading-relaxed line-clamp-2 mb-2">{job.problem_description}</p>

        <div className="flex items-center justify-between pt-2 border-t border-border/40">
          {job.mechanic_name ? (
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Wrench className="h-2.5 w-2.5" /> {job.mechanic_name}
            </span>
          ) : (
            <span className="text-[10px] text-muted-foreground/50 italic">Unassigned</span>
          )}
          <span className="text-[10px] text-muted-foreground/50">
            {new Date(job.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
          </span>
        </div>
      </div>
    </Link>
  );
}

export default SCDashboard;
