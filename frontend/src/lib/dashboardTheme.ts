import { getSCExtensionPacks } from '@/lib/featureExtensions';

export const DASHBOARD_THEME_CONFIG_KEY = 'sc-dashboard-theme-config-v2';
export const DASHBOARD_THEME_KEY = 'dashboardTheme';
export const DASHBOARD_PATTERN_KEY = 'dashboardPattern';
export const DASHBOARD_ANIMATION_KEY = 'dashboardAnimation';

export type DashboardThemePreset =
  | 'ocean-blue'
  | 'purple-saas'
  | 'emerald-automotive'
  | 'sunset-orange'
  | 'dark-tech'
  | 'night-shift-dark'
  | 'custom';

export type DashboardPatternMode = 'none' | 'dot-grid' | 'tech-grid' | 'diagonal-lines' | 'mesh-pattern';

export type DashboardThemeConfig = {
  preset: DashboardThemePreset;
  primaryColor: string;
  accentColor: string;
  gradientFrom: string;
  gradientVia: string;
  gradientTo: string;
  patternMode: DashboardPatternMode;
  animatedGradient: boolean;
};

export const DASHBOARD_THEME_PRESETS: Record<DashboardThemePreset, Omit<DashboardThemeConfig, 'preset'>> = {
  'ocean-blue': {
    primaryColor: '#1e3a8a',
    accentColor: '#0ea5e9',
    gradientFrom: '#0ea5e9',
    gradientVia: '#2563eb',
    gradientTo: '#1e3a8a',
    patternMode: 'tech-grid',
    animatedGradient: false,
  },
  'purple-saas': {
    primaryColor: '#312e81',
    accentColor: '#8b5cf6',
    gradientFrom: '#6366f1',
    gradientVia: '#8b5cf6',
    gradientTo: '#a855f7',
    patternMode: 'dot-grid',
    animatedGradient: false,
  },
  'emerald-automotive': {
    primaryColor: '#065f46',
    accentColor: '#10b981',
    gradientFrom: '#059669',
    gradientVia: '#10b981',
    gradientTo: '#34d399',
    patternMode: 'mesh-pattern',
    animatedGradient: false,
  },
  'sunset-orange': {
    primaryColor: '#7c2d12',
    accentColor: '#fb7185',
    gradientFrom: '#f97316',
    gradientVia: '#fb7185',
    gradientTo: '#f43f5e',
    patternMode: 'diagonal-lines',
    animatedGradient: false,
  },
  'dark-tech': {
    primaryColor: '#312e81',
    accentColor: '#94a3b8',
    gradientFrom: '#0f172a',
    gradientVia: '#1e293b',
    gradientTo: '#312e81',
    patternMode: 'tech-grid',
    animatedGradient: false,
  },
  'night-shift-dark': {
    primaryColor: '#111827',
    accentColor: '#22d3ee',
    gradientFrom: '#020617',
    gradientVia: '#0f172a',
    gradientTo: '#1d4ed8',
    patternMode: 'dot-grid',
    animatedGradient: false,
  },
  custom: {
    primaryColor: '#1f2937',
    accentColor: '#2563eb',
    gradientFrom: '#1f2937',
    gradientVia: '#2563eb',
    gradientTo: '#2563eb',
    patternMode: 'none',
    animatedGradient: false,
  },
};

export const DEFAULT_DASHBOARD_THEME_CONFIG: DashboardThemeConfig = {
  preset: 'ocean-blue',
  ...DASHBOARD_THEME_PRESETS['ocean-blue'],
};

export const DASHBOARD_THEME_PRESET_LABELS: Record<DashboardThemePreset, string> = {
  'ocean-blue': 'Ocean Blue',
  'purple-saas': 'Purple SaaS',
  'emerald-automotive': 'Emerald Automotive',
  'sunset-orange': 'Sunset Orange',
  'dark-tech': 'Dark Tech',
  'night-shift-dark': 'Night Shift Dark',
  custom: 'Custom',
};

