import type { ReactNode } from 'react';
import { Wrench } from 'lucide-react';

type WorkshopEmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

export function WorkshopEmptyState({ title, description, action }: WorkshopEmptyStateProps) {
  return (
    <div className="rounded-3xl border border-dashed border-border/70 bg-card/60 px-6 py-12 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-border/50 bg-background text-muted-foreground">
        <Wrench className="h-5 w-5" />
      </div>
      <h2 className="mt-4 text-lg font-semibold">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">{description}</p>
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}
