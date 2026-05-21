import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Linkedin, Instagram, Globe, Mail, Phone, ArrowRight } from 'lucide-react';
import { AnimatedBrandLogo } from '@/components/shared/AnimatedBrandLogo';

const ROOTOPS_URL = 'https://www.rootopstechnologies.in/';

export function LandingFooter() {
  return (
    <footer className="border-t border-border/50 bg-background">
      {/* Pre-footer CTA banner */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="border-b border-border/40 py-5 px-6 bg-muted/30"
      >
        <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm font-medium">
            Ready to digitize your workshop? <span className="text-muted-foreground">Start free with no credit card.</span>
          </p>
          <Link
            to="/signup"
            className="shrink-0 flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline underline-offset-4 transition-colors"
          >
            Get started now <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </motion.div>

      {/* Main footer */}
      <div className="max-w-[1200px] mx-auto px-6 py-14 grid sm:grid-cols-2 md:grid-cols-5 gap-10">
        {/* Brand col */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center gap-2.5 font-display font-bold text-base">
            <AnimatedBrandLogo className="w-8 h-8 rounded-xl border border-white/20" />
            AutoCare AI
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-[260px]">
            The all-in-one digital workshop management platform built for modern service centers across India.
          </p>
          <div className="flex items-center gap-3 text-muted-foreground">
            <a href={ROOTOPS_URL} target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors">
              <Globe className="h-4 w-4" />
            </a>
            <a href={ROOTOPS_URL} target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors">
              <Linkedin className="h-4 w-4" />
            </a>
            <a href={ROOTOPS_URL} target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors">
              <Instagram className="h-4 w-4" />
            </a>
          </div>
          <div className="space-y-1">
            <Link to="/contact" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <Mail className="h-3.5 w-3.5" /> support@autocare.ai
            </Link>
            <Link to="/contact" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <Phone className="h-3.5 w-3.5" /> +91 (800) 123-4567
            </Link>
          </div>
        </div>

        {/* Product */}
        <div className="space-y-3 text-xs">
          <p className="font-semibold text-foreground">Product</p>
          <div className="space-y-2">
            <a href="#product-overview" className="block text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#interactive-demo" className="block text-muted-foreground hover:text-foreground transition-colors">Live Demo</a>
            <a href="#how-it-works" className="block text-muted-foreground hover:text-foreground transition-colors">How It Works</a>
            <a href="#pricing" className="block text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
            <a href="#analytics" className="block text-muted-foreground hover:text-foreground transition-colors">Analytics</a>
          </div>
        </div>

        {/* Company */}
        <div className="space-y-3 text-xs">
          <p className="font-semibold text-foreground">Company</p>
          <div className="space-y-2">
            <a href={ROOTOPS_URL} target="_blank" rel="noreferrer" className="block text-muted-foreground hover:text-foreground transition-colors">About RootOps</a>
            <Link to="/contact" className="block text-muted-foreground hover:text-foreground transition-colors">Contact Us</Link>
            <Link to="/login" className="block text-muted-foreground hover:text-foreground transition-colors">Log In</Link>
            <Link to="/signup" className="block text-muted-foreground hover:text-foreground transition-colors">Sign Up Free</Link>
          </div>
        </div>

        {/* Support */}
        <div className="space-y-3 text-xs">
          <p className="font-semibold text-foreground">Support</p>
          <div className="space-y-2">
            <Link to="/contact" className="block text-muted-foreground hover:text-foreground transition-colors">Help Center</Link>
            <Link to="/contact" className="block text-muted-foreground hover:text-foreground transition-colors">Onboarding Support</Link>
            <Link to="/contact" className="block text-muted-foreground hover:text-foreground transition-colors">Report a Bug</Link>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="max-w-[1200px] mx-auto px-6 pb-8 pt-4 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-muted-foreground/70">
        <p>© 2026 AutoCare AI. All rights reserved.</p>
        <p>
          Built with ❤️ by{' '}
          <a href={ROOTOPS_URL} target="_blank" rel="noreferrer" className="underline underline-offset-4 hover:text-foreground transition-colors">
            RootOps Technologies
          </a>
        </p>
      </div>
    </footer>
  );
}
