import { useState, useEffect, useCallback } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Paintbrush } from 'lucide-react';
import { cn } from '@/lib/utils';

type ColorPickerPopoverProps = {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  presetSwatches?: string[];
};

export function ColorPickerPopover({ value, onChange, label, presetSwatches = [] }: ColorPickerPopoverProps) {
  // Use local state for immediate feedback without lagging the global app context
  const [localColor, setLocalColor] = useState(value);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setLocalColor(value);
  }, [value]);

  const handleColorChange = (newColor: string) => {
    setLocalColor(newColor);
    // Realtime update triggers lag on native pickers if the app layout is complex.
    // By separating this, the native color picker feels instantly responsive.
    // We update the real context using a slight debounce or on blur.
  };

  const commitColorChange = useCallback(() => {
    if (localColor !== value) {
      if (/^#?([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(localColor)) {
        onChange(localColor);
      }
    }
  }, [localColor, onChange, value]);

  useEffect(() => {
    // Soft debounce: if user stops dragging the native picker for 300ms, commit.
    // We only commit if the popover is actually open (meaning user is actively picking).
    if (!isOpen) return;
    const timer = setTimeout(() => {
      commitColorChange();
    }, 150);
    return () => clearTimeout(timer);
  }, [localColor, isOpen, commitColorChange]);

  return (
    <div className="space-y-1.5 flex flex-col">
      {label && <span className="text-xs text-muted-foreground font-medium">{label}</span>}
      <Popover open={isOpen} onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) commitColorChange();
      }}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              "flex items-center gap-2 h-9 w-full rounded-md border border-input bg-background/50 px-3 py-1 text-sm shadow-sm transition-colors hover:bg-accent/10 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            )}
          >
            <div 
              className="w-4 h-4 rounded-full border border-border/80 shadow-inner flex-shrink-0 relative overflow-hidden group"
              style={{ backgroundColor: localColor }}
            >
              <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <span className="flex-1 text-left font-mono tracking-wider tabular-nums uppercase text-[13px]">{localColor}</span>
            <Paintbrush className="w-3.5 h-3.5 text-muted-foreground opacity-70" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-3 bg-card/95 backdrop-blur-xl border border-border/60 shadow-xl" align="start">
          <div className="space-y-4">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Custom Hex</span>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={localColor}
                  onChange={(e) => handleColorChange(e.target.value)}
                  className="p-1 h-9 w-14 cursor-pointer shrink-0 border-border/50 bg-background/50"
                />
                <Input
                  type="text"
                  value={localColor.toUpperCase()}
                  onChange={(e) => {
                    const val = e.target.value;
                    setLocalColor(val.startsWith('#') ? val : `#${val}`);
                  }}
                  onBlur={commitColorChange}
                  className="h-9 font-mono uppercase tracking-wider"
                  maxLength={7}
                />
              </div>
            </div>

            {presetSwatches.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Suggested Colors</span>
                <div className="flex flex-wrap gap-2">
                  {presetSwatches.map((swatch) => (
                    <button
                      key={swatch}
                      type="button"
                      onClick={() => {
                        setLocalColor(swatch);
                        onChange(swatch); // Commit instantly for swatches
                      }}
                      className={cn(
                        "w-6 h-6 rounded-full border shadow-sm transition-all relative group",
                        localColor.toLowerCase() === swatch.toLowerCase() ? "ring-2 ring-ring ring-offset-1 border-transparent" : "border-border/60 hover:scale-110"
                      )}
                      style={{ backgroundColor: swatch }}
                      aria-label={`Select color ${swatch}`}
                    />
                  ))}
                </div>
              </div>
            )}
            
            <p className="text-[10px] text-muted-foreground text-center pt-1 border-t border-border/40">
              Dragging the color wheel automatically syncs after a short delay to ensure high performance.
            </p>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
