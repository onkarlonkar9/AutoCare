export type JobStatus = 'pending' | 'in_progress' | 'waiting_parts' | 'completed' | 'delivered';

export interface JobCard {
  id: string;
  serviceCenterId: string;
  customerName: string;
  customerPhone: string;
  vehicleNumber: string;
  vehicleModel: string;
  mileage: number;
  problemDescription: string;
  serviceTasks: string[];
  partsRequired: string[];
  estimatedCost: number;
  actualCost?: number;
  mechanicId: string;
  mechanicName: string;
  status: JobStatus;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  notes?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  vehicleNumbers: string[];
  totalVisits: number;
  totalSpend: number;
  lastVisit: string;
  createdAt: string;
}

export interface Mechanic {
  id: string;
  name: string;
  phone: string;
  specialization: string;
  activeJobs: number;
  completedJobs: number;
  rating: number;
  joinedAt: string;
  status: 'available' | 'busy' | 'off_duty';
}

export const jobStatusLabels: Record<JobStatus, string> = {
  pending: 'Pending',
  in_progress: 'In Progress',
  waiting_parts: 'Waiting Parts',
  completed: 'Completed',
  delivered: 'Delivered',
};

export const jobStatusColors: Record<JobStatus, string> = {
  pending: 'bg-warning/10 text-warning border-warning/20',
  in_progress: 'bg-primary/10 text-primary border-primary/20',
  waiting_parts: 'bg-destructive/10 text-destructive border-destructive/20',
  completed: 'bg-success/10 text-success border-success/20',
  delivered: 'bg-muted text-muted-foreground border-muted',
};
