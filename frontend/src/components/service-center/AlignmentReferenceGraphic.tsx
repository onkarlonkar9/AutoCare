type Reading = {
  label: string;
  value: string;
  range: string;
  ok: boolean;
};

type WheelGroup = {
  title: string;
  readings: Reading[];
};

const frontLeft: WheelGroup = {
  title: 'Left Front',
  readings: [
    { label: 'Camber', value: '-0.7 deg', range: '-1.7 to 0.3', ok: true },
    { label: 'Caster', value: '3.0 deg', range: '2.1 to 4.0', ok: true },
    { label: 'Toe', value: '-0.06 deg', range: '-0.07 to 0.07', ok: true },
  ],
};

const frontRight: WheelGroup = {
  title: 'Right Front',
  readings: [
    { label: 'Camber', value: '-0.9 deg', range: '-1.7 to 0.3', ok: true },
    { label: 'Caster', value: '3.2 deg', range: '2.1 to 4.0', ok: true },
    { label: 'Toe', value: '-0.31 deg', range: '-0.09 to 0.09', ok: false },
  ],
};

const rearLeft: WheelGroup = {
  title: 'Left Rear',
  readings: [
    { label: 'Camber', value: '-1.8 deg', range: '-2.5 to -0.5', ok: true },
    { label: 'Toe', value: '0.03 deg', range: '-0.31 to 0.04', ok: true },
  ],
};

const rearRight: WheelGroup = {
  title: 'Right Rear',
  readings: [
    { label: 'Camber', value: '-1.6 deg', range: '-2.5 to -0.5', ok: true },
    { label: 'Toe', value: '-0.13 deg', range: '-0.04 to 0.31', ok: false },
  ],
};

const centerReadings: Reading[] = [
  { label: 'Front Total Toe', value: '-0.38 deg', range: '-0.18 to 0.55', ok: false },
  { label: 'Steer Ahead', value: '0.12 deg', range: '-0.05 to 0.05', ok: false },
  { label: 'Rear Total Toe', value: '-0.10 deg', range: '-0.08 to 0.62', ok: false },
  { label: 'Thrust Angle', value: '0.08 deg', range: '-0.80 to 0.80', ok: true },
];

function readingClass(ok: boolean) {
  return ok
    ? 'border-success/35 bg-success/10 text-success'
    : 'border-destructive/35 bg-destructive/10 text-destructive';
}

function ReadingPill({ reading }: { reading: Reading }) {
  return (
    <div className={`rounded-lg border px-2.5 py-2 ${readingClass(reading.ok)}`}>
      <p className="text-[10px] uppercase tracking-wide opacity-80">{reading.label}</p>
      <p className="text-xs font-semibold leading-tight mt-0.5">{reading.value}</p>
      <p className="text-[10px] opacity-75 mt-0.5">Spec: {reading.range}</p>
    </div>
  );
}

function WheelBox({ group }: { group: WheelGroup }) {
  return (
    <div className="rounded-xl border border-border/70 bg-card/60 p-3">
      <p className="text-xs font-semibold mb-2">{group.title}</p>
      <div className="space-y-2">
        {group.readings.map((reading) => (
          <ReadingPill key={`${group.title}-${reading.label}`} reading={reading} />
        ))}
      </div>
    </div>
  );
}

export function AlignmentReferenceGraphic() {
  return (
    <div className="rounded-2xl border border-border/70 bg-card/50 p-4">
      <div className="mb-3">
        <p className="text-xs text-muted-foreground uppercase tracking-wider">Reference Graphic</p>
        <h3 className="text-sm font-semibold">Wheel Alignment Snapshot</h3>
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <WheelBox group={frontLeft} />
          <WheelBox group={frontRight} />
        </div>

        <div className="rounded-xl border border-border/70 bg-secondary/30 p-3">
          <p className="text-xs font-semibold mb-2">Centerline Measurements</p>
          <div className="space-y-2">
            {centerReadings.map((reading) => (
              <ReadingPill key={reading.label} reading={reading} />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <WheelBox group={rearLeft} />
          <WheelBox group={rearRight} />
        </div>
      </div>
    </div>
  );
}
