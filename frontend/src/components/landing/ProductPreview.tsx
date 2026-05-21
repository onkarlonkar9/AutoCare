import { type ComponentType, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, Car, ClipboardList, BarChart3 } from 'lucide-react';

type PreviewTab = 'dashboard' | 'vehicles' | 'job-cards' | 'analytics';

const tabs: Array<{ key: PreviewTab; label: string; icon: ComponentType<{ className?: string }> }> = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'vehicles', label: 'Vehicles', icon: Car },
  { key: 'job-cards', label: 'Job Cards', icon: ClipboardList },
  { key: 'analytics', label: 'Analytics', icon: BarChart3 },
];

const tabContent: Record<PreviewTab, { title: string; subtitle: string; metrics: string[]; chart: number[] }> = {
  dashboard: {
    title: 'Live Workshop Dashboard',
    subtitle: 'Monitor active jobs, service completion, and workshop throughput in real time.',
    metrics: ['124 Active Jobs', '96% On-time Delivery', '18 AI Alerts Raised'],
    chart: [34, 41, 38, 54, 63, 59, 66],
  },
  vehicles: {
    title: 'Vehicle Tracking and History',
    subtitle: 'Track every vehicle profile, service timeline, and preventive maintenance status.',
    metrics: ['4,286 Vehicles Tracked', '91% Data Completeness', 'Avg 7.2 Service Records / Vehicle'],
    chart: [28, 35, 44, 39, 48, 55, 61],
  },
  'job-cards': {
    title: 'Digital Job Card Operations',
    subtitle: 'Create, assign, and move jobs across intake, diagnostics, service, and delivery.',
    metrics: ['67 Jobs In Progress', '14 Mechanics Assigned', '11% Faster Job Closure'],
    chart: [22, 31, 29, 42, 50, 47, 58],
  },
  analytics: {
    title: 'Business Analytics Console',
    subtitle: 'View revenue trends, cost insights, and performance dashboards for strategic decisions.',
    metrics: ['Rs 8.4L Monthly Revenue', '82% Repeat Customers', '14% Margin Improvement'],
    chart: [25, 30, 37, 46, 51, 62, 70],
  },
};

export function ProductPreview() {
  const [activeTab, setActiveTab] = useState<PreviewTab>('dashboard');
  const content = useMemo(() => tabContent[activeTab], [activeTab]);

  return (
    <section id="live-preview" className="py-24 px-6">
      <div className="max-w-[1200px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.45 }}
          className="text-center mb-12"
        >
          <p className="text-xs font-semibold text-accent uppercase tracking-[0.2em] mb-3">Live Dashboard Preview</p>
          <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight mb-3">See the platform in action</h2>
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            Explore how AutoCare AI handles vehicle dashboards, service history, alignment reports, and analytics from one browser-like workspace.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="rounded-3xl border border-border/60 bg-card/55 backdrop-blur overflow-hidden shadow-[0_30px_80px_-45px_rgba(37,99,235,0.45)]"
        >
          <div className="h-10 border-b border-border/50 flex items-center gap-2 px-4 bg-card/80">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/70" />
            <p className="text-[11px] text-muted-foreground ml-1">autocare-ai.app/live-preview</p>
          </div>

          <div className="p-4 sm:p-5 md:p-6 bg-gradient-to-br from-blue-500/10 via-violet-500/8 to-cyan-500/10">
            <div className="grid sm:grid-cols-4 gap-2 mb-4">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`rounded-xl px-3 py-2 text-left border transition-all ${
                    activeTab === tab.key
                      ? 'border-accent/60 bg-accent/10'
                      : 'border-border/50 bg-background/45 hover:bg-background/65'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <tab.icon className="h-3.5 w-3.5 text-accent" />
                    <span className="text-xs font-medium">{tab.label}</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="grid lg:grid-cols-[1.25fr_1fr] gap-3">
              <div className="rounded-2xl border border-border/50 bg-background/55 overflow-hidden">
                <div className="h-44 sm:h-52 bg-gradient-to-br from-blue-600/30 via-violet-600/25 to-cyan-500/20 relative">
                  <img src="/placeholder.svg" alt={`${content.title} preview`} className="absolute inset-0 h-full w-full object-cover opacity-35" loading="lazy" />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(0,0,0,0.45))]" />
                  <div className="absolute left-3 bottom-3">
                    <p className="text-xs sm:text-sm text-white font-semibold">{content.title}</p>
                    <p className="text-[11px] text-white/85 mt-0.5 max-w-md">{content.subtitle}</p>
                  </div>
                </div>
                <div className="p-3">
                  <div className="h-20 rounded-lg border border-border/50 bg-card/60 p-2 flex items-end gap-1.5">
                    {content.chart.map((h, idx) => (
                      <div key={`${activeTab}-bar-${idx}`} className="flex-1 rounded-sm bg-accent/80" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-border/50 bg-background/55 p-3 sm:p-4">
                <p className="text-xs font-semibold mb-2">Key Snapshot</p>
                <div className="space-y-2">
                  {content.metrics.map((metric) => (
                    <div key={metric} className="rounded-lg border border-border/50 bg-card/65 px-3 py-2 text-xs text-muted-foreground">
                      {metric}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
