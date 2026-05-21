import { Link } from 'react-router-dom';
import { Plus, Search, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useServiceRecords, useVehicles, useDeleteServiceRecord } from '@/hooks/useData';
import { useState } from 'react';

const serviceTypeLabels: Record<string, string> = {
  oil_change: 'Oil Change', brake_pad: 'Brake Pad Change', wheel_alignment: 'Wheel Alignment',
  wheel_balancing: 'Wheel Balancing', tire_replacement: 'Tire Replacement',
  battery_replacement: 'Battery Replacement', general_service: 'General Service',
  engine_repair: 'Engine Repair', custom: 'Custom Service',
};

const ServiceHistory = () => {
  const [search, setSearch] = useState('');
  const { data: records = [], isLoading } = useServiceRecords();
  const { data: vehicles = [] } = useVehicles();
  const deleteServiceRecord = useDeleteServiceRecord();

  const filtered = records.filter(r => {
    const vehicle = vehicles.find(v => v.id === r.vehicle_id);
    const text = `${serviceTypeLabels[r.service_type] || ''} ${r.service_center_name} ${vehicle?.name || ''} ${r.notes || ''}`.toLowerCase();
    return text.includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Service History</h1>
          <p className="text-muted-foreground text-sm">{records.length} total records</p>
        </div>
        <Link to="/dashboard/services/add">
          <Button className="gradient-primary text-primary-foreground"><Plus className="h-4 w-4 mr-1" /> Add Record</Button>
        </Link>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search records..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
      ) : filtered.length === 0 ? (
        <p className="text-center py-8 text-muted-foreground">{records.length === 0 ? 'No service records yet' : 'No matching records'}</p>
      ) : (
        <div className="space-y-3">
          {filtered.map(record => {
            const vehicle = vehicles.find(v => v.id === record.vehicle_id);
            return (
              <div key={record.id} className="glass-card-hover rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">{serviceTypeLabels[record.service_type] || record.service_type}</Badge>
                    {vehicle && <span className="text-xs text-muted-foreground">{vehicle.name}</span>}
                  </div>
                  <p className="text-sm mt-1">{record.service_center_name} • {record.mechanic_name}</p>
                  {record.notes && <p className="text-xs text-muted-foreground mt-1 truncate">{record.notes}</p>}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-semibold">Rs.{Number(record.cost).toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">{record.date}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    disabled={deleteServiceRecord.isPending}
                    onClick={() => deleteServiceRecord.mutate(String(record.id))}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" /> Remove
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ServiceHistory;
