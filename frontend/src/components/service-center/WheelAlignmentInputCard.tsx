import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

type AlignmentSpecs = {
  camberFront: { min: number; max: number };
  camberRear: { min: number; max: number };
  casterFront: { min: number; max: number };
  toeFront: { min: number; max: number };
  toeRear: { min: number; max: number };
  frontTotalToe: { min: number; max: number };
  steerAhead: { min: number; max: number };
  rearTotalToe: { min: number; max: number };
  thrustAngle: { min: number; max: number };
};

export const alignmentSpecs: AlignmentSpecs = {
  camberFront: { min: -1.7, max: 0.3 },
  camberRear: { min: -2.5, max: -0.5 },
  casterFront: { min: 2.1, max: 4.0 },
  toeFront: { min: -0.07, max: 0.07 },
  toeRear: { min: -0.08, max: 0.62 },
  frontTotalToe: { min: -0.18, max: 0.55 },
  steerAhead: { min: -0.05, max: 0.05 },
  rearTotalToe: { min: -0.08, max: 0.62 },
  thrustAngle: { min: -0.8, max: 0.8 },
};

type AlignmentForm = {
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

type FieldStatus = 'empty' | 'in-spec' | 'out-spec';

type MeasurementFieldProps = {
  label: string;
  value: string;
  status: FieldStatus;
  onChange: (value: string) => void;
};

function MeasurementField({ label, value, status, onChange }: MeasurementFieldProps) {
  const statusClass =
    status === 'in-spec'
      ? 'border-success/60 ring-1 ring-success/25'
      : status === 'out-spec'
        ? 'border-destructive/60 ring-1 ring-destructive/25'
        : 'border-border';

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <p className="text-[11px] text-muted-foreground font-medium">{label}</p>
        <Badge
          variant="outline"
          className={`h-5 text-[10px] ${
            status === 'in-spec'
              ? 'border-success/40 text-success'
              : status === 'out-spec'
                ? 'border-destructive/40 text-destructive'
                : 'text-muted-foreground'
          }`}
        >
          {status === 'in-spec' ? 'In Spec' : status === 'out-spec' ? 'Out Spec' : 'Pending'}
        </Badge>
      </div>
      <div className={`flex items-center rounded-lg border bg-background px-2.5 py-2 ${statusClass}`}>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          type="number"
          step="0.01"
          className="w-full bg-transparent text-sm outline-none"
          placeholder="0.00"
        />
        <span className="text-[10px] text-muted-foreground ml-2">deg</span>
      </div>
    </div>
  );
}

function WheelCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border/70 bg-card/70 p-3 space-y-2.5">
      <p className="text-xs font-semibold">{title}</p>
      {children}
    </div>
  );
}

