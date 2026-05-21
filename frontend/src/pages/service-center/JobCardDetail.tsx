import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, Car, Gauge, User, Wrench, IndianRupee, FileText, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useJobCard, useUpdateJobStatus, useCustomers, useAddCustomer } from '@/hooks/useData';
import { toast } from 'sonner';
import { parseJobNotes, priorityClasses, isInSpec, AlignmentSpecKey } from '@/lib/jobCardStandards';
import { Battery, Zap, Droplets, Calendar, PenTool } from 'lucide-react';
import { WorkshopPageHeader } from '@/components/service-center/WorkshopPageHeader';
import { assignVehicleToBay, getBayDisplayName, getFreeBays, getServiceBays, releaseVehicleFromBay } from '@/lib/serviceBays';

const jobStatusLabels: Record<string, string> = {
  pending: 'Pending', in_progress: 'In Progress', waiting_parts: 'Waiting Parts',
  completed: 'Completed', delivered: 'Delivered and Payment Done',
};
const jobStatusColors: Record<string, string> = {
  pending: 'bg-warning/10 text-warning border-warning/20',
  in_progress: 'bg-primary/10 text-primary border-primary/20',
  waiting_parts: 'bg-destructive/10 text-destructive border-destructive/20',
  completed: 'bg-success/10 text-success border-success/20',
  delivered: 'bg-muted text-muted-foreground border-muted',
};

const AlignmentMiniGauge = ({ label, value, specKey }: { label: string, value: string | number | undefined, specKey: AlignmentSpecKey }) => {
  const inSpec = isInSpec(value, specKey);
  return (
    <div className="flex justify-between items-center py-1 border-b border-border/10 last:border-0">
      <span className="text-[10px] text-muted-foreground uppercase font-bold">{label}</span>
      <span className={`text-xs font-mono font-bold ${inSpec === true ? 'text-success' : inSpec === false ? 'text-destructive' : 'text-muted-foreground'}`}>
        {value ?? '--'}
      </span>
    </div>
  );
};

const JobCardDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: job, isLoading } = useJobCard(id);
  const { data: customers } = useCustomers();
  const updateStatus = useUpdateJobStatus();
  const addCustomer = useAddCustomer();
  const [bayPromptOpen, setBayPromptOpen] = useState(false);
  const [selectedBayIndex, setSelectedBayIndex] = useState<string>('');
  const [freeBays, setFreeBays] = useState(() => getFreeBays());
  const selectedBayEntry = freeBays.find(({ index }) => String(index) === selectedBayIndex);
  const selectedBayLabel =
    selectedBayIndex === ''
      ? ''
      : selectedBayEntry
        ? getBayDisplayName(selectedBayEntry.bay, selectedBayEntry.index)
        : `Bay ${Number(selectedBayIndex) + 1}`;

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-64 rounded-xl" /></div>;

  if (!job) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Job card not found</p>
        <Link to="/service-center/jobs"><Button variant="outline" className="mt-4">Back to Job Cards</Button></Link>
      </div>
    );
  }

  const syncCustomer = (jobToSync: NonNullable<typeof job>) => {
    if (!customers) return;
    const existing = customers.find(c => c.phone === jobToSync.customer_phone);
    if (!existing) {
      addCustomer.mutate({
        name: jobToSync.customer_name,
        phone: jobToSync.customer_phone,
        vehicle_numbers: [jobToSync.vehicle_number],
        total_visits: 1,
        total_spend: Number(jobToSync.actual_cost || jobToSync.estimated_cost || 0),
        last_visit: new Date().toISOString(),
      });
    }
  };

  const applyStatusUpdate = (newStatus: string) => {
    updateStatus.mutate({ 
      id: job.id, 
      status: newStatus,
      actual_cost: job.actual_cost || job.estimated_cost // Ensure cost is logged for revenue
    });

    if (newStatus === 'completed') {
      releaseVehicleFromBay(job.vehicle_number);
      toast.success(`Status updated to "${jobStatusLabels[newStatus]}". Bay is now free.`);
      return;
    }

    if (newStatus === 'delivered') {
      syncCustomer(job);
      toast.success(`Job delivered! Customer logged in history.`);
      return;
    }

    toast.success(`Status updated to "${jobStatusLabels[newStatus]}"`);
  };

  const handleStatusChange = (newStatus: string) => {
    if (newStatus === job.status) return;

    if (job.status === 'completed' && newStatus === 'in_progress') {
      setFreeBays(getFreeBays());
      setSelectedBayIndex('');
      setBayPromptOpen(true);
      return;
    }

    applyStatusUpdate(newStatus);
  };

  const handleInProgressWithBay = () => {
    if (selectedBayIndex !== '') {
      assignVehicleToBay(Number(selectedBayIndex), job.vehicle_number);
    }
    applyStatusUpdate('in_progress');
    setBayPromptOpen(false);
  };

  const handleSkipBayAssign = () => {
    applyStatusUpdate('in_progress');
    setBayPromptOpen(false);
  };

  const parsedNotes = parseJobNotes(job.notes);
  const meta = parsedNotes.meta;
  const currentCost = Number(job.actual_cost || job.estimated_cost || 0);
  const activeBayIndex = getServiceBays().findIndex(
    (bay) => bay.vehicleNumber?.trim().toUpperCase() === job.vehicle_number.trim().toUpperCase()
  );
  const activeBay = activeBayIndex >= 0 ? getServiceBays()[activeBayIndex] : undefined;
  const workflowSteps = ['pending', 'in_progress', 'waiting_parts', 'completed', 'delivered'];
  const activeStepIndex = workflowSteps.indexOf(job.status);

  return (
    <div className="mx-auto max-w-[1280px] space-y-6">
      <WorkshopPageHeader
        eyebrow="Workshop"
        title={`Job #${job.id.slice(0, 8).toUpperCase()}`}
        description="Review customer details, update progress, and keep the job moving through the workshop."
        breadcrumbs={[
          <Link key="workshop" to="/service-center" className="hover:text-foreground transition-colors">
            Workshop
          </Link>,
          <Link key="jobs" to="/service-center/jobs" className="hover:text-foreground transition-colors">
            Job Cards
          </Link>,
          `Job #${job.id.slice(0, 8).toUpperCase()}`,
        ]}
        meta={
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={`border px-3 py-1 text-[11px] font-semibold ${jobStatusColors[job.status] || ''}`}>
              {jobStatusLabels[job.status] || job.status}
            </Badge>
            {meta && (
              <Badge className={`border px-3 py-1 text-[11px] font-semibold ${priorityClasses(meta.priority)}`}>
                Priority {meta.priority.toUpperCase()}
              </Badge>
            )}
            <Badge variant="secondary" className="rounded-full px-3 py-1 text-[11px] font-medium">
              Created {new Date(job.created_at).toLocaleDateString()}
            </Badge>
          </div>
        }
        actions={
          <>
            <Link to="/service-center/jobs">
              <Button variant="outline" className="h-10 rounded-xl border-border/50">
                <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to Job Cards
              </Button>
            </Link>
            <Button variant="outline" className="h-10 rounded-xl border-border/50" onClick={() => navigate(`/service-center/jobs/${job.id}/invoice`)}>
              <Printer className="mr-1.5 h-4 w-4" /> Print Invoice
            </Button>
          </>
        }
      />

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <div className="glass-card rounded-2xl border border-border/50 p-6">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Overview</p>
                <h2 className="mt-2 text-xl font-semibold">Customer and vehicle details</h2>
                <p className="mt-1 text-sm text-muted-foreground">Created {new Date(job.created_at).toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">Status:</span>
                <Select value={job.status} onValueChange={handleStatusChange}>
                  <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(jobStatusLabels).map(([val, label]) => <SelectItem key={val} value={val}>{label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Customer</h3>
                <p className="flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground" /> <span className="font-medium">{job.customer_name}</span></p>
                <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" /> {job.customer_phone}</p>
              </div>
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Vehicle</h3>
                <p className="flex items-center gap-2"><Car className="h-4 w-4 text-muted-foreground" /> <span className="font-mono">{job.vehicle_number}</span></p>
                <p className="flex items-center gap-2"><FileText className="h-4 w-4 text-muted-foreground" /> {job.vehicle_model}</p>
                <p className="flex items-center gap-2"><Gauge className="h-4 w-4 text-muted-foreground" /> {job.mileage.toLocaleString()} km</p>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-xl p-6 space-y-4">
            <h3 className="font-semibold">Problem Description</h3>
            <p className="text-sm bg-muted/50 p-4 rounded-lg">{job.problem_description}</p>
            {job.service_tasks && job.service_tasks.length > 0 && (
              <>
                <h3 className="font-semibold mt-4">Service Tasks</h3>
                <div className="space-y-2">
                  {job.service_tasks.map((task, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        job.status === 'completed' || job.status === 'delivered' ? 'border-success bg-success/10' : 'border-muted-foreground/30'
                      }`}>
                        {(job.status === 'completed' || job.status === 'delivered') && <div className="w-2.5 h-2.5 rounded-full bg-success" />}
                      </div>
                      <span className="text-sm">{task}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
            {job.parts_required && job.parts_required.length > 0 && (
              <>
                <h3 className="font-semibold mt-4">Parts Required</h3>
                <div className="flex flex-wrap gap-2">{job.parts_required.map(p => <Badge key={p} variant="secondary">{p}</Badge>)}</div>
              </>
            )}
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div className="glass-card rounded-xl p-6">
              <h3 className="font-semibold mb-3 flex items-center gap-2"><IndianRupee className="h-4 w-4" /> Cost</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Estimated</span><span className="font-medium">Rs.{Number(job.estimated_cost).toLocaleString()}</span></div>
                {job.actual_cost && <div className="flex justify-between text-sm"><span className="text-muted-foreground">Actual</span><span className="font-semibold">Rs.{Number(job.actual_cost).toLocaleString()}</span></div>}
              </div>
            </div>
            <div className="glass-card rounded-xl p-6">
              <h3 className="font-semibold mb-3 flex items-center gap-2"><Wrench className="h-4 w-4" /> Assigned Mechanic</h3>
              <p className="font-medium">{job.mechanic_name || 'Unassigned'}</p>
            </div>
          </div>

          {meta && (
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="glass-card rounded-xl p-6 space-y-2">
                <h3 className="font-semibold mb-2">Industry Standard Fields</h3>
                <InfoRow label="Complaint Category" value={meta.complaintCategory.replace('_', ' ')} />
                <InfoRow label="Appointment Type" value={meta.appointmentType.replace('_', ' ')} />
                <InfoRow label="Service Advisor" value={meta.serviceAdvisorName || 'N/A'} />
                <InfoRow label="Advisor Phone" value={meta.serviceAdvisorPhone || 'N/A'} />
                <InfoRow label="Engine Number" value={meta.engineNumber || 'N/A'} />
                <InfoRow label="Chassis Number" value={meta.chassisNumber || 'N/A'} />
                <InfoRow label="Fuel Level In" value={meta.fuelLevelIn || 'N/A'} />
                <InfoRow label="ETA" value={formatEta(meta.estimatedDeliveryDate, meta.estimatedDeliveryTime)} />
              </div>

              <div className="glass-card rounded-xl p-6 space-y-3">
                <h3 className="font-semibold mb-2">Compliance Checklist</h3>
                <ChecklistRow label="RC copy received" checked={meta.inspectionChecklist.rcReceived} />
                <ChecklistRow label="Insurance copy received" checked={meta.inspectionChecklist.insuranceCopyReceived} />
                <ChecklistRow label="Spare wheel received" checked={meta.inspectionChecklist.spareWheelReceived} />
                <ChecklistRow label="Tool kit received" checked={meta.inspectionChecklist.toolKitReceived} />
                <ChecklistRow label="Jack and handle received" checked={meta.inspectionChecklist.jackHandleReceived} />
                <ChecklistRow label="Accessories intact" checked={meta.inspectionChecklist.accessoriesIntact} />
                <ChecklistRow label="Customer authorization" checked={meta.customerAuthorization} />
                <ChecklistRow label="Terms accepted" checked={meta.termsAccepted} />
              </div>
            </div>
          )}

          {meta?.customerConcerns?.length > 0 && (
            <div className="glass-card rounded-xl p-6">
              <h3 className="font-semibold mb-2">Customer Concerns</h3>
              <div className="flex flex-wrap gap-2">
                {meta.customerConcerns.map((concern, idx) => (
                  <Badge key={`${concern}-${idx}`} variant="secondary">{concern}</Badge>
                ))}
              </div>
            </div>
          )}

          {meta?.internalObservations && (
            <div className="glass-card rounded-xl p-6">
              <h3 className="font-semibold mb-2">Internal Observations</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{meta.internalObservations}</p>
            </div>
          )}

          {meta?.alignment && (
            <div className="glass-card rounded-xl p-6 border-l-4 border-l-primary">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <PenTool className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-black uppercase tracking-widest text-sm italic">Wheel Alignment Report</h3>
                    <p className="text-[10px] text-muted-foreground font-bold">LATEST DIAGNOSTIC SUMMARY</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-[10px] font-bold">
                  CHECKED: {new Date(meta.alignment.lastChecked).toLocaleDateString()}
                </Badge>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <h4 className="text-[10px] font-black text-muted-foreground border-b border-border/20 pb-1 mb-2">FRONT LEFT</h4>
                  <AlignmentMiniGauge label="Camber" value={meta.alignment.leftFront.camber} specKey="camberFront" />
                  <AlignmentMiniGauge label="Caster" value={meta.alignment.leftFront.caster} specKey="casterFront" />
                  <AlignmentMiniGauge label="Toe" value={meta.alignment.leftFront.toe} specKey="toeFront" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-[10px] font-black text-muted-foreground border-b border-border/20 pb-1 mb-2">FRONT RIGHT</h4>
                  <AlignmentMiniGauge label="Camber" value={meta.alignment.rightFront.camber} specKey="camberFront" />
                  <AlignmentMiniGauge label="Caster" value={meta.alignment.rightFront.caster} specKey="casterFront" />
                  <AlignmentMiniGauge label="Toe" value={meta.alignment.rightFront.toe} specKey="toeFront" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-[10px] font-black text-muted-foreground border-b border-border/20 pb-1 mb-2">REAR LEFT</h4>
                  <AlignmentMiniGauge label="Camber" value={meta.alignment.leftRear.camber} specKey="camberRear" />
                  <AlignmentMiniGauge label="Toe" value={meta.alignment.leftRear.toe} specKey="toeRear" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-[10px] font-black text-muted-foreground border-b border-border/20 pb-1 mb-2">REAR RIGHT</h4>
                  <AlignmentMiniGauge label="Camber" value={meta.alignment.rightRear.camber} specKey="camberRear" />
                  <AlignmentMiniGauge label="Toe" value={meta.alignment.rightRear.toe} specKey="toeRear" />
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-border/40 grid grid-cols-2 gap-8">
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Centerline Stats</h4>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                    <AlignmentMiniGauge label="Fr. Total Toe" value={meta.alignment.centerline.frontTotalToe} specKey="frontTotalToe" />
                    <AlignmentMiniGauge label="Rr. Total Toe" value={meta.alignment.centerline.rearTotalToe} specKey="rearTotalToe" />
                    <AlignmentMiniGauge label="Steer Ahead" value={meta.alignment.centerline.steerAhead} specKey="steerAhead" />
                    <AlignmentMiniGauge label="Thrust Angle" value={meta.alignment.centerline.thrustAngle} specKey="thrustAngle" />
                  </div>
                </div>
                <div className="bg-primary/5 p-4 rounded-2xl border border-primary/20 flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span className="text-[10px] font-black uppercase text-primary">Next Check Recommendation</span>
                  </div>
                  <p className="text-xl font-black text-primary italic">In {meta.alignment.nextCheckDate}</p>
                </div>
              </div>
            </div>
          )}

          {meta?.battery && (
            <div className="glass-card rounded-xl p-6 border-l-4 border-l-yellow-500">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-yellow-500/10">
                    <Battery className="w-5 h-5 text-yellow-500" />
                  </div>
                  <div>
                    <h3 className="font-black uppercase tracking-widest text-sm italic text-yellow-500">Battery Diagnostic Report</h3>
                    <p className="text-[10px] text-muted-foreground font-bold">HEALTH & CAPACITY ANALYSIS</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-[10px] font-bold border-yellow-500/30 text-yellow-600">
                  HEALTH: {meta.battery.health}%
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center gap-4 bg-muted/30 p-4 rounded-2xl border border-border/50">
                  <div className="p-3 rounded-xl bg-yellow-500/20 text-yellow-500">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-muted-foreground uppercase">Voltage</p>
                    <p className="text-lg font-black font-mono">{meta.battery.voltage}V</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 bg-muted/30 p-4 rounded-2xl border border-border/50">
                  <div className="p-3 rounded-xl bg-blue-500/20 text-blue-500">
                    <Droplets className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-muted-foreground uppercase">Water Level</p>
                    <p className="text-lg font-black font-mono">{meta.battery.waterLevel}%</p>
                  </div>
                </div>
                <div className="bg-yellow-500/5 p-4 rounded-2xl border border-yellow-500/20">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-3 h-3 text-yellow-600" />
                    <span className="text-[10px] font-black uppercase text-yellow-600">Recheck in</span>
                  </div>
                  <p className="text-lg font-black text-yellow-700 italic">{meta.battery.nextCheckDate}</p>
                </div>
              </div>

              {meta.alignment?.technicianNotes && (
                <div className="mt-6 p-4 rounded-2xl bg-muted/50 border border-border/50">
                  <p className="text-[10px] font-black text-muted-foreground uppercase mb-1 tracking-widest">Technician Notes & Observations</p>
                  <p className="text-xs font-medium leading-relaxed italic">"{meta.alignment.technicianNotes}"</p>
                </div>
              )}
            </div>
          )}

          {(parsedNotes.plainNotes || job.notes) && (
            <div className="glass-card rounded-xl p-6">
              <h3 className="font-semibold mb-2">Notes</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{parsedNotes.plainNotes || 'N/A'}</p>
            </div>
          )}
        </div>
        <aside className="space-y-4 xl:sticky xl:top-20">
          <div className="rounded-3xl border border-border/50 bg-card/70 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Job Summary</p>
            <div className="mt-4 space-y-4">
              <div>
                <p className="text-[11px] text-muted-foreground">Current value</p>
                <p className="mt-1 text-2xl font-semibold tracking-tight">Rs.{currentCost.toLocaleString()}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-border/40 bg-background/80 p-3">
                  <p className="text-[11px] text-muted-foreground">Mechanic</p>
                  <p className="mt-1 text-sm font-medium">{job.mechanic_name || 'Unassigned'}</p>
                </div>
                <div className="rounded-2xl border border-border/40 bg-background/80 p-3">
                  <p className="text-[11px] text-muted-foreground">Service Bay</p>
                  <p className="mt-1 text-sm font-medium">
                    {activeBay && activeBayIndex >= 0 ? getBayDisplayName(activeBay, activeBayIndex) : 'Not assigned'}
                  </p>
                </div>
                <div className="rounded-2xl border border-border/40 bg-background/80 p-3">
                  <p className="text-[11px] text-muted-foreground">Customer</p>
                  <p className="mt-1 text-sm font-medium">{job.customer_name}</p>
                </div>
                <div className="rounded-2xl border border-border/40 bg-background/80 p-3">
                  <p className="text-[11px] text-muted-foreground">Vehicle</p>
                  <p className="mt-1 text-sm font-medium">{job.vehicle_number}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-border/50 bg-card/70 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Workflow</p>
            <div className="mt-4 space-y-3">
              {workflowSteps.map((step, index) => {
                const reached = activeStepIndex >= index;
                const isCurrent = job.status === step;
                return (
                  <div key={step} className="flex items-center gap-3">
                    <div className={`h-2.5 w-2.5 rounded-full ${isCurrent ? 'bg-primary' : reached ? 'bg-success' : 'bg-muted'}`} />
                    <div className="flex-1 border-b border-border/30 pb-3 text-sm last:border-b-0 last:pb-0">
                      <p className={isCurrent ? 'font-semibold text-foreground' : 'text-muted-foreground'}>
                        {jobStatusLabels[step]}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-3xl border border-border/50 bg-card/70 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Quick Actions</p>
            <div className="mt-4 space-y-2">
              <Button variant="outline" className="h-10 w-full justify-start rounded-xl border-border/50" onClick={() => navigate(`/service-center/jobs/${job.id}/invoice`)}>
                <Printer className="mr-2 h-4 w-4" /> Open Invoice
              </Button>
              <Button variant="outline" className="h-10 w-full justify-start rounded-xl border-border/50" onClick={() => window.location.assign(`tel:${job.customer_phone}`)}>
                <Phone className="mr-2 h-4 w-4" /> Call Customer
              </Button>
              <Link to="/service-center/jobs" className="block">
                <Button variant="outline" className="h-10 w-full justify-start rounded-xl border-border/50">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to Job Cards
                </Button>
              </Link>
            </div>
            {meta?.estimatedDeliveryDate && (
              <p className="mt-4 text-xs text-muted-foreground">
                Expected delivery: {formatEta(meta.estimatedDeliveryDate, meta.estimatedDeliveryTime)}
              </p>
            )}
          </div>
        </aside>

      </div>

      <Dialog open={bayPromptOpen} onOpenChange={setBayPromptOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Bay for In Progress</DialogTitle>
            <DialogDescription>
              This job is moving from Completed back to In Progress. Select a free bay, or skip to continue without bay assignment.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Available Free Bays</p>
            <div className="flex flex-wrap gap-2">
              {freeBays.length === 0 && (
                <span className="text-xs text-muted-foreground">No free bays available right now.</span>
              )}
              {freeBays.map(({ bay, index }) => (
                <button
                  key={`prompt-free-bay-${index}`}
                  type="button"
                  onClick={() => setSelectedBayIndex(String(index))}
                  className={`rounded-lg border px-3 py-1.5 text-xs transition-colors ${
                    selectedBayIndex === String(index)
                      ? 'border-success/40 bg-success/10 text-success'
                      : 'border-border bg-background hover:bg-secondary/50'
                  }`}
                >
                  {getBayDisplayName(bay, index)} Free
                </button>
              ))}
            </div>
            {selectedBayIndex !== '' && (
              <p className="text-xs text-success">Selected {selectedBayLabel}</p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleSkipBayAssign}>Skip</Button>
            <Button onClick={handleInProgressWithBay}>Continue</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

function ChecklistRow({ label, checked }: { label: string; checked: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm border-b border-border/40 pb-2">
      <span className="text-muted-foreground">{label}</span>
      <span className={checked ? 'text-success font-medium' : 'text-destructive font-medium'}>{checked ? 'Yes' : 'No'}</span>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2 text-sm border-b border-border/40 pb-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  );
}

function formatEta(dateValue: string, timeValue: string) {
  if (!dateValue && !timeValue) return 'N/A';
  const formattedDate = dateValue ? new Date(dateValue).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '';
  return `${formattedDate} ${timeValue}`.trim();
}

export default JobCardDetail;
