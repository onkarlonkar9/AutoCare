import { useState } from 'react';
import { Search, Phone, Mail, Car, IndianRupee, Calendar, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useCustomers, useDeleteCustomer } from '@/hooks/useData';
import { Button } from '@/components/ui/button';

const Customers = () => {
  const [search, setSearch] = useState('');
  const { data: customers = [], isLoading } = useCustomers();
  const deleteCustomer = useDeleteCustomer();

  const filtered = customers.filter(c => {
    const text = `${c.name} ${c.phone} ${c.email || ''} ${(c.vehicle_numbers || []).join(' ')}`.toLowerCase();
    return text.includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold">Customers</h1>
        <p className="text-muted-foreground text-sm">{customers.length} registered customers</p>
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
      </div>
      {isLoading ? (
        <div className="grid sm:grid-cols-2 gap-4">{[1, 2].map(i => <Skeleton key={i} className="h-40 rounded-xl" />)}</div>
      ) : filtered.length === 0 ? (
        <p className="text-center py-8 text-muted-foreground">{customers.length === 0 ? 'No customers yet' : 'No matching customers'}</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {filtered.map(c => (
            <div key={c.id} className="glass-card-hover rounded-xl p-5 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{c.name}</h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1"><Phone className="h-3 w-3" /> {c.phone}</p>
                  {c.email && <p className="text-xs text-muted-foreground flex items-center gap-1"><Mail className="h-3 w-3" /> {c.email}</p>}
                </div>
                <Badge variant="outline" className="text-xs">{c.total_visits} visits</Badge>
              </div>
              {c.vehicle_numbers && c.vehicle_numbers.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {c.vehicle_numbers.map(vn => <Badge key={vn} variant="secondary" className="text-xs font-mono flex items-center gap-1"><Car className="h-3 w-3" /> {vn}</Badge>)}
                </div>
              )}
              <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                <span className="flex items-center gap-1"><IndianRupee className="h-3 w-3" /> Total: Rs.{Number(c.total_spend).toLocaleString()}</span>
                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Last: {c.last_visit || 'N/A'}</span>
              </div>
              <Button variant="outline" size="sm" className="w-full" disabled={deleteCustomer.isPending} onClick={() => deleteCustomer.mutate(c.id)}>
                <Trash2 className="h-4 w-4 mr-1" /> Remove
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Customers;
