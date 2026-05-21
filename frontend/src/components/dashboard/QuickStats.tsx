import { motion } from 'framer-motion';

interface QuickStatProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  subtitle?: string;
  index?: number;
}

export function QuickStat({ label, value, icon, subtitle, index = 0 }: QuickStatProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="glass-card rounded-2xl p-5 flex items-start gap-4"
    >
      <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground font-medium">{label}</p>
        <p className="text-xl font-display font-bold tracking-tight mt-0.5">{value}</p>
        {subtitle && <p className="text-[11px] text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
    </motion.div>
  );
}
