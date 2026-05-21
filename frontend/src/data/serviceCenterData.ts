import { JobCard, Customer, Mechanic } from '@/types/serviceCenter';

export const mockMechanics: Mechanic[] = [
  { id: 'm1', name: 'Rajesh Kumar', phone: '+91 98765 11111', specialization: 'Engine & Transmission', activeJobs: 2, completedJobs: 342, rating: 4.8, joinedAt: '2020-03-15', status: 'busy' },
  { id: 'm2', name: 'Amit Patil', phone: '+91 98765 22222', specialization: 'Electrical & AC', activeJobs: 1, completedJobs: 218, rating: 4.6, joinedAt: '2021-06-10', status: 'busy' },
  { id: 'm3', name: 'Vikram Singh', phone: '+91 98765 33333', specialization: 'Brakes & Suspension', activeJobs: 0, completedJobs: 185, rating: 4.7, joinedAt: '2021-11-20', status: 'available' },
  { id: 'm4', name: 'Sunil Yadav', phone: '+91 98765 44444', specialization: 'Body & Paint', activeJobs: 1, completedJobs: 156, rating: 4.5, joinedAt: '2022-02-01', status: 'busy' },
  { id: 'm5', name: 'Pradeep Verma', phone: '+91 98765 55555', specialization: 'General Service', activeJobs: 0, completedJobs: 98, rating: 4.4, joinedAt: '2023-01-10', status: 'off_duty' },
];

export const mockCustomers: Customer[] = [
  { id: 'c1', name: 'Ankit Patel', phone: '+91 99887 11111', email: 'ankit@example.com', vehicleNumbers: ['MH 01 AB 1234', 'MH 01 CD 5678'], totalVisits: 12, totalSpend: 45000, lastVisit: '2025-01-15', createdAt: '2023-02-10' },
  { id: 'c2', name: 'Priya Mehta', phone: '+91 99887 22222', email: 'priya@example.com', vehicleNumbers: ['MH 02 EF 9012'], totalVisits: 8, totalSpend: 32000, lastVisit: '2025-01-10', createdAt: '2023-05-20' },
  { id: 'c3', name: 'Rahul Sharma', phone: '+91 99887 33333', vehicleNumbers: ['MH 03 GH 3456', 'MH 03 IJ 7890'], totalVisits: 15, totalSpend: 68000, lastVisit: '2025-01-18', createdAt: '2022-11-05' },
  { id: 'c4', name: 'Deepak Joshi', phone: '+91 99887 44444', email: 'deepak@example.com', vehicleNumbers: ['MH 04 KL 1122'], totalVisits: 5, totalSpend: 18500, lastVisit: '2024-12-28', createdAt: '2024-03-15' },
  { id: 'c5', name: 'Sunita Reddy', phone: '+91 99887 55555', vehicleNumbers: ['MH 05 MN 3344'], totalVisits: 3, totalSpend: 9800, lastVisit: '2024-12-15', createdAt: '2024-06-01' },
];

