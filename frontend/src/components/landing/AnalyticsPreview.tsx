import { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, IndianRupee, ClipboardList } from 'lucide-react';

const chartData = [
  { day: 'Mon', revenue: 18400, jobs: 8,  value: 51 },
  { day: 'Tue', revenue: 24800, jobs: 11, value: 69 },
  { day: 'Wed', revenue: 21200, jobs: 9,  value: 59 },
  { day: 'Thu', revenue: 33600, jobs: 15, value: 93 },
  { day: 'Fri', revenue: 28400, jobs: 13, value: 79 },
  { day: 'Sat', revenue: 36000, jobs: 16, value: 100 },
  { day: 'Sun', revenue: 10000, jobs: 4,  value: 28 },
];

const kpiCards = [
  {
    icon: IndianRupee,
    title: 'Monthly Revenue',
    value: '₹6.8 Lakhs',
    sub: '↑ 23% vs last month',
    subColor: 'text-success',
    gradient: 'from-emerald-500/20 via-teal-500/10 to-transparent',
  },
  {
    icon: ClipboardList,
    title: 'Jobs Completed',
    value: '312 jobs',
    sub: 'Avg ₹2,180 per job',
    subColor: 'text-muted-foreground',
    gradient: 'from-blue-500/20 via-cyan-500/10 to-transparent',
  },
  {
    icon: TrendingUp,
    title: 'Avg Ticket Size',
    value: '₹2,180',
    sub: '↑ 15% vs last quarter',
    subColor: 'text-success',
    gradient: 'from-violet-500/20 via-indigo-500/10 to-transparent',
  },
  {
    icon: BarChart3,
    title: 'Mechanic Efficiency',
    value: '87% utilization',
    sub: '14 of 16 mechanics active',
    subColor: 'text-muted-foreground',
    gradient: 'from-amber-500/20 via-orange-500/10 to-transparent',
  },
];

export function AnalyticsPreview() {
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  return (
    <section id="analytics" className="py-24 px-6 surface-sunken">
      <div className="max-w-[1200px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-90px' }}
          transition={{ duration: 0.45 }}
          className="text-center mb-14"
        >
          <p className="text-xs font-semibold text-accent uppercase tracking-[0.2em] mb-3">Analytics</p>
          <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight mb-3">
            Know Your Workshop's Numbers
          </h2>
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            Real-time revenue dashboards, mechanic utilization charts, and job completion trends — so you always know where your business stands.
          </p>
        </motion.div>

        {/* KPI Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {kpiCards.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-70px' }}
              transition={{ delay: i * 0.07, duration: 0.45 }}
              className={`rounded-2xl border border-border/60 bg-gradient-to-br ${card.gradient} p-5 hover:-translate-y-1 transition-transform duration-300`}
            >
              <div className="w-10 h-10 rounded-xl bg-background/70 border border-border/50 flex items-center justify-center mb-4">
                <card.icon className="h-5 w-5 text-accent" />
              </div>
              <p className="text-xs text-muted-foreground mb-1">{card.title}</p>
              <p className="text-xl font-display font-bold mb-1">{card.value}</p>
              <p className={`text-[11px] ${card.subColor}`}>{card.sub}</p>
            </motion.div>
          ))}
        </div>

        {/* Revenue bar chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="rounded-2xl border border-border/60 bg-card/50 p-6"
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-sm font-semibold">This Week's Revenue</p>
              <p className="text-xs text-muted-foreground">Daily breakdown across all job completions</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-display font-bold">₹1,72,400</p>
              <p className="text-[11px] text-success">↑ 18% vs last week</p>
            </div>
          </div>
          <div className="relative">
            {/* Y-axis guide lines */}
            <div className="absolute inset-x-0 top-0 bottom-6 flex flex-col justify-between pointer-events-none">
              {[36000, 27000, 18000, 9000, 0].map((v) => (
                <div key={v} className="flex items-center gap-2">
                  <span className="text-[9px] text-muted-foreground/50 w-10 text-right shrink-0">
                    ₹{v >= 1000 ? `${v / 1000}k` : '0'}
                  </span>
                  <div className="flex-1 border-t border-dashed border-border/30" />
                </div>
              ))}
            </div>

            {/* Bars */}
            <div className="flex items-end gap-2 h-44 pl-12 pb-6">
              {chartData.map((d, i) => {
                const isHovered = hoveredBar === i;
                return (
                  <motion.div
                    key={d.day}
                    initial={{ scaleY: 0, originY: 1 }}
                    whileInView={{ scaleY: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="flex-1 flex flex-col items-center gap-1 group cursor-pointer relative"
                    onMouseEnter={() => setHoveredBar(i)}
                    onMouseLeave={() => setHoveredBar(null)}
                  >
                    {/* Tooltip */}
                    {isHovered && (
                      <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute -top-14 left-1/2 -translate-x-1/2 z-10 bg-foreground text-background text-[10px] font-semibold rounded-lg px-2.5 py-1.5 whitespace-nowrap shadow-xl"
                      >
                        <div>₹{d.revenue.toLocaleString('en-IN')}</div>
                        <div className="font-normal opacity-70">{d.jobs} jobs</div>
                        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 bg-foreground" />
                      </motion.div>
                    )}

                    {/* Revenue label above bar */}
                    <span className={`text-[9px] font-bold transition-colors duration-200 ${isHovered ? 'text-accent' : 'text-muted-foreground/60'}`}>
                      ₹{d.revenue >= 1000 ? `${(d.revenue / 1000).toFixed(0)}k` : d.revenue}
                    </span>

                    {/* Bar */}
                    <div
                      className={`w-full rounded-t-lg transition-all duration-300 ${
                        d.day === 'Sat'
                          ? 'bg-gradient-to-t from-accent to-blue-400'
                          : isHovered
                            ? 'bg-gradient-to-t from-accent/80 to-accent/60'
                            : 'bg-gradient-to-t from-accent/50 to-accent/30'
                      }`}
                      style={{ height: `${d.value}%` }}
                    />

                    {/* Day label */}
                    <p className={`text-[10px] transition-colors duration-200 ${isHovered ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>
                      {d.day}
                    </p>
                  </motion.div>
                );
              })}
            </div>

            {/* Bottom legend */}
            <div className="flex items-center gap-4 pt-2 pl-12 text-[10px] text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-2 rounded-sm bg-gradient-to-r from-accent to-blue-400" />
                <span>Highest day (Sat)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-2 rounded-sm bg-accent/40" />
                <span>Other days</span>
              </div>
            </div>
          </div>

          {/* Daily summary row */}
          <div className="mt-5 grid grid-cols-7 gap-1.5">
            {chartData.map((d) => (
              <div key={`${d.day}-sum`} className="text-center rounded-lg bg-secondary/40 py-2">
                <p className="text-[9px] text-muted-foreground mb-0.5">{d.day}</p>
                <p className="text-[10px] font-bold">{d.jobs}</p>
                <p className="text-[8px] text-muted-foreground">jobs</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
