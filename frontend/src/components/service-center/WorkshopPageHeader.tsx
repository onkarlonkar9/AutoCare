import type { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

type WorkshopPageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  breadcrumbs?: ReactNode[];
  meta?: ReactNode;
  actions?: ReactNode;
  className?: string;
};

export function WorkshopPageHeader({
  eyebrow,
  title,
  description,
  breadcrumbs = [],
  meta,
  actions,
  className,
}: WorkshopPageHeaderProps) {
  return (
    <header className={cn('space-y-4 border-b border-border/50 pb-5', className)}>
      {breadcrumbs.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          {breadcrumbs.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              {index > 0 && <ChevronRight className="h-3.5 w-3.5 opacity-60" />}
              <span>{item}</span>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          {eyebrow && (
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {eyebrow}
            </p>
          )}
          <div className="space-y-1.5">
            <h1 className="text-3xl font-display font-semibold tracking-tight">{title}</h1>
            {description && <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">{description}</p>}
          </div>
          {meta}
        </div>

        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </header>
  );
}
