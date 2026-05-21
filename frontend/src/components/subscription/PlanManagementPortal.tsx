import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check, 
  X, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  Building2, 
  Users2, 
  CreditCard,
  ChevronRight,
  ArrowLeft,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

type PlanTier = 'starter' | 'pro' | 'enterprise';

interface PlanFeature {
  name: string;
  starter: boolean | string;
  pro: boolean | string;
  enterprise: boolean | string;
}

interface PlanChangePayload {
  plan: string;
  billingCycle: string;
  teamLimit: number;
  isActive: boolean;
}

const FEATURES: PlanFeature[] = [
  { name: 'Team Members', starter: 'Up to 5', pro: 'Up to 20', enterprise: 'Unlimited' },
  { name: 'Monthly Job Cards', starter: '100', pro: 'Unlimited', enterprise: 'Unlimited' },
  { name: 'Inventory Management', starter: true, pro: true, enterprise: true },
  { name: 'Finance & GST Billing', starter: true, pro: true, enterprise: true },
  { name: 'Analytics & Reports', starter: 'Basic', pro: 'Advanced', enterprise: 'Custom' },
  { name: 'Priority Support', starter: false, pro: true, enterprise: true },
  { name: 'Multi-workshop Sync', starter: false, pro: false, enterprise: true },
  { name: 'Custom Domain', starter: false, pro: true, enterprise: true },
  { name: 'White-label Invoices', starter: false, pro: true, enterprise: true },
  { name: 'Dedicated Account Manager', starter: false, pro: false, enterprise: true },
];

interface PlanManagementPortalProps {
  currentPlan: string;
  onClose: () => void;
  onPlanChange: (newPlan: PlanChangePayload) => void;
}

