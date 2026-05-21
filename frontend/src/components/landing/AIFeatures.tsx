import { motion } from 'framer-motion';
import { BrainCircuit, Sparkles, Bot } from 'lucide-react';

export function AIFeatures() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-[1200px] mx-auto rounded-3xl overflow-hidden border border-white/15 bg-[linear-gradient(135deg,#0f172a,#1e293b,#2563eb)]">
        <div className="grid lg:grid-cols-2 gap-6 p-6 md:p-8 lg:p-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-90px' }}
            transition={{ duration: 0.5 }}
            className="text-white"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200 mb-3">AI Features</p>
            <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight mb-4">AI-Powered Maintenance Intelligence</h2>
            <p className="text-sm text-blue-100/85 leading-relaxed max-w-xl">
              AutoCare AI combines workshop operations, AI maintenance insights, customer communication, and business analytics into one high-performance platform designed for scale.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-90px' }}
            transition={{ duration: 0.55, delay: 0.08 }}
            className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur p-4 sm:p-5"
          >
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="rounded-xl border border-white/20 bg-white/10 p-3 text-white">
                <BrainCircuit className="h-4 w-4 mb-2 text-cyan-200" />
                <p className="text-xs font-semibold">Predictive Engine</p>
              </div>
              <div className="rounded-xl border border-white/20 bg-white/10 p-3 text-white">
                <Bot className="h-4 w-4 mb-2 text-violet-200" />
                <p className="text-xs font-semibold">AI Assist Flow</p>
              </div>
            </div>
            <div className="rounded-xl border border-white/20 bg-white/10 p-3 text-blue-100 text-xs leading-relaxed">
              <div className="flex items-center gap-2 mb-2 text-white">
                <Sparkles className="h-3.5 w-3.5" />
                <span className="font-semibold">AI Insight</span>
              </div>
              Service risk probability increased for 12 commercial vehicles based on usage frequency, delayed preventive checks, and last-job history.
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
