import { Link } from 'react-router-dom';
import { Car } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-border/50 py-16 px-6 bg-card/30">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 font-display font-bold text-xl mb-4">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center border border-white/20">
                <Car className="h-5 w-5 text-primary-foreground" />
              </div>
              AutoCare AI
            </Link>
            <p className="text-muted-foreground text-sm max-w-xs leading-relaxed">
              Empowering workshops with AI-driven maintenance predictions and seamless management solutions.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold mb-4 text-sm uppercase tracking-wider">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#features" className="hover:text-primary transition-colors">Features</a></li>
              <li><Link to="/payment" className="hover:text-primary transition-colors">Pricing</Link></li>
              <li><a href="#demo" className="hover:text-primary transition-colors">Demo</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-sm uppercase tracking-wider">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
              <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-border/40 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground/60">
          <p>© 2026 AutoCare AI. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-foreground">Twitter</a>
            <a href="#" className="hover:text-foreground">LinkedIn</a>
            <a href="#" className="hover:text-foreground">GitHub</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
