export type JobPriority = "low" | "medium" | "high" | "critical";

/* Spec ranges (degrees) */
export const ALIGNMENT_SPECS = {
  camberFront: { min: -1.5, max: 0.5 },
  camberRear: { min: -1.0, max: 0.5 },
  casterFront: { min: 2.0, max: 5.0 },
  toeFront: { min: -0.15, max: 0.15 },
  toeRear: { min: -0.20, max: 0.10 },
  frontTotalToe: { min: -0.30, max: 0.30 },
  steerAhead: { min: -0.20, max: 0.20 },
  rearTotalToe: { min: -0.20, max: 0.20 },
  thrustAngle: { min: -0.15, max: 0.15 },
} as const;

export type AlignmentSpecKey = keyof typeof ALIGNMENT_SPECS;

export type WheelAlignmentData = {
  leftFront: { camber: number; caster: number; toe: number };
  rightFront: { camber: number; caster: number; toe: number };
  leftRear: { camber: number; toe: number };
  rightRear: { camber: number; toe: number };
  centerline: { 
    frontTotalToe: number; 
    rearTotalToe: number; 
    steerAhead: number; 
    thrustAngle: number;
  };
  lastChecked: string;
  nextCheckDate: string;
  technicianNotes: string;
};

export type BatteryData = {
  voltage: number;
  health: number;
  waterLevel: string;
  lastChecked: string;
  nextCheckDate: string;
  technicianNotes: string;
};

export type JobCardMeta = {
  complaintCategory: string;
  priority: JobPriority;
  appointmentType: "walk_in" | "pickup_drop" | "breakdown";
  serviceAdvisorName: string;
  serviceAdvisorPhone: string;
  engineNumber: string;
  chassisNumber: string;
  fuelLevelIn: string;
  estimatedDeliveryDate: string;
  estimatedDeliveryTime: string;
  customerConcerns: string[];
  inspectionChecklist: {
    rcReceived: boolean;
    insuranceCopyReceived: boolean;
    spareWheelReceived: boolean;
    toolKitReceived: boolean;
    jackHandleReceived: boolean;
    accessoriesIntact: boolean;
  };
  customerAuthorization: boolean;
  termsAccepted: boolean;
  internalObservations: string;
  alignment?: WheelAlignmentData;
  battery?: BatteryData;
};

export type ParsedJobNotes = {
  plainNotes: string;
  meta: JobCardMeta | null;
};

const META_PREFIX = "[JOB_CARD_META]";

export const defaultJobCardMeta: JobCardMeta = {
  complaintCategory: "general_service",
  priority: "medium",
  appointmentType: "walk_in",
  serviceAdvisorName: "",
  serviceAdvisorPhone: "",
  engineNumber: "",
  chassisNumber: "",
  fuelLevelIn: "",
  estimatedDeliveryDate: "",
  estimatedDeliveryTime: "",
  customerConcerns: [],
  inspectionChecklist: {
    rcReceived: false,
    insuranceCopyReceived: false,
    spareWheelReceived: false,
    toolKitReceived: false,
    jackHandleReceived: false,
    accessoriesIntact: false,
  },
  customerAuthorization: false,
  termsAccepted: false,
  internalObservations: "",
  alignment: undefined,
  battery: undefined,
};

export function buildJobNotes(plainNotes: string, meta: JobCardMeta): string {
  const cleanedNotes = plainNotes.trim();
  const payload = `${META_PREFIX}${JSON.stringify(meta)}`;
  if (!cleanedNotes) return payload;
  return `${cleanedNotes}\n\n${payload}`;
}

export function parseJobNotes(notes: string | null | undefined): ParsedJobNotes {
  const raw = notes ?? "";
  const markerIndex = raw.indexOf(META_PREFIX);

  if (markerIndex < 0) {
    return { plainNotes: raw.trim(), meta: null };
  }

  const plainNotes = raw.slice(0, markerIndex).trim();
  const metaJson = raw.slice(markerIndex + META_PREFIX.length).trim();

  try {
    const parsed = JSON.parse(metaJson) as JobCardMeta;
    return {
      plainNotes,
      meta: {
        ...defaultJobCardMeta,
        ...parsed,
        inspectionChecklist: {
          ...defaultJobCardMeta.inspectionChecklist,
          ...(parsed.inspectionChecklist ?? {}),
        },
        customerConcerns: Array.isArray(parsed.customerConcerns) ? parsed.customerConcerns : [],
      },
    };
  } catch {
    return { plainNotes: raw.trim(), meta: null };
  }
}

export function priorityClasses(priority: JobPriority): string {
  if (priority === "critical") return "bg-destructive/15 text-destructive border-destructive/30";
  if (priority === "high") return "bg-warning/20 text-warning border-warning/30";
  if (priority === "medium") return "bg-primary/15 text-primary border-primary/30";
  return "bg-muted text-muted-foreground border-muted";
}

export function isInSpec(value: string | number | undefined, specKey: AlignmentSpecKey): boolean | null {
  const vStr = String(value ?? '');
  if (!vStr || vStr === '' || vStr === '-') return null;
  const num = parseFloat(vStr);
  if (Number.isNaN(num)) return null;
  const spec = ALIGNMENT_SPECS[specKey];
  return num >= spec.min && num <= spec.max;
}
