import { Button } from '@/components/ui/button';
import type { DashboardPatternMode } from '@/lib/dashboardTheme';
import { cn } from '@/lib/utils';

const PATTERN_OPTIONS: Array<{ value: DashboardPatternMode; label: string }> = [
  { value: 'none', label: 'None' },
  { value: 'dot-grid', label: 'Dot Grid' },
  { value: 'tech-grid', label: 'Tech Grid' },
  { value: 'diagonal-lines', label: 'Diagonal Lines' },
  { value: 'mesh-pattern', label: 'Mesh Pattern' },
];

type PatternSelectorProps = {
  value: DashboardPatternMode;
  onChange: (value: DashboardPatternMode) => void;
};

export function PatternSelector({ value, onChange }: PatternSelectorProps) {
  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">Background Pattern</p>
      <div className="flex flex-wrap gap-2">
        {PATTERN_OPTIONS.map((option) => (
          <Button
            key={option.value}
            type="button"
            variant={value === option.value ? 'default' : 'outline'}
            onClick={() => onChange(option.value)}
            className={cn('h-7 text-[11px]')}
          >
            {option.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
