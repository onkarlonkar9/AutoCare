import { motion } from 'framer-motion';
import { Star, Quote, Wrench, Building2, ThumbsUp, IndianRupee, BadgeCheck } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const stats = [
  { icon: Building2, value: 500, suffix: '+', label: 'Workshops active' },
  { icon: Wrench, value: 10000, suffix: '+', label: 'Job cards created' },
  { icon: IndianRupee, value: 2, prefix: '₹', suffix: 'Cr+', label: 'Revenue tracked' },
  { icon: ThumbsUp, value: 49, suffix: '/5', label: 'Avg rating', divisor: 10 },
];

function CountUp({ target, prefix = '', suffix = '', divisor = 1 }: { target: number; prefix?: string; suffix?: string; divisor?: number }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLParagraphElement>(null);
  const ran = useRef(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !ran.current) {
        ran.current = true;
        let start = 0;
        const dur = 1000;
        const step = (ts: number) => {
          if (!start) start = ts;
          const p = Math.min((ts - start) / dur, 1);
          const ease = 1 - Math.pow(1 - p, 3);
          setVal(Math.floor(ease * target));
          if (p < 1) requestAnimationFrame(step);
          else setVal(target);
        };
        requestAnimationFrame(step);
      }
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target]);

  const display = divisor > 1 ? (val / divisor).toFixed(1) : val.toLocaleString();
  return <p ref={ref} className="text-2xl font-display font-extrabold tracking-tight">{prefix}{display}{suffix}</p>;
}

const testimonials = [
  {
    name: 'Rajesh Kumar',
    role: 'Service Center Owner, Bangalore',
    initials: 'RK',
    color: 'from-blue-500 to-cyan-400',
    ring: 'ring-blue-500/30',
    content: 'Before AutoCare AI, I was managing everything on paper. Now job cards, invoices, and mechanic status are all on one screen. My cashflow improved 40% in 3 months.',
    rating: 5,
  },
  {
    name: 'Mohammed Auto Hub',
    role: '12-Bay Workshop, Hyderabad',
    initials: 'MH',
    color: 'from-violet-500 to-fuchsia-400',
    ring: 'ring-violet-500/30',
    content: 'Customer calls asking "is my car ready?" dropped by 80% after we started using the automated status updates. The team loves it.',
    rating: 5,
  },
  {
    name: 'Suresh Multi-Service Center',
    role: 'Multi-Branch, Chennai & Coimbatore',
    initials: 'SM',
    color: 'from-emerald-500 to-teal-400',
    ring: 'ring-emerald-500/30',
    content: 'I can see both branches in real-time from my phone. Revenue dashboard, open jobs, mechanic load — everything. Game changer for expansion.',
    rating: 5,
  },
];

export const Testimonials = () => {
  return (
    <section className="py-28 px-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-accent/5 blur-[80px] rounded-full" />
      </div>

      <div className="max-w-[1100px] mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <p className="text-xs font-semibold text-accent uppercase tracking-[0.2em] mb-3">Social Proof</p>
          <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight mb-3">
            Trusted by workshops{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-violet-600">across India</span>
          </h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Hundreds of service centers have already made the switch to digital. Here's what they say.
          </p>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-14"
        >
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, scale: 0.92 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.45 }}
              className="glass-card rounded-2xl p-5 text-center hover:-translate-y-1 transition-transform duration-300"
            >
              <s.icon className="h-5 w-5 text-accent mx-auto mb-2" />
              <CountUp target={s.value} prefix={s.prefix} suffix={s.suffix} divisor={s.divisor} />
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Trust marks row */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 mb-16 opacity-30 grayscale hover:grayscale-0 transition-all duration-500"
        >
          {['MARUTI', 'HYUNDAI', 'TATA', 'MAHINDRA', 'TOYOTA'].map(brand => (
            <span key={brand} className="text-xs font-black tracking-widest text-foreground/60">{brand}</span>
          ))}
        </motion.div>

        {/* Testimonial cards */}
        <div className="grid md:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ delay: i * 0.1, duration: 0.45 }}
              className="glass-card rounded-2xl p-6 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col"
            >
              <Quote className="h-5 w-5 text-accent/25 mb-3" />
              <p className="text-sm leading-relaxed mb-5 text-foreground/90 flex-1">{t.content}</p>

              {/* Stars */}
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="h-3.5 w-3.5 fill-warning text-warning" />
                ))}
              </div>

              <div className="flex items-center gap-3">
                {/* Gradient ring avatar */}
                <div className={`p-[2px] rounded-full bg-gradient-to-br ${t.color} ring-2 ${t.ring}`}>
                  <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-white text-xs font-bold`}>
                    {t.initials}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="font-display font-semibold text-sm">{t.name}</p>
                    <BadgeCheck className="h-3.5 w-3.5 text-blue-400" />
                  </div>
                  <p className="text-[11px] text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
