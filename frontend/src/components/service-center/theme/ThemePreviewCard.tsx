import { cn } from '@/lib/utils';

type ThemePreviewCardProps = {
  label: string;
  colors: [string, string, string];
  selected?: boolean;
  onSelect: () => void;
};

export function ThemePreviewCard({ label, colors, selected, onSelect }: ThemePreviewCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'group relative h-auto w-full overflow-hidden rounded-xl border-2 text-left transition-all duration-300',
        selected 
          ? 'border-ring shadow-[0_0_20px_-3px_var(--ring)] scale-[1.02]' 
          : 'border-border/60 hover:border-foreground/30 hover:scale-[1.01]'
      )}
    >
      <div className="w-full flex justify-between h-full flex-col">
        {/* Gradient Header Mock */}
        <div
          className="h-20 w-full relative p-2 overflow-hidden"
          style={{ background: `linear-gradient(120deg, ${colors[0]}, ${colors[1]}, ${colors[2]})` }}
        >
          {/* Mock UI elements to show the theme in "action" */}
          <div className="absolute inset-0 bg-black/5" />
          <div className="absolute top-2 left-2 right-2 h-[4px] opacity-30 bg-white/40 rounded-full" />
          <div className="absolute top-4 left-2 w-1/3 h-[4px] opacity-50 bg-white/60 rounded-full" />
          
          <div className="absolute bottom-2 left-2 flex gap-1">
            <div className="h-6 w-6 rounded border border-white/20 bg-white/10 backdrop-blur-sm" />
            <div className="h-6 w-12 rounded border border-white/20 bg-white/10 backdrop-blur-sm" />
          </div>
          <div className="absolute bottom-2 right-2 h-6 w-6 rounded-full border border-white/20 bg-white/20 backdrop-blur-sm" />
        </div>
        <div className="px-3 py-2.5 bg-card/90 backdrop-blur supports-[backdrop-filter]:bg-card/75 border-t border-border/40">
          <p className="text-[13px] font-semibold tracking-tight">{label}</p>
        </div>
      </div>
      {/* Glow overlay */}
      {selected && (
        <div className="absolute inset-0 border-2 rounded-xl border-white/10 pointer-events-none" />
      )}
    </button>
  );
}
