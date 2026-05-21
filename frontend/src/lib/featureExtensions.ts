export const SC_FEATURE_TOGGLES_KEY = 'sc-feature-toggles-v1';
export const SC_EXTENSION_PACKS_KEY = 'sc-extension-packs-v1';

export type SCFeatureKey =
  | 'dashboard'
  | 'jobs'
  | 'customers'
  | 'mechanics'
  | 'lookup'
  | 'analytics'
  | 'inventory';

export type SCFeatureToggles = Record<SCFeatureKey, boolean>;

export type SCExtensionPacks = {
  dashboardLayoutDragDrop: boolean;
  wheelAlignmentMachineConnect: boolean;
  workshopAnalyticsReportGenerator: boolean;
  dashboardThemeCustomizer: boolean;
  serviceBayCustomNames: boolean;
  multiBranchManagement: boolean;
  advancedVehicleDiagnostics: boolean;
};

export const DEFAULT_SC_FEATURE_TOGGLES: SCFeatureToggles = {
  dashboard: true,
  jobs: true,
  customers: true,
  mechanics: true,
  lookup: true,
  analytics: true,
  inventory: true,
};

export const DEFAULT_SC_EXTENSION_PACKS: SCExtensionPacks = {
  dashboardLayoutDragDrop: false,
  wheelAlignmentMachineConnect: false,
  workshopAnalyticsReportGenerator: false,
  dashboardThemeCustomizer: false,
  serviceBayCustomNames: false,
  multiBranchManagement: false,
  advancedVehicleDiagnostics: false,
};

export type SCFeatureMetadata = {
  key: SCFeatureKey;
  label: string;
  description: string;
  category: 'Operations' | 'Insights';
  icon: string;
};

export const SC_FEATURES: SCFeatureMetadata[] = [
  { key: 'dashboard', label: 'Dashboard', description: 'Workshop summary, kanban board, and operational overview.', category: 'Operations', icon: 'LayoutDashboard' },
  { key: 'jobs', label: 'Job Cards', description: 'Create, manage, and track all service job cards.', category: 'Operations', icon: 'ClipboardList' },
  { key: 'customers', label: 'Customers', description: 'Customer profiles, visits, and spending history.', category: 'Operations', icon: 'Users' },
  { key: 'mechanics', label: 'Mechanics', description: 'Mechanic roster, assignment status, and performance.', category: 'Operations', icon: 'Wrench' },
  { key: 'lookup', label: 'Vehicle Lookup', description: 'Quickly search and inspect vehicle-related details.', category: 'Operations', icon: 'Car' },
  { key: 'analytics', label: 'Analytics', description: 'Revenue, productivity, and workshop KPIs.', category: 'Insights', icon: 'BarChart' },
];

export type SCExtensionKey = keyof SCExtensionPacks;

export type SCExtensionMetadata = {
  key: SCExtensionKey;
  label: string;
  description: string;
  category: 'Workflow' | 'Integration' | 'Appearance' | 'Insights' | 'Operations';
  icon: string;
};

export const SC_EXTENSIONS: SCExtensionMetadata[] = [
  {
    key: 'dashboardLayoutDragDrop',
    label: 'Dashboard Layout Drag & Drop',
    description: 'Users can drag, drop, hide, and reorder dashboard sections.',
    category: 'Workflow',
    icon: 'GripVertical'
  },
  {
    key: 'wheelAlignmentMachineConnect',
    label: 'Wheel Alignment Machine Direct Connect',
    description: 'Pull direct wheel alignment readings from your machine link.',
    category: 'Integration',
    icon: 'Radar'
  },
  {
    key: 'workshopAnalyticsReportGenerator',
    label: 'Workshop Analytics Report Generator',
    description: 'Analyze complete workshop analytics and generate management-ready reports.',
    category: 'Insights',
    icon: 'FileText'
  },
  {
    key: 'dashboardThemeCustomizer',
    label: 'Dashboard Theme Customizer',
    description: 'Change dashboard theme, colors, and gradients when enabled.',
    category: 'Appearance',
    icon: 'Palette'
  },
  {
    key: 'serviceBayCustomNames',
    label: 'Service Bay Custom Names',
    description: 'Let users rename bay labels like Alignment Bay, Express Bay, or Paint Bay.',
    category: 'Workflow',
    icon: 'Type'
  },
  {
    key: 'multiBranchManagement',
    label: 'Multi-Branch Management',
    description: 'Manage multiple workshop locations, inventory sync, and branch switching.',
    category: 'Workflow',
    icon: 'Building2'
  },
  {
    key: 'advancedVehicleDiagnostics',
    label: 'Advanced Vehicle Diagnostics',
    description: 'Interactive 360° visual inspection maps, interactive car diagrams, and damage tracking.',
    category: 'Operations',
    icon: 'Activity'
  },
];

export function getSCFeatureToggles(): SCFeatureToggles {
  try {
    const raw = localStorage.getItem(SC_FEATURE_TOGGLES_KEY);
    if (!raw) return DEFAULT_SC_FEATURE_TOGGLES;
    const parsed = JSON.parse(raw) as Partial<SCFeatureToggles>;
    return { ...DEFAULT_SC_FEATURE_TOGGLES, ...parsed };
  } catch {
    localStorage.removeItem(SC_FEATURE_TOGGLES_KEY);
    return DEFAULT_SC_FEATURE_TOGGLES;
  }
}

export function setSCFeatureToggles(next: SCFeatureToggles) {
  localStorage.setItem(SC_FEATURE_TOGGLES_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent('sc-feature-toggles-updated', { detail: next }));
}

export function getSCExtensionPacks(): SCExtensionPacks {
  try {
    const raw = localStorage.getItem(SC_EXTENSION_PACKS_KEY);
    if (!raw) return DEFAULT_SC_EXTENSION_PACKS;
    const parsed = JSON.parse(raw) as Partial<SCExtensionPacks>;
    return { ...DEFAULT_SC_EXTENSION_PACKS, ...parsed };
  } catch {
    localStorage.removeItem(SC_EXTENSION_PACKS_KEY);
    return DEFAULT_SC_EXTENSION_PACKS;
  }
}

export function setSCExtensionPacks(next: SCExtensionPacks) {
  localStorage.setItem(SC_EXTENSION_PACKS_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent('sc-extension-packs-updated', { detail: next }));
}
