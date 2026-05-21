import { useState } from 'react';
import { Wrench, Star, Phone, Plus, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useMechanics, useAddMechanic, useDeleteMechanic } from '@/hooks/useData';

const statusColors: Record<string, string> = {
  available: 'bg-success/10 text-success border-success/20',
  busy: 'bg-warning/10 text-warning border-warning/20',
  off_duty: 'bg-muted text-muted-foreground border-muted',
};

const Mechanics = () => {
  const { data: mechanics = [], isLoading } = useMechanics();
  const addMechanic = useAddMechanic();
  const deleteMechanic = useDeleteMechanic();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', specialization: '' });

  const handleAdd = async () => {
    if (!form.name.trim()) return;
    await addMechanic.mutateAsync({
      name: form.name.trim(),
      phone: form.phone.trim() || undefined,
      specialization: form.specialization.trim() || undefined,
    });
    setForm({ name: '', phone: '', specialization: '' });
    setOpen(false);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Mechanics</h1>
          <p className="text-muted-foreground text-sm">{mechanics.length} team members</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary text-primary-foreground gap-2"><Plus className="h-4 w-4" /> Add Mechanic</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle>Add New Mechanic</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2"><Label>Name *</Label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Mechanic name" /></div>
              <div className="space-y-2"><Label>Phone</Label><Input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+91 XXXXX XXXXX" /></div>
              <div className="space-y-2"><Label>Specialization</Label><Input value={form.specialization} onChange={e => setForm(p => ({ ...p, specialization: e.target.value }))} placeholder="e.g. Engine, Electrical, General" /></div>
              <Button onClick={handleAdd} disabled={addMechanic.isPending || !form.name.trim()} className="w-full gradient-primary text-primary-foreground">
                {addMechanic.isPending ? 'Adding...' : 'Add Mechanic'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-48 rounded-xl" />)}</div>
      ) : mechanics.length === 0 ? (
        <p className="text-center py-8 text-muted-foreground">No mechanics added yet. Click "Add Mechanic" to get started.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {mechanics.map(m => (
            <div key={m.id} className="glass-card-hover rounded-xl p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Wrench className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{m.name}</h3>
                    <p className="text-xs text-muted-foreground">{m.specialization}</p>
                  </div>
                </div>
                <Badge className={`text-xs border capitalize ${statusColors[m.status] || ''}`}>{m.status.replace('_', ' ')}</Badge>
              </div>
              <div className="flex items-center gap-1 text-sm">
                <Star className="h-4 w-4 fill-warning text-warning" />
                <span className="font-medium">{Number(m.rating)}</span><span className="text-muted-foreground">/5.0</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs"><span className="text-muted-foreground">Active Jobs</span><span className="font-medium">{m.active_jobs}</span></div>
                <Progress value={m.active_jobs * 33} className="h-1.5" />
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {m.phone}</span>
                <span>{m.completed_jobs} completed</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                disabled={deleteMechanic.isPending}
                onClick={() => deleteMechanic.mutate(m.id)}
              >
                <Trash2 className="h-4 w-4 mr-1" /> Remove
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Mechanics;
