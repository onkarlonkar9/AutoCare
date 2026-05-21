import { motion } from 'framer-motion';
import { UserRound, ClipboardCheck, Wrench, Receipt } from 'lucide-react';

const steps = [
  {
    icon: UserRound,
    title: 'Customer Walks In',
    description: 'Staff registers the customer and vehicle in seconds. All previous visit history loads automatically.',
    sublabel: '~30 seconds',
    color: 'text-blue-400',
    iconBg: 'bg-blue-500/10 border-blue-500/20',
    gradientBadge: 'from-blue-500 to-cyan-500',
    glow: 'shadow-[0_4px_24px_-6px_rgba(59,130,246,0.5)]',
  },
  {
    icon: ClipboardCheck,
    title: 'Create a Job Card',
    description: 'Select complaint category, assign a bay, attach visual inspection photos, and estimate cost — all digitally.',
    sublabel: '~60 seconds',
    color: 'text-violet-400',
    iconBg: 'bg-violet-500/10 border-violet-500/20',
    gradientBadge: 'from-violet-500 to-fuchsia-500',
    glow: 'shadow-[0_4px_24px_-6px_rgba(139,92,246,0.5)]',
  },
  {
    icon: Wrench,
    title: 'Work Begins',
    description: 'The assigned mechanic sees the job on their screen. Status updates in real-time on the dashboard.',
    sublabel: 'Real-time',
    color: 'text-amber-400',
    iconBg: 'bg-amber-500/10 border-amber-500/20',
    gradientBadge: 'from-amber-500 to-orange-500',
    glow: 'shadow-[0_4px_24px_-6px_rgba(245,158,11,0.5)]',
  },
  {
    icon: Receipt,
    title: 'Invoice & Delivery',
    description: 'Generate a GST invoice and gate pass in one click. Customer gets notified. Job is closed digitally.',
    sublabel: '~10 seconds',
    color: 'text-emerald-400',
    iconBg: 'bg-emerald-500/10 border-emerald-500/20',
    gradientBadge: 'from-emerald-500 to-teal-500',
    glow: 'shadow-[0_4px_24px_-6px_rgba(16,185,129,0.5)]',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-28 px-6 surface-sunken relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>

      <div className="max-w-[1100px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <p className="text-xs font-semibold text-accent uppercase tracking-[0.2em] mb-3">How It Works</p>
          <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight mb-3">
            From walk-in to invoice in{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-violet-600">4 steps</span>
          </h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            AutoCare AI streamlines the entire service workflow so your team can focus on the work, not the paperwork.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ delay: i * 0.12, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="relative text-center group"
            >
              {/* Animated connector line (desktop) */}
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-9 left-[calc(50%+44px)] w-[calc(100%-88px)] h-px overflow-hidden">
                  <motion.div
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.12 + 0.3, duration: 0.6, ease: 'easeOut' }}
                    className="origin-left h-full bg-gradient-to-r from-accent/50 via-accent/20 to-accent/50"
                    style={{ originX: 0 }}
                  />
                </div>
              )}

              {/* Step number badge + icon */}
              <div className="relative inline-flex mb-5">
                <div className={`w-[72px] h-[72px] rounded-2xl ${step.iconBg} border flex items-center justify-center group-hover:scale-105 transition-transform duration-300 ${step.glow}`}>
                  <step.icon className={`h-7 w-7 ${step.color}`} />
                </div>
                <span className={`absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gradient-to-br ${step.gradientBadge} text-white text-[10px] font-extrabold flex items-center justify-center shadow-md`}>
                  {i + 1}
                </span>
              </div>

              <h3 className="font-display font-bold text-sm mb-1.5">{step.title}</h3>
              <p className="text-muted-foreground text-xs leading-relaxed max-w-[200px] mx-auto mb-3">{step.description}</p>

              {/* Sub-label pill */}
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${step.iconBg} ${step.color} border-opacity-30`}>
                {step.sublabel}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
