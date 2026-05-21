import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Shield, Star, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Floating particle positions/durations
const PARTICLES = [
  { x: '12%', y: '20%', delay: 0, duration: 6 },
  { x: '80%', y: '15%', delay: 1.2, duration: 7.5 },
  { x: '55%', y: '80%', delay: 0.6, duration: 5.5 },
  { x: '30%', y: '70%', delay: 2, duration: 8 },
  { x: '90%', y: '60%', delay: 0.3, duration: 6.5 },
  { x: '70%', y: '40%', delay: 1.8, duration: 7 },
];

export function CallToAction() {
  return (
    <section className="py-28 px-6">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.55 }}
        className="max-w-[1200px] mx-auto relative group"
      >
        {/* Outer glow */}
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 rounded-[2.2rem] blur-xl opacity-35 group-hover:opacity-60 transition duration-700" />

        <div className="relative rounded-3xl border border-white/15 bg-gradient-to-br from-slate-950 via-[#1a1050] to-[#0f2060] overflow-hidden">
          {/* Floating particles */}
          {PARTICLES.map((p, i) => (
            <motion.div
              key={i}
              className="absolute w-1.5 h-1.5 rounded-full bg-white/20 pointer-events-none"
              style={{ left: p.x, top: p.y }}
              animate={{ y: [0, -18, 0], opacity: [0.15, 0.5, 0.15] }}
              transition={{ delay: p.delay, duration: p.duration, repeat: Infinity, ease: 'easeInOut' }}
            />
          ))}

          {/* Subtle grid overlay */}
          <div
            className="absolute inset-0 opacity-[0.04] pointer-events-none"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />

          {/* Shimmer sweep */}
          <div className="absolute inset-0 translate-x-[-100%] animate-[shimmer_5s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none" />

          <div className="relative px-6 py-24 text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-white/80 text-xs font-semibold mb-8"
            >
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              4.9 rating · Trusted by 500+ Workshops across India
            </motion.div>

            <h2 className="text-4xl md:text-6xl font-display font-extrabold tracking-tight text-white mb-5 max-w-3xl mx-auto leading-[1.05]">
              Ready to take your workshop{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-400">
                fully digital?
              </span>
            </h2>

            <p className="text-white/55 text-sm md:text-base mb-12 max-w-lg mx-auto">
              Start with the live demo, then unlock the full platform. No credit card. No long setup.{' '}
              <span className="text-white/70 font-medium">Just a better workshop.</span>
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a href="#interactive-demo">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-13 rounded-xl px-8 text-sm border-white/25 text-white hover:bg-white/10 gap-2 bg-white/5"
                >
                  <Zap className="h-4 w-4" /> Try Demo First
                </Button>
              </a>
              <Link to="/signup">
                <div className="relative group/btn">
                  <div className="absolute -inset-1 rounded-[14px] bg-white/40 blur-md opacity-0 group-hover/btn:opacity-100 transition duration-500" />
                  <Button
                    size="lg"
                    className="relative h-13 rounded-xl px-10 text-sm bg-white text-slate-900 hover:bg-white/95 gap-2 shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_rgba(255,255,255,0.5)] transition-shadow font-bold"
                  >
                    <Zap className="h-4 w-4" /> Start Free Subscription <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </Link>
            </div>

            {/* Trust strip */}
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-10 text-white/35 text-xs">
              <div className="flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5" /> No credit card needed
              </div>
              <div className="flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5" /> Cancel anytime
              </div>
              <div className="flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5" /> Free onboarding support
              </div>
              <div className="flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5" /> Setup in under 5 minutes
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
