import { motion } from 'framer-motion';
import { ExternalLink, MonitorPlay, CheckCircle2, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { AnimatedDemoReel } from '@/components/landing/AnimatedDemoReel';
import { useEffect, useRef, useState } from 'react';

const ROOTOPS_URL = 'https://www.rootopstechnologies.in/';

const demoPoints = [
  { step: 1, text: 'Live workshop dashboard — jobs, mechanics, revenue at a glance' },
  { step: 2, text: 'Digital job card creation in under 60 seconds' },
  { step: 3, text: 'One-click GST invoice and gate pass generation' },
  { step: 4, text: 'Revenue analytics — daily, weekly, and monthly breakdowns' },
];

function CountUp({ target, prefix = '', suffix = '' }: { target: number; prefix?: string; suffix?: string }) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLParagraphElement>(null);
  const ran = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !ran.current) {
        ran.current = true;
        let start = 0;
        const duration = 1000;
        const step = (ts: number) => {
          if (!start) start = ts;
          const p = Math.min((ts - start) / duration, 1);
          const e = 1 - Math.pow(1 - p, 3);
          setValue(Math.floor(e * target));
          if (p < 1) requestAnimationFrame(step);
          else setValue(target);
        };
        requestAnimationFrame(step);
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return <p ref={ref} className="text-xl font-display font-bold">{prefix}{value.toLocaleString()}{suffix}</p>;
}

export function LandingDemoVideo() {
  return (
    <section id="demo-video" className="py-20 px-6 surface-sunken">
      <div className="max-w-[1200px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.45 }}
          className="text-center mb-12"
        >
          <p className="text-xs font-semibold text-accent uppercase tracking-[0.2em] mb-3">Product Walkthrough</p>
          <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight mb-3">
            See Your Workshop,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-violet-600">Fully Digital</span>
          </h2>
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            Watch a real walkthrough of how service centers manage jobs, invoices, mechanics, and revenue — all from one screen.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-[1.35fr_1fr] gap-5 items-stretch">
          {/* Video pane */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5 }}
            className="rounded-3xl border border-border/60 overflow-hidden bg-card/60 backdrop-blur shadow-xl"
          >
            <div className="h-10 border-b border-border/50 px-4 flex items-center gap-2 bg-card/75 shrink-0">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400/70" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/70" />
              <p className="text-[11px] text-muted-foreground ml-1 font-semibold uppercase tracking-wider">Watch Demo Walkthrough</p>
              <span className="ml-auto flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-[9px] text-red-500 font-bold uppercase tracking-tight">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                Live Demo
              </span>
            </div>
            <div className="bg-gradient-to-br from-background via-muted/20 to-background min-h-[420px] flex flex-col">
              <AnimatedDemoReel />
            </div>
          </motion.div>

          {/* Info pane */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.55, delay: 0.06 }}
            className="rounded-3xl border border-border/60 bg-card/55 p-6 flex flex-col justify-between shadow-xl"
          >
            <div>
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
                  <MonitorPlay className="h-4 w-4 text-accent" />
                </div>
                <p className="text-sm font-semibold">What You'll See in the Demo</p>
              </div>

              <div className="space-y-3 mb-6">
                {demoPoints.map((item, i) => (
                  <motion.div
                    key={item.step}
                    initial={{ opacity: 0, x: 10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.09, duration: 0.4 }}
                    className="flex items-start gap-3 text-xs text-muted-foreground"
                  >
                    <span className="w-5 h-5 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {item.step}
                    </span>
                    <span className="flex items-start gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-success mt-0.5 flex-shrink-0" />
                      {item.text}
                    </span>
                  </motion.div>
                ))}
              </div>

              {/* Mini live stats with count-up */}
              <div className="rounded-2xl border border-border/50 bg-background/60 p-4 mb-6">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-3 font-semibold">Live Platform Snapshot</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <CountUp target={67} />
                    <p className="text-[10px] text-muted-foreground">Open Jobs</p>
                  </div>
                  <div>
                    <p className="text-xl font-display font-bold text-success">₹24.8k</p>
                    <p className="text-[10px] text-muted-foreground">Today's Revenue</p>
                  </div>
                  <div>
                    <CountUp target={14} />
                    <p className="text-[10px] text-muted-foreground">Mechanics Active</p>
                  </div>
                  <div>
                    <p className="text-xl font-display font-bold text-accent">3</p>
                    <p className="text-[10px] text-muted-foreground">Ready for Delivery</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              <Link to="/signup">
                <Button className="w-full gradient-primary text-primary-foreground rounded-xl h-10 gap-2 text-sm">
                  <Zap className="h-4 w-4" /> Start Free Trial
                </Button>
              </Link>
              <a href={`${ROOTOPS_URL}#contact`} target="_blank" rel="noreferrer">
                <Button variant="outline" className="w-full rounded-xl h-10 gap-2 text-sm">
                  Talk to Sales <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
