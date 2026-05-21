import { API_BASE_URL } from '@/integrations/backend/client';
import {
  SC_FEATURE_TOGGLES_KEY,
  SC_EXTENSION_PACKS_KEY,
} from '@/lib/featureExtensions';
import {
  DASHBOARD_THEME_CONFIG_KEY,
} from '@/lib/dashboardTheme';
import { SERVICE_BAYS_STORAGE_KEY } from '@/lib/serviceBays';
import { SC_JOB_QUEUE_KEY } from '@/lib/jobQueue';

const AUTH_TOKEN_KEY = 'autocare_backend_token';

export type ServiceCenterConfigPayload = Partial<{
  featureToggles: unknown;
  extensionPacks: unknown;
  dashboardThemeConfig: unknown;
  branches: unknown;
  machineConfig: unknown;
  reportConfig: unknown;
  workshopSettings: unknown;
  shiftSettings: unknown;
  auditConfig: unknown;
  subscriptionStatus: unknown;
  mechanicShiftProfiles: unknown;
  recentCustomerProfiles: unknown;
  dashboardLayout: unknown;
  serviceBays: unknown;
  jobQueue: unknown;
}>;

function getToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

async function request(path: string, init?: RequestInit) {
  const token = getToken();
  if (!token) return null;
  const resp = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(init?.headers || {}),
    },
  });
  if (!resp.ok) return null;
  return resp.json();
}

export async function loadServiceCenterConfig() {
  return request('/service-center/config');
}

export async function saveServiceCenterConfigPatch(patch: ServiceCenterConfigPayload) {
  return request('/service-center/config', {
    method: 'PUT',
    body: JSON.stringify(patch),
  });
}

export function applyServiceCenterConfigToLocalStorage(config: ServiceCenterConfigPayload | null | undefined) {
  if (!config) return;
  const set = (key: string, value: unknown) => {
    if (value === undefined || value === null) return;
    localStorage.setItem(key, JSON.stringify(value));
  };

  set(SC_FEATURE_TOGGLES_KEY, config.featureToggles);
  set(SC_EXTENSION_PACKS_KEY, config.extensionPacks);
  set(DASHBOARD_THEME_CONFIG_KEY, config.dashboardThemeConfig);
  set('sc-multi-branch-config-v1', config.branches);
  set('sc-wheel-alignment-machine-config-v1', config.machineConfig);
  set('sc-analytics-report-config-v1', config.reportConfig);
  set('sc-workshop-settings-v1', config.workshopSettings);
  set('sc-shift-settings', config.shiftSettings);
  set('sc-settings-audit-v1', config.auditConfig);
  set('sc-subscription-status', config.subscriptionStatus);
  set('sc-mechanic-shift-profiles', config.mechanicShiftProfiles);
  set('sc-recent-customer-profiles', config.recentCustomerProfiles);
  set('sc-dashboard-layout-config-v2', config.dashboardLayout);
  set(SERVICE_BAYS_STORAGE_KEY, config.serviceBays);
  set(SC_JOB_QUEUE_KEY, config.jobQueue);
}

function parseJson(key: string) {
  const raw = localStorage.getItem(key);
  if (!raw) return undefined;
  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}

export function collectServiceCenterConfigFromLocalStorage(): ServiceCenterConfigPayload {
  return {
    featureToggles: parseJson(SC_FEATURE_TOGGLES_KEY),
    extensionPacks: parseJson(SC_EXTENSION_PACKS_KEY),
    dashboardThemeConfig: parseJson(DASHBOARD_THEME_CONFIG_KEY),
    branches: parseJson('sc-multi-branch-config-v1'),
    machineConfig: parseJson('sc-wheel-alignment-machine-config-v1'),
    reportConfig: parseJson('sc-analytics-report-config-v1'),
    workshopSettings: parseJson('sc-workshop-settings-v1'),
    shiftSettings: parseJson('sc-shift-settings'),
    auditConfig: parseJson('sc-settings-audit-v1'),
    subscriptionStatus: parseJson('sc-subscription-status'),
    mechanicShiftProfiles: parseJson('sc-mechanic-shift-profiles'),
    recentCustomerProfiles: parseJson('sc-recent-customer-profiles'),
    dashboardLayout: parseJson('sc-dashboard-layout-config-v2'),
    serviceBays: parseJson(SERVICE_BAYS_STORAGE_KEY),
    jobQueue: parseJson(SC_JOB_QUEUE_KEY),
  };
}
