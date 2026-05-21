import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Car, Plus, FileText, BarChart3, Activity, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QuickStat } from '@/components/dashboard/QuickStats';
import { VehicleTile } from '@/components/dashboard/VehicleTile';
import { MaintenanceTimeline } from '@/components/dashboard/MaintenanceTimeline';
import { AIInsightsPanel } from '@/components/dashboard/AIInsightsPanel';
import { MaintenanceCostChart, ServiceFrequencyChart } from '@/components/dashboard/Charts';
import { useAuth } from '@/contexts/AuthContext';
import { useVehicles, useServiceRecords } from '@/hooks/useData';
import { Skeleton } from '@/components/ui/skeleton';

const OwnerDashboard = () => {
  const { profile } = useAuth();
  const { data: vehicles = [], isLoading: vLoading } = useVehicles();
  const { data: records = [], isLoading: rLoading } = useServiceRecords();

  const upcomingServices = vehicles.filter((v) => v.next_service_date).length;
  const avgHealth = vehicles.length > 0 ? Math.round(vehicles.reduce((a, v) => a + v.health_score, 0) / vehicles.length) : 0;
  const isLoading = vLoading || rLoading;

  return (
    <div className="space-y-8 max-w-[1200px]">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4"
      >
        <div>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Dashboard</p>
          <h1 className="text-2xl font-display font-bold tracking-tight">
            Welcome back, {profile?.name?.split(' ')[0] || 'there'}
          </h1>
        </div>
        <div className="flex gap-2">
          <Link to="/dashboard/vehicles/add">
            <Button size="sm" className="gradient-primary text-primary-foreground rounded-xl h-9 text-xs gap-1.5">
              <Plus className="h-3.5 w-3.5" /> Add Vehicle
            </Button>
          </Link>
          <Link to="/dashboard/services/add">
            <Button size="sm" variant="outline" className="rounded-xl h-9 text-xs gap-1.5">
              <FileText className="h-3.5 w-3.5" /> Add Service
            </Button>
          </Link>
        </div>
      </motion.div>

      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickStat label="Vehicles" value={vehicles.length} icon={<Car className="h-4 w-4 text-muted-foreground" />} subtitle="Total registered" index={0} />
          <QuickStat label="Services" value={records.length} icon={<Activity className="h-4 w-4 text-muted-foreground" />} subtitle="Total records" index={1} />
          <QuickStat label="Upcoming" value={upcomingServices} icon={<Calendar className="h-4 w-4 text-muted-foreground" />} subtitle="Scheduled" index={2} />
          <QuickStat label="Health" value={vehicles.length > 0 ? `${avgHealth}%` : '--'} icon={<BarChart3 className="h-4 w-4 text-muted-foreground" />} subtitle="Avg score" index={3} />
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold text-sm">Your Vehicles</h2>
          <Link to="/dashboard/vehicles" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            View all {'->'}
          </Link>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-44 rounded-2xl" />)}
          </div>
        ) : vehicles.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card rounded-2xl p-12 text-center"
          >
            <Car className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No vehicles yet</p>
            <Link to="/dashboard/vehicles/add">
              <Button size="sm" variant="outline" className="mt-3 rounded-xl text-xs">
                <Plus className="h-3.5 w-3.5 mr-1" /> Add your first vehicle
              </Button>
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {vehicles.slice(0, 6).map((vehicle, i) => (
              <VehicleTile
                key={vehicle.id}
                vehicle={{
                  ...vehicle,
                  image_url: typeof (vehicle as { image_url?: unknown }).image_url === 'string'
                    ? (vehicle as { image_url?: string | null }).image_url ?? null
                    : null,
                }}
                index={i}
              />
            ))}
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-[1fr_340px] gap-6">
        <MaintenanceTimeline records={records} />
        <AIInsightsPanel vehicles={vehicles} records={records} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <MaintenanceCostChart />
        <ServiceFrequencyChart />
      </div>
    </div>
  );
};

export default OwnerDashboard;
