import { motion } from 'framer-motion';
import { ClipboardList, Users, Wrench, Boxes, Receipt, MapPin } from 'lucide-react';

const features = [
  { icon: ClipboardList, title: 'Digital Job Cards', description: 'Structured, fast, paperless' },
  { icon: Users, title: 'Customer Management', description: 'Full visit & vehicle history' },
  { icon: Wrench, title: 'Mechanic Assignment', description: 'Smart workload balancing' },
  { icon: Boxes, title: 'Parts Tracking', description: 'Stock alerts & usage logs' },
  { icon: Receipt, title: 'Invoice Generation', description: 'GST-ready in one click' },
  { icon: MapPin, title: 'Service Bay Control', description: 'Live bay status board' },
];

export function WorkshopFeatures() {
  return (
    <section id="workshop" className="py-24 px-6">
      <div className="max-w-[1200px] mx-auto grid lg:grid-cols-2 gap-10 items-center">

        {/* Left — live dashboard mockup */}
        <motion.div
          initial={{ opacity: 0, x: -18 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-90px' }}
          transition={{ duration: 0.55 }}
          className="rounded-3xl border border-border/60 bg-card/60 backdrop-blur p-4 shadow-2xl"
        >
          <div className="h-9 border-b border-border/40 flex items-center gap-2 px-2 mb-3">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/70" />
            <p className="text-[11px] text-muted-foreground ml-1 font-mono">Workshop Control Panel</p>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-blue-500/15 via-violet-500/10 to-cyan-400/10 border border-border/50 p-4">
            {/* Top KPI row */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              {[
                { label: 'Open Jobs', value: '67', color: 'text-foreground' },
                { label: 'Mechanics', value: '14', color: 'text-accent' },
                { label: 'Revenue', value: '₹24.8k', color: 'text-success' },
              ].map((kpi) => (
                <div key={kpi.label} className="rounded-xl bg-background/60 border border-border/50 p-2.5 text-center">
                  <p className={`text-lg font-display font-bold ${kpi.color}`}>{kpi.value}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{kpi.label}</p>
                </div>
              ))}
            </div>

            {/* Job board rows */}
            <p className="text-[10px] font-semibold text-muted-foreground mb-2 px-1">Live Job Board</p>
            <div className="space-y-1.5">
              {[
                { plate: 'KA01AB1023', status: 'In Progress', dot: 'bg-accent' },
                { plate: 'TN22GH8891', status: 'Waiting Parts', dot: 'bg-warning' },
                { plate: 'MH12DN9044', status: 'Ready Delivery', dot: 'bg-success' },
              ].map((job) => (
                <div key={job.plate} className="flex items-center justify-between rounded-lg bg-background/55 border border-border/40 px-3 py-2">
                  <span className="font-mono text-[11px] font-semibold">{job.plate}</span>
                  <div className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${job.dot}`} />
                    <span className="text-[10px] text-muted-foreground">{job.status}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* AI insight */}
            <div className="mt-3 rounded-lg border border-accent/25 bg-accent/8 p-2.5">
              <p className="text-[10px] text-muted-foreground">
                <span className="text-accent font-semibold">AI Insight:</span> 3 jobs approaching promised delivery time. Customer notifications sent automatically.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Right — text + feature pills */}
        <motion.div
          initial={{ opacity: 0, x: 18 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-90px' }}
          transition={{ duration: 0.55, delay: 0.06 }}
        >
          <p className="text-xs font-semibold text-accent uppercase tracking-[0.2em] mb-3">Workshop Tools</p>
          <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight mb-4">
            Built for Workshops That Want to Scale
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-7">
            Every tool your team needs — from intake to invoice, from bay assignment to business analytics. AutoCare AI was designed from the ground up for high-volume service centers.
          </p>

          <div className="grid grid-cols-2 gap-2.5">
            {features.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07, duration: 0.4 }}
                className="group rounded-xl border border-border/60 bg-card/50 hover:bg-card/80 hover:border-accent/30 p-3.5 flex items-center gap-3 transition-all duration-300 hover:-translate-y-0.5"
              >
                <div className="w-8 h-8 shrink-0 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center group-hover:bg-accent/15 transition-colors">
                  <item.icon className="h-4 w-4 text-accent" />
                </div>
                <div>
                  <p className="text-xs font-semibold">{item.title}</p>
                  <p className="text-[10px] text-muted-foreground">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
