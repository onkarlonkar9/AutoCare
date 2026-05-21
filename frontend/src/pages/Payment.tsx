import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Shield, Zap, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { getDefaultAppRoute } from '@/lib/authRoutes';
import { toast } from 'sonner';

type PlanId = 'free' | 'pro' | 'enterprise';

interface RazorpayResponse {
  razorpay_payment_id?: string;
  razorpay_subscription_id?: string;
  razorpay_signature?: string;
}

interface RazorpayOptions {
  key: string;
  subscription_id: string;
  name: string;
  description: string;
  image: string;
  handler: (response: RazorpayResponse) => void;
  prefill: {
    name: string;
    email: string;
  };
  theme: {
    color: string;
  };
}

interface RazorpayInstance {
  open: () => void;
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

const RAZORPAY_KEY = 'YOUR_RAZORPAY_KEY_ID';

const Payment = () => {
  const { user, subscription, role } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<PlanId | null>(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const currentPlan = subscription?.plan_name ?? 'free_trial';

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate(getDefaultAppRoute(role));
  };

  const handleSubscription = async (plan: PlanId) => {
    if (plan === 'enterprise') {
      navigate('/contact');
      return;
    }

    setLoading(plan);

    if (!window.Razorpay || RAZORPAY_KEY === 'YOUR_RAZORPAY_KEY_ID') {
      toast.info('Payments are not configured yet. Please update the Razorpay keys first.');
      setLoading(null);
      return;
    }

    const options: RazorpayOptions = {
      key: RAZORPAY_KEY,
      subscription_id: plan === 'pro' ? 'sub_PRO_PLACEHOLDER' : 'sub_ENTERPRISE_PLACEHOLDER',
      name: 'AutoCare AI',
      description: `${plan.toUpperCase()} Plan Subscription`,
      image: '/logo.png',
      handler: (_response) => {
        toast.success('Payment successful. Subscription activation can now be verified.');
        navigate(getDefaultAppRoute(role));
      },
      prefill: {
        name: user?.user_metadata?.name || '',
        email: user?.email || '',
      },
      theme: {
        color: '#3b82f6',
      },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
    setLoading(null);
  };

  const plans = [
    {
      id: 'free' as const,
      name: 'Free Trial',
      price: 'Rs.0',
      duration: '14 days',
      features: ['Basic Maintenance Tracking', 'Single Vehicle Support', 'Standard Reports', 'Email Support'],
      buttonText: currentPlan === 'free_trial' ? 'Current Plan' : 'Included Trial',
      disabled: currentPlan === 'free_trial',
      highlight: false,
    },
    {
      id: 'pro' as const,
      name: 'Pro Workshop',
      price: 'Rs.999',
      duration: 'per month',
      features: ['AI Maintenance Predictions', 'Up to 50 Vehicles', 'Advanced Analytics', 'Priority Email Support', 'Inventory Management'],
      buttonText: currentPlan === 'pro' ? 'Current Plan' : 'Upgrade to Pro',
      disabled: currentPlan === 'pro',
      highlight: true,
    },
    {
      id: 'enterprise' as const,
      name: 'Enterprise',
      price: 'Custom',
      duration: 'annual plan',
      features: ['Unlimited Vehicles', 'Full Workshop Suite', 'Custom Reports', '24/7 Dedicated Support', 'White-label Option'],
      buttonText: 'Contact Sales',
      disabled: false,
      highlight: false,
    },
  ];

  return (
    <div className="min-h-screen bg-background pt-20 pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Button
            type="button"
            variant="ghost"
            className="h-10 px-3 text-muted-foreground hover:text-foreground"
            onClick={handleBack}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>

        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">Choose Your Plan</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Unlock the full potential of your workshop with AutoCare AI&apos;s premium features.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-3xl p-8 border transition-all duration-300 ${plan.highlight ? 'border-primary bg-primary/5 scale-105 shadow-xl shadow-primary/10' : 'border-border bg-card hover:border-primary/50'}`}
            >
              {plan.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                  <Star className="w-4 h-4 fill-current" /> Most Popular
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.duration}</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm">
                    <div className="bg-primary/10 p-1 rounded-full text-primary">
                      <Check className="w-4 h-4" />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full py-6 rounded-xl font-bold text-lg ${plan.highlight ? 'gradient-primary text-primary-foreground' : ''}`}
                variant={plan.highlight ? 'default' : 'outline'}
                disabled={plan.disabled || loading === plan.id}
                onClick={() => handleSubscription(plan.id)}
              >
                {loading === plan.id ? 'Loading...' : plan.buttonText}
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-12 border-t pt-12 border-border/50">
          <div className="flex flex-col items-center text-center">
            <div className="bg-primary/10 p-4 rounded-2xl text-primary mb-4">
              <Shield className="w-8 h-8" />
            </div>
            <h4 className="font-bold mb-2">Secure Payments</h4>
            <p className="text-sm text-muted-foreground">Encryption powered by Razorpay for your safety.</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="bg-primary/10 p-4 rounded-2xl text-primary mb-4">
              <Zap className="w-8 h-8" />
            </div>
            <h4 className="font-bold mb-2">Instant Access</h4>
            <p className="text-sm text-muted-foreground">Unlock premium features immediately after payment.</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="bg-primary/10 p-4 rounded-2xl text-primary mb-4">
              <Star className="w-8 h-8" />
            </div>
            <h4 className="font-bold mb-2">Cancel Anytime</h4>
            <p className="text-sm text-muted-foreground">Flexible subscriptions with no hidden cancellation fees.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
