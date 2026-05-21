import { useState } from 'react';
import { ArrowLeft, Plus, X, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useMechanics, useAddJobCard, useAddMechanic } from '@/hooks/useData';
import { toast } from 'sonner';
import { buildJobNotes, defaultJobCardMeta, JobPriority } from '@/lib/jobCardStandards';
import { assignVehicleToBay, getBayDisplayName, getFreeBays } from '@/lib/serviceBays';
import { enqueueJob } from '@/lib/jobQueue';
import { VisualInspectionMap, InspectionMarker } from '@/components/service-center/VisualInspectionMap';
import { getSCExtensionPacks } from '@/lib/featureExtensions';
import { useAppRouter, DemoLink as Link } from '@/hooks/useAppRouter';

const CreateJobCard = () => {
  const { navigate } = useAppRouter();
  const { data: mechanics = [] } = useMechanics();
  const addJob = useAddJobCard();
  const addMechanic = useAddMechanic();
  const [tasks, setTasks] = useState<string[]>([]);
  const [taskInput, setTaskInput] = useState('');
  const [parts, setParts] = useState<string[]>([]);
  const [partInput, setPartInput] = useState('');
  const [concerns, setConcerns] = useState<string[]>([]);
  const [concernInput, setConcernInput] = useState('');
  const [mechanicId, setMechanicId] = useState('');
  const [mechanicDialogOpen, setMechanicDialogOpen] = useState(false);
  const [newMechanic, setNewMechanic] = useState({ name: '', phone: '', specialization: '' });
  const [complaintCategory, setComplaintCategory] = useState(defaultJobCardMeta.complaintCategory);
  const [priority, setPriority] = useState<JobPriority>('medium');
  const [appointmentType, setAppointmentType] = useState(defaultJobCardMeta.appointmentType);
  const [serviceAdvisorName, setServiceAdvisorName] = useState('');
  const [serviceAdvisorPhone, setServiceAdvisorPhone] = useState('');
  const [engineNumber, setEngineNumber] = useState('');
  const [chassisNumber, setChassisNumber] = useState('');
  const [fuelLevelIn, setFuelLevelIn] = useState('');
  const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState('');
  const [estimatedDeliveryTime, setEstimatedDeliveryTime] = useState('');
  const [inspectionChecklist, setInspectionChecklist] = useState(defaultJobCardMeta.inspectionChecklist);
  const [customerAuthorization, setCustomerAuthorization] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [internalObservations, setInternalObservations] = useState('');
  const [selectedBayIndex, setSelectedBayIndex] = useState<string>('');
  const [inspectionMarkers, setInspectionMarkers] = useState<InspectionMarker[]>([]);
  const [freeBays, setFreeBays] = useState(() => getFreeBays());
  const extensions = getSCExtensionPacks();
  const showInspectionMap = extensions.advancedVehicleDiagnostics;

  const refreshFreeBays = () => setFreeBays(getFreeBays());
  const selectedBayEntry = freeBays.find(({ index }) => String(index) === selectedBayIndex);
  const selectedBayLabel =
    selectedBayIndex === ''
      ? ''
      : selectedBayEntry
        ? getBayDisplayName(selectedBayEntry.bay, selectedBayEntry.index)
        : `Bay ${Number(selectedBayIndex) + 1}`;

  const allChecklistDone = Object.values(inspectionChecklist).every(Boolean);
  const mandatoryReady = !!mechanicId && concerns.length > 0 && tasks.length > 0 && allChecklistDone;

  const missingItems = [
    !mechanicId ? 'Assign Mechanic' : null,
    concerns.length === 0 ? 'Customer Concerns' : null,
    tasks.length === 0 ? 'Service Tasks' : null,
    !allChecklistDone ? 'Vehicle Inward Checklist' : null,
    !customerAuthorization ? 'Customer Authorization' : null,
    !termsAccepted ? 'Terms Acceptance' : null,
  ].filter(Boolean) as string[];

  const addTask = () => { if (taskInput.trim()) { setTasks(p => [...p, taskInput.trim()]); setTaskInput(''); } };
  const addPart = () => { if (partInput.trim()) { setParts(p => [...p, partInput.trim()]); setPartInput(''); } };
  const addConcern = () => { if (concernInput.trim()) { setConcerns((prev) => [...prev, concernInput.trim()]); setConcernInput(''); } };

  const handleAddMechanic = async () => {
    if (!newMechanic.name.trim()) return;
    await addMechanic.mutateAsync({
      name: newMechanic.name.trim(),
      phone: newMechanic.phone.trim() || undefined,
      specialization: newMechanic.specialization.trim() || undefined,
    });
    setNewMechanic({ name: '', phone: '', specialization: '' });
    setMechanicDialogOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const nativeEvent = e.nativeEvent as SubmitEvent;
    const submitter = nativeEvent.submitter as HTMLButtonElement | null;
    const submitMode = submitter?.dataset.submitMode === 'queue' ? 'queue' : 'create';

    if (submitMode === 'create' && !mechanicId) {
      toast.error('Assign Mechanic is mandatory');
      return;
    }
    if (concerns.length === 0) {
      toast.error('Add at least one Customer Concern');
      return;
    }
    if (tasks.length === 0) {
      toast.error('Add at least one Service Task');
      return;
    }
    if (!allChecklistDone) {
      toast.error('Complete all Vehicle Inward Checklist items');
      return;
    }

    if (!customerAuthorization || !termsAccepted) {
      toast.error('Customer authorization and terms acceptance are required');
      return;
    }

    const fd = new FormData(e.currentTarget);
    const mechanic = mechanics.find(m => m.id === mechanicId);
    const meta = {
      complaintCategory,
      priority,
      appointmentType,
      serviceAdvisorName: serviceAdvisorName.trim(),
      serviceAdvisorPhone: serviceAdvisorPhone.trim(),
      engineNumber: engineNumber.trim(),
      chassisNumber: chassisNumber.trim(),
      fuelLevelIn: fuelLevelIn.trim(),
      estimatedDeliveryDate,
      estimatedDeliveryTime,
      customerConcerns: concerns,
      inspectionChecklist,
      customerAuthorization,
      termsAccepted,
      internalObservations: internalObservations.trim(),
      inspectionMarkers,
    };

    const createdJob = await addJob.mutateAsync({
      customer_name: fd.get('customer') as string,
      customer_phone: fd.get('phone') as string,
      vehicle_number: fd.get('vehicle') as string,
      vehicle_model: fd.get('model') as string,
      mileage: Number(fd.get('mileage')),
      problem_description: fd.get('problem') as string,
      service_tasks: tasks,
      parts_required: parts,
      estimated_cost: Number(fd.get('cost')),
      mechanic_id: mechanicId || undefined,
      mechanic_name: mechanic?.name || '',
      notes: buildJobNotes((fd.get('notes') as string) || '', meta),
    });

    const assignedVehicle = String(fd.get('vehicle') || '').trim();
    const bayIndex = Number(selectedBayIndex);
    if (submitMode === 'create' && selectedBayIndex !== '' && Number.isInteger(bayIndex) && assignedVehicle) {
      assignVehicleToBay(bayIndex, assignedVehicle);
    }

    if (submitMode === 'queue') {
      enqueueJob({
        jobId: createdJob?.id,
        customerName: String(fd.get('customer') || '').trim(),
        customerPhone: String(fd.get('phone') || '').trim(),
        vehicleNumber: assignedVehicle,
        vehicleModel: String(fd.get('model') || '').trim(),
        problemDescription: String(fd.get('problem') || '').trim(),
      });
      toast.success('Job added to queue');
    }

    navigate('/service-center/jobs');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto w-full">
      <Link to="/service-center/jobs" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Job Cards
      </Link>
      <div>
        <h1 className="text-2xl font-bold">Create Job Card</h1>
        <p className="text-muted-foreground text-sm">Create a standardized digital job card with compliance checklist</p>
      </div>

      {missingItems.length > 0 && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
          <p className="text-sm font-medium text-destructive">Please complete mandatory items:</p>
          <p className="text-xs text-destructive mt-1">{missingItems.join(' • ')}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass-card rounded-xl p-6 lg:p-8 space-y-6">
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Priority</Label>
            <Select value={priority} onValueChange={(v) => setPriority(v as JobPriority)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Complaint Category</Label>
            <Select value={complaintCategory} onValueChange={setComplaintCategory}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="general_service">General Service</SelectItem>
                <SelectItem value="engine">Engine</SelectItem>
                <SelectItem value="electrical">Electrical</SelectItem>
                <SelectItem value="brakes">Brakes</SelectItem>
                <SelectItem value="suspension">Suspension</SelectItem>
                <SelectItem value="ac">AC</SelectItem>
                <SelectItem value="body_work">Body Work</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Appointment Type</Label>
            <Select value={appointmentType} onValueChange={(v) => setAppointmentType(v as 'walk_in' | 'pickup_drop' | 'breakdown')}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="walk_in">Walk-in</SelectItem>
                <SelectItem value="pickup_drop">Pickup / Drop</SelectItem>
                <SelectItem value="breakdown">Breakdown</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2"><Label htmlFor="customer">Customer Name *</Label><Input id="customer" name="customer" placeholder="Full name" required /></div>
          <div className="space-y-2"><Label htmlFor="phone">Customer Phone *</Label><Input id="phone" name="phone" placeholder="+91 XXXXX XXXXX" required /></div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2"><Label>Service Advisor Name</Label><Input value={serviceAdvisorName} onChange={(e) => setServiceAdvisorName(e.target.value)} placeholder="Advisor handling this job" /></div>
          <div className="space-y-2"><Label>Service Advisor Phone</Label><Input value={serviceAdvisorPhone} onChange={(e) => setServiceAdvisorPhone(e.target.value)} placeholder="Advisor contact number" /></div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2"><Label htmlFor="vehicle">Vehicle Number *</Label><Input id="vehicle" name="vehicle" placeholder="e.g. MH 01 AB 1234" required /></div>
          <div className="space-y-2"><Label htmlFor="model">Vehicle Model *</Label><Input id="model" name="model" placeholder="e.g. Maruti Swift VXI 2021" required /></div>
        </div>

        {showInspectionMap && (
          <div className="glass-card rounded-2xl p-6 border border-border/40 bg-secondary/5">
            <VisualInspectionMap 
              markers={inspectionMarkers} 
              onAddMarker={(m) => setInspectionMarkers(prev => {
                  const filtered = prev.filter(p => p.id !== m.id);
                  return [...filtered, m];
              })}
              onRemoveMarker={(id) => setInspectionMarkers(prev => prev.filter(m => m.id !== id))}
            />
          </div>
        )}

        <div className="grid sm:grid-cols-3 gap-4">
          <div className="space-y-2"><Label>Engine Number</Label><Input value={engineNumber} onChange={(e) => setEngineNumber(e.target.value)} placeholder="Optional" /></div>
          <div className="space-y-2"><Label>Chassis Number</Label><Input value={chassisNumber} onChange={(e) => setChassisNumber(e.target.value)} placeholder="Optional" /></div>
          <div className="space-y-2"><Label>Fuel Level In</Label><Input value={fuelLevelIn} onChange={(e) => setFuelLevelIn(e.target.value)} placeholder="e.g. Half tank" /></div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2"><Label htmlFor="mileage">Mileage (km) *</Label><Input id="mileage" name="mileage" type="number" placeholder="Current odometer" required /></div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2"><Label>ETA Date</Label><Input type="date" value={estimatedDeliveryDate} onChange={(e) => setEstimatedDeliveryDate(e.target.value)} /></div>
            <div className="space-y-2"><Label>ETA Time</Label><Input type="time" value={estimatedDeliveryTime} onChange={(e) => setEstimatedDeliveryTime(e.target.value)} /></div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Assign Mechanic *</Label>
            <div className="flex gap-2">
              <Select value={mechanicId} onValueChange={setMechanicId}>
                <SelectTrigger className="flex-1"><SelectValue placeholder="Select mechanic" /></SelectTrigger>
                <SelectContent>
                  {mechanics.filter(m => m.status !== 'off_duty').map(m => (
                    <SelectItem key={m.id} value={m.id}>{m.name} ({m.specialization}) {m.status === 'available' ? '🟢' : '🟡'}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Dialog open={mechanicDialogOpen} onOpenChange={setMechanicDialogOpen}>
                <DialogTrigger asChild>
                  <Button type="button" variant="outline" size="icon" title="Add new mechanic">
                    <UserPlus className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add New Mechanic</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-2">
                    <div className="space-y-2">
                      <Label>Name *</Label>
                      <Input value={newMechanic.name} onChange={e => setNewMechanic(p => ({ ...p, name: e.target.value }))} placeholder="Mechanic name" />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone</Label>
                      <Input value={newMechanic.phone} onChange={e => setNewMechanic(p => ({ ...p, phone: e.target.value }))} placeholder="+91 XXXXX XXXXX" />
                    </div>
                    <div className="space-y-2">
                      <Label>Specialization</Label>
                      <Input value={newMechanic.specialization} onChange={e => setNewMechanic(p => ({ ...p, specialization: e.target.value }))} placeholder="e.g. Engine, Electrical, General" />
                    </div>
                    <Button onClick={handleAddMechanic} disabled={addMechanic.isPending || !newMechanic.name.trim()} className="w-full gradient-primary text-primary-foreground">
                      {addMechanic.isPending ? 'Adding...' : 'Add Mechanic'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            {!mechanicId && <p className="text-xs text-destructive">Assign mechanic is required.</p>}
          </div>
        </div>

        <div className="rounded-xl border border-border/60 p-4 bg-background/40 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-sm font-medium">Assign Service Bay (Optional)</p>
              <p className="text-xs text-muted-foreground">Select from currently free bays while creating this job card.</p>
            </div>
            <Button type="button" variant="outline" className="h-7 text-[11px]" onClick={refreshFreeBays}>Refresh</Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {freeBays.length === 0 && (
              <span className="text-xs text-muted-foreground">No free bays available right now.</span>
            )}
            {freeBays.map(({ bay, index }) => (
              <button
                key={`free-bay-${index}`}
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
            {selectedBayIndex !== '' && (
              <button
                type="button"
                onClick={() => setSelectedBayIndex('')}
                className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-secondary/50"
              >
                Clear Bay
              </button>
            )}
          </div>

          {selectedBayIndex !== '' && (
            <p className="text-xs text-success">Selected {selectedBayLabel} for this job card.</p>
          )}
        </div>

        <div className="space-y-2"><Label htmlFor="problem">Problem Description</Label><Textarea id="problem" name="problem" placeholder="Describe the issue..." rows={3} required /></div>

        <div className="grid lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Customer Concerns *</Label>
            <div className="flex gap-2">
              <Input value={concernInput} onChange={(e) => setConcernInput(e.target.value)} placeholder="Add customer concern" onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addConcern())} />
              <Button type="button" variant="outline" size="icon" onClick={addConcern}><Plus className="h-4 w-4" /></Button>
            </div>
            {concerns.length > 0 && <div className="flex flex-wrap gap-2 mt-2">{concerns.map((c, i) => <Badge key={i} variant="secondary" className="gap-1">{c}<button type="button" onClick={() => setConcerns((p) => p.filter((_, j) => j !== i))}><X className="h-3 w-3" /></button></Badge>)}</div>}
            {concerns.length === 0 && <p className="text-xs text-destructive">Add at least one customer concern.</p>}
          </div>

          <div className="space-y-2">
            <Label>Service Tasks *</Label>
            <div className="flex gap-2">
              <Input value={taskInput} onChange={e => setTaskInput(e.target.value)} placeholder="Add a task" onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTask())} />
              <Button type="button" variant="outline" size="icon" onClick={addTask}><Plus className="h-4 w-4" /></Button>
            </div>
            {tasks.length > 0 && <div className="flex flex-wrap gap-2 mt-2">{tasks.map((t, i) => <Badge key={i} variant="secondary" className="gap-1">{t}<button type="button" onClick={() => setTasks(p => p.filter((_, j) => j !== i))}><X className="h-3 w-3" /></button></Badge>)}</div>}
            {tasks.length === 0 && <p className="text-xs text-destructive">Add at least one service task.</p>}
          </div>

          <div className="space-y-2">
            <Label>Parts Required</Label>
            <div className="flex gap-2">
              <Input value={partInput} onChange={e => setPartInput(e.target.value)} placeholder="Add a part" onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addPart())} />
              <Button type="button" variant="outline" size="icon" onClick={addPart}><Plus className="h-4 w-4" /></Button>
            </div>
            {parts.length > 0 && <div className="flex flex-wrap gap-2 mt-2">{parts.map((p, i) => <Badge key={i} variant="secondary" className="gap-1">{p}<button type="button" onClick={() => setParts(prev => prev.filter((_, j) => j !== i))}><X className="h-3 w-3" /></button></Badge>)}</div>}
          </div>
        </div>

        <div className="space-y-3">
          <Label>Vehicle Inward Checklist *</Label>
          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            <ChecklistItem label="RC copy received" checked={inspectionChecklist.rcReceived} onChange={(checked) => setInspectionChecklist((p) => ({ ...p, rcReceived: checked }))} />
            <ChecklistItem label="Insurance copy received" checked={inspectionChecklist.insuranceCopyReceived} onChange={(checked) => setInspectionChecklist((p) => ({ ...p, insuranceCopyReceived: checked }))} />
            <ChecklistItem label="Spare wheel received" checked={inspectionChecklist.spareWheelReceived} onChange={(checked) => setInspectionChecklist((p) => ({ ...p, spareWheelReceived: checked }))} />
            <ChecklistItem label="Tool kit received" checked={inspectionChecklist.toolKitReceived} onChange={(checked) => setInspectionChecklist((p) => ({ ...p, toolKitReceived: checked }))} />
            <ChecklistItem label="Jack and handle received" checked={inspectionChecklist.jackHandleReceived} onChange={(checked) => setInspectionChecklist((p) => ({ ...p, jackHandleReceived: checked }))} />
            <ChecklistItem label="Accessories intact" checked={inspectionChecklist.accessoriesIntact} onChange={(checked) => setInspectionChecklist((p) => ({ ...p, accessoriesIntact: checked }))} />
          </div>
          {!allChecklistDone && <p className="text-xs text-destructive">All checklist items must be checked before creating the job card.</p>}
        </div>

        <div className="space-y-2"><Label htmlFor="cost">Estimated Cost (₹)</Label><Input id="cost" name="cost" type="number" placeholder="e.g. 8500" required /></div>
        <div className="space-y-2"><Label>Internal Observations</Label><Textarea value={internalObservations} onChange={(e) => setInternalObservations(e.target.value)} placeholder="Observed condition, advisories, risk notes..." rows={2} /></div>
        <div className="space-y-2"><Label htmlFor="notes">Notes</Label><Textarea id="notes" name="notes" placeholder="Internal notes..." rows={2} /></div>

        <div className="space-y-2 rounded-lg border p-4 bg-muted/30">
          <ChecklistItem label="Customer authorization received for diagnosis and repairs" checked={customerAuthorization} onChange={setCustomerAuthorization} />
          <ChecklistItem label="Customer informed about estimate, timeline, and terms" checked={termsAccepted} onChange={setTermsAccepted} />
          {!customerAuthorization && <p className="text-xs text-destructive">Customer authorization is required.</p>}
          {!termsAccepted && <p className="text-xs text-destructive">Terms acceptance is required.</p>}
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" className="gradient-primary text-primary-foreground" disabled={addJob.isPending || !customerAuthorization || !termsAccepted || !mandatoryReady}>
            {addJob.isPending ? 'Creating...' : 'Create Job Card'}
          </Button>
          <Button
            type="submit"
            data-submit-mode="queue"
            variant="outline"
            disabled={addJob.isPending || !customerAuthorization || !termsAccepted || concerns.length === 0 || tasks.length === 0 || !allChecklistDone}
          >
            {addJob.isPending ? 'Adding...' : 'Create and Add To Queue'}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate('/service-center/jobs')}>Cancel</Button>
        </div>
      </form>
    </div>
  );
};

function ChecklistItem({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <Checkbox checked={checked} onCheckedChange={(v) => onChange(!!v)} />
      <span>{label}</span>
    </label>
  );
}

export default CreateJobCard;
