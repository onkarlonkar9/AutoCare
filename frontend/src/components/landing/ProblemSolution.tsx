import { motion } from 'framer-motion';
import { X, Check, AlertTriangle, Zap } from 'lucide-react';

const problems = [
  'Job cards on paper — lost, illegible, or misplaced',
  'Mechanics standing idle waiting for assignments',
  'Customers calling repeatedly asking "is my car ready?"',
  'No idea how much revenue was collected today',
  'Invoice generation taking 20–30 minutes per job',
  'No record of past visits when a customer returns',
];

const solutions = [
  'Digital job cards created in under 60 seconds, always accessible',
  'Mechanic availability tracked live, jobs assigned instantly',
  'Automated delivery alerts and service status updates to customers',
  'Real-time revenue dashboard always visible on your screen',
  'GST invoice and gate pass generated with one click',
  'Full vehicle and customer history at your fingertips',
];

export function ProblemSolution() {
  return (
    <section className="py-28 px-6 relative overflow-hidden">
      {/* Subtle background accent */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-accent/5 blur-[120px]" />
      </div>

      <div className="max-w-[1100px] mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <p className="text-xs font-semibold text-accent uppercase tracking-[0.2em] mb-3">Why AutoCare AI</p>
          <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight mb-3">
            The paper-based workshop is{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">costing you money</span>
          </h2>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto">
            Modern service centers can't afford slow, manual processes. Here's what changes when you go digital.
          </p>
        </motion.div>

        <div className="relative grid md:grid-cols-[1fr_auto_1fr] gap-0 md:gap-4 items-stretch">
          {/* Without */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl border border-destructive/25 bg-gradient-to-br from-destructive/8 to-destructive/3 p-6 md:p-7"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-xl bg-destructive/15 border border-destructive/20 flex items-center justify-center">
                <AlertTriangle className="h-4.5 w-4.5 text-destructive" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-destructive/60 uppercase tracking-wider">Without AutoCare AI</p>
                <h3 className="font-display font-bold text-sm">Traditional Workshop</h3>
              </div>
            </div>
            <ul className="space-y-3.5">
              {problems.map((p, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07, duration: 0.4 }}
                  className="flex items-start gap-3 text-sm text-muted-foreground"
                >
                  <span className="w-5 h-5 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <X className="h-3 w-3 text-destructive" />
                  </span>
                  {p}
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* VS divider */}
          <div className="hidden md:flex flex-col items-center justify-center gap-2 px-2">
            <div className="flex-1 w-px bg-gradient-to-b from-transparent via-border to-transparent" />
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.4)] text-white text-[11px] font-extrabold flex-shrink-0">
              VS
            </div>
            <div className="flex-1 w-px bg-gradient-to-b from-transparent via-border to-transparent" />
          </div>

          {/* Mobile VS */}
          <div className="flex md:hidden items-center gap-3 my-2">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.4)] text-white text-[11px] font-extrabold">
              VS
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          </div>

          {/* With AutoCare AI */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="rounded-2xl border border-success/30 bg-gradient-to-br from-success/8 to-emerald-500/3 p-6 md:p-7 relative overflow-hidden"
          >
            {/* Glow */}
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-success/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center gap-3 mb-6 relative">
              <div className="w-9 h-9 rounded-xl bg-success/15 border border-success/25 flex items-center justify-center">
                <Zap className="h-4 w-4 text-success" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-success/70 uppercase tracking-wider">With AutoCare AI</p>
                <h3 className="font-display font-bold text-sm">Digital Workshop</h3>
              </div>
            </div>
            <ul className="space-y-3.5 relative">
              {solutions.map((s, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: 12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07, duration: 0.4 }}
                  className="flex items-start gap-3 text-sm text-foreground"
                >
                  <span className="w-5 h-5 rounded-full bg-success/15 border border-success/25 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="h-3 w-3 text-success" />
                  </span>
                  {s}
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
