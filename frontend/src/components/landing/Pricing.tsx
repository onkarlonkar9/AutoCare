import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Zap, Shield, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';

const plans = [
  {
    name: 'Starter',
    monthly: 0,
    yearly: 0,
    description: 'For small garages just getting started',
    icon: Zap,
    features: [
      'Up to 50 job cards/month',
      'Basic customer & vehicle records',
      'Digital invoices',
      'Single mechanic account',
      'Email support',
    ],
    cta: 'Get Started Free',
    popular: false,
    href: '/payment',
    gradient: 'from-slate-500 to-slate-600',
  },
  {
    name: 'Professional',
    monthly: 999,
    yearly: 799,
    description: 'For growing workshops with a team',
    icon: Crown,
    features: [
      'Unlimited job cards',
      'Full workshop dashboard',
      'Mechanic management & tracking',
      'GST invoices & gate passes',
      'Revenue & analytics reports',
      'Customer communication tools',
      'Priority support',
    ],
    cta: 'Start Free Trial',
    popular: true,
    href: '/payment',
    gradient: 'from-blue-500 to-violet-600',
  },
  {
    name: 'Enterprise',
    monthly: 2499,
    yearly: 1999,
    description: 'For multi-bay or multi-branch centers',
    icon: Shield,
    features: [
      'Everything in Professional',
      'Multi-branch management',
      'Advanced analytics & exports',
      'Custom branding on invoices',
      'API access',
      'Dedicated account manager',
    ],
    cta: 'Contact Sales',
    popular: false,
    href: '/payment',
    gradient: 'from-amber-500 to-orange-600',
  },
];

export const Pricing = () => {
  const [yearly, setYearly] = useState(false);

  return (
    <section id="pricing" className="py-28 px-6 surface-sunken relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>

      <div className="max-w-[1060px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <p className="text-xs font-semibold text-accent uppercase tracking-[0.2em] mb-3">Pricing</p>
          <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight mb-3">
            Plans for every{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-violet-600">workshop</span>
          </h2>
          <p className="text-muted-foreground text-sm mb-8">Start free. Scale as your workshop grows.</p>

          {/* Billing toggle */}
          <div className="inline-flex items-center gap-3 bg-secondary/50 p-1.5 rounded-full border border-border/50">
            <button
              onClick={() => setYearly(false)}
              className={`px-5 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
                !yearly ? 'bg-background shadow-md text-foreground' : 'text-muted-foreground'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setYearly(true)}
              className={`px-5 py-1.5 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                yearly ? 'bg-background shadow-md text-foreground' : 'text-muted-foreground'
              }`}
            >
              Yearly
              <span className="text-[10px] font-bold bg-success/20 text-success px-2 py-0.5 rounded-full">
                Save 20%
              </span>
            </button>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-5">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ delay: i * 0.1, duration: 0.45 }}
              className="relative"
            >
              {plan.popular && (
                <>
                  {/* Animated gradient border */}
                  <div className={`absolute -inset-[1.5px] rounded-[18px] bg-gradient-to-br ${plan.gradient} opacity-80 blur-[2px]`} />
                  <div className={`absolute -inset-[1.5px] rounded-[18px] bg-gradient-to-br ${plan.gradient} animate-pulse opacity-20`} />
                </>
              )}

              <div className={`relative rounded-2xl p-6 h-full flex flex-col ${
                plan.popular
                  ? 'bg-foreground text-background'
                  : 'glass-card hover:shadow-xl hover:-translate-y-1 transition-all duration-300'
              }`}>
                {plan.popular && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 flex items-center gap-1 text-[10px] font-bold bg-gradient-to-r from-blue-500 to-violet-600 text-white px-3 py-1 rounded-full shadow-lg">
                    <Zap className="h-3 w-3" /> Most Popular
                  </span>
                )}

                {/* Plan icon + name */}
                <div className="flex items-center gap-3 mb-1">
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center shadow-md`}>
                    <plan.icon className="h-4.5 w-4.5 text-white" />
                  </div>
                  <h3 className="font-display font-bold text-lg">{plan.name}</h3>
                </div>
                <p className={`text-xs mt-1 mb-5 ${plan.popular ? 'opacity-60' : 'text-muted-foreground'}`}>
                  {plan.description}
                </p>

                {/* Price */}
                <div className="mb-6">
                  <motion.span
                    key={`${plan.name}-${yearly}`}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl font-display font-extrabold tracking-tight"
                  >
                    {(yearly ? plan.yearly : plan.monthly) === 0
                      ? '₹0'
                      : `₹${(yearly ? plan.yearly : plan.monthly).toLocaleString()}`}
                  </motion.span>
                  <span className={`text-xs ml-1 ${plan.popular ? 'opacity-50' : 'text-muted-foreground'}`}>/month</span>
                  {yearly && plan.monthly > 0 && (
                    <p className="text-[10px] text-muted-foreground mt-1">
                      <span className="line-through opacity-50">₹{plan.monthly}/mo</span>
                      {' '}
                      <span className="text-success font-semibold">Save ₹{((plan.monthly - plan.yearly) * 12).toLocaleString()}/year</span>
                    </p>
                  )}
                </div>

                <ul className="space-y-2.5 mb-6 flex-1">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-xs">
                      <Check className={`h-3.5 w-3.5 flex-shrink-0 mt-0.5 ${plan.popular ? 'text-blue-400' : 'text-accent'}`} />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link to={plan.href}>
                  <Button
                    className={`w-full rounded-xl h-10 text-xs font-semibold ${
                      plan.popular ? 'bg-background text-foreground hover:bg-background/90' : ''
                    }`}
                    variant={plan.popular ? 'default' : 'outline'}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Guarantee badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-10"
        >
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Shield className="h-4 w-4 text-success" />
            No credit card required for Starter
          </div>
          <span className="hidden sm:block text-border">·</span>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Check className="h-4 w-4 text-success" />
            Cancel anytime on paid plans
          </div>
          <span className="hidden sm:block text-border">·</span>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Zap className="h-4 w-4 text-accent" />
            Free onboarding & setup support
          </div>
        </motion.div>
      </div>
    </section>
  );
};
