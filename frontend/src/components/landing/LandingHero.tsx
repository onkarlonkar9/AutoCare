import { Link } from 'react-router-dom';
import { motion, useMotionValue, useTransform, animate, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles, ChevronDown, ClipboardList, IndianRupee, Wrench, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { AnimatedBrandLogo } from '@/components/shared/AnimatedBrandLogo';
import { useEffect, useRef, useState } from 'react';

function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !inView.current) {
          inView.current = true;
          let start = 0;
          const duration = 1200;
          const step = (timestamp: number) => {
            if (!start) start = timestamp;
            const progress = Math.min((timestamp - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(step);
            else setValue(target);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{value.toLocaleString()}{suffix}</span>;
}

const STATS = [
  { icon: ClipboardList, rawValue: 500, suffix: '+', label: 'Workshops Active' },
  { icon: Wrench, rawValue: 10000, suffix: '+', label: 'Job Cards Created' },
  { icon: IndianRupee, rawValue: 2, suffix: 'x', label: 'Avg Revenue Growth' },
];

const NAV_LINKS = [
  { label: 'Live Demo', href: '#interactive-demo' },
  { label: 'Features', href: '#product-overview' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Pricing', href: '#pricing' },
];

export function LandingHero() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  return (
    <section className="relative overflow-hidden px-6 pt-5 pb-20 lg:pb-28">
      {/* Background blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 left-[-120px] h-[480px] w-[480px] rounded-full bg-blue-500/20 blur-[120px]" />
        <div className="absolute top-[15%] right-[-90px] h-[400px] w-[400px] rounded-full bg-violet-500/18 blur-[120px]" />
        <div className="absolute bottom-[-160px] left-[35%] h-[440px] w-[440px] rounded-full bg-cyan-400/15 blur-[130px]" />
      </div>

      <div className="mx-auto max-w-[1250px] relative z-10">
        {/* Navbar */}
        <motion.nav
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="flex items-center justify-between mb-12"
        >
          <Link to="/" className="flex items-center gap-3 font-display font-bold text-lg">
            <AnimatedBrandLogo className="w-10 h-10 rounded-2xl border border-white/20" />
            AutoCare AI
          </Link>

          <div className="hidden lg:flex items-center gap-7 text-[13px] font-medium text-muted-foreground">
            {NAV_LINKS.map(link => (
              <a key={link.label} href={link.href} className="hover:text-foreground transition-colors">{link.label}</a>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link to="/login" className="hidden sm:block">
              <Button variant="ghost" className="rounded-xl h-8 text-xs">Log in</Button>
            </Link>
            <Link to="/signup" className="hidden sm:block">
              <Button className="rounded-xl h-8 text-xs px-4 gradient-primary text-primary-foreground">Start Free</Button>
            </Link>
            
            {/* Mobile menu button */}
            <button 
              className="lg:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </motion.nav>

        {/* Mobile menu overlay */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-0 z-[100] bg-background lg:hidden p-6 flex flex-col"
            >
              <div className="flex items-center justify-between mb-12">
                <Link to="/" className="flex items-center gap-3 font-display font-bold text-lg" onClick={() => setMobileMenuOpen(false)}>
                  <AnimatedBrandLogo className="w-10 h-10 rounded-2xl border border-white/20" />
                  AutoCare AI
                </Link>
                <button onClick={() => setMobileMenuOpen(false)} className="p-2">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex flex-col gap-6 text-xl font-medium">
                {NAV_LINKS.map(link => (
                  <a 
                    key={link.label} 
                    href={link.href} 
                    className="hover:text-primary transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </a>
                ))}
              </div>

              <div className="mt-auto space-y-4 pt-10 border-t border-border/50">
                <Link to="/login" className="block" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full py-6 rounded-xl text-lg">Log in</Button>
                </Link>
                <Link to="/signup" className="block" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full py-6 rounded-xl text-lg gradient-primary text-primary-foreground">Start Free</Button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-14 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="space-y-7"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-500/30 bg-gradient-to-r from-blue-500/10 to-violet-500/10 text-blue-500 dark:text-blue-400 text-xs font-semibold"
            >
              <Sparkles className="h-3.5 w-3.5" />
              India's #1 Workshop Management Platform
            </motion.div>

            <h1 className="text-[clamp(2.4rem,5.8vw,4.4rem)] leading-[1.04] tracking-tight font-display font-extrabold pb-1">
              Run Your Workshop{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 animate-gradient-x">
                Faster, Smarter
              </span>{' '}
              and Fully Digital
            </h1>

            <p className="text-base md:text-[1.05rem] text-muted-foreground leading-relaxed max-w-xl">
              AutoCare AI gives your service center digital job cards, smart invoicing, mechanic tracking,
              and real-time revenue dashboards — all in one place. <strong className="text-foreground">No more paperwork.</strong>
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <Link to="/signup">
                <div className="relative group">
                  <div className="absolute -inset-1 rounded-[14px] bg-gradient-to-r from-blue-500 to-violet-600 blur-md opacity-40 group-hover:opacity-70 transition duration-500" />
                  <Button size="lg" className="relative h-12 rounded-xl px-8 gradient-primary text-primary-foreground gap-2 font-semibold shadow-lg">
                    Start Free Trial <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </Link>
              <a href="#interactive-demo">
                <Button size="lg" variant="outline" className="h-12 rounded-xl px-7 gap-2">
                  <ChevronDown className="h-4 w-4" /> Try Live Demo
                </Button>
              </a>
            </div>

            {/* Animated trust stats */}
            <div className="flex flex-wrap gap-6 pt-1">
              {STATS.map((s) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.4 }}
                  className="flex items-center gap-2.5 text-sm"
                >
                  <div className="w-7 h-7 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
                    <s.icon className="h-3.5 w-3.5 text-accent" />
                  </div>
                  <div>
                    <span className="font-bold text-foreground">
                      <AnimatedCounter target={s.rawValue} suffix={s.suffix} />
                    </span>
                    <span className="text-muted-foreground ml-1.5">{s.label}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Hero dashboard card */}
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.65, delay: 0.1 }}
            className="relative animate-float"
          >
            {/* Soft ambient glow — matches page tones */}
            <div className="absolute -inset-4 bg-gradient-to-br from-blue-500/12 via-indigo-500/8 to-violet-500/12 rounded-[2.5rem] blur-3xl pointer-events-none" />

            {/* Glass card — works in light and dark */}
            <div className="relative rounded-3xl border border-border/70 bg-card/80 backdrop-blur-2xl shadow-[0_8px_40px_-12px_rgba(0,0,0,0.15)] overflow-hidden">
              {/* Very subtle top-edge accent stripe */}
              <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-blue-500/0 via-indigo-500/60 to-violet-500/0 rounded-t-3xl" />

              <div className="p-4 sm:p-5">
                {/* Browser chrome */}
                <div className="h-9 rounded-xl border border-border/40 bg-muted/40 flex items-center gap-2 px-3 mb-4">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
                  <p className="text-[11px] text-muted-foreground ml-1 font-mono">AutoCare AI — Workshop Dashboard</p>
                  <span className="ml-auto flex items-center gap-1 text-[9px] text-success font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" /> Live
                  </span>
                </div>

                <div className="grid grid-cols-12 gap-3 min-h-[360px]">
                  {/* Stats column */}
                  <div className="col-span-4 space-y-3">
                    {[
                      { label: 'Open Jobs', value: '67', color: 'text-foreground', border: 'border-border/50', bg: 'bg-secondary/40', suffix: '' },
                      { label: 'Mechanics Active', value: '14', color: 'text-foreground', border: 'border-border/50', bg: 'bg-secondary/40', suffix: '' },
                      { label: "Today's Revenue", value: 24800, prefix: '₹', color: 'text-success', sub: '↑ 12% vs yday', subColor: 'text-success/70', border: 'border-success/25', bg: 'bg-success/8', suffix: '' },
                    ].map((card, i) => (
                      <motion.div
                        key={card.label}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + i * 0.1, duration: 0.4 }}
                        className={`rounded-2xl border p-3 ${card.border} ${card.bg} relative overflow-hidden`}
                      >
                        {/* Shimmer sweep on cards */}
                        <div className="absolute inset-0 -translate-x-full animate-[shimmer_3s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
                        
                        <div className={`text-2xl font-display font-bold mt-1 ${card.color}`}>
                          {card.prefix || ''}
                          {typeof card.value === 'number' ? (
                            <AnimatedCounter target={card.value} suffix={card.suffix} />
                          ) : (
                            card.value
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Job board column */}
                  <div className="col-span-8 space-y-2.5">
                    <p className="text-[11px] font-semibold px-1 text-foreground/80">Live Job Board</p>
                    {[
                      { vehicle: 'KA01AB1023', status: 'In Progress',     dot: 'bg-blue-500',           bg: 'bg-blue-500/6 border-blue-500/18' },
                      { vehicle: 'TN22GH8891', status: 'Waiting Parts',   dot: 'bg-amber-400',          bg: 'bg-amber-400/6 border-amber-400/18' },
                      { vehicle: 'MH12DN9044', status: 'Ready Delivery',  dot: 'bg-emerald-500',        bg: 'bg-emerald-500/6 border-emerald-500/18' },
                      { vehicle: 'DL3CAB7734', status: 'Pending',         dot: 'bg-muted-foreground/60', bg: 'bg-secondary/30 border-border/40' },
                    ].map((job, i) => (
                      <motion.div
                        key={job.vehicle}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.35 + i * 0.08, duration: 0.4 }}
                        className={`rounded-xl border p-2.5 flex items-center justify-between gap-2 ${job.bg} relative overflow-hidden`}
                      >
                        {/* Shimmer on job rows */}
                        <div className="absolute inset-0 -translate-x-full animate-[shimmer_4s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none" />
                        
                        <span className="font-mono text-[10px] font-semibold text-foreground/80">{job.vehicle}</span>
                        <div className="flex items-center gap-1.5">
                          <div className={`w-2 h-2 rounded-full ${job.dot}`} />
                          <span className="text-[10px] text-muted-foreground">{job.status}</span>
                        </div>
                      </motion.div>
                    ))}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.7 }}
                      className="rounded-xl border border-indigo-400/25 bg-indigo-500/6 p-2.5"
                    >
                      <p className="text-[10px] text-muted-foreground">
                        <span className="font-semibold text-indigo-500 dark:text-indigo-400">AI:</span>{' '}
                        3 jobs approaching promised delivery. Auto-reminder sent to customers.
                      </p>
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
