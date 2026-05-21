import { Link } from 'react-router-dom';
import { Plus, Car, Bike, Truck, Bus, Gauge, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useVehicles } from '@/hooks/useData';
import { Skeleton } from '@/components/ui/skeleton';

const vehicleIcons: Record<string, typeof Car> = {
  car: Car, bike: Bike, truck: Truck, bus: Bus, scooter: Bike, machinery: Gauge,
};

const Vehicles = () => {
  const { data: vehicles = [], isLoading } = useVehicles();

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Vehicles</h1>
          <p className="text-muted-foreground text-sm">{vehicles.length} vehicles registered</p>
        </div>
        <Link to="/dashboard/vehicles/add">
          <Button className="gradient-primary text-primary-foreground">
            <Plus className="h-4 w-4 mr-1" /> Add Vehicle
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-52 rounded-xl" />)}
        </div>
      ) : vehicles.length === 0 ? (
        <div className="text-center py-16 glass-card rounded-xl">
          <Car className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground">No vehicles yet. Add your first vehicle!</p>
          <Link to="/dashboard/vehicles/add"><Button className="mt-4 gradient-primary text-primary-foreground">Add Vehicle</Button></Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map(v => {
            const Icon = vehicleIcons[v.type] || Car;
            return (
              <Link key={v.id} to={`/dashboard/vehicles/${v.id}`}>
                <div className="glass-card-hover rounded-xl p-6 h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <Badge variant="outline" className="capitalize">{v.type}</Badge>
                  </div>
                  <h3 className="font-semibold text-lg">{v.name}</h3>
                  <p className="text-sm text-muted-foreground">{v.manufacturer} {v.model} • {v.year}</p>
                  <p className="text-xs text-muted-foreground mt-1">{v.vehicle_number}</p>
                  <div className="mt-4 space-y-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Health Score</span>
                        <span className="font-medium">{v.health_score}%</span>
                      </div>
                      <Progress value={v.health_score} className="h-2" />
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Gauge className="h-3 w-3" /> {v.current_mileage.toLocaleString()} km</span>
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {v.next_service_date || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Vehicles;
