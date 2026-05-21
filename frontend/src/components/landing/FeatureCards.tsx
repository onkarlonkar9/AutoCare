import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ClipboardList, Receipt, Wrench, Users, BarChart3, Bell,
  ArrowRight, Check
} from 'lucide-react';

const features = [
  {
    icon: ClipboardList,
    title: 'Digital Job Cards',
    description: 'Create standardized, GST-compliant job cards in seconds — with vehicle checklist, complaint categories, bay assignment, and mechanic selection.',
    color: 'blue',
    accent: 'from-blue-500/30 via-cyan-500/15 to-transparent',
    glow: 'shadow-[0_20px_60px_-15px_rgba(59,130,246,0.5)]',
    ring: 'ring-blue-500/30',
    iconBg: 'bg-blue-500/10 border-blue-500/25 text-blue-400',
    bullets: ['60-second intake', 'Visual inspection tool', 'Photo attachment'],
  },
  {
    icon: Receipt,
    title: 'Smart Invoicing & Gate Pass',
    description: 'Generate professional GST invoices and vehicle gate passes instantly. One-click PDF print or WhatsApp share.',
    color: 'violet',
    accent: 'from-violet-500/30 via-fuchsia-500/15 to-transparent',
    glow: 'shadow-[0_20px_60px_-15px_rgba(139,92,246,0.5)]',
    ring: 'ring-violet-500/30',
    iconBg: 'bg-violet-500/10 border-violet-500/25 text-violet-400',
    bullets: ['GST-ready templates', 'Instant PDF export', 'Gate pass included'],
  },
  {
    icon: Wrench,
    title: 'Mechanic Management',
    description: 'Assign jobs by skill and availability. Track live workload, busy/available status, and individual productivity.',
    color: 'indigo',
    accent: 'from-indigo-500/30 via-blue-500/15 to-transparent',
    glow: 'shadow-[0_20px_60px_-15px_rgba(99,102,241,0.5)]',
    ring: 'ring-indigo-500/30',
    iconBg: 'bg-indigo-500/10 border-indigo-500/25 text-indigo-400',
    bullets: ['Smart assignment', 'Live status tracking', 'Productivity reports'],
  },
  {
    icon: Users,
    title: 'Customer & Vehicle CRM',
    description: 'Every customer visit, complaint, invoice, and vehicle detail — logged automatically and searchable in seconds.',
    color: 'amber',
    accent: 'from-amber-500/30 via-orange-500/15 to-transparent',
    glow: 'shadow-[0_20px_60px_-15px_rgba(245,158,11,0.5)]',
    ring: 'ring-amber-500/30',
    iconBg: 'bg-amber-500/10 border-amber-500/25 text-amber-400',
    bullets: ['Full service history', 'Vehicle-wise records', 'Return customer alerts'],
  },
  {
    icon: BarChart3,
    title: 'Revenue & Analytics',
    description: 'Live revenue dashboard, daily job completion rates, average ticket size, and mechanic utilization — all from one screen.',
    color: 'emerald',
    accent: 'from-emerald-500/30 via-teal-500/15 to-transparent',
    glow: 'shadow-[0_20px_60px_-15px_rgba(16,185,129,0.5)]',
    ring: 'ring-emerald-500/30',
    iconBg: 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400',
    bullets: ['Daily revenue report', 'Weekly trend charts', 'Per-mechanic analytics'],
  },
  {
    icon: Bell,
    title: 'Customer Communication',
    description: 'Automated delivery alerts, service reminders, and follow-up prompts — reduce no-shows and grow repeat business.',
    color: 'pink',
    accent: 'from-pink-500/30 via-rose-500/15 to-transparent',
    glow: 'shadow-[0_20px_60px_-15px_rgba(236,72,153,0.5)]',
    ring: 'ring-pink-500/30',
    iconBg: 'bg-pink-500/10 border-pink-500/25 text-pink-400',
    bullets: ['Delivery notifications', 'Service reminders', 'Follow-up automation'],
  },
];

export function FeatureCards() {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <section id="product-overview" className="py-28 px-6">
      <div className="max-w-[1260px] mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <p className="text-xs font-semibold text-accent uppercase tracking-[0.25em] mb-3">Features</p>
          <h2 className="text-4xl md:text-5xl font-display font-extrabold tracking-tight mb-4">
            Everything Your{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-600">
              Workshop Needs
            </span>
          </h2>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            From the first customer walk-in to the final invoice — AutoCare AI handles the entire service workflow digitally, so your team can focus on the work.
          </p>
        </motion.div>

        {/* Feature grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: i * 0.07, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              className="h-full"
            >
              <div
                className={`
                  group relative overflow-hidden rounded-2xl border border-border/60 
                  bg-gradient-to-br ${feature.accent} 
                  p-6 h-full flex flex-col
                  transition-all duration-500 ease-out
                  ${hovered === i
                    ? `${feature.glow} -translate-y-2 ring-1 ${feature.ring}`
                    : 'hover:-translate-y-1'
                  }
                `}
              >
                {/* Inner shimmer */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-tr from-transparent via-white/[0.04] to-transparent transition-opacity duration-700 pointer-events-none" />

                {/* Corner number */}
                <span className="absolute top-4 right-4 text-[10px] font-bold text-muted-foreground/30 select-none">
                  0{i + 1}
                </span>

                {/* Icon */}
                <div className={`w-11 h-11 rounded-xl border flex items-center justify-center mb-5 transition-all duration-300 group-hover:scale-110 ${feature.iconBg}`}>
                  <feature.icon className="h-5 w-5" />
                </div>

                {/* Text */}
                <h3 className="font-display font-bold text-base mb-2 group-hover:text-foreground transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed mb-5 flex-1">
                  {feature.description}
                </p>

                {/* Bullet pills */}
                <ul className="space-y-1.5 mb-5">
                  {feature.bullets.map((b) => (
                    <li key={b} className="flex items-center gap-2 text-[11px] text-muted-foreground">
                      <Check className="h-3 w-3 text-success shrink-0" />
                      {b}
                    </li>
                  ))}
                </ul>

                {/* CTA link */}
                <div className="flex items-center gap-1 text-[11px] font-semibold text-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Learn more <ArrowRight className="h-3 w-3" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
