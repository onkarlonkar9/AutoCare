import type { JobCardRow, CustomerRow, MechanicRow } from '@/types/backendRows';

type JobCardRow = Tables<'job_cards'>;
type CustomerRow = Tables<'customers'>;
type MechanicRow = Tables<'mechanics'>;

type RevenuePoint = { day: string; revenue: number };
type MonthlyServicePoint = { month: string; count: number };
type RepairTypePoint = { type: string; count: number };
type MechanicPerformancePoint = {
  mechanicId: string;
  mechanicName: string;
  completedJobs: number;
  revenue: number;
  avgTurnaroundHours: number;
  activeJobs: number;
  rating: number;
};

export type WorkshopAnalytics = {
  totalRevenue: number;
  completedJobs: number;
  activeJobs: number;
  pendingJobs: number;
  waitingPartsJobs: number;
  avgTicket: number;
  avgTurnaroundHours: number;
  completionRate: number;
  repeatCustomerRate: number;
  monthlyRevenue: number;
  monthlyRevenueGrowth: number;
  monthlyCompletedJobs: number;
  monthlyJobsGrowth: number;
  topMechanic: string;
  estimatedPipelineValue: number;
  realizationRate: number;
  jobsCompletedWithin48hRate: number;
  dailyRevenue: RevenuePoint[];
  monthlyServices: MonthlyServicePoint[];
  repairTypes: RepairTypePoint[];
  mechanicPerformance: MechanicPerformancePoint[];
};

const REPAIR_RULES: Array<{ type: string; keywords: string[] }> = [
  { type: 'General Service', keywords: ['general service', 'periodic service', 'scheduled service', 'oil change', 'service'] },
  { type: 'Engine Repair', keywords: ['engine', 'misfire', 'ecu', 'injector', 'timing belt'] },
  { type: 'AC/Electrical', keywords: ['ac', 'electrical', 'battery', 'alternator', 'wiring', 'cooling'] },
  { type: 'Body & Paint', keywords: ['dent', 'paint', 'body', 'bumper', 'scratch'] },
  { type: 'Brakes', keywords: ['brake', 'pad', 'rotor', 'disc'] },
  { type: 'Suspension', keywords: ['suspension', 'strut', 'shock', 'alignment', 'balancing'] },
];

function monthKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}`;
}

function asDate(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function jobRevenue(job: JobCardRow) {
  return Number(job.actual_cost || job.estimated_cost || 0);
}

function toJobText(job: JobCardRow) {
  const tasks = Array.isArray(job.service_tasks) ? job.service_tasks.join(' ') : '';
  return `${job.problem_description || ''} ${tasks}`.toLowerCase();
}

function categorizeRepair(job: JobCardRow) {
  const text = toJobText(job);
  for (const rule of REPAIR_RULES) {
    if (rule.keywords.some((k) => text.includes(k))) return rule.type;
  }
  return 'Other';
}

function monthLabel(date: Date) {
  return date.toLocaleString('en-IN', { month: 'short' });
}

function percentageGrowth(current: number, previous: number) {
  if (previous <= 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

function buildDailyRevenue(jobs: JobCardRow[]): RevenuePoint[] {
  const today = new Date();
  const points: RevenuePoint[] = [];

  for (let i = 6; i >= 0; i -= 1) {
    const date = new Date(today);
    date.setHours(0, 0, 0, 0);
    date.setDate(today.getDate() - i);
    const start = date.getTime();
    const end = start + 24 * 60 * 60 * 1000;

    const revenue = jobs.reduce((sum, job) => {
      const dateCandidate = asDate(job.completed_at) || asDate(job.created_at);
      if (!dateCandidate) return sum;
      const ts = dateCandidate.getTime();
      if (ts < start || ts >= end) return sum;
      return sum + jobRevenue(job);
    }, 0);

    points.push({ day: date.toLocaleString('en-IN', { weekday: 'short' }), revenue });
  }

  return points;
}

function buildMonthlyServices(jobs: JobCardRow[]): MonthlyServicePoint[] {
  const now = new Date();
  const slots: Array<{ label: string; year: number; month: number }> = [];

  for (let i = 5; i >= 0; i -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    slots.push({ label: monthLabel(date), year: date.getFullYear(), month: date.getMonth() });
  }

  return slots.map((slot) => {
    const count = jobs.filter((job) => {
      if (!(job.status === 'completed' || job.status === 'delivered')) return false;
      const date = asDate(job.completed_at) || asDate(job.created_at);
      if (!date) return false;
      return date.getFullYear() === slot.year && date.getMonth() === slot.month;
    }).length;

    return { month: slot.label, count };
  });
}

function buildRepairTypes(jobs: JobCardRow[]): RepairTypePoint[] {
  const map = new Map<string, number>();

  jobs.forEach((job) => {
    const key = categorizeRepair(job);
    map.set(key, (map.get(key) || 0) + 1);
  });

  return [...map.entries()]
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 7);
}

export function computeWorkshopAnalytics(
  jobs: JobCardRow[],
  customers: CustomerRow[],
  mechanics: MechanicRow[]
): WorkshopAnalytics {
  const completed = jobs.filter((j) => j.status === 'completed' || j.status === 'delivered');
  const totalRevenue = completed.reduce((sum, j) => sum + jobRevenue(j), 0);
  const activeJobs = jobs.filter((j) => j.status !== 'delivered').length;
  const pendingJobs = jobs.filter((j) => j.status === 'pending').length;
  const waitingPartsJobs = jobs.filter((j) => j.status === 'waiting_parts').length;
  const avgTicket = completed.length ? totalRevenue / completed.length : 0;

  const turnaroundHours = completed
    .map((job) => {
      const start = asDate(job.created_at);
      const end = asDate(job.completed_at);
      if (!start || !end) return null;
      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      return hours >= 0 ? hours : null;
    })
    .filter((v): v is number => typeof v === 'number');

  const avgTurnaroundHours = turnaroundHours.length
    ? turnaroundHours.reduce((sum, h) => sum + h, 0) / turnaroundHours.length
    : 0;

  const completionRate = jobs.length ? (completed.length / jobs.length) * 100 : 0;
  const estimatedPipelineValue = jobs
    .filter((j) => !(j.status === 'completed' || j.status === 'delivered'))
    .reduce((sum, j) => sum + Number(j.estimated_cost || 0), 0);

  const completedEstimatedTotal = completed.reduce((sum, j) => sum + Number(j.estimated_cost || 0), 0);
  const realizationRate = completedEstimatedTotal > 0 ? (totalRevenue / completedEstimatedTotal) * 100 : 0;

  const completedWithin48h = completed.filter((job) => {
    const start = asDate(job.created_at);
    const end = asDate(job.completed_at);
    if (!start || !end) return false;
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    return hours >= 0 && hours <= 48;
  }).length;
  const jobsCompletedWithin48hRate = completed.length ? (completedWithin48h / completed.length) * 100 : 0;

  const repeatCustomers = customers.filter((c) => Number(c.total_visits || 0) > 1).length;
  const repeatCustomerRate = customers.length ? (repeatCustomers / customers.length) * 100 : 0;

  const now = new Date();
  const currentKey = monthKey(now);
  const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const previousKey = monthKey(prev);

  const monthBuckets = new Map<string, { revenue: number; jobs: number }>();
  completed.forEach((job) => {
    const date = asDate(job.completed_at) || asDate(job.created_at);
    if (!date) return;
    const key = monthKey(date);
    const bucket = monthBuckets.get(key) || { revenue: 0, jobs: 0 };
    bucket.revenue += jobRevenue(job);
    bucket.jobs += 1;
    monthBuckets.set(key, bucket);
  });

  const currentMonth = monthBuckets.get(currentKey) || { revenue: 0, jobs: 0 };
  const previousMonth = monthBuckets.get(previousKey) || { revenue: 0, jobs: 0 };

  const topMechanic = mechanics.length
    ? [...mechanics]
        .sort((a, b) => Number(b.completed_jobs || 0) - Number(a.completed_jobs || 0))[0]
        ?.name || 'N/A'
    : 'N/A';

  const mechanicPerformance = mechanics
    .map((m) => {
      const assigned = jobs.filter((j) => j.mechanic_id === m.id || (j.mechanic_name && j.mechanic_name === m.name));
      const assignedCompleted = assigned.filter((j) => j.status === 'completed' || j.status === 'delivered');
      const mechanicRevenue = assignedCompleted.reduce((sum, j) => sum + jobRevenue(j), 0);
      const tatValues = assignedCompleted
        .map((j) => {
          const start = asDate(j.created_at);
          const end = asDate(j.completed_at);
          if (!start || !end) return null;
          const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
          return hours >= 0 ? hours : null;
        })
        .filter((v): v is number => typeof v === 'number');

      const activeJobs = assigned.filter((j) => j.status === 'pending' || j.status === 'in_progress' || j.status === 'waiting_parts').length;
      const avgTurnaroundHours = tatValues.length ? tatValues.reduce((sum, h) => sum + h, 0) / tatValues.length : 0;

      return {
        mechanicId: m.id,
        mechanicName: m.name,
        completedJobs: assignedCompleted.length || Number(m.completed_jobs || 0),
        revenue: mechanicRevenue,
        avgTurnaroundHours,
        activeJobs,
        rating: Number(m.rating || 0),
      };
    })
    .sort((a, b) => {
      if (b.completedJobs !== a.completedJobs) return b.completedJobs - a.completedJobs;
      return b.revenue - a.revenue;
    })
    .slice(0, 8);

  return {
    totalRevenue,
    completedJobs: completed.length,
    activeJobs,
    pendingJobs,
    waitingPartsJobs,
    avgTicket,
    avgTurnaroundHours,
    completionRate,
    repeatCustomerRate,
    monthlyRevenue: currentMonth.revenue,
    monthlyRevenueGrowth: percentageGrowth(currentMonth.revenue, previousMonth.revenue),
    monthlyCompletedJobs: currentMonth.jobs,
    monthlyJobsGrowth: percentageGrowth(currentMonth.jobs, previousMonth.jobs),
    topMechanic,
    estimatedPipelineValue,
    realizationRate,
    jobsCompletedWithin48hRate,
    dailyRevenue: buildDailyRevenue(completed),
    monthlyServices: buildMonthlyServices(jobs),
    repairTypes: buildRepairTypes(jobs),
    mechanicPerformance,
  };
}
