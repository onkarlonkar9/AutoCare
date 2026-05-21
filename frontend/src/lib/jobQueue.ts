export const SC_JOB_QUEUE_KEY = 'sc-job-queue-v1';

export type JobQueueItem = {
  id: string;
  jobId?: string;
  customerName: string;
  customerPhone: string;
  vehicleNumber: string;
  vehicleModel: string;
  problemDescription: string;
  mechanicId?: string;
  mechanicName?: string;
  bayIndex?: number;
  createdAt: string;
};

function dispatchQueueUpdated(next: JobQueueItem[]) {
  window.dispatchEvent(new CustomEvent('sc-job-queue-updated', { detail: next }));
}

export function getJobQueue(): JobQueueItem[] {
  try {
    const raw = localStorage.getItem(SC_JOB_QUEUE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as JobQueueItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    localStorage.removeItem(SC_JOB_QUEUE_KEY);
    return [];
  }
}

export function setJobQueue(next: JobQueueItem[]) {
  localStorage.setItem(SC_JOB_QUEUE_KEY, JSON.stringify(next));
  dispatchQueueUpdated(next);
}

export function enqueueJob(item: Omit<JobQueueItem, 'id' | 'createdAt'>) {
  const nextItem: JobQueueItem = {
    ...item,
    id: (typeof crypto !== 'undefined' && crypto.randomUUID)
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    createdAt: new Date().toISOString(),
  };

  const next = [nextItem, ...getJobQueue()];
  setJobQueue(next);
  return nextItem;
}

export function removeQueuedJob(queueId: string) {
  const next = getJobQueue().filter((item) => item.id !== queueId);
  setJobQueue(next);
}

export function updateQueuedJob(queueId: string, patch: Partial<JobQueueItem>) {
  const next = getJobQueue().map((item) => (item.id === queueId ? { ...item, ...patch } : item));
  setJobQueue(next);
}
