export type BayStatus = 'green' | 'yellow' | 'red';

export type ServiceBay = {
  status: BayStatus;
  vehicleNumber?: string;
  name?: string;
};

export const SERVICE_BAYS_STORAGE_KEY = 'sc-service-bays-v1';

export const DEFAULT_SERVICE_BAYS: ServiceBay[] = [
  { status: 'green' },
  { status: 'red' },
  { status: 'yellow' },
  { status: 'green' },
];

export function getServiceBays(): ServiceBay[] {
  try {
    const raw = localStorage.getItem(SERVICE_BAYS_STORAGE_KEY);
    if (!raw) return DEFAULT_SERVICE_BAYS;
    const parsed = JSON.parse(raw) as Array<{ status?: BayStatus; vehicleNumber?: string; name?: string }>;
    if (!Array.isArray(parsed)) return DEFAULT_SERVICE_BAYS;

    const next = parsed.reduce<ServiceBay[]>((acc, bay) => {
      if (!(bay.status === 'green' || bay.status === 'yellow' || bay.status === 'red')) return acc;

      acc.push({
        status: bay.status,
        vehicleNumber: bay.vehicleNumber?.trim() || undefined,
        name: bay.name?.trim() || undefined,
      });

      return acc;
    }, []);

    return next.length ? next : DEFAULT_SERVICE_BAYS;
  } catch {
    localStorage.removeItem(SERVICE_BAYS_STORAGE_KEY);
    return DEFAULT_SERVICE_BAYS;
  }
}

export function setServiceBays(next: ServiceBay[]) {
  localStorage.setItem(SERVICE_BAYS_STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent('sc-service-bays-updated', { detail: next }));
}

export function assignVehicleToBay(index: number, vehicleNumber: string) {
  const bays = getServiceBays();
  if (index < 0 || index >= bays.length) return;
  const next = bays.map((bay, i) =>
    i === index
      ? {
          ...bay,
          status: 'red' as BayStatus,
          vehicleNumber: vehicleNumber.trim().toUpperCase(),
        }
      : bay
  );
  setServiceBays(next);
}

export function releaseVehicleFromBay(vehicleNumber: string) {
  const normalized = vehicleNumber.trim().toUpperCase();
  if (!normalized) return;

  const bays = getServiceBays();
  const next = bays.map((bay) => {
    const current = bay.vehicleNumber?.trim().toUpperCase();
    if (current && current === normalized) {
      return {
        ...bay,
        status: 'green' as BayStatus,
        vehicleNumber: undefined,
      };
    }
    return bay;
  });

  setServiceBays(next);
}

export function getFreeBays() {
  return getServiceBays().map((bay, index) => ({ bay, index })).filter(({ bay }) => bay.status === 'green');
}

export function getBayDisplayName(bay: ServiceBay, index: number) {
  return bay.name?.trim() || `Bay ${index + 1}`;
}

export function renameServiceBay(index: number, name: string) {
  const bays = getServiceBays();
  if (index < 0 || index >= bays.length) return;

  const trimmed = name.trim();
  const next = bays.map((bay, i) =>
    i === index
      ? {
          ...bay,
          name: trimmed || undefined,
        }
      : bay
  );

  setServiceBays(next);
}
