import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AnimatedBrandLogo } from '@/components/shared/AnimatedBrandLogo';
import { ThemeToggle } from '@/components/shared/ThemeToggle';

export function StickyNav() {
  const [visible, setVisible] = useState(false);
  const [lastY, setLastY] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      // Show after scrolling 200px past hero
      setVisible(y > 200 && y < lastY || y > 500);
      setLastY(y);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [lastY]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.header
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="fixed top-0 inset-x-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl"
        >
          <div className="max-w-[1250px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 font-display font-bold text-sm shrink-0">
              <AnimatedBrandLogo className="w-8 h-8 rounded-xl border border-white/20" />
              AutoCare AI
            </Link>

            {/* Nav links */}
            <nav className="hidden md:flex items-center gap-6 text-[13px] font-medium text-muted-foreground">
              <a href="#interactive-demo" className="hover:text-foreground transition-colors">Demo</a>
              <a href="#product-overview" className="hover:text-foreground transition-colors">Features</a>
              <a href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</a>
              <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
            </nav>

            {/* CTAs */}
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Link to="/login" className="hidden lg:block">
                <Button variant="ghost" className="h-8 rounded-xl text-xs">Log in</Button>
              </Link>
              <Link to="/signup" className="hidden sm:block">
                <Button
                  size="sm"
                  className="h-8 rounded-xl text-xs px-4 gradient-primary text-primary-foreground gap-1.5 shadow-[0_0_20px_-5px_rgba(99,102,241,0.5)]"
                >
                  <Zap className="h-3 w-3" />
                  Start Free
                </Button>
              </Link>
              
              {/* Mobile menu button */}
              <button 
                className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Mobile menu content */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden border-t border-border/50 bg-background overflow-hidden"
              >
                <div className="p-4 space-y-4 flex flex-col text-sm font-medium">
                  <a href="#interactive-demo" className="hover:text-primary transition-colors py-2" onClick={() => setMobileMenuOpen(false)}>Demo</a>
                  <a href="#product-overview" className="hover:text-primary transition-colors py-2" onClick={() => setMobileMenuOpen(false)}>Features</a>
                  <a href="#how-it-works" className="hover:text-primary transition-colors py-2" onClick={() => setMobileMenuOpen(false)}>How It Works</a>
                  <a href="#pricing" className="hover:text-primary transition-colors py-2" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
                  <div className="pt-4 flex flex-col gap-2 border-t border-border/30">
                    <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full rounded-xl">Log in</Button>
                    </Link>
                    <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full rounded-xl gradient-primary text-primary-foreground">Start Free</Button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.header>
      )}
    </AnimatePresence>
  );
}
