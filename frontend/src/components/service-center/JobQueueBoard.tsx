import { useEffect, useMemo, useState } from 'react';
import { Wrench, CarFront, ListOrdered, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type JobQueueItem, getJobQueue, removeQueuedJob, updateQueuedJob } from '@/lib/jobQueue';
import { assignVehicleToBay, getBayDisplayName, getFreeBays } from '@/lib/serviceBays';
import { useUpdateJobStatus } from '@/hooks/useData';

type MechanicOption = {
  id: string;
  name: string;
  status: string;
  specialization?: string | null;
};

function QueueCarGraphic({ vehicleNumber }: { vehicleNumber: string }) {
  const compact = vehicleNumber.toUpperCase().replace(/\s+/g, '').slice(0, 10);

  return (
    <svg className="h-16 w-28" viewBox="0 0 180 100" aria-hidden="true">
      <rect x="22" y="30" width="136" height="38" rx="12" fill="white" stroke="#9ca3af" strokeWidth="1.5" />
      <rect x="54" y="18" width="72" height="20" rx="8" fill="#e5e7eb" />
      <circle cx="46" cy="70" r="10" fill="#374151" />
      <circle cx="134" cy="70" r="10" fill="#374151" />
      <text
        x="90"
        y="54"
        textAnchor="middle"
        fill="#111827"
        fontSize="14"
        fontWeight="700"
        stroke="#ffffff"
        strokeWidth="0.6"
        paintOrder="stroke"
      >
        {compact}
      </text>
    </svg>
  );
}

