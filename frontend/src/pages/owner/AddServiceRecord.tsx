import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, Check, Wrench, Gauge, Cog, Camera,
  User, Droplets, Disc, Battery, CircleDot, ChevronLeft, Loader2, X, Upload,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useVehicles, useAddServiceRecord } from '@/hooks/useData';
import { useAuth } from '@/contexts/AuthContext';
import { API_BASE_URL } from '@/integrations/backend/client';
import { toast } from 'sonner';

const serviceTypes = [
  { value: 'oil_change', label: 'Oil Change', icon: Droplets },
  { value: 'brake_pad', label: 'Brake Pad', icon: Disc },
  { value: 'wheel_alignment', label: 'Wheel Alignment', icon: CircleDot },
  { value: 'wheel_balancing', label: 'Wheel Balancing', icon: CircleDot },
  { value: 'tire_replacement', label: 'Tire Replace', icon: CircleDot },
  { value: 'battery_replacement', label: 'Battery', icon: Battery },
  { value: 'general_service', label: 'General Service', icon: Cog },
  { value: 'engine_repair', label: 'Engine Repair', icon: Wrench },
  { value: 'custom', label: 'Custom', icon: Wrench },
];

const STEPS = [
  { id: 'vehicle', title: 'Vehicle & Type', icon: Wrench },
  { id: 'mileage', title: 'Date & Mileage', icon: Gauge },
  { id: 'parts', title: 'Parts & Cost', icon: Cog },
  { id: 'bill', title: 'Upload Bill', icon: Camera },
  { id: 'mechanic', title: 'Mechanic & Notes', icon: User },
];

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
};

