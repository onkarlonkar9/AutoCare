import { Switch } from '@/components/ui/switch';

type GradientAnimationToggleProps = {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
};

export function GradientAnimationToggle({ checked, onCheckedChange }: GradientAnimationToggleProps) {
  return (
    <div className="rounded-lg border border-border/60 p-3 flex items-center justify-between">
      <div>
        <p className="text-sm font-medium">Enable Animated Gradient</p>
        <p className="text-xs text-muted-foreground">Moves gradient smoothly across the dashboard background.</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}
