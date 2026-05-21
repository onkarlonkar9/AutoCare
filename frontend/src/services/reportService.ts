import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import type { CustomerRow, JobCardRow, MechanicRow } from '@/types/backendRows';

interface WorkshopSettings {
  workshopName?: string;
}

export interface ReportData {
  jobCards: JobCardRow[];
  customers: CustomerRow[];
  mechanics: MechanicRow[];
  workshopSettings: WorkshopSettings;
}

export const generateWorkshopReport = (data: ReportData) => {
  const { jobCards, customers, mechanics, workshopSettings } = data;
  const timestamp = format(new Date(), 'dd-MMM-yyyy_HHmm');
  const fileName = `${workshopSettings.workshopName || 'Workshop'}_Analytics_${timestamp}.xlsx`;

  // 1. Financial Summary Sheet
  const completedJobs = jobCards.filter(j => j.status === 'completed' || j.status === 'delivered');
  const totalRevenue = completedJobs.reduce((sum, j) => sum + (j.actual_cost || j.estimated_cost || 0), 0);
  const avgTicket = completedJobs.length > 0 ? totalRevenue / completedJobs.length : 0;

  const financialSummary = [
    { Metric: 'Workshop Name', Value: workshopSettings.workshopName },
    { Metric: 'Report Date', Value: format(new Date(), 'PPP') },
    { Metric: 'Total Job Cards', Value: jobCards.length },
    { Metric: 'Completed Jobs', Value: completedJobs.length },
    { Metric: 'Total Revenue (₹)', Value: totalRevenue },
    { Metric: 'Average Ticket Size (₹)', Value: Math.round(avgTicket) },
    { Metric: 'Active Customers', Value: customers.length },
    { Metric: 'Team Size', Value: mechanics.length },
  ];

  // 2. Job Cards Detailed Sheet
  const jobCardExport = jobCards.map(j => ({
    'Job ID': j.id.slice(0, 8),
    'Date': format(new Date(j.created_at), 'dd-MM-yyyy'),
    'Customer Name': j.customer_name,
    'Vehicle Number': j.vehicle_number,
    'Model': j.vehicle_model,
    'Status': j.status.toUpperCase().replace('_', ' '),
    'Estimated Cost (₹)': j.estimated_cost,
    'Actual Cost (₹)': j.actual_cost || 0,
    'Mechanic': j.mechanic_name || 'Unassigned',
    'Description': j.problem_description,
    'Service Tasks': Array.isArray(j.service_tasks) ? j.service_tasks.join(', ') : '',
  }));

  // 3. Customer Directory Sheet
  const customerExport = customers.map(c => ({
    'Name': c.name,
    'Phone': c.phone,
    'Email': c.email || 'N/A',
    'Vehicles': Array.isArray(c.vehicle_numbers) ? c.vehicle_numbers.join(', ') : '',
    'Total Visits': c.total_visits || 0,
    'Total Spend (₹)': c.total_spend || 0,
    'Last Visit': c.last_visit ? format(new Date(c.last_visit), 'dd-MM-yyyy') : 'N/A',
  }));

  // 4. Team Performance Sheet
  const teamExport = mechanics.map(m => {
    const mechanicJobs = jobCards.filter(j => j.mechanic_id === m.id);
    const completedByMe = mechanicJobs.filter(j => j.status === 'completed' || j.status === 'delivered');
    const revenueGen = completedByMe.reduce((sum, j) => sum + (j.actual_cost || j.estimated_cost || 0), 0);

    return {
      'Mechanic Name': m.name,
      'Specialization': m.specialization || 'General',
      'Assigned Jobs': mechanicJobs.length,
      'Completed Jobs': completedByMe.length,
      'Revenue Generated (₹)': revenueGen,
      'Current Status': m.status.toUpperCase().replace('_', ' '),
    };
  });

  // Create Workbook
  const wb = XLSX.utils.book_new();

  // Add sheets
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(financialSummary), 'Financial Summary');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(jobCardExport), 'Job Cards');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(customerExport), 'Customers');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(teamExport), 'Team Performance');

  // Trigger Download
  XLSX.writeFile(wb, fileName);
};
