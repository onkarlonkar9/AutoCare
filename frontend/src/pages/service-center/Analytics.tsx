import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { DailyRevenueChart, MonthlyServicesChart, RepairTypesChart } from '@/components/dashboard/SCCharts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { WorkshopPageHeader } from '@/components/service-center/WorkshopPageHeader';
import { useJobCards, useCustomers, useMechanics } from '@/hooks/useData';
import { computeWorkshopAnalytics } from '@/lib/workshopAnalytics';
import { getSCExtensionPacks } from '@/lib/featureExtensions';
import { generateWorkshopAnalyticsReport } from '@/lib/workshopReport';
import {
  IndianRupee,
  Wrench,
  Users,
  ClipboardList,
  TimerReset,
  Repeat,
  TrendingUp,
  CheckCircle2,
  Activity,
  Wallet,
  Download,
  FileText,
  LineChart,
} from 'lucide-react';

const ANALYTICS_REPORT_CONFIG_KEY = 'sc-analytics-report-config-v1';

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

const SCAnalytics = () => {
  const { data: jobs = [] } = useJobCards();
  const { data: customers = [] } = useCustomers();
  const { data: mechanics = [] } = useMechanics();
  const [reportExtensionEnabled, setReportExtensionEnabled] = useState(false);
  const [reportConfig, setReportConfig] = useState<AnalyticsReportConfig>(DEFAULT_ANALYTICS_REPORT_CONFIG);
  const [generatedReport, setGeneratedReport] = useState('');

  const analytics = useMemo(() => computeWorkshopAnalytics(jobs, customers, mechanics), [jobs, customers, mechanics]);
  const avgRating =
    mechanics.length > 0 ? (mechanics.reduce((sum, mechanic) => sum + Number(mechanic.rating), 0) / mechanics.length).toFixed(1) : '0.0';
  const trendRevenue = `${analytics.monthlyRevenueGrowth >= 0 ? '+' : ''}${analytics.monthlyRevenueGrowth.toFixed(1)}% vs last month`;
  const trendJobs = `${analytics.monthlyJobsGrowth >= 0 ? '+' : ''}${analytics.monthlyJobsGrowth.toFixed(1)}% vs last month`;
  const totalRepairs = analytics.repairTypes.reduce((sum, item) => sum + item.count, 0);

  useEffect(() => {
    const syncExtension = () => {
      const packs = getSCExtensionPacks();
      setReportExtensionEnabled(Boolean(packs.workshopAnalyticsReportGenerator));
    };

    const syncConfig = () => {
      try {
        const raw = localStorage.getItem(ANALYTICS_REPORT_CONFIG_KEY);
        if (!raw) {
          setReportConfig(DEFAULT_ANALYTICS_REPORT_CONFIG);
          return;
        }

        const parsed = JSON.parse(raw) as Partial<AnalyticsReportConfig>;
        setReportConfig({
          reportTitle: parsed.reportTitle || DEFAULT_ANALYTICS_REPORT_CONFIG.reportTitle,
          includeRecommendations: parsed.includeRecommendations ?? DEFAULT_ANALYTICS_REPORT_CONFIG.includeRecommendations,
          generatedBy: parsed.generatedBy || DEFAULT_ANALYTICS_REPORT_CONFIG.generatedBy,
        });
      } catch {
        setReportConfig(DEFAULT_ANALYTICS_REPORT_CONFIG);
      }
    };

    syncExtension();
    syncConfig();
    window.addEventListener('storage', syncExtension);
    window.addEventListener('storage', syncConfig);
    window.addEventListener('sc-extension-packs-updated', syncExtension as EventListener);

    return () => {
      window.removeEventListener('storage', syncExtension);
      window.removeEventListener('storage', syncConfig);
      window.removeEventListener('sc-extension-packs-updated', syncExtension as EventListener);
    };
  }, []);

  const handleGenerateReport = () => {
    const report = generateWorkshopAnalyticsReport(
      analytics,
      { totalCustomers: customers.length, totalJobs: jobs.length, totalMechanics: mechanics.length },
      {
        reportTitle: reportConfig.reportTitle,
        includeRecommendations: reportConfig.includeRecommendations,
        generatedBy: reportConfig.generatedBy,
      }
    );

    setGeneratedReport(report);
  };

  const handleDownloadReport = () => {
    if (!generatedReport.trim()) return;

    const blob = new Blob([generatedReport], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    const safeName = (reportConfig.reportTitle || 'workshop-analytics-report')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    anchor.href = url;
    anchor.download = `${safeName || 'workshop-analytics-report'}-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

  const metricCards = [
    {
      label: 'Total Revenue',
      value: `Rs.${analytics.totalRevenue.toLocaleString()}`,
      detail: 'Revenue recorded from completed and delivered jobs.',
      icon: IndianRupee,
    },
    {
      label: 'Jobs Completed',
      value: analytics.completedJobs,
      detail: 'Completed and delivered jobs counted together.',
      icon: ClipboardList,
    },
    {
      label: 'Total Customers',
      value: customers.length,
      detail: 'Customers with service history in the workshop.',
      icon: Users,
    },
    {
      label: 'Average Rating',
      value: `${avgRating}/5`,
      detail: 'Average of current mechanic ratings.',
      icon: Wrench,
    },
    {
      label: 'Average Ticket',
      value: `Rs.${Math.round(analytics.avgTicket).toLocaleString()}`,
      detail: 'Average billed value per completed job.',
      icon: TrendingUp,
    },
    {
      label: 'Average TAT',
      value: `${analytics.avgTurnaroundHours.toFixed(1)} hrs`,
      detail: 'Average time taken to close completed jobs.',
      icon: TimerReset,
    },
    {
      label: 'Completion Rate',
      value: `${analytics.completionRate.toFixed(1)}%`,
      detail: 'How many jobs moved all the way to completion.',
      icon: CheckCircle2,
    },
    {
      label: 'Repeat Customers',
      value: `${analytics.repeatCustomerRate.toFixed(1)}%`,
      detail: 'Share of customers who returned for another visit.',
      icon: Repeat,
    },
  ];

  const signalCards = [
    {
      label: 'Open Pipeline Value',
      value: `Rs.${Math.round(analytics.estimatedPipelineValue).toLocaleString()}`,
      detail: 'Estimated value still sitting in active and pending jobs.',
      icon: Wallet,
    },
    {
      label: 'Revenue Realization',
      value: `${analytics.realizationRate.toFixed(1)}%`,
      detail: 'Actual billed revenue compared with estimated completed value.',
      icon: TrendingUp,
    },
    {
      label: 'Fast Delivery',
      value: `${analytics.jobsCompletedWithin48hRate.toFixed(1)}%`,
      detail: 'Share of jobs completed in forty-eight hours or less.',
      icon: Activity,
    },
  ];

  const monthCards = [
    {
      label: 'This Month Revenue',
      value: `Rs.${analytics.monthlyRevenue.toLocaleString()}`,
      detail: trendRevenue,
    },
    {
      label: 'This Month Completed Jobs',
      value: analytics.monthlyCompletedJobs,
      detail: trendJobs,
    },
    {
      label: 'Top Mechanic',
      value: analytics.topMechanic,
      detail: 'Based on completed jobs this month.',
    },
  ];

  return (
    <div className="max-w-7xl space-y-6">
      <WorkshopPageHeader
        eyebrow="Workshop"
        title="Analytics"
        description="Follow revenue, turnaround time, repair mix, and team performance with a calmer operational view."
        breadcrumbs={[
          <Link key="workshop" to="/service-center" className="hover:text-foreground transition-colors">
            Workshop
          </Link>,
          'Analytics',
        ]}
        meta={
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="rounded-full px-3 py-1 text-[11px] font-medium">
              {jobs.length} total jobs
            </Badge>
            <Badge variant="secondary" className="rounded-full px-3 py-1 text-[11px] font-medium">
              {mechanics.length} mechanics tracked
            </Badge>
            <Badge variant="secondary" className="rounded-full px-3 py-1 text-[11px] font-medium">
              {customers.length} customers tracked
            </Badge>
          </div>
        }
        actions={
          reportExtensionEnabled ? (
            <>
              <Button variant="outline" className="h-10 rounded-xl border-border/50" onClick={handleGenerateReport}>
                <FileText className="mr-1.5 h-4 w-4" /> Generate Report
              </Button>
              <Button className="h-10 rounded-xl bg-foreground px-4 text-background hover:bg-foreground/90" onClick={handleDownloadReport} disabled={!generatedReport.trim()}>
                <Download className="mr-1.5 h-4 w-4" /> Download Report
              </Button>
            </>
          ) : undefined
        }
      />

      <section className="rounded-3xl border border-border/50 bg-card/70 p-5 sm:p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border/40 bg-background text-primary">
            <LineChart className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Performance Overview</h2>
            <p className="text-sm text-muted-foreground">Core business metrics for revenue, delivery health, and customer retention.</p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {metricCards.map((card) => (
            <div key={card.label} className="rounded-2xl border border-border/40 bg-background/80 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">{card.label}</p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight">{card.value}</p>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/40 bg-muted/20 text-primary">
                  <card.icon className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{card.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section className="space-y-6">
          <div className="grid gap-3 lg:grid-cols-3">
            {signalCards.map((card) => (
              <div key={card.label} className="rounded-2xl border border-border/50 bg-card/70 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">{card.label}</p>
                    <p className="mt-2 text-xl font-semibold tracking-tight">{card.value}</p>
                  </div>
                  <card.icon className="mt-1 h-4 w-4 text-muted-foreground" />
                </div>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{card.detail}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <DailyRevenueChart data={analytics.dailyRevenue} />
            <MonthlyServicesChart data={analytics.monthlyServices} />
          </div>

          <RepairTypesChart data={analytics.repairTypes} />

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="glass-card rounded-2xl border border-border/50 p-6 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="font-semibold">Top Repair Mix</h3>
                  <p className="mt-1 text-xs text-muted-foreground">Most common repairs based on live job text and service tasks.</p>
                </div>
                <Badge variant="secondary" className="rounded-full px-3 py-1 text-[11px] font-medium">
                  {totalRepairs} repair entries
                </Badge>
              </div>

              <div className="space-y-3">
                {analytics.repairTypes.length === 0 && (
                  <p className="text-sm text-muted-foreground">No repair data available yet.</p>
                )}
                {analytics.repairTypes.map((item) => {
                  const share = totalRepairs > 0 ? (item.count / totalRepairs) * 100 : 0;
                  return (
                    <div key={item.type} className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{item.type}</span>
                        <span className="text-muted-foreground">{item.count} jobs ({share.toFixed(1)}%)</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-secondary">
                        <div className="h-full bg-primary" style={{ width: `${Math.min(100, Math.max(0, share))}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="glass-card rounded-2xl border border-border/50 p-6 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="font-semibold">Mechanic Performance</h3>
                  <p className="mt-1 text-xs text-muted-foreground">Leaderboard ordered by completed jobs and supported by revenue and TAT.</p>
                </div>
                <Badge variant="secondary" className="rounded-full px-3 py-1 text-[11px] font-medium">
                  {analytics.mechanicPerformance.length} ranked
                </Badge>
              </div>

              <div className="space-y-2">
                {analytics.mechanicPerformance.length === 0 && (
                  <p className="text-sm text-muted-foreground">No mechanic performance data available.</p>
                )}
                {analytics.mechanicPerformance.map((mechanic, index) => (
                  <div key={mechanic.mechanicId} className="flex items-center justify-between gap-3 rounded-2xl border border-border/50 bg-background/70 p-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-medium">{mechanic.mechanicName}</p>
                        <Badge variant="outline" className="h-5 text-[10px]">#{index + 1}</Badge>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {mechanic.completedJobs} completed • Rs.{Math.round(mechanic.revenue).toLocaleString()} revenue • TAT {mechanic.avgTurnaroundHours.toFixed(1)}h
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Active</p>
                      <p className="text-sm font-semibold">{mechanic.activeJobs}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <aside className="space-y-4 xl:sticky xl:top-20 self-start">
          <div className="rounded-3xl border border-border/50 bg-card/70 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Monthly Snapshot</p>
            <div className="mt-4 space-y-3">
              {monthCards.map((card) => (
                <div key={card.label} className="rounded-2xl border border-border/40 bg-background/80 p-4">
                  <p className="text-[11px] font-medium text-muted-foreground">{card.label}</p>
                  <p className="mt-2 text-xl font-semibold tracking-tight">{card.value}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{card.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-border/50 bg-card/70 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">What To Watch</p>
            <div className="mt-4 space-y-3 text-sm">
              <div className="rounded-2xl border border-border/40 bg-background/80 p-4">
                <p className="font-medium">Revenue trend</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{trendRevenue}</p>
              </div>
              <div className="rounded-2xl border border-border/40 bg-background/80 p-4">
                <p className="font-medium">Job flow trend</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{trendJobs}</p>
              </div>
              <div className="rounded-2xl border border-border/40 bg-background/80 p-4">
                <p className="font-medium">Delivery health</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {analytics.jobsCompletedWithin48hRate.toFixed(1)}% of jobs are closing inside two days.
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {reportExtensionEnabled && (
        <section className="rounded-3xl border border-border/50 bg-card/70 p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Analytics Report</p>
              <h2 className="mt-2 text-lg font-semibold">Workshop report generator</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Create a management-ready summary from the live workshop numbers shown on this page.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" className="h-10 rounded-xl border-border/50" onClick={handleGenerateReport}>
                <FileText className="mr-1.5 h-4 w-4" /> Generate Report
              </Button>
              <Button className="h-10 rounded-xl bg-foreground px-4 text-background hover:bg-foreground/90" onClick={handleDownloadReport} disabled={!generatedReport.trim()}>
                <Download className="mr-1.5 h-4 w-4" /> Download Report
              </Button>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-border/40 bg-background/80 p-4">
              <p className="text-[11px] font-medium text-muted-foreground">Report Title</p>
              <p className="mt-2 text-sm font-medium">{reportConfig.reportTitle}</p>
            </div>
            <div className="rounded-2xl border border-border/40 bg-background/80 p-4">
              <p className="text-[11px] font-medium text-muted-foreground">Generated By</p>
              <p className="mt-2 text-sm font-medium">{reportConfig.generatedBy}</p>
            </div>
            <div className="rounded-2xl border border-border/40 bg-background/80 p-4">
              <p className="text-[11px] font-medium text-muted-foreground">Recommendations</p>
              <p className="mt-2 text-sm font-medium">{reportConfig.includeRecommendations ? 'Included' : 'Excluded'}</p>
            </div>
          </div>

          <Textarea
            value={generatedReport}
            onChange={(event) => setGeneratedReport(event.target.value)}
            placeholder="Click Generate Report to create a workshop summary from the current analytics."
            className="mt-5 min-h-[240px] rounded-2xl border-border/50 bg-background font-mono text-xs"
          />
        </section>
      )}
    </div>
  );
};

export default SCAnalytics;
