import { motion } from 'framer-motion';
import { Wrench, Droplets, Disc, Battery, Cog, CircleDot, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

const serviceIcons: Record<string, React.ElementType> = {
  oil_change: Droplets,
  brake_pad: Disc,
  battery_replacement: Battery,
  general_service: Cog,
  engine_repair: Wrench,
  tire_replacement: CircleDot,
  wheel_alignment: CircleDot,
  wheel_balancing: CircleDot,
  custom: Wrench,
};

const serviceLabels: Record<string, string> = {
  oil_change: 'Oil Change',
  brake_pad: 'Brake Pad',
  battery_replacement: 'Battery',
  general_service: 'General Service',
  engine_repair: 'Engine Repair',
  tire_replacement: 'Tire Replace',
  wheel_alignment: 'Alignment',
  wheel_balancing: 'Balancing',
  custom: 'Custom',
};

interface ServiceRecord {
  id: string;
  service_type: string;
  date: string;
  mileage_at_service: number;
  cost: number;
  service_center_name: string;
  mechanic_name: string | null;
}

export function MaintenanceTimeline({ records }: { records: ServiceRecord[] }) {
  const recent = records.slice(0, 8);

  if (recent.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-6">
        <h3 className="font-display font-semibold text-sm mb-4">Maintenance Timeline</h3>
        <p className="text-sm text-muted-foreground text-center py-8">No service records yet. Add your first service to see the timeline.</p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-display font-semibold text-sm">Maintenance Timeline</h3>
        <Link to="/dashboard/services" className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
          View all <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="overflow-x-auto -mx-2 px-2 pb-2">
        <div className="flex gap-3 min-w-max">
          {recent.map((record, i) => {
            const Icon = serviceIcons[record.service_type] || Wrench;
            return (
              <motion.div
                key={record.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06, duration: 0.35 }}
                className="group relative flex flex-col items-center gap-2 min-w-[120px]"
              >
                {i < recent.length - 1 && (
                  <div className="absolute top-5 left-[calc(50%+20px)] w-[calc(100%-10px)] h-px bg-border/60" />
                )}

                <div className="relative z-10 w-10 h-10 rounded-xl bg-secondary flex items-center justify-center group-hover:bg-accent/10 transition-colors">
                  <Icon className="h-4 w-4 text-muted-foreground group-hover:text-accent transition-colors" />
                </div>

                <div className="text-center">
                  <p className="text-[11px] font-medium leading-tight">{serviceLabels[record.service_type] || record.service_type}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{format(new Date(record.date), 'MMM d, yyyy')}</p>
                  <p className="text-[10px] font-medium text-accent mt-1">Rs.{record.cost.toLocaleString()}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
