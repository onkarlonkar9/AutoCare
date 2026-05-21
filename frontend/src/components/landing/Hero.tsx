import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Car, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/shared/ThemeToggle';

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
};

export function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden">
      {/* Nav */}
      <motion.nav
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full flex items-center justify-between px-6 lg:px-10 py-5 max-w-[1400px] mx-auto z-20"
      >
        <Link to="/" className="flex items-center gap-2.5 font-display font-bold text-lg">
          <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center">
            <Car className="h-4 w-4 text-primary-foreground" />
          </div>
          AutoCare AI
        </Link>
        <div className="hidden md:flex items-center gap-8 text-[13px] font-medium text-muted-foreground">
          <a href="#product-preview" className="hover:text-foreground transition-colors duration-200">Preview</a>
          <a href="#features" className="hover:text-foreground transition-colors duration-200">Features</a>
          <a href="#how-it-works" className="hover:text-foreground transition-colors duration-200">How It Works</a>
          <a href="#pricing" className="hover:text-foreground transition-colors duration-200">Pricing</a>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link to="/login">
            <Button variant="ghost" size="sm" className="text-xs h-8 rounded-xl">Log in</Button>
          </Link>
          <Link to="/signup">
            <Button size="sm" className="gradient-primary text-primary-foreground border-0 text-xs h-8 rounded-xl px-4">
              Get Started
            </Button>
          </Link>
        </div>
      </motion.nav>

      {/* Hero Content */}
      <div className="flex-1 flex items-center justify-center px-6 relative z-10">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="max-w-3xl mx-auto text-center space-y-7"
        >
          <motion.div variants={item} className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/8 border border-accent/15 text-accent text-xs font-medium">
            <Sparkles className="h-3 w-3" />
            AI-Powered Vehicle Intelligence
          </motion.div>

          <motion.h1 variants={item} className="text-[clamp(2.5rem,6vw,4.5rem)] font-display font-extrabold tracking-tight leading-[1.05]">
            Manage your workshop{' '}
            <br className="hidden sm:block" />
            <span className="gradient-text">online, with intelligence</span>
          </motion.h1>

          <motion.p variants={item} className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            AutoCare AI predicts maintenance needs, tracks service history, and keeps every vehicle in peak condition — all powered by intelligence.
          </motion.p>

          <motion.div variants={item} className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link to="/signup">
              <Button size="lg" className="gradient-primary text-primary-foreground border-0 h-11 px-7 text-sm rounded-xl gap-2">
                Start Free
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
            <Link to="/signup?role=service_center">
              <Button variant="outline" size="lg" className="h-11 px-7 text-sm rounded-xl">
                Register Workshop
              </Button>
            </Link>
            <a href="https://www.rootopstechnologies.in/" target="_blank" rel="noreferrer">
              <Button variant="outline" size="lg" className="h-11 px-7 text-sm rounded-xl">
                Live Demo
              </Button>
            </a>
            <a href="https://www.rootopstechnologies.in/#contact" target="_blank" rel="noreferrer">
              <Button variant="ghost" size="lg" className="h-11 px-5 text-sm rounded-xl">
                Sales Contact
              </Button>
            </a>
          </motion.div>

          <motion.div variants={item} className="pt-10">
            <p className="text-[11px] text-muted-foreground/60 uppercase tracking-widest font-medium mb-4">Trusted by owners & workshops</p>
            <div className="flex items-center justify-center gap-10 opacity-30">
              {['Maruti', 'Honda', 'Toyota', 'Hyundai', 'Tata'].map(brand => (
                <span key={brand} className="text-xs font-semibold tracking-[0.2em] uppercase">{brand}</span>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Background orbs */}
      <div className="absolute top-[15%] left-[10%] w-[500px] h-[500px] bg-accent/[0.05] rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-[10%] right-[5%] w-[400px] h-[400px] bg-accent/[0.04] rounded-full blur-[100px] -z-10" />
      <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-accent/[0.02] rounded-full blur-[140px] -z-10" />
    </section>
  );
}
