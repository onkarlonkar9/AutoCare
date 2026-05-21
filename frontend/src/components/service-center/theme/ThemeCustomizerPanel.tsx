import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DASHBOARD_THEME_PRESET_LABELS,
  DASHBOARD_THEME_PRESETS,
  type DashboardThemeConfig,
  type DashboardThemePreset,
} from '@/lib/dashboardTheme';
import { GradientAnimationToggle } from './GradientAnimationToggle';
import { PatternSelector } from './PatternSelector';
import { ThemePreviewCard } from './ThemePreviewCard';
import { ColorPickerPopover } from './ColorPickerPopover';
import { PaintBucket } from 'lucide-react';

const PRESET_ORDER: DashboardThemePreset[] = [
  'ocean-blue',
  'purple-saas',
  'emerald-automotive',
  'sunset-orange',
  'dark-tech',
  'night-shift-dark',
];

// Provide some nice swatches for quick customized picks
const QUICK_SWATCHES = [
  '#0ea5e9', '#2563eb', '#3b82f6', '#8b5cf6', '#d946ef', 
  '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', 
  '#10b981', '#14b8a6', '#0f172a', '#1e293b', '#334155'
];

type ThemeCustomizerPanelProps = {
  value: DashboardThemeConfig;
  onChange: (next: DashboardThemeConfig) => void;
  onSelectPreset: (preset: DashboardThemePreset) => void;
};

export function ThemeCustomizerPanel({ value, onChange, onSelectPreset }: ThemeCustomizerPanelProps) {
  const handleManualThemeSelection = (preset: DashboardThemePreset) => {
    if (preset === 'custom') {
      onChange({ ...value, preset: 'custom' });
      return;
    }
    onSelectPreset(preset);
  };

  const handleColorChange = (key: keyof DashboardThemeConfig, newColor: string) => {
    onChange({ ...value, preset: 'custom', [key]: newColor });
  };

  return (
    <div className="space-y-8 pb-4">
      {/* 1. Presets Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <PaintBucket className="w-4 h-4 text-primary" /> Curated Themes
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">Select a professionally designed preset theme.</p>
          </div>
          <div className="w-40">
            <Select value={value.preset} onValueChange={(preset) => handleManualThemeSelection(preset as DashboardThemePreset)}>
              <SelectTrigger className="h-8 text-xs bg-background/50 backdrop-blur">
                <SelectValue placeholder="Custom" />
              </SelectTrigger>
              <SelectContent>
                {[...PRESET_ORDER, 'custom' as const].map((preset) => (
                  <SelectItem key={preset} value={preset} className="text-xs">
                    {DASHBOARD_THEME_PRESET_LABELS[preset]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {PRESET_ORDER.map((preset) => {
            const theme = DASHBOARD_THEME_PRESETS[preset];
            return (
              <ThemePreviewCard
                key={preset}
                label={DASHBOARD_THEME_PRESET_LABELS[preset]}
                colors={[theme.gradientFrom, theme.gradientVia, theme.gradientTo]}
                selected={value.preset === preset}
                onSelect={() => onSelectPreset(preset)}
              />
            );
          })}
        </div>
      </section>

      {/* 2. Colors Section */}
      <section className="space-y-4 rounded-xl border border-border/40 bg-muted/20 p-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Advanced Color Controls</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Fine-tune the individual background gradients and accent colors.</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ColorPickerPopover
            label="Primary Brand Color"
            value={value.primaryColor}
            onChange={(c) => handleColorChange('primaryColor', c)}
            presetSwatches={QUICK_SWATCHES}
          />
          <ColorPickerPopover
            label="Accent Color"
            value={value.accentColor}
            onChange={(c) => handleColorChange('accentColor', c)}
            presetSwatches={QUICK_SWATCHES}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-border/40 pt-4">
          <ColorPickerPopover
            label="Gradient Origin"
            value={value.gradientFrom}
            onChange={(c) => handleColorChange('gradientFrom', c)}
            presetSwatches={QUICK_SWATCHES}
          />
          <ColorPickerPopover
            label="Gradient Middle"
            value={value.gradientVia}
            onChange={(c) => handleColorChange('gradientVia', c)}
            presetSwatches={QUICK_SWATCHES}
          />
          <ColorPickerPopover
            label="Gradient End"
            value={value.gradientTo}
            onChange={(c) => handleColorChange('gradientTo', c)}
            presetSwatches={QUICK_SWATCHES}
          />
        </div>
      </section>

      {/* 3. Texture & Motion */}
      <section className="space-y-5">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Texture & Motion</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Add depth and life to the dashboard background.</p>
        </div>

        <div className="bg-background/40 backdrop-blur-sm rounded-xl border border-border/40 p-4 space-y-6">
          <PatternSelector
            value={value.patternMode}
            onChange={(patternMode) => {
              onChange({ ...value, preset: 'custom', patternMode });
            }}
          />

          <div className="border-t border-border/40 pt-6">
            <GradientAnimationToggle
              checked={value.animatedGradient}
              onCheckedChange={(animatedGradient) => onChange({ ...value, preset: 'custom', animatedGradient })}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
