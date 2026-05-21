import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, FileText, FileSpreadsheet, Lock } from 'lucide-react';
import { DemoWrapper } from './DemoWrapper';

// Import actual components to demonstrate
import SCDashboard from '@/pages/service-center/Dashboard';
import CreateJobCard from '@/pages/service-center/CreateJobCard';
import JobCardInvoice from '@/pages/service-center/JobCardInvoice';

const DEMO_TABS = [
  {
    id: 'dashboard',
    label: 'Workshop Dashboard',
    icon: LayoutDashboard,
    description: 'Track ongoing jobs, mechanic utilization, and daily revenue in real-time.',
    path: '/'
  },
  {
    id: 'create-job',
    label: 'Digital Job Cards',
    icon: FileText,
    description: 'Create standardized job cards with integrated vehicle inspection and cost estimation.',
    path: '/create'
  },
  {
    id: 'invoice',
    label: 'Smart Invoicing',
    icon: FileSpreadsheet,
    description: 'Generate professional, GST-compliant invoices and gate passes instantly.',
    path: '/jobs/jc3/invoice'
  }
];



export function DemoSections() {
  const [activeTab, setActiveTab] = useState(DEMO_TABS[0].id);

  return (
    <section className="py-24 relative overflow-hidden" id="interactive-demo">
      {/* Background decorations */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-primary/10 rounded-full blur-[120px] -z-10 opacity-50" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6"
          >
            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
            Interactive Preview
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-display font-bold tracking-tight mb-6"
          >
            Experience the <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Real Workflow</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-muted-foreground"
          >
            Don't just take our word for it. Try our fully functional workshop management tools right here.
          </motion.p>
        </div>

        {/* Demo Navigation */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {DEMO_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-6 py-4 rounded-2xl transition-all duration-300 flex items-start gap-4 text-left border overflow-hidden max-w-[320px] ${
                  isActive 
                    ? 'border-primary/50 shadow-[0_0_30px_-10px_rgba(var(--primary),0.3)] bg-background' 
                    : 'border-border/50 bg-secondary/30 hover:bg-secondary/50'
                }`}
              >
                {isActive && (
                  <motion.div 
                    layoutId="active-tab-bg"
                    className="absolute inset-0 bg-primary/5 z-0"
                  />
                )}
                <div className={`relative z-10 w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                  isActive ? 'bg-primary/10 text-primary' : 'bg-background text-muted-foreground'
                }`}>
                  <tab.icon className="h-6 w-6" />
                </div>
                <div className="relative z-10">
                  <h3 className={`font-bold mb-1 transition-colors ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {tab.label}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {tab.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Demo Content */}
        <motion.div
          layout
          className="relative rounded-3xl border border-border/50 bg-background shadow-2xl flex flex-col h-[85vh] min-h-[700px] max-h-[1000px]"
        >
          {/* Mac-style window controls */}
          <div className="h-12 border-b bg-muted/30 flex items-center shrink-0 px-6 gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-500/80" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            
            <div className="flex-1 flex justify-center">
              <div className="bg-background border rounded-md px-4 py-1 text-xs text-muted-foreground flex items-center gap-2 max-w-sm w-full font-mono">
                <Lock className="h-3 w-3" /> https://autocare.ai/app
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-8 flex-1 overflow-y-auto preview-scrollbar relative bg-muted/10">
            <DemoWrapper maxInteractions={10}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="w-full min-h-max pb-20 pointer-events-auto"
                  >
                    {activeTab === 'dashboard' && <SCDashboard />}
                    {activeTab === 'create-job' && <CreateJobCard />}
                    {activeTab === 'invoice' && <JobCardInvoice />}
                  </motion.div>
                </AnimatePresence>
            </DemoWrapper>
          </div>
        </motion.div>
      </div>

    </section>
  );
}
