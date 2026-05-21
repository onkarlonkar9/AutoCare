export type VehicleType = 'bike' | 'car' | 'truck' | 'bus' | 'scooter' | 'machinery';
export type FuelType = 'petrol' | 'diesel' | 'electric' | 'hybrid' | 'cng' | 'lpg';

export interface Vehicle {
  id: string;
  ownerId: string;
  name: string;
  vehicleNumber: string;
  type: VehicleType;
  manufacturer: string;
  model: string;
  year: number;
  fuelType: FuelType;
  engineNumber: string;
  chassisNumber: string;
  currentMileage: number;
  purchaseDate: string;
  imageUrl?: string;
  healthScore: number;
  nextServiceDate?: string;
  insuranceExpiry?: string;
  pucExpiry?: string;
}
