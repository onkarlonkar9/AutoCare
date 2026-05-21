import { useState } from 'react';
import { Search, Car, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useJobCards } from '@/hooks/useData';
import type { JobCardRow } from '@/types/backendRows';

const jobStatusLabels: Record<string, string> = {
  pending: 'Pending', in_progress: 'In Progress', waiting_parts: 'Waiting Parts',
  completed: 'Completed', delivered: 'Delivered and Payment Done',
};
const jobStatusColors: Record<string, string> = {
  pending: 'bg-warning/10 text-warning border-warning/20',
  in_progress: 'bg-primary/10 text-primary border-primary/20',
  waiting_parts: 'bg-destructive/10 text-destructive border-destructive/20',
  completed: 'bg-success/10 text-success border-success/20',
  delivered: 'bg-muted text-muted-foreground border-muted',
};

const VehicleLookup = () => {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<JobCardRow[]>([]);
  const [searched, setSearched] = useState(false);
  const { data: jobs = [] } = useJobCards();

  const handleSearch = () => {
    if (!search.trim()) return;
    const q = search.toLowerCase().replace(/\s/g, '');
    const found = jobs.filter(j => j.vehicle_number.toLowerCase().replace(/\s/g, '').includes(q))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    setResults(found);
    setSearched(true);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">Vehicle Lookup</h1>
        <p className="text-muted-foreground text-sm">Search by vehicle number to see complete service history</p>
      </div>
      <div className="glass-card rounded-xl p-6">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Car className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Enter vehicle number (e.g. MH 01 AB 1234)" value={search} onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()} className="pl-10 font-mono" />
          </div>
          <Button onClick={handleSearch} className="gradient-primary text-primary-foreground"><Search className="h-4 w-4 mr-1" /> Search</Button>
        </div>
      </div>
      {searched && (
        <div className="space-y-3">
          {results.length === 0 ? (
            <div className="text-center py-12 glass-card rounded-xl">
              <Car className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">No records found for this vehicle number</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">{results.length} record(s) found</p>
              {results.map(job => (
                <div key={job.id} className="glass-card-hover rounded-xl p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-semibold">{job.vehicle_model}</span>
                        <Badge className={`text-xs border flex items-center gap-1.5 py-1 px-2.5 font-semibold ${jobStatusColors[job.status] || ''}`}>
                          {job.status === 'delivered' && <Check className="h-5 w-5 text-emerald-600" strokeWidth={4} />}
                          {jobStatusLabels[job.status] || job.status}
                        </Badge>
                      </div>
                      <p className="text-sm mt-1">{job.problem_description}</p>
                      {job.service_tasks && <div className="flex flex-wrap gap-1 mt-2">{job.service_tasks.map((t: string) => <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>)}</div>}
                      <p className="text-xs text-muted-foreground mt-2">
                        Mechanic: {job.mechanic_name} • {job.completed_at ? `Completed: ${new Date(job.completed_at).toLocaleDateString()}` : `Created: ${new Date(job.created_at).toLocaleDateString()}`}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-semibold">₹{Number(job.actual_cost || job.estimated_cost).toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">{job.mileage.toLocaleString()} km</p>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default VehicleLookup;