export const PlanManagementPortal = ({ currentPlan, onClose, onPlanChange }: PlanManagementPortalProps) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [selectedTier, setSelectedTier] = useState<PlanTier>(
    currentPlan.toLowerCase().includes('pro') ? 'pro' : 
    currentPlan.toLowerCase().includes('enterprise') ? 'enterprise' : 'starter'
  );
  const [isProcessing, setIsProcessing] = useState(false);

  const plans = {
    starter: {
      name: 'Workshop Starter',
      price: billingCycle === 'monthly' ? 1999 : 19990,
      description: 'Perfect for small local workshops.',
      icon: <Zap className="h-6 w-6 text-blue-500" />,
      color: 'blue'
    },
    pro: {
      name: 'Workshop Pro Expansion',
      price: billingCycle === 'monthly' ? 4999 : 49990,
      description: 'The standard for growing service centers.',
      icon: <ShieldCheck className="h-6 w-6 text-indigo-500" />,
      color: 'indigo'
    },
    enterprise: {
      name: 'Enterprise Network',
      price: billingCycle === 'monthly' ? 12999 : 129990,
      description: 'For workshop chains and large networks.',
      icon: <Building2 className="h-6 w-6 text-violet-500" />,
      color: 'violet'
    }
  };

  const handleUpgrade = async (tier: PlanTier) => {
    if (tier === selectedTier) return;
    
    setIsProcessing(true);
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    onPlanChange({
      plan: plans[tier].name,
      billingCycle: billingCycle === 'yearly' ? 'Yearly (Save 20%)' : 'Monthly',
      teamLimit: tier === 'starter' ? 5 : tier === 'pro' ? 20 : 999,
      isActive: true
    });
    
    setIsProcessing(false);
    toast.success(`Succesfully upgraded to ${plans[tier].name}!`);
    onClose();
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-xl p-4 md:p-8"
    >
      <motion.div 
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="w-full max-w-6xl h-full max-h-[90vh] bg-background rounded-[40px] shadow-2xl border border-border/40 overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-8 border-b border-border/40 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-2xl hover:bg-secondary/50">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Manage Your Subscription</h2>
              <p className="text-sm text-muted-foreground">Select the plan that best fits your business needs.</p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-secondary/30 p-1.5 rounded-2xl border border-border/20">
            <span className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all ${billingCycle === 'monthly' ? 'bg-background shadow-sm' : 'text-muted-foreground'}`} onClick={() => setBillingCycle('monthly')}>Monthly</span>
            <div className="flex items-center gap-2 px-1">
              <Switch checked={billingCycle === 'yearly'} onCheckedChange={(checked) => setBillingCycle(checked ? 'yearly' : 'monthly')} />
            </div>
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all ${billingCycle === 'yearly' ? 'bg-background shadow-sm' : 'text-muted-foreground'}`} onClick={() => setBillingCycle('yearly')}>
              <span className="text-xs font-bold">Yearly</span>
              <Badge className="bg-success/10 text-success border-success/20 text-[10px] h-5 px-1.5">-20%</Badge>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {(Object.keys(plans) as PlanTier[]).map((tier) => {
              const plan = plans[tier];
              const isCurrent = currentPlan.includes(tier === 'pro' ? 'Pro' : tier === 'enterprise' ? 'Enterprise' : 'Starter');
              
              return (
                <div 
                  key={tier}
                  onClick={() => setSelectedTier(tier)}
                  className={`relative group glass-card rounded-[32px] p-8 border-2 transition-all cursor-pointer ${
                    selectedTier === tier ? 'border-primary ring-4 ring-primary/10' : 'border-border/40 hover:border-primary/40'
                  }`}
                >
                  {tier === 'pro' && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground px-4 py-1.5 rounded-full shadow-lg shadow-primary/20 flex items-center gap-2">
                        <Sparkles className="h-3 w-3" /> Most Popular
                      </Badge>
                    </div>
                  )}

                  <div className="flex items-center justify-between mb-6">
                    <div className={`h-14 w-14 rounded-2xl bg-${plan.color}-500/10 flex items-center justify-center`}>
                      {plan.icon}
                    </div>
                    {isCurrent && (
                      <Badge variant="outline" className="bg-secondary/50 border-border/40 h-7 px-3">Current Plan</Badge>
                    )}
                  </div>

                  <div className="space-y-1 mb-6">
                    <h3 className="text-xl font-bold">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{plan.description}</p>
                  </div>

                  <div className="flex items-baseline gap-1 mb-8">
                    <span className="text-4xl font-black">₹{plan.price.toLocaleString()}</span>
                    <span className="text-muted-foreground font-medium">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                  </div>

                  <Button 
                    disabled={isCurrent || isProcessing}
                    onClick={() => handleUpgrade(tier)}
                    className={`w-full h-14 rounded-2xl text-lg font-bold shadow-xl transition-all ${
                      selectedTier === tier 
                        ? 'bg-primary text-primary-foreground shadow-primary/20' 
                        : 'bg-secondary/40 text-secondary-foreground hover:bg-secondary/60'
                    }`}
                  >
                    {isProcessing && selectedTier === tier ? (
                      <motion.div 
                        animate={{ rotate: 360 }} 
                        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                      >
                        <Sparkles className="h-5 w-5" />
                      </motion.div>
                    ) : isCurrent ? 'Active Plan' : `Upgrade to ${tier.charAt(0).toUpperCase() + tier.slice(1)}`}
                  </Button>
                </div>
              );
            })}
          </div>

          {/* Feature Comparison Table */}
          <div className="space-y-8 pb-12">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Info className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Comprehensive Comparison</h3>
            </div>

            <div className="rounded-[32px] border border-border/40 bg-secondary/5 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-secondary/20">
                    <th className="p-6 text-sm font-bold text-muted-foreground uppercase tracking-widest">Core Features</th>
                    <th className="p-6 text-center text-sm font-bold text-muted-foreground uppercase tracking-widest">Starter</th>
                    <th className="p-6 text-center text-sm font-bold text-muted-foreground uppercase tracking-widest">Pro</th>
                    <th className="p-6 text-center text-sm font-bold text-muted-foreground uppercase tracking-widest">Enterprise</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {FEATURES.map((feature, i) => (
                    <tr key={i} className="hover:bg-secondary/10 transition-colors">
                      <td className="p-6 font-medium">{feature.name}</td>
                      <td className="p-6 text-center">
                        {typeof feature.starter === 'boolean' ? (
                          feature.starter ? <Check className="h-5 w-5 text-success mx-auto" /> : <X className="h-5 w-5 text-destructive/40 mx-auto" />
                        ) : (
                          <span className="text-sm font-bold text-muted-foreground">{feature.starter}</span>
                        )}
                      </td>
                      <td className="p-6 text-center bg-primary/5">
                        {typeof feature.pro === 'boolean' ? (
                          feature.pro ? <Check className="h-5 w-5 text-primary mx-auto" /> : <X className="h-5 w-5 text-destructive/40 mx-auto" />
                        ) : (
                          <span className="text-sm font-bold text-primary">{feature.pro}</span>
                        )}
                      </td>
                      <td className="p-6 text-center">
                        {typeof feature.enterprise === 'boolean' ? (
                          feature.enterprise ? <Check className="h-5 w-5 text-violet-500 mx-auto" /> : <X className="h-5 w-5 text-destructive/40 mx-auto" />
                        ) : (
                          <span className="text-sm font-bold text-violet-500">{feature.enterprise}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-border/40 bg-secondary/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-success/10 flex items-center justify-center">
                <ShieldCheck className="h-4 w-4 text-success" />
              </div>
              <span className="text-sm font-medium">Enterprise-grade Security</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                <CreditCard className="h-4 w-4 text-indigo-500" />
              </div>
              <span className="text-sm font-medium">Secure Payments via Stripe</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground max-w-xs text-right">
            By upgrading, you agree to our Terms of Service and Privacy Policy. Subscriptions are billed upfront and auto-renew.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};
