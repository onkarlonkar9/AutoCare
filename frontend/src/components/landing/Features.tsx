import { motion } from 'framer-motion';
import { Car, Wrench, Brain, Bell, BarChart3, Shield } from 'lucide-react';

const features = [
  {
    icon: Car,
    title: 'Multi-Vehicle Tracking',
    description: 'Bikes, cars, trucks, machinery — manage them all from one clean dashboard.',
  },
  {
    icon: Wrench,
    title: 'Complete Service History',
    description: 'Every oil change, brake pad swap, and repair — logged with full detail.',
  },
  {
    icon: Brain,
    title: 'AI Predictions',
    description: 'Learns your patterns and predicts when maintenance is due before problems arise.',
  },
  {
    icon: Bell,
    title: 'Smart Reminders',
    description: 'Timely alerts for services, insurance expiry, PUC renewal, and more.',
  },
  {
    icon: BarChart3,
    title: 'Cost Analytics',
    description: 'Visualize spending, frequency, and cost-per-km with beautiful charts.',
  },
  {
    icon: Shield,
    title: 'Workshop Tools',
    description: 'Digital job cards, customer management, and mechanic tracking for service centers.',
  },
];

export function Features() {
  return (
    <section id="features" className="py-28 px-6">
      <div className="max-w-[1100px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <p className="text-xs font-semibold text-accent uppercase tracking-[0.2em] mb-3">Features</p>
          <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight mb-4">
            Everything for vehicle care
          </h2>
          <p className="text-muted-foreground text-sm max-w-lg mx-auto">
            From personal tracking to workshop management — one platform covers it all.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ delay: i * 0.08, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="group glass-card rounded-2xl p-6 h-full hover:border-accent/20 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
                <div className="w-10 h-10 rounded-xl bg-accent/8 flex items-center justify-center mb-4 group-hover:bg-accent/12 transition-colors">
                  <feature.icon className="h-5 w-5 text-accent" />
                </div>
                <h3 className="font-display font-semibold text-sm mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-xs leading-relaxed">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
