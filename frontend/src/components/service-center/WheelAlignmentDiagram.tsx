import { useCallback, useEffect, useState, useRef } from 'react';
import { Battery, Droplets, Zap, Wifi, Download, ChevronRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { getSCExtensionPacks } from '@/lib/featureExtensions';
import { useJobCards, useUpdateJobCard } from '@/hooks/useData';
import { buildJobNotes, parseJobNotes, WheelAlignmentData, BatteryData, ALIGNMENT_SPECS, isInSpec, AlignmentSpecKey, defaultJobCardMeta, type JobCardMeta } from '@/lib/jobCardStandards';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from 'lucide-react';
import type { JobCardRow } from '@/types/backendRows';

type SpecKey = AlignmentSpecKey;

interface AlignmentValues {
  leftFront: { camber: string; caster: string; toe: string };
  rightFront: { camber: string; caster: string; toe: string };
  leftRear: { camber: string; toe: string };
  rightRear: { camber: string; toe: string };
  centerline: { frontTotalToe: string; steerAhead: string; rearTotalToe: string; thrustAngle: string };
}

interface LocalBatteryData {
  voltage: string;
  health: number;
  waterLevel: number;
}

const defaultValues: AlignmentValues = {
  leftFront: { camber: '', caster: '', toe: '' },
  rightFront: { camber: '', caster: '', toe: '' },
  leftRear: { camber: '', toe: '' },
  rightRear: { camber: '', toe: '' },
  centerline: { frontTotalToe: '', steerAhead: '', rearTotalToe: '', thrustAngle: '' },
};

const defaultBattery: LocalBatteryData = { voltage: '12.6', health: 85, waterLevel: 70 };
const ALIGNMENT_MACHINE_CONFIG_KEY = 'sc-wheel-alignment-machine-config-v1';

type MachineConfig = {
  endpoint: string;
  apiKey: string;
};
type JobCardWithMeta = JobCardRow & { notes?: string | null };

function toStringValue(value: unknown): string {
  if (typeof value === 'number') return String(value);
  if (typeof value === 'string') return value;
  return '';
}

function getNumeric(value: unknown, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function mapMachinePayload(payload: unknown): { values: AlignmentValues; battery: LocalBatteryData } | null {
  if (!payload || typeof payload !== 'object') return null;
  const obj = payload as Record<string, unknown>;
  const alignment = (obj.alignment && typeof obj.alignment === 'object')
    ? (obj.alignment as Record<string, unknown>)
    : obj;

  const leftFront = (alignment.leftFront && typeof alignment.leftFront === 'object') ? alignment.leftFront as Record<string, unknown> : {};
  const rightFront = (alignment.rightFront && typeof alignment.rightFront === 'object') ? alignment.rightFront as Record<string, unknown> : {};
  const leftRear = (alignment.leftRear && typeof alignment.leftRear === 'object') ? alignment.leftRear as Record<string, unknown> : {};
  const rightRear = (alignment.rightRear && typeof alignment.rightRear === 'object') ? alignment.rightRear as Record<string, unknown> : {};
  const centerline = (alignment.centerline && typeof alignment.centerline === 'object') ? alignment.centerline as Record<string, unknown> : {};

  const batteryObj = (obj.battery && typeof obj.battery === 'object')
    ? (obj.battery as Record<string, unknown>)
    : {};

  const values: AlignmentValues = {
    leftFront: {
      camber: toStringValue(leftFront.camber),
      caster: toStringValue(leftFront.caster),
      toe: toStringValue(leftFront.toe),
    },
    rightFront: {
      camber: toStringValue(rightFront.camber),
      caster: toStringValue(rightFront.caster),
      toe: toStringValue(rightFront.toe),
    },
    leftRear: {
      camber: toStringValue(leftRear.camber),
      toe: toStringValue(leftRear.toe),
    },
    rightRear: {
      camber: toStringValue(rightRear.camber),
      toe: toStringValue(rightRear.toe),
    },
    centerline: {
      frontTotalToe: toStringValue(centerline.frontTotalToe),
      steerAhead: toStringValue(centerline.steerAhead),
      rearTotalToe: toStringValue(centerline.rearTotalToe),
      thrustAngle: toStringValue(centerline.thrustAngle),
    },
  };

  const battery: LocalBatteryData = {
    voltage: toStringValue(batteryObj.voltage || defaultBattery.voltage),
    health: Math.min(100, Math.max(0, getNumeric(batteryObj.health, defaultBattery.health))),
    waterLevel: Math.min(100, Math.max(0, getNumeric(batteryObj.waterLevel, defaultBattery.waterLevel))),
  };

  return { values, battery };
}

// Local isInSpec removed, using the one from jobCardStandards

function AlignmentGauge({
  label,
  value,
  onChange,
  specKey,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  specKey: SpecKey;
}) {
  const inSpec = isInSpec(value, specKey);
  const spec = ALIGNMENT_SPECS[specKey];
  const numValue = parseFloat(value) || 0;
  
  // Calculate percentage of value within spec range for visual gauge
  // We want to show a decent range around the spec
  const specRange = spec.max - spec.min;
  const padding = specRange * 0.5;
  const minView = spec.min - padding;
  const maxView = spec.max + padding;
  const displayRange = maxView - minView;
  const position = ((numValue - minView) / displayRange) * 100;
  const boundedPosition = Math.min(100, Math.max(0, position));

  const specLeft = ((spec.min - minView) / displayRange) * 100;
  const specWidth = (specRange / displayRange) * 100;

  return (
    <div className="space-y-1.5 p-2 rounded-xl bg-secondary/20 border border-border/50 hover:border-primary/30 transition-all group">
      <div className="flex items-center justify-between px-0.5">
        <span className="text-[10px] uppercase font-bold tracking-tighter text-muted-foreground group-hover:text-primary transition-colors">{label}</span>
        <div className="flex items-center gap-1">
          {inSpec !== null && (
            inSpec ? <CheckCircle2 className="w-3 h-3 text-success" /> : <AlertCircle className="w-3 h-3 text-destructive" />
          )}
          <span className="text-[9px] font-mono opacity-60">
            {spec.min.toFixed(2)} to {spec.max.toFixed(2)}
          </span>
        </div>
      </div>
      
      {/* Visual Gauge */}
      <div className="relative h-6 bg-muted/50 rounded-md overflow-hidden border border-border/30">
        {/* Spec Range Highlight */}
        <div 
          className="absolute h-full bg-success/15 border-x border-success/30"
          style={{ left: `${specLeft}%`, width: `${specWidth}%` }}
        />
        
        {/* Center Line for Gauge */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border/40" />
        
        {/* Value Marker */}
        <motion.div 
          initial={false}
          animate={{ left: `${boundedPosition}%` }}
          className={`absolute top-0 bottom-0 w-1 flex items-center justify-center -translate-x-1/2 z-10`}
        >
          <div className={`h-full w-full ${inSpec === false ? 'bg-destructive' : 'bg-primary shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]'}`} />
          <div className="absolute -top-1 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-primary" />
        </motion.div>
        
        <input
          type="number"
          step="0.01"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 w-full h-full bg-transparent text-xs font-mono font-bold text-center outline-none cursor-ew-resize placeholder:opacity-30"
          placeholder="0.00"
        />
      </div>
    </div>
  );
}

function CarTopView({ selectedSection, onSelect }: { selectedSection: string | null; onSelect: (s: string) => void }) {
  return (
    <svg viewBox="0 0 200 340" className="w-full h-full drop-shadow-2xl" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="carBodyGradient" x1="100" y1="25" x2="100" y2="325" gradientUnits="userSpaceOnUse">
          <stop stopColor="hsl(var(--muted))" />
          <stop offset="1" stopColor="hsl(var(--secondary))" />
        </linearGradient>
        <filter id="carGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Main Car Body */}
      <motion.path
        d="M60 60 Q60 30 100 25 Q140 30 140 60 L145 100 Q148 120 148 140 L148 220 Q148 260 145 280 L140 300 Q140 320 100 325 Q60 320 60 300 L55 280 Q52 260 52 220 L52 140 Q52 120 55 100 Z"
        fill="url(#carBodyGradient)"
        stroke="hsl(var(--border))"
        strokeWidth="2"
      />
      
      {/* Front Windshield */}
      <path
        d="M70 75 Q70 55 100 50 Q130 55 130 75 L132 105 Q100 108 68 105 Z"
        fill="hsl(var(--card))"
        fillOpacity="0.5"
        stroke="hsl(var(--border))"
        strokeWidth="1"
      />
      
      {/* Rear Window */}
      <path
        d="M72 280 Q72 300 100 305 Q128 300 128 280 L130 255 Q100 252 70 255 Z"
        fill="hsl(var(--card))"
        fillOpacity="0.5"
        stroke="hsl(var(--border))"
        strokeWidth="1"
      />

      {/* Center Line Axis */}
      <motion.line 
        x1="100" y1="0" x2="100" y2="340" 
        stroke="hsl(var(--primary) / 0.3)" 
        strokeWidth="1" 
        strokeDasharray="8 4"
        initial={{ strokeDashoffset: 0 }}
        animate={{ strokeDashoffset: -12 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />

      {/* Wheel Groups with Interaction */}
      {[
        { id: 'leftFront', x: 34, y: 65, label: 'LF' },
        { id: 'rightFront', x: 148, y: 65, label: 'RF' },
        { id: 'leftRear', x: 34, y: 240, label: 'LR' },
        { id: 'rightRear', x: 148, y: 240, label: 'RR' }
      ].map((wheel) => (
        <motion.g 
          key={wheel.id}
          className="cursor-pointer"
          whileHover={{ scale: 1.1 }}
          onClick={() => onSelect(wheel.id)}
        >
          <motion.rect
            x={wheel.x} y={wheel.y} width="18" height="42" rx="5"
            fill={selectedSection === wheel.id ? "hsl(var(--primary))" : "hsl(var(--foreground) / 0.7)"}
            stroke={selectedSection === wheel.id ? "white" : "hsl(var(--foreground) / 0.9)"}
            strokeWidth={selectedSection === wheel.id ? "2" : "1"}
            animate={selectedSection === wheel.id ? { fill: "hsl(var(--primary))", strokeWidth: 2 } : {}}
          />
          {selectedSection === wheel.id && (
            <motion.circle 
              cx={wheel.x + 9} cy={wheel.y + 21} r="30" 
              fill="hsl(var(--primary) / 0.15)"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
            />
          )}
        </motion.g>
      ))}

      {/* Direction Indicators */}
      <motion.path 
        d="M100 10 L110 0 L90 0 Z" 
        fill="hsl(var(--primary))"
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </svg>
  );
}

function WheelCard({
  title,
  id,
  children,
  className = '',
  selected = false
}: {
  title: string;
  id: string;
  children: React.ReactNode;
  className?: string;
  selected?: boolean;
}) {
  return (
    <motion.div 
      id={id}
      animate={selected ? { borderColor: 'hsl(var(--primary))', boxShadow: '0 0 15px hsl(var(--primary) / 0.2)' } : {}}
      className={`bg-card/40 backdrop-blur-md border border-border/80 rounded-2xl p-4 shadow-xl transition-all ${className} ${selected ? 'ring-2 ring-primary/20 scale-[1.02]' : ''}`}
    >
      <div className="flex items-center justify-between mb-3 border-b border-border/40 pb-2">
        <h4 className="text-sm font-black uppercase tracking-widest text-foreground">{title}</h4>
        {selected && <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />}
      </div>
      <div className="grid gap-3">{children}</div>
    </motion.div>
  );
}

function BatteryGauge({ health, waterLevel, voltage }: LocalBatteryData) {
  const h = Number(health);
  const w = Number(waterLevel);
  const healthColor = h > 70 ? 'text-green-500' : h > 40 ? 'text-yellow-500' : 'text-red-500';
  const waterColor = w > 50 ? 'text-blue-500' : w > 25 ? 'text-yellow-500' : 'text-red-500';

  return (
    <div className="border border-border rounded-lg p-3 bg-card">
      <h4 className="text-xs font-bold text-foreground mb-2 flex items-center gap-1.5">
        <Battery className="w-3.5 h-3.5 text-primary" /> Battery Diagnostics
      </h4>

      <div className="grid grid-cols-3 gap-2">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Zap className="w-3 h-3 text-yellow-500" />
            <span className="text-[10px] text-muted-foreground">Voltage</span>
          </div>
          <span className="text-sm font-bold font-mono text-foreground">{voltage}V</span>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Battery className={`w-3 h-3 ${healthColor}`} />
            <span className="text-[10px] text-muted-foreground">Health</span>
          </div>
          <span className={`text-sm font-bold font-mono ${healthColor}`}>{health}%</span>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Droplets className={`w-3 h-3 ${waterColor}`} />
            <span className="text-[10px] text-muted-foreground">Water</span>
          </div>
          <span className={`text-sm font-bold font-mono ${waterColor}`}>{waterLevel}%</span>
        </div>
      </div>

      <div className="mt-2 space-y-1.5">
        <div>
          <div className="flex justify-between text-[10px] text-muted-foreground mb-0.5">
            <span>Battery Health</span>
            <span>{health}%</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${health > 70 ? 'bg-green-500' : health > 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
              style={{ width: `${health}%` }}
            />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-[10px] text-muted-foreground mb-0.5">
            <span>Water Level</span>
            <span>{waterLevel}%</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${waterLevel > 50 ? 'bg-blue-500' : waterLevel > 25 ? 'bg-yellow-500' : 'bg-red-500'}`}
              style={{ width: `${waterLevel}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function WheelAlignmentDiagram() {
  const [values, setValues] = useState<AlignmentValues>(defaultValues);
  const [battery, setBattery] = useState<LocalBatteryData>(defaultBattery);
  const [machineConnectEnabled, setMachineConnectEnabled] = useState(false);
  const [machineConfig, setMachineConfig] = useState<MachineConfig>({ endpoint: '', apiKey: '' });
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  
  const { data: jobCards } = useJobCards();
  const updateJobCard = useUpdateJobCard();
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [nextAlignmentDuration, setNextAlignmentDuration] = useState('6 months');
  const [nextBatteryDuration, setNextBatteryDuration] = useState('12 months');
  const [techNotes, setTechNotes] = useState('');

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const syncPacks = () => {
      const packs = getSCExtensionPacks();
      setMachineConnectEnabled(Boolean(packs.wheelAlignmentMachineConnect));
    };
    syncPacks();
    window.addEventListener('storage', syncPacks);
    window.addEventListener('sc-extension-packs-updated', syncPacks as EventListener);
    return () => {
      window.removeEventListener('storage', syncPacks);
      window.removeEventListener('sc-extension-packs-updated', syncPacks as EventListener);
    };
  }, []);

  const handleSelectSection = (section: string) => {
    setSelectedSection(section);
    const element = document.getElementById(section);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const update = useCallback((section: keyof AlignmentValues, field: string, val: string) => {
    setValues((prev) => ({
      ...prev,
      [section]: { ...(prev[section] as Record<string, string>), [field]: val },
    }));
  }, []);

  const handleSave = () => {
    toast({
      title: 'Alignment Data Saved',
      description: 'All readings have been recorded successfully.',
    });
  };

  const activeJobs = jobCards?.filter(j => j.status !== 'delivered') || [];

  const handleSaveToJob = async () => {
    if (!selectedJobId) {
      handleSave();
      return;
    }

    const job = activeJobs.find((j): j is JobCardWithMeta => j.id === selectedJobId);
    if (!job) return;

    const jobNotes = job.notes || '';
    const { meta: existingMeta } = parseJobNotes(jobNotes);
    
    const alignmentData: WheelAlignmentData = {
      leftFront: { 
        camber: getNumeric(values.leftFront.camber, 0), 
        caster: getNumeric(values.leftFront.caster, 0), 
        toe: getNumeric(values.leftFront.toe, 0) 
      },
      rightFront: { 
        camber: getNumeric(values.rightFront.camber, 0), 
        caster: getNumeric(values.rightFront.caster, 0), 
        toe: getNumeric(values.rightFront.toe, 0) 
      },
      leftRear: { 
        camber: getNumeric(values.leftRear.camber, 0), 
        toe: getNumeric(values.leftRear.toe, 0) 
      },
      rightRear: { 
        camber: getNumeric(values.rightRear.camber, 0), 
        toe: getNumeric(values.rightRear.toe, 0) 
      },
      centerline: { 
        frontTotalToe: getNumeric(values.centerline.frontTotalToe, 0), 
        rearTotalToe: getNumeric(values.centerline.rearTotalToe, 0), 
        steerAhead: getNumeric(values.centerline.steerAhead, 0), 
        thrustAngle: getNumeric(values.centerline.thrustAngle, 0) 
      },
      lastChecked: new Date().toISOString(),
      nextCheckDate: nextAlignmentDuration,
      technicianNotes: techNotes,
    };

    const batteryData: BatteryData = {
      voltage: getNumeric(battery.voltage, 0),
      health: battery.health,
      waterLevel: String(battery.waterLevel),
      lastChecked: new Date().toISOString(),
      nextCheckDate: nextBatteryDuration,
      technicianNotes: techNotes,
    };

    const newMeta: JobCardMeta = {
      ...(existingMeta || defaultJobCardMeta),
      alignment: alignmentData,
      battery: batteryData,
    };

    const plainNotes = jobNotes.split('[JOB_CARD_META]')[0].trim();
    const updatedNotes = buildJobNotes(plainNotes, newMeta);

    try {
      await updateJobCard.mutateAsync({ id: selectedJobId, notes: updatedNotes });
      setValues(defaultValues);
      setBattery(defaultBattery);
      setSelectedJobId('');
      setTechNotes('');
      // Scroll back up to reset view
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Update failed:', error);
    }
  };

  const loadSampleReadings = () => {
    setValues({
      leftFront: { camber: '-0.72', caster: '3.01', toe: '-0.06' },
      rightFront: { camber: '-0.91', caster: '3.18', toe: '-0.31' },
      leftRear: { camber: '-0.88', toe: '0.03' },
      rightRear: { camber: '-0.93', toe: '-0.13' },
      centerline: { frontTotalToe: '-0.38', steerAhead: '0.12', rearTotalToe: '-0.10', thrustAngle: '0.08' },
    });
  };

  const fieldChecks = [
    isInSpec(values.leftFront.camber, 'camberFront'),
    isInSpec(values.leftFront.caster, 'casterFront'),
    isInSpec(values.leftFront.toe, 'toeFront'),
    isInSpec(values.rightFront.camber, 'camberFront'),
    isInSpec(values.rightFront.caster, 'casterFront'),
    isInSpec(values.rightFront.toe, 'toeFront'),
    isInSpec(values.leftRear.camber, 'camberRear'),
    isInSpec(values.leftRear.toe, 'toeRear'),
    isInSpec(values.rightRear.camber, 'camberRear'),
    isInSpec(values.rightRear.toe, 'toeRear'),
    isInSpec(values.centerline.frontTotalToe, 'frontTotalToe'),
    isInSpec(values.centerline.steerAhead, 'steerAhead'),
    isInSpec(values.centerline.rearTotalToe, 'rearTotalToe'),
    isInSpec(values.centerline.thrustAngle, 'thrustAngle'),
  ];

  const inSpecCount = fieldChecks.filter((s) => s === true).length;
  const outSpecCount = fieldChecks.filter((s) => s === false).length;

  return (
    <Card className="w-full max-w-4xl mx-auto border-none shadow-2xl bg-gradient-to-br from-background via-background/95 to-secondary/10 overflow-hidden">
      <CardHeader className="pb-4 relative overflow-hidden text-center">
        <div className="absolute top-0 left-0 w-full h-1 gradient-primary shadow-[0_2px_15px_rgba(var(--primary-rgb),0.5)]" />
        <CardTitle className="text-2xl font-black italic tracking-tighter">WHEEL ALIGNMENT SYSTEM</CardTitle>
        <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Real-time Diagnostic Terminal</p>
        
        <div className="flex justify-center gap-4 mt-6">
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold text-muted-foreground mb-1">IN SPEC</span>
            <div className="h-10 w-16 flex items-center justify-center rounded-xl bg-success/10 border border-success/30 text-success font-black text-xl">
              {inSpecCount}
            </div>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold text-muted-foreground mb-1">OUT RANGE</span>
            <div className="h-10 w-16 flex items-center justify-center rounded-xl bg-destructive/10 border border-destructive/30 text-destructive font-black text-xl">
              {outSpecCount}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-8" ref={containerRef}>
        <div className="flex justify-center gap-3">
          <Button variant="outline" className="h-9 px-6 rounded-full text-xs font-bold border-border/50 hover:border-primary transition-all" onClick={loadSampleReadings}>
            SIMULATE DATA
          </Button>
          <Button variant="outline" className="h-9 px-6 rounded-full text-xs font-bold border-border/50 hover:border-destructive transition-all" onClick={() => setValues(defaultValues)}>
            RESET TERMINAL
          </Button>
        </div>

        {/* Main Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr_320px] gap-8 items-start">
          {/* Left Column: Front and Rear Left Wheels */}
          <div className="space-y-6">
            <WheelCard title="Left Front" id="leftFront" selected={selectedSection === 'leftFront'}>
              <AlignmentGauge label="Camber" value={values.leftFront.camber} onChange={(v) => update('leftFront', 'camber', v)} specKey="camberFront" />
              <AlignmentGauge label="Caster" value={values.leftFront.caster} onChange={(v) => update('leftFront', 'caster', v)} specKey="casterFront" />
              <AlignmentGauge label="Toe" value={values.leftFront.toe} onChange={(v) => update('leftFront', 'toe', v)} specKey="toeFront" />
            </WheelCard>

            <WheelCard title="Left Rear" id="leftRear" selected={selectedSection === 'leftRear'}>
              <AlignmentGauge label="Camber" value={values.leftRear.camber} onChange={(v) => update('leftRear', 'camber', v)} specKey="camberRear" />
              <AlignmentGauge label="Toe" value={values.leftRear.toe} onChange={(v) => update('leftRear', 'toe', v)} specKey="toeRear" />
            </WheelCard>
          </div>

          {/* Center Column: Car SVG + Centerline Statistics */}
          <div className="flex flex-col items-center gap-8 py-4">
            <div className="w-full max-w-[240px] relative">
              <CarTopView selectedSection={selectedSection} onSelect={handleSelectSection} />
              
              <AnimatePresence>
                {selectedSection && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-full shadow-lg z-20"
                  >
                    SELECTING: {selectedSection.toUpperCase()}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Centerline Section - Now Integrated into Center Column for Balance */}
            <div className="w-full grid grid-cols-2 gap-4 bg-secondary/5 p-4 rounded-2xl border border-border/40 backdrop-blur-sm mt-8">
              <div className="col-span-2 text-center pb-2 border-b border-border/20 mb-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Chassis Centerline</span>
              </div>
              <div className="space-y-3">
                <AlignmentGauge label="Fr. Total Toe" value={values.centerline.frontTotalToe} onChange={(v) => update('centerline', 'frontTotalToe', v)} specKey="frontTotalToe" />
                <AlignmentGauge label="Steer Ahead" value={values.centerline.steerAhead} onChange={(v) => update('centerline', 'steerAhead', v)} specKey="steerAhead" />
              </div>
              <div className="space-y-3">
                <AlignmentGauge label="Rr. Total Toe" value={values.centerline.rearTotalToe} onChange={(v) => update('centerline', 'rearTotalToe', v)} specKey="rearTotalToe" />
                <AlignmentGauge label="Thrust Angle" value={values.centerline.thrustAngle} onChange={(v) => update('centerline', 'thrustAngle', v)} specKey="thrustAngle" />
              </div>
            </div>
          </div>

          {/* Right Column: Front and Rear Right Wheels */}
          <div className="space-y-6">
            <WheelCard title="Right Front" id="rightFront" selected={selectedSection === 'rightFront'}>
              <AlignmentGauge label="Camber" value={values.rightFront.camber} onChange={(v) => update('rightFront', 'camber', v)} specKey="camberFront" />
              <AlignmentGauge label="Caster" value={values.rightFront.caster} onChange={(v) => update('rightFront', 'caster', v)} specKey="casterFront" />
              <AlignmentGauge label="Toe" value={values.rightFront.toe} onChange={(v) => update('rightFront', 'toe', v)} specKey="toeFront" />
            </WheelCard>

            <WheelCard title="Right Rear" id="rightRear" selected={selectedSection === 'rightRear'}>
              <AlignmentGauge label="Camber" value={values.rightRear.camber} onChange={(v) => update('rightRear', 'camber', v)} specKey="camberRear" />
              <AlignmentGauge label="Toe" value={values.rightRear.toe} onChange={(v) => update('rightRear', 'toe', v)} specKey="toeRear" />
            </WheelCard>
          </div>
        </div>

        {/* Battery Diagnostics Enhanced - Now at the Bottom as a Summary Bar */}
        <div className="mt-12 border-t border-border/40 pt-8">
          <div className="max-w-2xl mx-auto bg-card/20 p-6 rounded-3xl border border-border/30">
            <div className="flex items-center gap-3 mb-6">
              <Battery className="w-5 h-5 text-primary" />
              <h3 className="text-sm font-black uppercase tracking-widest">Battery Health Diagnostic</h3>
            </div>
            <BatteryGauge {...battery} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase px-1">Voltage</label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={battery.voltage}
                  onChange={(e) => setBattery((p) => ({ ...p, voltage: e.target.value }))}
                  className="w-full text-sm font-mono font-bold border border-border rounded-xl px-3 py-2 bg-background/50 text-foreground outline-none focus:ring-2 ring-primary/20 transition-all"
                  placeholder="12.6"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase px-1">Health %</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={battery.health}
                  onChange={(e) => setBattery((p) => ({ ...p, health: Math.min(100, Math.max(0, parseInt(e.target.value, 10) || 0)) }))}
                  className="w-full text-sm font-mono font-bold border border-border rounded-xl px-3 py-2 bg-background/50 text-foreground outline-none focus:ring-2 ring-primary/20 transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase px-1">Water %</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={battery.waterLevel}
                  onChange={(e) => setBattery((p) => ({ ...p, waterLevel: Math.min(100, Math.max(0, parseInt(e.target.value, 10) || 0)) }))}
                  className="w-full text-sm font-mono font-bold border border-border rounded-xl px-3 py-2 bg-background/50 text-foreground outline-none focus:ring-2 ring-primary/20 transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Connect to Job Card Section */}
        <div className="mt-12 border-t border-border/40 pt-8">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                  </div>
                  <h3 className="text-sm font-black uppercase tracking-widest italic">Sync with Job Card</h3>
                </div>
                
                <div className="space-y-4 bg-secondary/5 p-6 rounded-3xl border border-border/40">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest px-1">Select Active Job</Label>
                    <Select value={selectedJobId} onValueChange={setSelectedJobId}>
                      <SelectTrigger className="h-12 rounded-2xl bg-background/50 border-border/50 font-medium">
                        <SelectValue placeholder="Choose a job card to link..." />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-border/40">
                        {activeJobs.map(job => (
                          <SelectItem key={job.id} value={job.id} className="rounded-xl">
                            {job.vehicle_number} — {job.customer_name}
                          </SelectItem>
                        ))}
                        {activeJobs.length === 0 && (
                          <div className="p-4 text-center text-xs text-muted-foreground">No active job cards found</div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest px-1">Next Alignment</Label>
                      <Select value={nextAlignmentDuration} onValueChange={setNextAlignmentDuration}>
                        <SelectTrigger className="h-10 rounded-xl bg-background/50 border-border/50 text-xs font-mono">
                          <Calendar className="w-3 h-3 mr-2 text-muted-foreground" />
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3 months">3 Months</SelectItem>
                          <SelectItem value="6 months">6 Months</SelectItem>
                          <SelectItem value="10,000 km">10,000 KM</SelectItem>
                          <SelectItem value="12 months">12 Months</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest px-1">Next Battery Check</Label>
                      <Select value={nextBatteryDuration} onValueChange={setNextBatteryDuration}>
                        <SelectTrigger className="h-10 rounded-xl bg-background/50 border-border/50 text-xs font-mono">
                          <Calendar className="w-3 h-3 mr-2 text-muted-foreground" />
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3 months">3 Months</SelectItem>
                          <SelectItem value="6 months">6 Months</SelectItem>
                          <SelectItem value="12 months">12 Months</SelectItem>
                          <SelectItem value="24 months">24 Months</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <AlertCircle className="w-4 h-4 text-primary" />
                  </div>
                  <h3 className="text-sm font-black uppercase tracking-widest italic">Technician Recommendations</h3>
                </div>
                <div className="h-full">
                  <Textarea 
                    className="h-[calc(100%-40px)] min-h-[140px] rounded-3xl bg-secondary/5 border-border/40 p-4 text-sm font-medium resize-none focus:ring-primary/20"
                    placeholder="Enter any specific observations or maintenance advice for the customer..."
                    value={techNotes}
                    onChange={(e) => setTechNotes(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <motion.div
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button 
                onClick={handleSaveToJob} 
                className="w-full h-20 rounded-3xl text-xl font-black gradient-primary text-primary-foreground shadow-2xl shadow-primary/30 group"
              >
                {selectedJobId ? 'SYNC WITH JOB CARD & FINALIZE' : 'CONFIRM READINGS ONLY'}
                <ChevronRight className="ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