export function JobQueueBoard({ mechanics }: { mechanics: MechanicOption[] }) {
  const [queueItems, setQueueItems] = useState<JobQueueItem[]>(() => getJobQueue());
  const [activeQueueId, setActiveQueueId] = useState<string | null>(null);
  const [selectedMechanicId, setSelectedMechanicId] = useState<string>('');
  const [selectedBayIndex, setSelectedBayIndex] = useState<string>('');
  const [freeBays, setFreeBays] = useState(() => getFreeBays());
  const updateStatus = useUpdateJobStatus();

  useEffect(() => {
    const syncQueue = () => setQueueItems(getJobQueue());
    const syncBays = () => setFreeBays(getFreeBays());
    window.addEventListener('storage', syncQueue);
    window.addEventListener('sc-job-queue-updated', syncQueue as EventListener);
    window.addEventListener('sc-service-bays-updated', syncBays as EventListener);
    return () => {
      window.removeEventListener('storage', syncQueue);
      window.removeEventListener('sc-job-queue-updated', syncQueue as EventListener);
      window.removeEventListener('sc-service-bays-updated', syncBays as EventListener);
    };
  }, []);

  const activeItem = useMemo(
    () => queueItems.find((item) => item.id === activeQueueId) || null,
    [activeQueueId, queueItems]
  );

  const openQueueItem = (queueId: string) => {
    const item = queueItems.find((q) => q.id === queueId);
    if (!item) return;
    setActiveQueueId(queueId);
    setSelectedMechanicId(item.mechanicId || '');
    setSelectedBayIndex(typeof item.bayIndex === 'number' ? String(item.bayIndex) : '');
    setFreeBays(getFreeBays());
  };

  const closeDialog = () => {
    setActiveQueueId(null);
    setSelectedMechanicId('');
    setSelectedBayIndex('');
  };

  const saveQueueAssignment = () => {
    if (!activeItem) return;

    const mechanic = mechanics.find((m) => m.id === selectedMechanicId);
    updateQueuedJob(activeItem.id, {
      mechanicId: selectedMechanicId || undefined,
      mechanicName: mechanic?.name,
      bayIndex: selectedBayIndex === '' ? undefined : Number(selectedBayIndex),
    });

    if (selectedBayIndex !== '') {
      assignVehicleToBay(Number(selectedBayIndex), activeItem.vehicleNumber);
    }

    if (activeItem.jobId) {
      updateStatus.mutate({ id: activeItem.jobId, status: 'in_progress' });
    }

    closeDialog();
  };

  const removeItem = (queueId: string) => {
    removeQueuedJob(queueId);
    if (activeQueueId === queueId) closeDialog();
  };

  return (
    <div className="glass-card rounded-2xl p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-semibold flex items-center gap-2"><ListOrdered className="h-4 w-4" /> Job Queue</h3>
          <p className="text-xs text-muted-foreground mt-1">Queued vehicles waiting for assignment and bay allocation.</p>
        </div>
        <span className="text-[11px] rounded-full border border-border px-2 py-1">Queued: {queueItems.length}</span>
      </div>

      {queueItems.length === 0 ? (
        <p className="text-xs text-muted-foreground">No queued jobs yet.</p>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(170px,1fr))] gap-4">
          {queueItems.map((item) => (
            <div
              key={item.id}
              role="button"
              tabIndex={0}
              onClick={() => openQueueItem(item.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  openQueueItem(item.id);
                }
              }}
              className="rounded-xl border border-border/70 bg-background/60 p-3 text-left hover:bg-secondary/40 transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs font-medium truncate">{item.customerName}</p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeItem(item.id);
                  }}
                  className="text-muted-foreground hover:text-destructive"
                  aria-label="Remove queued vehicle"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="mt-2 flex justify-center">
                <QueueCarGraphic vehicleNumber={item.vehicleNumber} />
              </div>
              <p className="text-[11px] text-muted-foreground truncate">{item.vehicleModel}</p>
              <div className="mt-1 text-[11px] text-muted-foreground">
                <p className="truncate">Mechanic: {item.mechanicName || 'Not assigned'}</p>
                <p className="truncate">Bay: {typeof item.bayIndex === 'number' ? `Bay ${item.bayIndex + 1}` : 'Not assigned'}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!activeItem} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><CarFront className="h-4 w-4" /> Queue Vehicle Details</DialogTitle>
            <DialogDescription>
              Review job details and assign mechanic or service bay.
            </DialogDescription>
          </DialogHeader>

          {activeItem && (
            <div className="space-y-3">
              <div className="rounded-lg border border-border/60 p-3 text-xs space-y-1">
                <p><span className="text-muted-foreground">Customer:</span> {activeItem.customerName}</p>
                <p><span className="text-muted-foreground">Phone:</span> {activeItem.customerPhone}</p>
                <p><span className="text-muted-foreground">Vehicle:</span> {activeItem.vehicleNumber} • {activeItem.vehicleModel}</p>
                <p><span className="text-muted-foreground">Problem:</span> {activeItem.problemDescription}</p>
              </div>

              <div className="space-y-1.5">
                <p className="text-xs text-muted-foreground flex items-center gap-1"><Wrench className="h-3 w-3" /> Assign Mechanic</p>
                <Select value={selectedMechanicId} onValueChange={setSelectedMechanicId}>
                  <SelectTrigger><SelectValue placeholder="Select mechanic" /></SelectTrigger>
                  <SelectContent>
                    {mechanics.map((mechanic) => (
                      <SelectItem key={mechanic.id} value={mechanic.id}>
                        {mechanic.name} ({mechanic.specialization || 'General'})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <p className="text-xs text-muted-foreground">Assign Service Bay</p>
                <div className="flex flex-wrap gap-2">
                  {freeBays.length === 0 && (
                    <span className="text-xs text-muted-foreground">No free bays available.</span>
                  )}
                  {freeBays.map(({ bay, index }) => (
                    <button
                      key={`queue-bay-${index}`}
                      type="button"
                      onClick={() => setSelectedBayIndex(String(index))}
                      className={`rounded-lg border px-3 py-1.5 text-xs transition-colors ${
                        selectedBayIndex === String(index)
                          ? 'border-success/40 bg-success/10 text-success'
                          : 'border-border bg-background hover:bg-secondary/50'
                      }`}
                    >
                      {getBayDisplayName(bay, index)} Free
                    </button>
                  ))}
                  {selectedBayIndex !== '' && (
                    <button
                      type="button"
                      onClick={() => setSelectedBayIndex('')}
                      className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-secondary/50"
                    >
                      Clear Bay
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>Close</Button>
            <Button onClick={saveQueueAssignment}>Save Assignment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
