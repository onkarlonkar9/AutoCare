import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useDemo } from '@/contexts/DemoContext';
import { mockDemoData } from '@/data/mockDemoData';
import { toast } from 'sonner';
import { apiRequest } from '@/integrations/backend/client';

type Dict = Record<string, unknown>;

function authToken(token?: string) {
  if (!token) throw new Error('Authentication token missing');
  return token;
}

function vehicleFromBackend(v: Dict) {
  return {
    id: v.id,
    owner_id: v.ownerId,
    name: v.name,
    vehicle_number: v.vehicleNumber,
    type: v.type,
    manufacturer: v.manufacturer,
    model: v.model,
    year: v.year,
    fuel_type: v.fuelType,
    engine_number: v.engineNumber,
    chassis_number: v.chassisNumber,
    current_mileage: v.currentMileage,
    purchase_date: v.purchaseDate,
    image_url: v.imageUrl,
    health_score: v.healthScore,
    next_service_date: v.nextServiceDate,
    insurance_expiry: v.insuranceExpiry,
    puc_expiry: v.pucExpiry,
    created_at: v.createdAt,
    updated_at: v.updatedAt,
  };
}

function serviceRecordFromBackend(r: Dict) {
  return {
    id: r.id,
    vehicle_id: r.vehicleId,
    owner_id: r.ownerId,
    service_type: r.serviceType,
    date: r.date,
    mileage_at_service: r.mileageAtService,
    service_center_name: r.serviceCenterName,
    mechanic_name: r.mechanicName,
    parts_replaced: r.partsReplaced,
    cost: r.cost,
    notes: r.notes,
    bill_url: r.billUrl,
    created_at: r.createdAt,
    updated_at: r.updatedAt,
  };
}

function jobCardFromBackend(j: Dict) {
  return {
    id: j.id,
    center_id: j.centerId,
    customer_name: j.customerName,
    customer_phone: j.customerPhone,
    vehicle_number: j.vehicleNumber,
    vehicle_model: j.vehicleModel,
    mileage: j.mileage,
    problem_description: j.problemDescription,
    service_tasks: j.serviceTasks,
    parts_required: j.partsRequired,
    estimated_cost: j.estimatedCost,
    actual_cost: j.actualCost,
    mechanic_id: j.mechanicId,
    mechanic_name: j.mechanicName,
    status: j.status,
    notes: j.notes,
    created_at: j.createdAt,
    updated_at: j.updatedAt,
    completed_at: j.completedAt,
  };
}

function customerFromBackend(c: Dict) {
  return {
    id: c.id,
    center_id: c.centerId,
    name: c.name,
    phone: c.phone,
    email: c.email,
    vehicle_numbers: c.vehicleNumbers,
    total_visits: c.totalVisits,
    total_spend: c.totalSpend,
    last_visit: c.lastVisit,
    created_at: c.createdAt,
    updated_at: c.updatedAt,
  };
}

function mechanicFromBackend(m: Dict) {
  return {
    id: m.id,
    center_id: m.centerId,
    name: m.name,
    phone: m.phone,
    specialization: m.specialization,
    status: m.status,
    active_jobs: m.activeJobs,
    completed_jobs: m.completedJobs,
    rating: m.rating,
    joined_at: m.joinedAt,
    created_at: m.createdAt,
    updated_at: m.updatedAt,
  };
}

// ========== VEHICLES ==========
export function useVehicles() {
  const { user, session } = useAuth();
  const { isDemo } = useDemo();
  return useQuery({
    queryKey: ['vehicles', user?.id, isDemo],
    queryFn: async () => {
      if (isDemo) return mockDemoData.vehicles;
      const data = await apiRequest<Dict[]>('/owner/vehicles', undefined, authToken(session?.access_token));
      return data.map(vehicleFromBackend);
    },
    enabled: isDemo || !!user,
  });
}

