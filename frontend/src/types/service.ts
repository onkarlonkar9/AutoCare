export type ServiceType =
  | 'oil_change'
  | 'brake_pad'
  | 'wheel_alignment'
  | 'wheel_balancing'
  | 'tire_replacement'
  | 'battery_replacement'
  | 'general_service'
  | 'engine_repair'
  | 'custom';

export interface ServiceRecord {
  id: string;
  vehicleId: string;
  serviceType: ServiceType;
  date: string;
  mileageAtService: number;
  serviceCenterName: string;
  mechanicName: string;
  partsReplaced: string[];
  cost: number;
  notes: string;
  billUrl?: string;
  photos?: string[];
}

export const serviceTypeLabels: Record<ServiceType, string> = {
  oil_change: 'Oil Change',
  brake_pad: 'Brake Pad Change',
  wheel_alignment: 'Wheel Alignment',
  wheel_balancing: 'Wheel Balancing',
  tire_replacement: 'Tire Replacement',
  battery_replacement: 'Battery Replacement',
  general_service: 'General Service',
  engine_repair: 'Engine Repair',
  custom: 'Custom Service',
};
