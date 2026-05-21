export type VehicleRow = {
  id: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
  name: string;
  vehicle_number: string;
  type: string;
  fuel_type: string;
  manufacturer: string;
  model: string;
  year: number;
  current_mileage: number;
  health_score: number;
  next_service_date: string | null;
  purchase_date: string | null;
  insurance_expiry: string | null;
  puc_expiry: string | null;
  engine_number: string;
  chassis_number: string;
  image_url: string | null;
};

export type ServiceRecordRow = {
  id: string;
  vehicle_id: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
  date: string;
  service_type: string;
  mileage_at_service: number;
  service_center_name: string;
  mechanic_name: string | null;
  cost: number;
  notes: string | null;
  parts_replaced: string[];
  bill_url: string | null;
};

export type JobCardStatus = 'pending' | 'in_progress' | 'waiting_parts' | 'completed' | 'delivered';

export type JobCardRow = {
  id: string;
  center_id: string;
  created_at: string;
  updated_at: string;
  status: JobCardStatus;
  customer_name: string;
  customer_phone: string;
  vehicle_number: string;
  vehicle_model: string;
  mileage: number;
  problem_description: string;
  service_tasks: string[];
  parts_required: string[];
  estimated_cost: number;
  actual_cost: number | null;
  mechanic_id: string | null;
  mechanic_name: string | null;
  notes: string | null;
  completed_at: string | null;
};

export type CustomerRow = {
  id: string;
  center_id: string;
  created_at: string;
  updated_at: string;
  name: string;
  phone: string;
  email: string | null;
  vehicle_numbers: string[];
  total_visits: number;
  total_spend: number;
  last_visit: string | null;
};

export type MechanicStatus = 'available' | 'busy' | 'off_duty';

export type MechanicRow = {
  id: string;
  center_id: string;
  created_at: string;
  updated_at: string;
  name: string;
  phone: string;
  specialization: string;
  status: MechanicStatus;
  active_jobs: number;
  completed_jobs: number;
  rating: number;
  joined_at: string;
};
