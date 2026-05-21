import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAddVehicle } from '@/hooks/useData';

const vehicleTypes = [
  { value: 'car', label: 'Car' }, { value: 'bike', label: 'Bike' },
  { value: 'scooter', label: 'Scooter' }, { value: 'truck', label: 'Truck' },
  { value: 'bus', label: 'Bus' }, { value: 'machinery', label: 'Machinery' },
];
const fuelTypes = [
  { value: 'petrol', label: 'Petrol' }, { value: 'diesel', label: 'Diesel' },
  { value: 'electric', label: 'Electric' }, { value: 'hybrid', label: 'Hybrid' },
  { value: 'cng', label: 'CNG' }, { value: 'lpg', label: 'LPG' },
];

const AddVehicle = () => {
  const navigate = useNavigate();
  const addVehicle = useAddVehicle();
  const [vehicleType, setVehicleType] = useState('');
  const [fuelType, setFuelType] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await addVehicle.mutateAsync({
      name: fd.get('name') as string,
      vehicle_number: fd.get('number') as string,
      type: vehicleType,
      fuel_type: fuelType,
      manufacturer: fd.get('manufacturer') as string,
      model: fd.get('model') as string,
      year: Number(fd.get('year')),
      current_mileage: Number(fd.get('mileage')),
      engine_number: fd.get('engine') as string || undefined,
      chassis_number: fd.get('chassis') as string || undefined,
      purchase_date: fd.get('purchase') as string || undefined,
    });
    navigate('/dashboard/vehicles');
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <Link to="/dashboard/vehicles" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Vehicles
      </Link>
      <div>
        <h1 className="text-2xl font-bold">Add New Vehicle</h1>
        <p className="text-muted-foreground text-sm">Enter your vehicle details</p>
      </div>
      <form onSubmit={handleSubmit} className="glass-card rounded-xl p-6 space-y-6">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2"><Label htmlFor="name">Vehicle Name</Label><Input id="name" name="name" placeholder="e.g. My Swift" required /></div>
          <div className="space-y-2"><Label htmlFor="number">Vehicle Number</Label><Input id="number" name="number" placeholder="e.g. MH 01 AB 1234" required /></div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Vehicle Type</Label>
            <Select value={vehicleType} onValueChange={setVehicleType} required>
              <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
              <SelectContent>{vehicleTypes.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Fuel Type</Label>
            <Select value={fuelType} onValueChange={setFuelType} required>
              <SelectTrigger><SelectValue placeholder="Select fuel" /></SelectTrigger>
              <SelectContent>{fuelTypes.map(f => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2"><Label htmlFor="manufacturer">Manufacturer</Label><Input id="manufacturer" name="manufacturer" placeholder="e.g. Maruti Suzuki" required /></div>
          <div className="space-y-2"><Label htmlFor="model">Model</Label><Input id="model" name="model" placeholder="e.g. Swift VXI" required /></div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2"><Label htmlFor="year">Year</Label><Input id="year" name="year" type="number" placeholder="e.g. 2021" min="1990" max="2026" required /></div>
          <div className="space-y-2"><Label htmlFor="mileage">Current Mileage (km)</Label><Input id="mileage" name="mileage" type="number" placeholder="e.g. 35000" required /></div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2"><Label htmlFor="engine">Engine Number</Label><Input id="engine" name="engine" placeholder="Engine number" /></div>
          <div className="space-y-2"><Label htmlFor="chassis">Chassis Number</Label><Input id="chassis" name="chassis" placeholder="Chassis number" /></div>
        </div>
        <div className="space-y-2"><Label htmlFor="purchase">Purchase Date</Label><Input id="purchase" name="purchase" type="date" /></div>
        <div className="flex gap-3 pt-2">
          <Button type="submit" className="gradient-primary text-primary-foreground" disabled={addVehicle.isPending}>
            {addVehicle.isPending ? 'Adding...' : 'Add Vehicle'}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate('/dashboard/vehicles')}>Cancel</Button>
        </div>
      </form>
    </div>
  );
};

export default AddVehicle;
