import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  type BayStatus,
  type ServiceBay,
  DEFAULT_SERVICE_BAYS,
  getBayDisplayName,
  getServiceBays,
  renameServiceBay,
  setServiceBays,
} from '@/lib/serviceBays';
import { getSCExtensionPacks } from '@/lib/featureExtensions';

function CarLiftGraphic({ vehicleNumber }: { vehicleNumber?: string }) {
  const compactVehicle = vehicleNumber?.toUpperCase().replace(/\s+/g, '').slice(0, 10) || '';

  return (
    <svg className="h-[128px] w-[70px] opacity-90" viewBox="0 0 120 220" aria-hidden="true">
      <rect x="30" y="10" width="60" height="190" rx="28" fill="white" stroke="#9ca3af" strokeWidth="1.5" />
      <rect x="45" y="45" width="30" height="70" rx="8" fill="#e5e7eb" />
      <circle cx="30" cy="40" r="5" fill="#374151" />
      <circle cx="90" cy="40" r="5" fill="#374151" />
      <circle cx="30" cy="190" r="5" fill="#374151" />
      <circle cx="90" cy="190" r="5" fill="#374151" />
      {compactVehicle && (
        <text
          x="60"
          y="140"
          textAnchor="middle"
          fill="#111827"
          fontSize="18"
          fontWeight="700"
          stroke="#ffffff"
          strokeWidth="0.6"
          paintOrder="stroke"
        >
          {compactVehicle}
        </text>
      )}
    </svg>
  );
}

export function ServiceBaysBoard() {
  const [bays, setBaysState] = useState<ServiceBay[]>(() => getServiceBays());
  const [canCustomizeBayNames, setCanCustomizeBayNames] = useState(() => getSCExtensionPacks().serviceBayCustomNames);

  useEffect(() => {
    const syncBays = () => setBaysState(getServiceBays());
    const syncExtensionPacks = () => setCanCustomizeBayNames(getSCExtensionPacks().serviceBayCustomNames);
    window.addEventListener('storage', syncBays);
    window.addEventListener('sc-service-bays-updated', syncBays as EventListener);
    window.addEventListener('sc-extension-packs-updated', syncExtensionPacks as EventListener);
    return () => {
      window.removeEventListener('storage', syncBays);
      window.removeEventListener('sc-service-bays-updated', syncBays as EventListener);
      window.removeEventListener('sc-extension-packs-updated', syncExtensionPacks as EventListener);
    };
  }, []);

  const counts = useMemo(() => {
    return bays.reduce(
      (acc, bay) => {
        acc[bay.status] += 1;
        return acc;
      },
      { green: 0, yellow: 0, red: 0 }
    );
  }, [bays]);

  const persist = (next: ServiceBay[]) => {
    setBaysState(next);
    setServiceBays(next);
  };

  const changeStatus = (index: number, status: BayStatus) => {
    const next = bays.map((bay, i) =>
      i === index
        ? {
            ...bay,
            status,
            vehicleNumber: status === 'green' ? undefined : bay.vehicleNumber,
          }
        : bay
    );
    persist(next);
  };

  const addBay = () => {
    persist([...bays, { status: 'green' }]);
  };

  const removeBay = () => {
    if (!bays.length) return;
    persist(bays.slice(0, -1));
  };

  const resetBays = () => {
    persist(DEFAULT_SERVICE_BAYS);
  };

  const changeBayName = (index: number, name: string) => {
    const capped = name.slice(0, 24);
    renameServiceBay(index, capped);
  };

  return (
    <div className="glass-card rounded-2xl p-4 sm:p-5">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-semibold">Workshop Service Bays</h3>
          <p className="text-xs text-muted-foreground mt-1">Manage bay occupancy and live floor status.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] rounded-full bg-success/10 text-success px-2 py-1 border border-success/20">Free: {counts.green}</span>
          <span className="text-[11px] rounded-full bg-warning/10 text-warning px-2 py-1 border border-warning/20">Finishing: {counts.yellow}</span>
          <span className="text-[11px] rounded-full bg-destructive/10 text-destructive px-2 py-1 border border-destructive/20">Busy: {counts.red}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <Button variant="outline" className="h-8 text-xs" onClick={addBay}>Add Bay</Button>
        <Button variant="outline" className="h-8 text-xs" onClick={removeBay} disabled={!bays.length}>Remove Bay</Button>
        <Button variant="outline" className="h-8 text-xs" onClick={resetBays}>Reset Bays</Button>
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-4">
        {bays.map((bay, index) => (
          <div key={`bay-${index}`} className="relative rounded-xl border border-border/70 bg-background/55 h-[260px] px-3 pt-6 pb-3 overflow-hidden">
            <div className="absolute top-2.5 right-2.5 w-2.5 h-2.5 rounded-full border border-black/20 bg-muted">
              <span
                className={`absolute inset-0 rounded-full ${
                  bay.status === 'green' ? 'bg-success' : bay.status === 'yellow' ? 'bg-warning' : 'bg-destructive'
                }`}
              />
            </div>

            <div className="absolute inset-y-3 left-1/2 -translate-x-1/2 border-l border-dashed border-border/90" />

            {bay.status !== 'green' && (
              <div className="absolute top-[56px] left-1/2 -translate-x-1/2">
                <CarLiftGraphic vehicleNumber={bay.vehicleNumber} />
              </div>
            )}

            <div className="absolute bottom-2 left-3 right-3 text-center">
              <p className="text-xs font-medium">{getBayDisplayName(bay, index)}</p>
              <select
                value={bay.status}
                onChange={(e) => changeStatus(index, e.target.value as BayStatus)}
                className="mt-1 h-7 w-full rounded-md border border-border bg-background px-2 text-[11px] outline-none"
              >
                <option value="green">Free</option>
                <option value="yellow">Finishing</option>
                <option value="red">Busy</option>
              </select>
              {canCustomizeBayNames && (
                <input
                  value={bay.name || ''}
                  onChange={(e) => changeBayName(index, e.target.value)}
                  placeholder={`Bay ${index + 1}`}
                  className="mt-1 h-7 w-full rounded-md border border-border bg-background px-2 text-[11px] outline-none"
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
