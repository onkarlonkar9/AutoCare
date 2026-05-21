import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardList, Receipt, Wrench, CheckCircle2,
  User, Car, IndianRupee, Bell, ChevronRight
} from 'lucide-react';

// ─── Step definitions ───────────────────────────────────────────────
const STEPS = [
  {
    id: 0,
    label: 'Dashboard Overview',
    icon: ClipboardList,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/15 border-blue-500/30',
  },
  {
    id: 1,
    label: 'Creating Job Card',
    icon: ClipboardList,
    color: 'text-violet-400',
    bgColor: 'bg-violet-500/15 border-violet-500/30',
  },
  {
    id: 2,
    label: 'Assigning Mechanic',
    icon: Wrench,
    color: 'text-indigo-400',
    bgColor: 'bg-indigo-500/15 border-indigo-500/30',
  },
  {
    id: 3,
    label: 'Generating Invoice',
    icon: Receipt,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/15 border-emerald-500/30',
  },
];

const STEP_DURATION = 3500; // ms per step

// ─── Step 0: Dashboard ───────────────────────────────────────────────
function DashboardStep() {
  const jobs = [
    { plate: 'KA01AB1023', status: 'In Progress', dot: 'bg-blue-400', mechanic: 'Ravi K.' },
    { plate: 'TN22GH8891', status: 'Waiting Parts', dot: 'bg-amber-400', mechanic: 'Suresh M.' },
    { plate: 'MH12DN9044', status: 'Ready', dot: 'bg-emerald-400', mechanic: 'Arjun P.' },
    { plate: 'DL3CAB7734', status: 'Pending', dot: 'bg-slate-400', mechanic: 'Unassigned' },
  ];
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
      {/* KPI row */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Open Jobs', value: '67', sub: '↑ 5 today', color: 'text-foreground' },
          { label: 'Mechanics Active', value: '14', sub: '2 on break', color: 'text-accent' },
          { label: "Today's Revenue", value: '₹24,800', sub: '↑ 12%', color: 'text-emerald-400' },
        ].map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.15, duration: 0.4 }}
            className="rounded-xl bg-background/60 border border-border/50 p-2.5 text-center"
          >
            <p className={`text-base font-display font-bold ${kpi.color}`}>{kpi.value}</p>
            <p className="text-[9px] text-muted-foreground">{kpi.label}</p>
            <p className="text-[9px] text-emerald-400/70">{kpi.sub}</p>
          </motion.div>
        ))}
      </div>
      {/* Live job list */}
      <div className="space-y-1.5">
        <p className="text-[10px] font-semibold text-muted-foreground px-0.5">Live Job Board</p>
        {jobs.map((job, i) => (
          <motion.div
            key={job.plate}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + i * 0.12, duration: 0.35 }}
            className="flex items-center justify-between rounded-lg bg-background/55 border border-border/40 px-3 py-2"
          >
            <div className="flex items-center gap-2">
              <Car className="h-3 w-3 text-muted-foreground" />
              <span className="font-mono text-[11px] font-semibold">{job.plate}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-muted-foreground">{job.mechanic}</span>
              <div className="flex items-center gap-1">
                <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${job.dot}`} />
                <span className="text-[10px]">{job.status}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      {/* AI insight */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0, duration: 0.4 }}
        className="rounded-lg border border-accent/25 bg-accent/8 p-2.5"
      >
        <p className="text-[10px] text-muted-foreground">
          <span className="text-accent font-semibold">AI:</span> 3 jobs near promised delivery. Auto-notifications sent to customers.
        </p>
      </motion.div>
    </motion.div>
  );
}

// ─── Step 1: Job Card ────────────────────────────────────────────────
function JobCardStep() {
  const [typed, setTyped] = useState('');
  const fullText = 'Engine noise on acceleration, oil warning light on';

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setTyped(fullText.slice(0, i + 1));
      i++;
      if (i >= fullText.length) clearInterval(interval);
    }, 38);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2.5">
      <p className="text-[11px] font-bold text-foreground">New Job Card — MH12ZZ5599</p>
      {[
        { label: 'Customer', value: 'Vikram Sharma', icon: User },
        { label: 'Vehicle', value: 'Maruti Suzuki Swift (2021)', icon: Car },
        { label: 'Bay', value: 'Bay 3', icon: ClipboardList },
      ].map((row, i) => (
        <motion.div
          key={row.label}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.18, duration: 0.35 }}
          className="flex items-center gap-2 rounded-lg bg-background/60 border border-border/40 px-3 py-2"
        >
          <row.icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <span className="text-[10px] text-muted-foreground w-14 shrink-0">{row.label}</span>
          <span className="text-[11px] font-semibold">{row.value}</span>
        </motion.div>
      ))}
      {/* Complaint typing */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.3 }}
        className="rounded-lg bg-background/60 border border-border/40 px-3 py-2.5"
      >
        <p className="text-[10px] text-muted-foreground mb-1">Complaint</p>
        <p className="text-[11px] font-medium min-h-[1.2em]">
          {typed}
          <span className="animate-pulse border-r-2 border-accent ml-0.5 inline-block h-3" />
        </p>
      </motion.div>
      {/* Checklist */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.35 }}
        className="rounded-lg bg-background/60 border border-border/40 p-2.5"
      >
        <p className="text-[10px] text-muted-foreground mb-1.5">Pre-inspection Checklist</p>
        <div className="grid grid-cols-3 gap-1.5">
          {['Wipers', 'Tyres', 'Lights', 'AC', 'Brakes', 'Fuel'].map((item, i) => (
            <motion.div
              key={item}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4 + i * 0.1, duration: 0.3 }}
              className="flex items-center gap-1 text-[9px] text-muted-foreground"
            >
              <CheckCircle2 className="h-2.5 w-2.5 text-emerald-400" />
              {item}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Step 2: Mechanic Assignment ─────────────────────────────────────
function MechanicStep() {
  const [assigned, setAssigned] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setAssigned(true), 1600);
    return () => clearTimeout(t);
  }, []);

  const mechanics = [
    { name: 'Ravi Kumar', spec: 'Engine & Transmission', load: 3, available: false },
    { name: 'Suresh M.', spec: 'Electrical & AC', load: 1, available: false },
    { name: 'Arjun Patil', spec: 'Engine & Brakes', load: 2, available: true },
    { name: 'Deepak S.', spec: 'General Service', load: 0, available: true },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2.5">
      <p className="text-[11px] font-bold text-foreground">Assign Mechanic — MH12ZZ5599</p>
      <p className="text-[10px] text-muted-foreground">AI recommends based on specialization & workload</p>
      <div className="space-y-1.5">
        {mechanics.map((m, i) => (
          <motion.div
            key={m.name}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.15, duration: 0.35 }}
            className={`relative flex items-center justify-between rounded-lg border px-3 py-2.5 transition-all duration-500 ${
              assigned && m.name === 'Arjun Patil'
                ? 'border-emerald-500/50 bg-emerald-500/10'
                : 'border-border/40 bg-background/55'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold ${m.available ? 'bg-emerald-500/15 text-emerald-400' : 'bg-muted text-muted-foreground'}`}>
                {m.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <p className="text-[11px] font-semibold">{m.name}</p>
                <p className="text-[9px] text-muted-foreground">{m.spec}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-right">
              <div>
                <p className="text-[9px] text-muted-foreground">{m.load} active jobs</p>
                <p className={`text-[9px] font-semibold ${m.available ? 'text-emerald-400' : 'text-muted-foreground'}`}>
                  {m.available ? 'Available' : 'Busy'}
                </p>
              </div>
              {assigned && m.name === 'Arjun Patil' && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300 }}>
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                </motion.div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
      {assigned && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-2.5"
        >
          <p className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="h-3 w-3" /> Arjun Patil assigned. Customer notified via SMS.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}

// ─── Step 3: Invoice ─────────────────────────────────────────────────
function InvoiceStep() {
  const [visible, setVisible] = useState(0);
  useEffect(() => {
    const t1 = setTimeout(() => setVisible(1), 400);
    const t2 = setTimeout(() => setVisible(2), 900);
    const t3 = setTimeout(() => setVisible(3), 1400);
    const t4 = setTimeout(() => setVisible(4), 1900);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, []);

  const lineItems = [
    { desc: 'Engine Diagnosis', qty: 1, rate: 800, amt: 800 },
    { desc: 'Engine Oil (5W-40, 4L)', qty: 4, rate: 450, amt: 1800 },
    { desc: 'Oil Filter', qty: 1, rate: 350, amt: 350 },
    { desc: 'Labour Charges', qty: 1, rate: 1200, amt: 1200 },
  ];
  const subtotal = 4150;
  const gst = Math.round(subtotal * 0.18);
  const total = subtotal + gst;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-bold text-foreground">GST Invoice — INV-2026-0312</p>
          <p className="text-[9px] text-muted-foreground">MH12ZZ5599 · Vikram Sharma · 16 Mar 2026</p>
        </div>
        <IndianRupee className="h-4 w-4 text-emerald-400" />
      </motion.div>
      {/* Line items */}
      <div className="rounded-lg border border-border/40 bg-background/55 overflow-hidden">
        <div className="grid grid-cols-[1fr_auto_auto] gap-x-3 border-b border-border/30 px-3 py-1.5">
          <span className="text-[9px] font-semibold text-muted-foreground">Description</span>
          <span className="text-[9px] font-semibold text-muted-foreground text-right">Qty</span>
          <span className="text-[9px] font-semibold text-muted-foreground text-right">Amount</span>
        </div>
        {lineItems.map((item, i) => (
          <motion.div
            key={item.desc}
            initial={{ opacity: 0 }}
            animate={{ opacity: visible >= 1 ? 1 : 0 }}
            transition={{ delay: i * 0.15, duration: 0.3 }}
            className="grid grid-cols-[1fr_auto_auto] gap-x-3 px-3 py-1.5 border-b border-border/20 last:border-0"
          >
            <span className="text-[10px]">{item.desc}</span>
            <span className="text-[10px] text-muted-foreground text-right">{item.qty}</span>
            <span className="text-[10px] font-semibold text-right">₹{item.amt.toLocaleString('en-IN')}</span>
          </motion.div>
        ))}
      </div>
      {/* Totals */}
      <motion.div
        animate={{ opacity: visible >= 2 ? 1 : 0 }}
        className="rounded-lg border border-border/40 bg-background/55 p-2.5 space-y-1"
      >
        {[
          { label: 'Subtotal', value: `₹${subtotal.toLocaleString('en-IN')}`, bold: false },
          { label: 'GST (18%)', value: `₹${gst.toLocaleString('en-IN')}`, bold: false },
          { label: 'Total', value: `₹${total.toLocaleString('en-IN')}`, bold: true },
        ].map(r => (
          <div key={r.label} className={`flex justify-between text-[10px] ${r.bold ? 'font-bold text-emerald-400 text-sm' : 'text-muted-foreground'}`}>
            <span>{r.label}</span>
            <span>{r.value}</span>
          </div>
        ))}
      </motion.div>
      {/* Actions */}
      <motion.div animate={{ opacity: visible >= 3 ? 1 : 0 }} className="flex gap-2">
        {['Print PDF', 'Share WhatsApp', 'Gate Pass'].map((btn, i) => (
          <div key={btn} className={`flex-1 rounded-lg border text-center py-1.5 text-[9px] font-semibold cursor-pointer transition-colors ${i === 0 ? 'border-accent/40 bg-accent/10 text-accent' : 'border-border/40 text-muted-foreground'}`}>
            {btn}
          </div>
        ))}
      </motion.div>
      {visible >= 4 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-2 flex items-center gap-2"
        >
          <Bell className="h-3 w-3 text-emerald-400 shrink-0" />
          <p className="text-[9px] text-emerald-400 font-semibold">Invoice sent to customer. Job closed ✓</p>
        </motion.div>
      )}
    </motion.div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────
export function AnimatedDemoReel() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!isPlaying) return;
    const t = setInterval(() => {
      setCurrentStep(s => (s + 1) % STEPS.length);
    }, STEP_DURATION);
    return () => clearInterval(t);
  }, [isPlaying]);

  const StepContent = [DashboardStep, JobCardStep, MechanicStep, InvoiceStep][currentStep];
  const step = STEPS[currentStep];

  return (
    <div className="w-full h-full flex flex-col">
      {/* Step tabs */}
      <div className="flex items-center gap-1 px-4 py-2 border-b border-border/40 bg-card/60 flex-shrink-0 overflow-x-auto">
        {STEPS.map((s, i) => (
          <button
            key={s.id}
            onClick={() => { setCurrentStep(i); setIsPlaying(false); }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-medium whitespace-nowrap transition-all duration-300 ${
              i === currentStep
                ? `${s.bgColor} ${s.color} border font-semibold`
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <s.icon className="h-3 w-3" />
            {s.label}
            {i === currentStep && isPlaying && (
              <span className="ml-1 w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
            )}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-1 shrink-0">
          <button
            onClick={() => setIsPlaying(p => !p)}
            className="text-[9px] px-2 py-1 rounded border border-border/40 text-muted-foreground hover:text-foreground transition-colors"
          >
            {isPlaying ? '⏸ Pause' : '▶ Play'}
          </button>
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto px-4 py-3 min-h-0">
        <AnimatePresence mode="wait">
          <motion.div key={currentStep}>
            <StepContent />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress bar */}
      <div className="h-0.5 bg-border/30 flex-shrink-0">
        {isPlaying && (
          <motion.div
            key={`${currentStep}-progress`}
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: STEP_DURATION / 1000, ease: 'linear' }}
            className={`h-full ${
              ['bg-blue-400', 'bg-violet-400', 'bg-indigo-400', 'bg-emerald-400'][currentStep]
            }`}
          />
        )}
      </div>

      {/* Step dots */}
      <div className="flex items-center justify-center gap-2 py-2 bg-card/40 flex-shrink-0">
        {STEPS.map((_, i) => (
          <button
            key={i}
            onClick={() => { setCurrentStep(i); setIsPlaying(false); }}
            className={`rounded-full transition-all duration-300 ${
              i === currentStep ? 'w-4 h-1.5 bg-accent' : 'w-1.5 h-1.5 bg-border'
            }`}
          />
        ))}
        {!isPlaying && (
          <button
            onClick={() => setIsPlaying(true)}
            className="ml-2 flex items-center gap-1 text-[9px] text-accent hover:text-accent/80 transition-colors"
          >
            Auto-play <ChevronRight className="h-3 w-3" />
          </button>
        )}
      </div>
    </div>
  );
}
