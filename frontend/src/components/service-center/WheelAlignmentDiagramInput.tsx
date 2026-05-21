import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';

type Spec = { min: number; max: number };

type DiagramState = {
  lfCamber: string;
  lfCaster: string;
  lfToe: string;
  rfCamber: string;
  rfCaster: string;
  rfToe: string;
  lrCamber: string;
  lrToe: string;
  rrCamber: string;
  rrToe: string;
  frontTotalToe: string;
  steerAhead: string;
  rearTotalToe: string;
  thrustAngle: string;
};

type FieldStatus = 'empty' | 'ok' | 'bad';

export const specs = {
  camberFront: { min: -1.7, max: 0.3 },
  casterFront: { min: 2.1, max: 4.0 },
  toeFront: { min: -0.07, max: 0.07 },
  toeRear: { min: -0.08, max: 0.62 },
};

const centerlineSpecs: Record<'frontTotalToe' | 'steerAhead' | 'rearTotalToe' | 'thrustAngle', Spec> = {
  frontTotalToe: { min: -0.18, max: 0.55 },
  steerAhead: { min: -0.05, max: 0.05 },
  rearTotalToe: { min: -0.08, max: 0.62 },
  thrustAngle: { min: -0.8, max: 0.8 },
};

function getStatus(value: string, spec: Spec): FieldStatus {
  if (value === '') return 'empty';
  const num = Number(value);
  if (Number.isNaN(num)) return 'bad';
  return num >= spec.min && num <= spec.max ? 'ok' : 'bad';
}

function fieldClass(status: FieldStatus): string {
  if (status === 'ok') return 'border-success/70 ring-1 ring-success/20';
  if (status === 'bad') return 'border-destructive/70 ring-1 ring-destructive/20';
  return 'border-border';
}

function LabelBadge({ status }: { status: FieldStatus }) {
  return (
    <span
      className={`text-[10px] px-1.5 py-0.5 rounded-md border ${
        status === 'ok'
          ? 'border-success/40 text-success bg-success/10'
          : status === 'bad'
            ? 'border-destructive/40 text-destructive bg-destructive/10'
            : 'border-border text-muted-foreground bg-muted/40'
      }`}
    >
      {status === 'ok' ? 'In Spec' : status === 'bad' ? 'Out Spec' : 'Pending'}
    </span>
  );
}

function NumericField({
  label,
  value,
  status,
  onChange,
}: {
  label: string;
  value: string;
  status: FieldStatus;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <label className="text-[11px] text-muted-foreground">{label}</label>
        <LabelBadge status={status} />
      </div>
      <div className={`flex items-center rounded-lg border bg-background px-2 py-1.5 ${fieldClass(status)}`}>
        <input
          type="number"
          step="0.01"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent text-xs outline-none"
          placeholder="0.00"
        />
        <span className="text-[10px] text-muted-foreground ml-1">deg</span>
      </div>
    </div>
  );
}

function WheelCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border/70 bg-card/80 p-2.5 space-y-2 shadow-sm">
      <p className="text-xs font-semibold">{title}</p>
      {children}
    </div>
  );
}