export const mockJobCards: JobCard[] = [
  {
    id: 'j1', serviceCenterId: 'sc1', customerName: 'Ankit Patel', customerPhone: '+91 99887 11111',
    vehicleNumber: 'MH 01 AB 1234', vehicleModel: 'Maruti Swift VXI 2021', mileage: 35420,
    problemDescription: 'Engine misfiring at idle, rough acceleration',
    serviceTasks: ['Spark plug replacement', 'Fuel injector cleaning', 'ECU diagnostics'],
    partsRequired: ['Spark Plugs x4', 'Fuel injector cleaner'],
    estimatedCost: 8500, mechanicId: 'm1', mechanicName: 'Rajesh Kumar',
    status: 'in_progress', createdAt: '2025-01-20T09:00:00', updatedAt: '2025-01-20T11:30:00',
    notes: 'Customer reported issue started 2 weeks ago. Initial scan shows P0301 code.',
  },
  {
    id: 'j2', serviceCenterId: 'sc1', customerName: 'Priya Mehta', customerPhone: '+91 99887 22222',
    vehicleNumber: 'MH 02 EF 9012', vehicleModel: 'Honda City ZX 2022', mileage: 22000,
    problemDescription: 'AC not cooling, unusual noise from compressor',
    serviceTasks: ['AC gas refill', 'Compressor inspection', 'Cabin filter replacement'],
    partsRequired: ['R134a refrigerant', 'Cabin air filter'],
    estimatedCost: 5500, mechanicId: 'm2', mechanicName: 'Amit Patil',
    status: 'waiting_parts', createdAt: '2025-01-19T14:00:00', updatedAt: '2025-01-20T10:00:00',
    notes: 'Compressor bearing needs replacement. Part ordered from Honda dealer.',
  },
  {
    id: 'j3', serviceCenterId: 'sc1', customerName: 'Rahul Sharma', customerPhone: '+91 99887 33333',
    vehicleNumber: 'MH 03 GH 3456', vehicleModel: 'Hyundai Creta SX 2023', mileage: 15000,
    problemDescription: '15,000 km scheduled service',
    serviceTasks: ['Oil change', 'Oil filter', 'Air filter', 'Brake inspection', 'Tire rotation'],
    partsRequired: ['Engine oil 4L', 'Oil filter', 'Air filter'],
    estimatedCost: 6200, mechanicId: 'm1', mechanicName: 'Rajesh Kumar',
    status: 'pending', createdAt: '2025-01-20T08:30:00', updatedAt: '2025-01-20T08:30:00',
  },
  {
    id: 'j4', serviceCenterId: 'sc1', customerName: 'Deepak Joshi', customerPhone: '+91 99887 44444',
    vehicleNumber: 'MH 04 KL 1122', vehicleModel: 'Tata Nexon EV 2023', mileage: 28000,
    problemDescription: 'Front suspension noise over bumps',
    serviceTasks: ['Suspension inspection', 'Strut mount replacement', 'Wheel alignment'],
    partsRequired: ['Front strut mounts x2', 'Alignment shims'],
    estimatedCost: 12000, actualCost: 11200, mechanicId: 'm3', mechanicName: 'Vikram Singh',
    status: 'completed', createdAt: '2025-01-18T10:00:00', updatedAt: '2025-01-19T16:00:00', completedAt: '2025-01-19T16:00:00',
    notes: 'Both front strut mounts worn. Replaced and aligned. Test drive confirmed fix.',
  },
  {
    id: 'j5', serviceCenterId: 'sc1', customerName: 'Sunita Reddy', customerPhone: '+91 99887 55555',
    vehicleNumber: 'MH 05 MN 3344', vehicleModel: 'Maruti Alto K10 2022', mileage: 42000,
    problemDescription: 'Dent repair on rear left door + touch-up paint',
    serviceTasks: ['Dent removal', 'Surface preparation', 'Paint match & spray', 'Clear coat'],
    partsRequired: ['Primer', 'Base coat paint', 'Clear coat'],
    estimatedCost: 7500, actualCost: 7500, mechanicId: 'm4', mechanicName: 'Sunil Yadav',
    status: 'delivered', createdAt: '2025-01-15T11:00:00', updatedAt: '2025-01-17T15:00:00', completedAt: '2025-01-17T12:00:00',
  },
  {
    id: 'j6', serviceCenterId: 'sc1', customerName: 'Ankit Patel', customerPhone: '+91 99887 11111',
    vehicleNumber: 'MH 01 CD 5678', vehicleModel: 'RE Classic 350 2022', mileage: 12800,
    problemDescription: 'Chain and sprocket replacement, oil change',
    serviceTasks: ['Chain sprocket set replacement', 'Chain tensioner adjustment', 'Oil change', 'General inspection'],
    partsRequired: ['Chain sprocket set', 'Engine oil 2.5L', 'Oil filter'],
    estimatedCost: 4200, mechanicId: 'm4', mechanicName: 'Sunil Yadav',
    status: 'in_progress', createdAt: '2025-01-20T10:00:00', updatedAt: '2025-01-20T12:00:00',
  },
];

export const scDailyRevenue = [
  { day: 'Mon', revenue: 12500 },
  { day: 'Tue', revenue: 18200 },
  { day: 'Wed', revenue: 8900 },
  { day: 'Thu', revenue: 22000 },
  { day: 'Fri', revenue: 15600 },
  { day: 'Sat', revenue: 28400 },
  { day: 'Sun', revenue: 5000 },
];

export const scMonthlyServices = [
  { month: 'Aug', count: 42 },
  { month: 'Sep', count: 38 },
  { month: 'Oct', count: 51 },
  { month: 'Nov', count: 45 },
  { month: 'Dec', count: 56 },
  { month: 'Jan', count: 48 },
];

export const scRepairTypes = [
  { type: 'General Service', count: 35 },
  { type: 'Engine Repair', count: 18 },
  { type: 'AC/Electrical', count: 22 },
  { type: 'Body & Paint', count: 15 },
  { type: 'Brakes', count: 28 },
  { type: 'Suspension', count: 12 },
];