export function useVehicle(id: string | undefined) {
  const { user, session } = useAuth();
  const { isDemo } = useDemo();
  return useQuery({
    queryKey: ['vehicle', id, isDemo],
    queryFn: async () => {
      if (isDemo) return mockDemoData.vehicles.find((v) => v.id === id) || null;
      const data = await apiRequest<Dict>(`/owner/vehicles/${id}`, undefined, authToken(session?.access_token));
      return vehicleFromBackend(data);
    },
    enabled: (!!user || isDemo) && !!id,
  });
}

export function useAddVehicle() {
  const qc = useQueryClient();
  const { user, session } = useAuth();
  const { isDemo, interact } = useDemo();
  return useMutation({
    mutationFn: async (vehicle: Dict) => {
      if (isDemo) {
        interact();
        return;
      }
      if (!user) throw new Error('You must be logged in to add a vehicle');
      await apiRequest('/owner/vehicles', {
        method: 'POST',
        body: JSON.stringify({
          name: vehicle.name,
          vehicleNumber: vehicle.vehicle_number,
          type: vehicle.type,
          manufacturer: vehicle.manufacturer,
          model: vehicle.model,
        }),
      }, authToken(session?.access_token));
    },
    onSuccess: () => {
      if (!isDemo) {
        qc.invalidateQueries({ queryKey: ['vehicles'] });
        toast.success('Vehicle added!');
      }
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateVehicle() {
  const qc = useQueryClient();
  const { session } = useAuth();
  const { isDemo, interact } = useDemo();
  return useMutation({
    mutationFn: async ({ id, ...vehicle }: { id: string; [key: string]: unknown }) => {
      if (isDemo) {
        interact();
        return;
      }
      await apiRequest(`/owner/vehicles/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          name: vehicle.name,
          vehicleNumber: vehicle.vehicle_number,
          type: vehicle.type,
          manufacturer: vehicle.manufacturer,
          model: vehicle.model,
          year: vehicle.year,
          fuelType: vehicle.fuel_type,
          currentMileage: vehicle.current_mileage,
          nextServiceDate: vehicle.next_service_date,
          insuranceExpiry: vehicle.insurance_expiry,
          pucExpiry: vehicle.puc_expiry,
        }),
      }, authToken(session?.access_token));
    },
    onSuccess: (_, variables) => {
      if (!isDemo) {
        qc.invalidateQueries({ queryKey: ['vehicles'] });
        qc.invalidateQueries({ queryKey: ['vehicle', variables.id] });
        toast.success('Vehicle updated!');
      }
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteVehicle() {
  const qc = useQueryClient();
  const { session } = useAuth();
  const { isDemo, interact } = useDemo();
  return useMutation({
    mutationFn: async (id: string) => {
      if (isDemo) {
        interact();
        return;
      }
      await apiRequest(`/owner/vehicles/${id}`, { method: 'DELETE' }, authToken(session?.access_token));
    },
    onSuccess: () => {
      if (!isDemo) {
        qc.invalidateQueries({ queryKey: ['vehicles'] });
        toast.success('Vehicle removed.');
      }
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ========== SERVICE RECORDS ==========
export function useServiceRecords(vehicleId?: string) {
  const { user, session } = useAuth();
  const { isDemo } = useDemo();
  return useQuery({
    queryKey: ['service_records', user?.id, vehicleId, isDemo],
    queryFn: async () => {
      if (isDemo) {
        return vehicleId
          ? mockDemoData.service_records.filter((r) => r.vehicle_id === vehicleId)
          : mockDemoData.service_records;
      }
      const query = vehicleId ? `?vehicleId=${encodeURIComponent(vehicleId)}` : '';
      const data = await apiRequest<Dict[]>(`/owner/service-records${query}`, undefined, authToken(session?.access_token));
      return data.map(serviceRecordFromBackend);
    },
    enabled: isDemo || !!user,
  });
}

export function useAddServiceRecord() {
  const qc = useQueryClient();
  const { user, session } = useAuth();
  const { isDemo, interact } = useDemo();
  return useMutation({
    mutationFn: async (record: Dict) => {
      if (isDemo) {
        interact();
        return;
      }
      if (!user) throw new Error('You must be logged in to add service record');
      await apiRequest('/owner/service-records', {
        method: 'POST',
        body: JSON.stringify({
          vehicleId: record.vehicle_id,
          serviceType: record.service_type,
          date: record.date,
          mileageAtService: record.mileage_at_service,
          serviceCenterName: record.service_center_name,
          mechanicName: record.mechanic_name,
          partsReplaced: record.parts_replaced,
          cost: record.cost,
          notes: record.notes,
          billUrl: record.bill_url,
        }),
      }, authToken(session?.access_token));
    },
    onSuccess: () => {
      if (!isDemo) {
        qc.invalidateQueries({ queryKey: ['service_records'] });
        toast.success('Service record added!');
      }
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateServiceRecord() {
  const qc = useQueryClient();
  const { session } = useAuth();
  const { isDemo, interact } = useDemo();
  return useMutation({
    mutationFn: async ({ id, ...record }: { id: string; [key: string]: unknown }) => {
      if (isDemo) {
        interact();
        return;
      }
      await apiRequest(`/owner/service-records/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          serviceType: record.service_type,
          date: record.date,
          mileageAtService: record.mileage_at_service,
          serviceCenterName: record.service_center_name,
          mechanicName: record.mechanic_name,
          partsReplaced: record.parts_replaced,
          cost: record.cost,
          notes: record.notes,
          billUrl: record.bill_url,
        }),
      }, authToken(session?.access_token));
    },
    onSuccess: () => {
      if (!isDemo) {
        qc.invalidateQueries({ queryKey: ['service_records'] });
        toast.success('Service record updated!');
      }
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteServiceRecord() {
  const qc = useQueryClient();
  const { session } = useAuth();
  const { isDemo, interact } = useDemo();
  return useMutation({
    mutationFn: async (id: string) => {
      if (isDemo) {
        interact();
        return;
      }
      await apiRequest(`/owner/service-records/${id}`, { method: 'DELETE' }, authToken(session?.access_token));
    },
    onSuccess: () => {
      if (!isDemo) {
        qc.invalidateQueries({ queryKey: ['service_records'] });
        toast.success('Service record removed.');
      }
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ========== JOB CARDS ==========
export function useJobCards() {
  const { user, session } = useAuth();
  const { isDemo } = useDemo();
  return useQuery({
    queryKey: ['job_cards', user?.id, isDemo],
    queryFn: async () => {
      if (isDemo) return mockDemoData.job_cards;
      const data = await apiRequest<Dict[]>('/service-center/job-cards', undefined, authToken(session?.access_token));
      return data.map(jobCardFromBackend);
    },
    enabled: isDemo || !!user,
  });
}

export function useJobCard(id: string | undefined) {
  const { user, session } = useAuth();
  const { isDemo } = useDemo();
  return useQuery({
    queryKey: ['job_card', id, isDemo],
    queryFn: async () => {
      if (isDemo) return mockDemoData.job_cards.find((j) => j.id === id) || null;
      const data = await apiRequest<Dict>(`/service-center/job-cards/${id}`, undefined, authToken(session?.access_token));
      return jobCardFromBackend(data);
    },
    enabled: (!!user || isDemo) && !!id,
  });
}

export function useAddJobCard() {
  const qc = useQueryClient();
  const { user, session } = useAuth();
  const { isDemo, interact } = useDemo();
  return useMutation({
    mutationFn: async (job: Dict) => {
      if (isDemo) {
        interact();
        return { id: 'demo-new-job', ...job };
      }
      if (!user) throw new Error('You must be logged in to create a job card');
      const data = await apiRequest<Dict>('/service-center/job-cards', {
        method: 'POST',
        body: JSON.stringify({
          customerName: job.customer_name,
          customerPhone: job.customer_phone,
          vehicleNumber: job.vehicle_number,
          vehicleModel: job.vehicle_model,
          problemDescription: job.problem_description,
          serviceTasks: job.service_tasks,
          partsRequired: job.parts_required,
          estimatedCost: job.estimated_cost,
        }),
      }, authToken(session?.access_token));
      return jobCardFromBackend(data);
    },
    onSuccess: () => {
      if (!isDemo) {
        qc.invalidateQueries({ queryKey: ['job_cards'] });
        toast.success('Job card created!');
      }
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateJobStatus() {
  const qc = useQueryClient();
  const { isDemo, interact } = useDemo();
  const { session } = useAuth();
  return useMutation({
    mutationFn: async ({ id, status, actual_cost }: { id: string; status: string; actual_cost?: number }) => {
      if (isDemo) {
        interact();
        return;
      }
      await apiRequest(`/service-center/job-cards/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status,
          actualCost: actual_cost,
        }),
      }, authToken(session?.access_token));
    },
    onSuccess: () => {
      if (!isDemo) {
        qc.invalidateQueries({ queryKey: ['job_cards'] });
        qc.invalidateQueries({ queryKey: ['job_card'] });
      }
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateJobCard() {
  const qc = useQueryClient();
  const { isDemo, interact } = useDemo();
  const { session } = useAuth();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; [key: string]: unknown }) => {
      if (isDemo) {
        interact();
        return;
      }
      await apiRequest(`/service-center/job-cards/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: updates.status,
          notes: updates.notes,
          mechanicId: updates.mechanic_id,
          mechanicName: updates.mechanic_name,
          actualCost: updates.actual_cost,
        }),
      }, authToken(session?.access_token));
    },
    onSuccess: (_, variables) => {
      if (!isDemo) {
        qc.invalidateQueries({ queryKey: ['job_cards'] });
        qc.invalidateQueries({ queryKey: ['job_card', variables.id] });
        toast.success('Job card updated!');
      }
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteJobCard() {
  const qc = useQueryClient();
  const { isDemo, interact } = useDemo();
  const { session } = useAuth();
  return useMutation({
    mutationFn: async (id: string) => {
      if (isDemo) {
        interact();
        return;
      }
      await apiRequest(`/service-center/job-cards/${id}`, { method: 'DELETE' }, authToken(session?.access_token));
    },
    onSuccess: () => {
      if (!isDemo) {
        qc.invalidateQueries({ queryKey: ['job_cards'] });
        toast.success('Job card removed.');
      }
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ========== CUSTOMERS ==========
export function useCustomers() {
  const { user, session } = useAuth();
  const { isDemo } = useDemo();
  return useQuery({
    queryKey: ['customers', user?.id, isDemo],
    queryFn: async () => {
      if (isDemo) return mockDemoData.customers;
      const data = await apiRequest<Dict[]>('/service-center/customers', undefined, authToken(session?.access_token));
      return data.map(customerFromBackend);
    },
    enabled: isDemo || !!user,
  });
}

export function useAddCustomer() {
  const qc = useQueryClient();
  const { user, session } = useAuth();
  const { isDemo, interact } = useDemo();
  return useMutation({
    mutationFn: async (customer: Dict) => {
      if (isDemo) {
        interact();
        return;
      }
      if (!user) throw new Error('You must be logged in to add a customer');

      await apiRequest('/service-center/customers', {
        method: 'POST',
        body: JSON.stringify({
          name: customer.name,
          phone: customer.phone,
          email: customer.email || undefined,
          vehicleNumbers: customer.vehicle_numbers,
        }),
      }, authToken(session?.access_token));
    },
    onSuccess: () => {
      if (!isDemo) {
        qc.invalidateQueries({ queryKey: ['customers'] });
        toast.success('Customer profile created!');
      }
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateCustomer() {
  const qc = useQueryClient();
  const { user, session } = useAuth();
  const { isDemo, interact } = useDemo();
  return useMutation({
    mutationFn: async ({ id, ...customer }: { id: string; [key: string]: unknown }) => {
      if (isDemo) {
        interact();
        return;
      }
      if (!user) throw new Error('You must be logged in to update a customer');

      await apiRequest(`/service-center/customers/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          name: customer.name,
          phone: customer.phone,
          email: customer.email || null,
          vehicleNumbers: customer.vehicle_numbers,
          totalVisits: customer.total_visits,
          totalSpend: customer.total_spend,
          lastVisit: customer.last_visit,
        }),
      }, authToken(session?.access_token));
    },
    onSuccess: () => {
      if (!isDemo) {
        qc.invalidateQueries({ queryKey: ['customers'] });
        toast.success('Customer updated!');
      }
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteCustomer() {
  const qc = useQueryClient();
  const { user, session } = useAuth();
  const { isDemo, interact } = useDemo();
  return useMutation({
    mutationFn: async (id: string) => {
      if (isDemo) {
        interact();
        return;
      }
      if (!user) throw new Error('You must be logged in to remove a customer');
      await apiRequest(`/service-center/customers/${id}`, { method: 'DELETE' }, authToken(session?.access_token));
    },
    onSuccess: () => {
      if (!isDemo) {
        qc.invalidateQueries({ queryKey: ['customers'] });
        toast.success('Customer removed.');
      }
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ========== MECHANICS ==========
export function useMechanics() {
  const { user, session } = useAuth();
  const { isDemo } = useDemo();
  return useQuery({
    queryKey: ['mechanics', user?.id, isDemo],
    queryFn: async () => {
      if (isDemo) return mockDemoData.mechanics;
      const data = await apiRequest<Dict[]>('/service-center/mechanics', undefined, authToken(session?.access_token));
      return data.map(mechanicFromBackend);
    },
    enabled: isDemo || !!user,
  });
}

export function useAddMechanic() {
  const qc = useQueryClient();
  const { user, session } = useAuth();
  const { isDemo, interact } = useDemo();
  return useMutation({
    mutationFn: async (mechanic: Dict) => {
      if (isDemo) {
        interact();
        return;
      }
      if (!user) throw new Error('You must be logged in to add a mechanic');
      await apiRequest('/service-center/mechanics', {
        method: 'POST',
        body: JSON.stringify({
          name: mechanic.name,
          phone: mechanic.phone,
          specialization: mechanic.specialization,
        }),
      }, authToken(session?.access_token));
    },
    onSuccess: () => {
      if (!isDemo) {
        qc.invalidateQueries({ queryKey: ['mechanics'] });
        toast.success('Mechanic added!');
      }
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateMechanic() {
  const qc = useQueryClient();
  const { user, session } = useAuth();
  const { isDemo, interact } = useDemo();
  return useMutation({
    mutationFn: async ({ id, ...mechanic }: { id: string; [key: string]: unknown }) => {
      if (isDemo) {
        interact();
        return;
      }
      if (!user) throw new Error('You must be logged in to update a mechanic');
      await apiRequest(`/service-center/mechanics/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          name: mechanic.name,
          phone: mechanic.phone,
          specialization: mechanic.specialization,
          status: mechanic.status,
          activeJobs: mechanic.active_jobs,
          completedJobs: mechanic.completed_jobs,
          rating: mechanic.rating,
        }),
      }, authToken(session?.access_token));
    },
    onSuccess: () => {
      if (!isDemo) {
        qc.invalidateQueries({ queryKey: ['mechanics'] });
        toast.success('Mechanic updated!');
      }
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteMechanic() {
  const qc = useQueryClient();
  const { user, session } = useAuth();
  const { isDemo, interact } = useDemo();
  return useMutation({
    mutationFn: async (id: string) => {
      if (isDemo) {
        interact();
        return;
      }
      if (!user) throw new Error('You must be logged in to remove a mechanic');
      await apiRequest(`/service-center/mechanics/${id}`, { method: 'DELETE' }, authToken(session?.access_token));
    },
    onSuccess: () => {
      if (!isDemo) {
        qc.invalidateQueries({ queryKey: ['mechanics'] });
        toast.success('Mechanic removed.');
      }
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
