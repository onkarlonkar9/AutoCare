import { motion } from 'framer-motion';
import { Sparkles, Droplets, Disc, Shield, TrendingUp } from 'lucide-react';

interface Vehicle {
  id: string;
  name: string;
  current_mileage: number;
  health_score: number;
  next_service_date: string | null;
  fuel_type: string;
}

interface ServiceRecord {
  id: string;
  service_type: string;
  date: string;
  mileage_at_service: number;
  cost: number;
}

function generateInsights(vehicles: Vehicle[], records: ServiceRecord[]) {
  const insights: Array<{
    id: string;
    icon: React.ElementType;
    title: string;
    description: string;
    type: 'info' | 'warning' | 'success';
  }> = [];

  const oilChanges = records.filter((r) => r.service_type === 'oil_change').sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  if (oilChanges.length > 0) {
    const lastOil = oilChanges[0];
    const mileageSince = vehicles.length > 0
      ? Math.max(0, vehicles[0].current_mileage - lastOil.mileage_at_service)
      : 0;
    if (mileageSince > 4000) {
      insights.push({
        id: 'oil',
        icon: Droplets,
        title: 'Oil Change Due Soon',
        description: `${mileageSince.toLocaleString()} km since last oil change. Recommended at 5,000 km.`,
        type: 'warning',
      });
    }
  } else if (vehicles.length > 0) {
    insights.push({
      id: 'oil-first',
      icon: Droplets,
      title: 'Track Oil Changes',
      description: 'Add your oil change records for smart predictions.',
      type: 'info',
    });
  }

  const brakeRecords = records.filter((r) => r.service_type === 'brake_pad');
  if (brakeRecords.length > 0) {
    insights.push({
      id: 'brake',
      icon: Disc,
      title: 'Brake Pads Healthy',
      description: 'Last replaced recently. Next check in about 15,000 km.',
      type: 'success',
    });
  }

  if (records.length >= 3) {
    const totalCost = records.reduce((a, r) => a + r.cost, 0);
    const avgCost = Math.round(totalCost / records.length);
    insights.push({
      id: 'cost',
      icon: TrendingUp,
      title: 'Spending Insight',
      description: `Average service cost: Rs.${avgCost.toLocaleString()}. ${records.length} total services.`,
      type: 'info',
    });
  }

  const lowHealth = vehicles.filter((v) => v.health_score < 60);
  if (lowHealth.length > 0) {
    insights.push({
      id: 'health',
      icon: Shield,
      title: 'Attention Needed',
      description: `${lowHealth[0].name} has a health score of ${lowHealth[0].health_score}. Schedule a check-up.`,
      type: 'warning',
    });
  }

  if (insights.length === 0) {
    insights.push({
      id: 'default',
      icon: Sparkles,
      title: 'All Looking Good',
      description: 'Your vehicles are well maintained. Keep adding service records for better insights.',
      type: 'success',
    });
  }

  return insights.slice(0, 4);
}

const typeBg = {
  info: 'bg-accent/8 border-accent/15',
  warning: 'bg-warning/8 border-warning/15',
  success: 'bg-success/8 border-success/15',
};

const typeIconColor = {
  info: 'text-accent',
  warning: 'text-warning',
  success: 'text-success',
};

export function AIInsightsPanel({ vehicles, records }: { vehicles: Vehicle[]; records: ServiceRecord[] }) {
  const insights = generateInsights(vehicles, records);

  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-6 h-6 rounded-lg bg-accent/10 flex items-center justify-center">
          <Sparkles className="h-3.5 w-3.5 text-accent" />
        </div>
        <h3 className="font-display font-semibold text-sm">AI Insights</h3>
      </div>

      <div className="space-y-3">
        {insights.map((insight, i) => (
          <motion.div
            key={insight.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1, duration: 0.35 }}
            className={`flex items-start gap-3 p-3.5 rounded-xl border ${typeBg[insight.type]}`}
          >
            <insight.icon className={`h-4 w-4 mt-0.5 flex-shrink-0 ${typeIconColor[insight.type]}`} />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold leading-tight">{insight.title}</p>
              <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{insight.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