const AddServiceRecord = () => {
  const navigate = useNavigate();
  const { user, session } = useAuth();
  const { data: vehicles = [] } = useVehicles();
  const addRecord = useAddServiceRecord();

  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);

  // Form state
  const [vehicleId, setVehicleId] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [mileage, setMileage] = useState('');
  const [cost, setCost] = useState('');
  const [parts, setParts] = useState<string[]>([]);
  const [partInput, setPartInput] = useState('');
  const [billFile, setBillFile] = useState<File | null>(null);
  const [billPreview, setBillPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [centerName, setCenterName] = useState('');
  const [mechanicName, setMechanicName] = useState('');
  const [notes, setNotes] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const goNext = () => { setDirection(1); setStep(s => Math.min(s + 1, STEPS.length - 1)); };
  const goBack = () => { setDirection(-1); setStep(s => Math.max(s - 1, 0)); };

  const canProceed = () => {
    switch (step) {
      case 0: return !!vehicleId && !!serviceType;
      case 1: return !!date && !!mileage && Number(mileage) > 0;
      case 2: return !!cost && Number(cost) >= 0;
      case 3: return true; // bill is optional
      case 4: return !!centerName;
      default: return false;
    }
  };

  const addPart = () => {
    if (partInput.trim() && !parts.includes(partInput.trim())) {
      setParts(p => [...p, partInput.trim()]);
      setPartInput('');
    }
  };

  const removePart = (part: string) => setParts(p => p.filter(x => x !== part));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('File must be under 5MB'); return; }
    setBillFile(file);
    const reader = new FileReader();
    reader.onload = () => setBillPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!user || !session?.access_token) return;
    setUploading(true);

    let billUrl: string | undefined;

    // Upload bill if present
    if (billFile) {
      const formData = new FormData();
      formData.append('bill', billFile);

      const response = await fetch(`${API_BASE_URL}/owner/upload-bill`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        toast.error('Failed to upload bill');
        const payload = await response.json().catch(() => ({}));
        console.error(payload);
      } else {
        const payload = await response.json();
        billUrl = payload.billUrl;
      }
    }

    try {
      await addRecord.mutateAsync({
        vehicle_id: vehicleId,
        service_type: serviceType,
        date,
        mileage_at_service: Number(mileage),
        service_center_name: centerName,
        mechanic_name: mechanicName || undefined,
        parts_replaced: parts.length > 0 ? parts : undefined,
        cost: Number(cost),
        notes: notes || undefined,
        bill_url: billUrl,
      });
      navigate('/dashboard/services');
    } catch {
      // error handled by mutation
    }
    setUploading(false);
  };

  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <Link to="/dashboard/services" className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Service History
      </Link>

      <div>
        <h1 className="text-xl font-display font-bold tracking-tight">Add Service Record</h1>
        <p className="text-xs text-muted-foreground mt-1">Log a new maintenance or repair entry</p>
      </div>

      {/* Progress */}
      <div className="glass-card rounded-2xl p-6">
        {/* Step indicators */}
        <div className="flex items-center justify-between mb-2">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center gap-1.5">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold transition-all duration-300 ${
                i < step ? 'bg-accent text-accent-foreground' :
                i === step ? 'bg-accent/10 text-accent ring-1 ring-accent/30' :
                'bg-secondary text-muted-foreground'
              }`}>
                {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </div>
              <span className="text-[10px] font-medium text-muted-foreground hidden sm:inline">{s.title}</span>
              {i < STEPS.length - 1 && (
                <div className={`hidden sm:block w-8 h-px mx-1 transition-colors ${i < step ? 'bg-accent' : 'bg-border'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="w-full h-1 rounded-full bg-secondary mt-3 mb-8 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-accent"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>

        {/* Step Content */}
        <div className="min-h-[280px] relative overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-5"
            >
              {/* Step 0: Vehicle & Service Type */}
              {step === 0 && (
                <>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Vehicle</Label>
                    <Select value={vehicleId} onValueChange={setVehicleId}>
                      <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select a vehicle" /></SelectTrigger>
                      <SelectContent>
                        {vehicles.map(v => <SelectItem key={v.id} value={v.id}>{v.name} ({v.vehicle_number})</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Service Type</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {serviceTypes.map(t => {
                        const active = serviceType === t.value;
                        return (
                          <button
                            key={t.value}
                            type="button"
                            onClick={() => setServiceType(t.value)}
                            className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs transition-all duration-200 ${
                              active
                                ? 'bg-accent/10 border-accent/30 text-accent'
                                : 'bg-secondary/40 border-border/50 text-muted-foreground hover:bg-secondary/60'
                            }`}
                          >
                            <t.icon className="h-4 w-4" />
                            <span className="font-medium text-[10px] text-center leading-tight">{t.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              {/* Step 1: Date & Mileage */}
              {step === 1 && (
                <>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Service Date</Label>
                    <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Mileage at Service (km)</Label>
                    <Input
                      type="number"
                      value={mileage}
                      onChange={e => setMileage(e.target.value)}
                      placeholder="e.g. 35000"
                      className="rounded-xl text-lg font-display font-bold h-14"
                    />
                    <p className="text-[10px] text-muted-foreground">Enter your vehicle's odometer reading at the time of service</p>
                  </div>
                </>
              )}

              {/* Step 2: Parts & Cost */}
              {step === 2 && (
                <>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Cost (₹)</Label>
                    <Input
                      type="number"
                      value={cost}
                      onChange={e => setCost(e.target.value)}
                      placeholder="e.g. 2500"
                      className="rounded-xl text-lg font-display font-bold h-14"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Parts Replaced</Label>
                    <div className="flex gap-2">
                      <Input
                        value={partInput}
                        onChange={e => setPartInput(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addPart(); } }}
                        placeholder="e.g. Oil Filter"
                        className="rounded-xl text-xs"
                      />
                      <Button type="button" variant="outline" size="sm" onClick={addPart} className="rounded-xl text-xs h-10 px-4">
                        Add
                      </Button>
                    </div>
                    {parts.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {parts.map(part => (
                          <span key={part} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-accent/8 text-accent text-[10px] font-medium">
                            {part}
                            <button onClick={() => removePart(part)} className="hover:text-destructive"><X className="h-2.5 w-2.5" /></button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Step 3: Bill Upload */}
              {step === 3 && (
                <div className="space-y-4">
                  <Label className="text-xs font-medium">Upload Bill / Receipt (optional)</Label>
                  <input ref={fileRef} type="file" accept="image/*,.pdf" onChange={handleFileChange} className="hidden" />

                  {billPreview ? (
                    <div className="relative">
                      <img src={billPreview} alt="Bill preview" className="w-full max-h-48 object-contain rounded-xl border border-border/50" />
                      <button
                        onClick={() => { setBillFile(null); setBillPreview(null); }}
                        className="absolute top-2 right-2 w-6 h-6 rounded-lg bg-foreground/80 text-background flex items-center justify-center"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className="w-full h-40 rounded-2xl border-2 border-dashed border-border/60 flex flex-col items-center justify-center gap-3 hover:border-accent/30 hover:bg-accent/[0.02] transition-all duration-200"
                    >
                      <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                        <Upload className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-medium">Click to upload</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">JPG, PNG or PDF up to 5MB</p>
                      </div>
                    </button>
                  )}
                  {billFile && (
                    <p className="text-[10px] text-muted-foreground">{billFile.name} ({(billFile.size / 1024).toFixed(0)} KB)</p>
                  )}
                </div>
              )}

              {/* Step 4: Mechanic & Notes */}
              {step === 4 && (
                <>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Service Center Name *</Label>
                    <Input
                      value={centerName}
                      onChange={e => setCenterName(e.target.value)}
                      placeholder="e.g. AutoFix Workshop"
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Mechanic Name</Label>
                    <Input
                      value={mechanicName}
                      onChange={e => setMechanicName(e.target.value)}
                      placeholder="Optional"
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Additional Notes</Label>
                    <Textarea
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      placeholder="Any extra details..."
                      rows={3}
                      className="rounded-xl text-xs"
                    />
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-6 border-t border-border/40 mt-6">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={step === 0 ? () => navigate('/dashboard/services') : goBack}
            className="rounded-xl text-xs gap-1.5 h-9"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            {step === 0 ? 'Cancel' : 'Back'}
          </Button>

          {step < STEPS.length - 1 ? (
            <Button
              type="button"
              size="sm"
              onClick={goNext}
              disabled={!canProceed()}
              className="gradient-primary text-primary-foreground rounded-xl text-xs gap-1.5 h-9 px-5"
            >
              Next
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              onClick={handleSubmit}
              disabled={!canProceed() || uploading || addRecord.isPending}
              className="gradient-primary text-primary-foreground rounded-xl text-xs gap-1.5 h-9 px-5"
            >
              {uploading || addRecord.isPending ? (
                <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving...</>
              ) : (
                <><Check className="h-3.5 w-3.5" /> Save Record</>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddServiceRecord;
