import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Gauge, Fuel, Shield, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useVehicle, useServiceRecords } from '@/hooks/useData';

const serviceTypeLabels: Record<string, string> = {
  oil_change: 'Oil Change', brake_pad: 'Brake Pad Change', wheel_alignment: 'Wheel Alignment',
  wheel_balancing: 'Wheel Balancing', tire_replacement: 'Tire Replacement',
  battery_replacement: 'Battery Replacement', general_service: 'General Service',
  engine_repair: 'Engine Repair', custom: 'Custom Service',
};

const VehicleDetail = () => {
  const { id } = useParams();
  const { data: vehicle, isLoading: vLoading } = useVehicle(id);
  const { data: records = [], isLoading: rLoading } = useServiceRecords(id);

  if (vLoading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-64 rounded-xl" /></div>;

  if (!vehicle) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Vehicle not found</p>
        <Link to="/dashboard/vehicles"><Button variant="outline" className="mt-4">Back to Vehicles</Button></Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <Link to="/dashboard/vehicles" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Vehicles
      </Link>

      <div className="glass-card rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{vehicle.name}</h1>
            <p className="text-muted-foreground">{vehicle.manufacturer} {vehicle.model} • {vehicle.year}</p>
            <Badge variant="outline" className="mt-2 capitalize">{vehicle.type} • {vehicle.fuel_type}</Badge>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Vehicle Number</p>
            <p className="text-lg font-mono font-bold">{vehicle.vehicle_number}</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1"><Gauge className="h-4 w-4" /> Mileage</div>
            <p className="font-semibold">{vehicle.current_mileage.toLocaleString()} km</p>
          </div>
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1"><Calendar className="h-4 w-4" /> Next Service</div>
            <p className="font-semibold">{vehicle.next_service_date || 'N/A'}</p>
          </div>
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1"><Shield className="h-4 w-4" /> Insurance</div>
            <p className="font-semibold">{vehicle.insurance_expiry || 'N/A'}</p>
          </div>
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1"><FileText className="h-4 w-4" /> PUC</div>
            <p className="font-semibold">{vehicle.puc_expiry || 'N/A'}</p>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">AI Health Score</span>
            <span className="font-semibold">{vehicle.health_score}/100</span>
          </div>
          <Progress value={vehicle.health_score} className="h-3" />
        </div>
      </div>

      <div className="glass-card rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Service History</h2>
          <Link to="/dashboard/services/add"><Button size="sm" variant="outline">Add Record</Button></Link>
        </div>

        {rLoading ? <Skeleton className="h-32" /> : records.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No service records yet</p>
        ) : (
          <div className="space-y-4">
            {records.map((record, i) => (
              <div key={record.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                  {i < records.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
                </div>
                <div className="flex-1 pb-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{serviceTypeLabels[record.service_type] || record.service_type}</p>
                      <p className="text-sm text-muted-foreground">{record.service_center_name} • {record.mechanic_name}</p>
                      {record.parts_replaced && record.parts_replaced.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {record.parts_replaced.map(p => <Badge key={p} variant="secondary" className="text-xs">{p}</Badge>)}
                        </div>
                      )}
                      {record.notes && <p className="text-xs text-muted-foreground mt-1">{record.notes}</p>}
                    </div>
                    <div className="text-right flex-shrink-0 ml-4">
                      <p className="font-semibold">₹{Number(record.cost).toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">{record.date}</p>
                      <p className="text-xs text-muted-foreground">{record.mileage_at_service.toLocaleString()} km</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VehicleDetail;
