import { MaintenanceCostChart, ServiceFrequencyChart, MileageChart } from '@/components/dashboard/Charts';
import { StatCard } from '@/components/dashboard/StatCard';
import { useVehicles, useServiceRecords } from '@/hooks/useData';
import { DollarSign, Wrench, Gauge, Activity } from 'lucide-react';

const Analytics = () => {
  const { data: vehicles = [] } = useVehicles();
  const { data: records = [] } = useServiceRecords();
  const totalCost = records.reduce((a, r) => a + Number(r.cost), 0);
  const totalMileage = vehicles.reduce((a, v) => a + v.current_mileage, 0);
  const costPerKm = totalMileage > 0 ? (totalCost / totalMileage).toFixed(2) : '0';

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-muted-foreground text-sm">Insights across all your vehicles</p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Spend" value={`₹${totalCost.toLocaleString()}`} icon={<DollarSign className="h-5 w-5" />} />
        <StatCard title="Total Services" value={records.length} icon={<Wrench className="h-5 w-5" />} />
        <StatCard title="Cost per km" value={`₹${costPerKm}`} icon={<Gauge className="h-5 w-5" />} />
        <StatCard title="Avg Health" value={vehicles.length > 0 ? `${Math.round(vehicles.reduce((a, v) => a + v.health_score, 0) / vehicles.length)}%` : 'N/A'} icon={<Activity className="h-5 w-5" />} />
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <MaintenanceCostChart />
        <ServiceFrequencyChart />
      </div>
      <MileageChart />
    </div>
  );
};

export default Analytics;