export function getDashboardThemeConfig(): DashboardThemeConfig {
  try {
    const rawPreset = localStorage.getItem(DASHBOARD_THEME_KEY) as DashboardThemePreset | null;
    const rawPattern = localStorage.getItem(DASHBOARD_PATTERN_KEY) as DashboardPatternMode | null;
    const rawAnimation = localStorage.getItem(DASHBOARD_ANIMATION_KEY);
    const raw = localStorage.getItem(DASHBOARD_THEME_CONFIG_KEY);
    const parsed = raw ? (JSON.parse(raw) as Partial<DashboardThemeConfig>) : {};

    const parsedPreset = parsed.preset;
    const preset = (rawPreset && rawPreset in DASHBOARD_THEME_PRESETS
      ? rawPreset
      : parsedPreset && parsedPreset in DASHBOARD_THEME_PRESETS
        ? parsedPreset
        : DEFAULT_DASHBOARD_THEME_CONFIG.preset) as DashboardThemePreset;
    const presetDefaults = DASHBOARD_THEME_PRESETS[preset] || DASHBOARD_THEME_PRESETS['ocean-blue'];
    const validPatterns: DashboardPatternMode[] = ['none', 'dot-grid', 'tech-grid', 'diagonal-lines', 'mesh-pattern'];
    const pattern = validPatterns.includes(rawPattern as DashboardPatternMode)
      ? (rawPattern as DashboardPatternMode)
      : validPatterns.includes(parsed.patternMode as DashboardPatternMode)
        ? (parsed.patternMode as DashboardPatternMode)
        : presetDefaults.patternMode;
    const animatedGradient = rawAnimation === null
      ? (parsed.animatedGradient ?? presetDefaults.animatedGradient)
      : rawAnimation === 'true';

    return {
      preset,
      primaryColor: parsed.primaryColor || presetDefaults.primaryColor,
      accentColor: parsed.accentColor || presetDefaults.accentColor,
      gradientFrom: parsed.gradientFrom || presetDefaults.gradientFrom,
      gradientVia: parsed.gradientVia || presetDefaults.gradientVia,
      gradientTo: parsed.gradientTo || presetDefaults.gradientTo,
      patternMode: pattern,
      animatedGradient,
    };
  } catch {
    localStorage.removeItem(DASHBOARD_THEME_CONFIG_KEY);
    return DEFAULT_DASHBOARD_THEME_CONFIG;
  }
}

export function persistDashboardThemeConfig(config: DashboardThemeConfig) {
  localStorage.setItem(DASHBOARD_THEME_CONFIG_KEY, JSON.stringify(config));
  localStorage.setItem(DASHBOARD_THEME_KEY, config.preset);
  localStorage.setItem(DASHBOARD_PATTERN_KEY, config.patternMode);
  localStorage.setItem(DASHBOARD_ANIMATION_KEY, String(config.animatedGradient));
}

export function hexToHsl(value: string): string {
  if (!/^#?([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(value)) return '0 0% 0%';
  const hex = value.replace('#', '');
  const normalized = hex.length === 3 ? hex.split('').map((c) => `${c}${c}`).join('') : hex;

  const r = parseInt(normalized.slice(0, 2), 16) / 255;
  const g = parseInt(normalized.slice(2, 4), 16) / 255;
  const b = parseInt(normalized.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h /= 6;
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

export function getContrastForegroundHsl(hexColor: string): string {
  if (!/^#?([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(hexColor)) return '0 0% 98%';
  const hex = hexColor.replace('#', '');
  const normalized = hex.length === 3 ? hex.split('').map((c) => `${c}${c}`).join('') : hex;

  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);

  // YIQ equation from YIQ color space for calculating perceived brightness
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  
  // If yiq >= 128, background is light, so return a dark text foreground HSL (e.g., 240 10% 10%).
  // Else, background is dark, so return a light text foreground HSL (e.g., 0 0% 98%).
  return yiq >= 128 ? '240 10% 10%' : '0 0% 98%';
}