export function WheelAlignmentInputCard() {
  const [form, setForm] = useState<AlignmentForm>({
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

  const [lastSavedAt, setLastSavedAt] = useState<string>('');

  const statuses = useMemo(() => {
    const getStatus = (rawValue: string, spec: { min: number; max: number }): FieldStatus => {
      if (rawValue === '') return 'empty';
      const value = Number(rawValue);
      if (Number.isNaN(value)) return 'out-spec';
      return value >= spec.min && value <= spec.max ? 'in-spec' : 'out-spec';
    };

    return {
      lfCamber: getStatus(form.lfCamber, alignmentSpecs.camberFront),
      lfCaster: getStatus(form.lfCaster, alignmentSpecs.casterFront),
      lfToe: getStatus(form.lfToe, alignmentSpecs.toeFront),
      rfCamber: getStatus(form.rfCamber, alignmentSpecs.camberFront),
      rfCaster: getStatus(form.rfCaster, alignmentSpecs.casterFront),
      rfToe: getStatus(form.rfToe, alignmentSpecs.toeFront),
      lrCamber: getStatus(form.lrCamber, alignmentSpecs.camberRear),
      lrToe: getStatus(form.lrToe, alignmentSpecs.toeRear),
      rrCamber: getStatus(form.rrCamber, alignmentSpecs.camberRear),
      rrToe: getStatus(form.rrToe, alignmentSpecs.toeRear),
      frontTotalToe: getStatus(form.frontTotalToe, alignmentSpecs.frontTotalToe),
      steerAhead: getStatus(form.steerAhead, alignmentSpecs.steerAhead),
      rearTotalToe: getStatus(form.rearTotalToe, alignmentSpecs.rearTotalToe),
      thrustAngle: getStatus(form.thrustAngle, alignmentSpecs.thrustAngle),
    };
  }, [form]);

  const setField = (key: keyof AlignmentForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    // Mock state handling: replace with API call when backend endpoint is ready.
    console.log('Alignment data saved:', form);
    setLastSavedAt(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }));
  };

  return (
    <div className="rounded-2xl border border-border/70 bg-card/50 p-4">
      <div className="mb-3">
        <h3 className="text-sm font-semibold">Wheel Alignment Entry</h3>
        <p className="text-[11px] text-muted-foreground">Enter readings from alignment machine</p>
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2.5">
          <WheelCard title="Left Front">
            <MeasurementField label="Camber" value={form.lfCamber} status={statuses.lfCamber} onChange={(v) => setField('lfCamber', v)} />
            <MeasurementField label="Caster" value={form.lfCaster} status={statuses.lfCaster} onChange={(v) => setField('lfCaster', v)} />
            <MeasurementField label="Toe" value={form.lfToe} status={statuses.lfToe} onChange={(v) => setField('lfToe', v)} />
          </WheelCard>

          <WheelCard title="Right Front">
            <MeasurementField label="Camber" value={form.rfCamber} status={statuses.rfCamber} onChange={(v) => setField('rfCamber', v)} />
            <MeasurementField label="Caster" value={form.rfCaster} status={statuses.rfCaster} onChange={(v) => setField('rfCaster', v)} />
            <MeasurementField label="Toe" value={form.rfToe} status={statuses.rfToe} onChange={(v) => setField('rfToe', v)} />
          </WheelCard>
        </div>

        <div className="rounded-xl border border-border/70 bg-secondary/35 p-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold">Center Measurements</p>
            <span className="text-[10px] text-muted-foreground">Top-View Alignment Diagram</span>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <MeasurementField label="Front Total Toe" value={form.frontTotalToe} status={statuses.frontTotalToe} onChange={(v) => setField('frontTotalToe', v)} />
            <MeasurementField label="Steer Ahead" value={form.steerAhead} status={statuses.steerAhead} onChange={(v) => setField('steerAhead', v)} />
            <MeasurementField label="Rear Total Toe" value={form.rearTotalToe} status={statuses.rearTotalToe} onChange={(v) => setField('rearTotalToe', v)} />
            <MeasurementField label="Thrust Angle" value={form.thrustAngle} status={statuses.thrustAngle} onChange={(v) => setField('thrustAngle', v)} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <WheelCard title="Left Rear">
            <MeasurementField label="Camber" value={form.lrCamber} status={statuses.lrCamber} onChange={(v) => setField('lrCamber', v)} />
            <MeasurementField label="Toe" value={form.lrToe} status={statuses.lrToe} onChange={(v) => setField('lrToe', v)} />
          </WheelCard>

          <WheelCard title="Right Rear">
            <MeasurementField label="Camber" value={form.rrCamber} status={statuses.rrCamber} onChange={(v) => setField('rrCamber', v)} />
            <MeasurementField label="Toe" value={form.rrToe} status={statuses.rrToe} onChange={(v) => setField('rrToe', v)} />
          </WheelCard>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-2">
        <Button className="h-8 text-xs rounded-lg gradient-primary text-primary-foreground" onClick={handleSave}>
          Save Alignment Data
        </Button>
        {lastSavedAt && <span className="text-[10px] text-muted-foreground">Saved at {lastSavedAt}</span>}
      </div>
    </div>
  );
}
