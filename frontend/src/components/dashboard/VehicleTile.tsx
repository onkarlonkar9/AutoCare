import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Car, Fuel, Gauge, Calendar, Activity } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

interface VehicleTileProps {
  vehicle: {
    id: string;
    name: string;
    manufacturer: string;
    model: string;
    vehicle_number: string;
    current_mileage: number;
    health_score: number;
    fuel_type: string;
    type: string;
    next_service_date: string | null;
    image_url: string | null;
  };
  index: number;
}

function getHealthColor(score: number) {
  if (score >= 80) return 'text-success';
  if (score >= 50) return 'text-warning';
  return 'text-destructive';
}

function getHealthBg(score: number) {
  if (score >= 80) return 'bg-success/10';
  if (score >= 50) return 'bg-warning/10';
  return 'bg-destructive/10';
}

function getServiceCountdown(date: string | null) {
  if (!date) return null;
  const days = differenceInDays(new Date(date), new Date());
  if (days < 0) return { text: 'Overdue', urgent: true };
  if (days === 0) return { text: 'Today', urgent: true };
  if (days <= 7) return { text: `${days}d`, urgent: true };
  return { text: `${days}d`, urgent: false };
}

const typeIcons: Record<string, string> = {
  car: '🚗', bike: '🏍️', truck: '🚛', bus: '🚌', scooter: '🛵', machinery: '⚙️',
};

export function VehicleTile({ vehicle, index }: VehicleTileProps) {
  const countdown = getServiceCountdown(vehicle.next_service_date);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link to={`/dashboard/vehicles/${vehicle.id}`}>
        <motion.div
          whileHover={{ y: -4, scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="group relative glass-card rounded-2xl p-5 cursor-pointer overflow-hidden"
        >
          {/* Accent line */}
          <div className={`absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl ${
            vehicle.health_score >= 80 ? 'bg-success' :
            vehicle.health_score >= 50 ? 'bg-warning' : 'bg-destructive'
          } opacity-60 group-hover:opacity-100 transition-opacity`} />

          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{typeIcons[vehicle.type] || '🚗'}</span>
              <div>
                <h3 className="font-display font-semibold text-sm leading-tight">{vehicle.name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{vehicle.manufacturer} {vehicle.model}</p>
              </div>
            </div>
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getHealthBg(vehicle.health_score)} ${getHealthColor(vehicle.health_score)}`}>
              <Activity className="h-3 w-3" />
              {vehicle.health_score}
            </div>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Gauge className="h-3.5 w-3.5" />
                Mileage
              </span>
              <span className="font-medium tabular-nums">{vehicle.current_mileage.toLocaleString()} km</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <span className="text-[10px] uppercase font-medium tracking-wide">{vehicle.vehicle_number}</span>
              </span>
              <span className="text-muted-foreground capitalize">{vehicle.fuel_type}</span>
            </div>

            {countdown && (
              <div className="flex items-center justify-between text-xs pt-1 border-t border-border/50">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  Next service
                </span>
                <span className={`font-medium ${countdown.urgent ? 'text-warning' : 'text-muted-foreground'}`}>
                  {countdown.text}
                </span>
              </div>
            )}
          </div>

          {/* Subtle hover gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-accent/0 via-accent/0 to-accent/0 group-hover:from-accent/[0.02] group-hover:to-accent/[0.04] transition-all duration-500 rounded-2xl pointer-events-none" />
        </motion.div>
      </Link>
    </motion.div>
  );
}
