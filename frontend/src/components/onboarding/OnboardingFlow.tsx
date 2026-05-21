import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Check, Sparkles, Layout, BarChart, Settings } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OnboardingStep {
    title: string;
    description: string;
    icon: LucideIcon;
    image: string;
}

const steps: OnboardingStep[] = [
    {
        title: "Welcome to AutoCare AI",
        description: "Your workshop is now powered by AI. Let's get you started with a quick tour of your new digital command center.",
        icon: Sparkles,
        image: "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=800"
    },
    {
        title: "Manage Your Fleet",
        description: "Easily add vehicles, track their health, and get predictive maintenance alerts before breakdowns happen.",
        icon: Layout,
        image: "https://images.unsplash.com/photo-1486006396193-471ed61c830c?auto=format&fit=crop&q=80&w=800"
    },
    {
        title: "Advanced Analytics",
        description: "Monitor your workshop's performance, revenue, and customer satisfaction with real-time data visualisations.",
        icon: BarChart,
        image: "https://images.unsplash.com/photo-1551288049-bbbda5402bd7?auto=format&fit=crop&q=80&w=800"
    },
    {
        title: "Custom Settings",
        description: "Tailor the platform to your needs. Set up service types, mechanic roles, and business hours in seconds.",
        icon: Settings,
        image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800"
    }
];

export function OnboardingFlow() {
    const [currentStep, setCurrentStep] = useState(0);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const hasCompletedOnboarding = localStorage.getItem('autocare_onboarding_completed');
        if (!hasCompletedOnboarding) {
            setIsVisible(true);
        }
    }, []);

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            handleComplete();
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleComplete = () => {
        localStorage.setItem('autocare_onboarding_completed', 'true');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    const step = steps[currentStep];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-card border border-border/50 rounded-[2rem] shadow-2xl max-w-4xl w-full overflow-hidden flex flex-col md:flex-row h-[600px]"
            >
                {/* Visual Side */}
                <div className="md:w-1/2 relative bg-muted h-full overflow-hidden">
                    <AnimatePresence mode="wait">
                        <motion.img 
                            key={currentStep}
                            src={step.image}
                            initial={{ opacity: 0, scale: 1.1 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.6 }}
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                    </AnimatePresence>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-6 left-6 right-6">
                        <div className="flex gap-2">
                            {steps.map((_, i) => (
                                <div 
                                    key={i} 
                                    className={`h-1.5 rounded-full transition-all duration-300 ${i === currentStep ? 'w-8 bg-white' : 'w-2 bg-white/30'}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Content Side */}
                <div className="md:w-1/2 p-10 flex flex-col justify-between">
                    <div>
                        <div className="bg-primary/10 w-12 h-12 rounded-xl flex items-center justify-center text-primary mb-6">
                            <step.icon className="w-6 h-6" />
                        </div>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentStep}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <h2 className="text-3xl font-bold mb-4">{step.title}</h2>
                                <p className="text-muted-foreground text-lg leading-relaxed">
                                    {step.description}
                                </p>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    <div className="flex items-center justify-between mt-8">
                        <Button 
                            variant="ghost" 
                            onClick={handleBack}
                            disabled={currentStep === 0}
                            className="gap-2"
                        >
                            <ChevronLeft className="w-4 h-4" /> Back
                        </Button>
                        <Button 
                            onClick={handleNext}
                            className="px-8 py-6 rounded-xl font-bold gradient-primary text-primary-foreground gap-2"
                        >
                            {currentStep === steps.length - 1 ? 'Get Started' : 'Next'} 
                            {currentStep === steps.length - 1 ? <Check className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </Button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