export function WheelAlignmentDiagramInput() {
  const [values, setValues] = useState<DiagramState>({
    lfCamber: '',
    lfCaster: '',
    lfToe: '',
    rfCamber: '',
    rfCaster: '',
    rfToe: '',
    lrCamber: '',
    lrToe: '',
    rrCamber: '',
    rrToe: '',
    frontTotalToe: '',
    steerAhead: '',
    rearTotalToe: '',
    thrustAngle: '',
  });

  const [savedAt, setSavedAt] = useState('');

  const status = useMemo(() => {
    return {
      lfCamber: getStatus(values.lfCamber, specs.camberFront),
      lfCaster: getStatus(values.lfCaster, specs.casterFront),
      lfToe: getStatus(values.lfToe, specs.toeFront),
      rfCamber: getStatus(values.rfCamber, specs.camberFront),
      rfCaster: getStatus(values.rfCaster, specs.casterFront),
      rfToe: getStatus(values.rfToe, specs.toeFront),
      lrCamber: getStatus(values.lrCamber, { min: -2.5, max: -0.5 }),
      lrToe: getStatus(values.lrToe, specs.toeRear),
      rrCamber: getStatus(values.rrCamber, { min: -2.5, max: -0.5 }),
      rrToe: getStatus(values.rrToe, specs.toeRear),
      frontTotalToe: getStatus(values.frontTotalToe, centerlineSpecs.frontTotalToe),
      steerAhead: getStatus(values.steerAhead, centerlineSpecs.steerAhead),
      rearTotalToe: getStatus(values.rearTotalToe, centerlineSpecs.rearTotalToe),
      thrustAngle: getStatus(values.thrustAngle, centerlineSpecs.thrustAngle),
    };
  }, [values]);

  const setField = (key: keyof DiagramState, val: string) => {
    setValues((prev) => ({ ...prev, [key]: val }));
  };

  const handleSave = () => {
    // Mock state handling - replace with API integration.
    console.log('Wheel alignment saved', values);
    setSavedAt(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }));
  };

  return (
    <div className="rounded-2xl border border-border/70 bg-muted/30 p-3.5 w-full max-w-[360px]">
      <div className="mb-3">
        <h3 className="text-sm font-semibold">Wheel Alignment Entry</h3>
        <p className="text-[11px] text-muted-foreground">Enter readings from alignment machine</p>
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2.5">
          <WheelCard title="Left Front">
            <NumericField label="Camber" value={values.lfCamber} status={status.lfCamber} onChange={(v) => setField('lfCamber', v)} />
            <NumericField label="Caster" value={values.lfCaster} status={status.lfCaster} onChange={(v) => setField('lfCaster', v)} />
            <NumericField label="Toe" value={values.lfToe} status={status.lfToe} onChange={(v) => setField('lfToe', v)} />
          </WheelCard>

          <WheelCard title="Right Front">
            <NumericField label="Camber" value={values.rfCamber} status={status.rfCamber} onChange={(v) => setField('rfCamber', v)} />
            <NumericField label="Caster" value={values.rfCaster} status={status.rfCaster} onChange={(v) => setField('rfCaster', v)} />
            <NumericField label="Toe" value={values.rfToe} status={status.rfToe} onChange={(v) => setField('rfToe', v)} />
          </WheelCard>
        </div>

        <div className="rounded-xl border border-border/70 bg-card/70 p-3">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-semibold">Top View Car Diagram</p>
            <span className="text-[10px] text-muted-foreground">Alignment Axis</span>
          </div>

          <div className="rounded-lg bg-secondary/40 p-2.5 border border-border/60">
            <svg viewBox="0 0 300 110" className="w-full h-20" role="img" aria-label="Top-view car silhouette">
              <rect x="120" y="8" width="60" height="94" rx="18" fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth="2" />
              <rect x="128" y="18" width="44" height="20" rx="8" fill="hsl(var(--muted))" />
              <rect x="128" y="72" width="44" height="20" rx="8" fill="hsl(var(--muted))" />

              <rect x="40" y="12" width="22" height="26" rx="6" fill="hsl(var(--secondary))" stroke="hsl(var(--border))" />
              <rect x="238" y="12" width="22" height="26" rx="6" fill="hsl(var(--secondary))" stroke="hsl(var(--border))" />
              <rect x="40" y="72" width="22" height="26" rx="6" fill="hsl(var(--secondary))" stroke="hsl(var(--border))" />
              <rect x="238" y="72" width="22" height="26" rx="6" fill="hsl(var(--secondary))" stroke="hsl(var(--border))" />

              <line x1="150" y1="4" x2="150" y2="106" stroke="hsl(var(--muted-foreground))" strokeDasharray="4 3" />
              <line x1="74" y1="26" x2="226" y2="26" stroke="hsl(var(--muted-foreground))" strokeDasharray="4 3" />
              <line x1="74" y1="86" x2="226" y2="86" stroke="hsl(var(--muted-foreground))" strokeDasharray="4 3" />
            </svg>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <WheelCard title="Left Rear">
            <NumericField label="Camber" value={values.lrCamber} status={status.lrCamber} onChange={(v) => setField('lrCamber', v)} />
            <NumericField label="Toe" value={values.lrToe} status={status.lrToe} onChange={(v) => setField('lrToe', v)} />
          </WheelCard>

          <WheelCard title="Right Rear">
            <NumericField label="Camber" value={values.rrCamber} status={status.rrCamber} onChange={(v) => setField('rrCamber', v)} />
            <NumericField label="Toe" value={values.rrToe} status={status.rrToe} onChange={(v) => setField('rrToe', v)} />
          </WheelCard>
        </div>

        <div className="rounded-xl border border-border/70 bg-card/80 p-3 space-y-2.5">
          <p className="text-xs font-semibold">Centerline Measurements</p>
          <div className="grid grid-cols-2 gap-2.5">
            <NumericField label="Front Total Toe" value={values.frontTotalToe} status={status.frontTotalToe} onChange={(v) => setField('frontTotalToe', v)} />
            <NumericField label="Steer Ahead" value={values.steerAhead} status={status.steerAhead} onChange={(v) => setField('steerAhead', v)} />
            <NumericField label="Rear Total Toe" value={values.rearTotalToe} status={status.rearTotalToe} onChange={(v) => setField('rearTotalToe', v)} />
            <NumericField label="Thrust Angle" value={values.thrustAngle} status={status.thrustAngle} onChange={(v) => setField('thrustAngle', v)} />
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <Button className="h-8 rounded-lg text-xs gradient-primary text-primary-foreground" onClick={handleSave}>
          Save Alignment Data
        </Button>
        {savedAt && <span className="text-[10px] text-muted-foreground">Saved {savedAt}</span>}
      </div>
    </div>
  );
}
