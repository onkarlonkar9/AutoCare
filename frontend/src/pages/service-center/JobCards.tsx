import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useJobCards } from '@/hooks/useData';
import { parseJobNotes, priorityClasses } from '@/lib/jobCardStandards';
import { WorkshopPageHeader } from '@/components/service-center/WorkshopPageHeader';
import { WorkshopEmptyState } from '@/components/service-center/WorkshopEmptyState';

const jobStatusLabels: Record<string, string> = {
  pending: 'Pending',
  in_progress: 'In Progress',
  waiting_parts: 'Waiting Parts',
  completed: 'Completed',
  delivered: 'Delivered and Payment Done',
};

const jobStatusColors: Record<string, string> = {
  pending: 'bg-warning/10 text-warning border-warning/20',
  in_progress: 'bg-primary/10 text-primary border-primary/20',
  waiting_parts: 'bg-destructive/10 text-destructive border-destructive/20',
  completed: 'bg-success/10 text-success border-success/20',
  delivered: 'bg-muted text-muted-foreground border-muted',
};

const JobCards = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { data: jobs = [], isLoading } = useJobCards();

  const openJobs = jobs.filter((job) => job.status !== 'delivered').length;
  const deliveredJobs = jobs.filter((job) => job.status === 'delivered').length;

  const filtered = jobs.filter((job) => {
    if (statusFilter !== 'all' && job.status !== statusFilter) return false;
    const text = `${job.customer_name} ${job.vehicle_number} ${job.vehicle_model} ${job.problem_description} ${job.mechanic_name}`.toLowerCase();
    return text.includes(search.toLowerCase());
  });

  return (
    <div className="max-w-6xl space-y-6">
      <WorkshopPageHeader
        eyebrow="Workshop"
        title="Job Cards"
        description="Search, review, and manage active and completed workshop jobs from one place."
        breadcrumbs={[
          <Link key="workshop" to="/service-center" className="hover:text-foreground transition-colors">
            Workshop
          </Link>,
          'Job Cards',
        ]}
        meta={
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="rounded-full px-3 py-1 text-[11px] font-medium">
              {jobs.length} total
            </Badge>
            <Badge variant="secondary" className="rounded-full px-3 py-1 text-[11px] font-medium">
              {openJobs} open
            </Badge>
            <Badge variant="secondary" className="rounded-full px-3 py-1 text-[11px] font-medium">
              {deliveredJobs} delivered
            </Badge>
          </div>
        }
        actions={
          <Link to="/service-center/jobs/create">
            <Button className="h-10 rounded-xl bg-foreground px-4 text-background hover:bg-foreground/90">
              <Plus className="mr-1.5 h-4 w-4" /> New Job Card
            </Button>
          </Link>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-border/50 bg-card/70 p-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">Active Work</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight">{openJobs}</p>
          <p className="mt-1 text-xs text-muted-foreground">Jobs still moving through the workshop.</p>
        </div>
        <div className="rounded-2xl border border-border/50 bg-card/70 p-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">Delivered</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight">{deliveredJobs}</p>
          <p className="mt-1 text-xs text-muted-foreground">Closed jobs that already reached the customer.</p>
        </div>
        <div className="rounded-2xl border border-border/50 bg-card/70 p-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">Current Results</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight">{filtered.length}</p>
          <p className="mt-1 text-xs text-muted-foreground">Jobs matching your current search and filters.</p>
        </div>
      </div>

      <div className="rounded-3xl border border-border/50 bg-card/70 p-4">
        <div className="mb-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Find a job</p>
          <p className="mt-1 text-sm text-muted-foreground">Search by customer, vehicle, model, concern, or assigned mechanic.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search job cards..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="h-11 rounded-xl border-border/50 bg-background pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-11 w-full rounded-xl border-border/50 bg-background sm:w-[220px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {Object.entries(jobStatusLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((item) => (
            <Skeleton key={item} className="h-32 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <WorkshopEmptyState
          title={jobs.length === 0 ? 'No job cards yet' : 'No matching job cards'}
          description={
            jobs.length === 0
              ? 'Create your first job card to start tracking workshop work, estimates, and delivery status.'
              : 'Try another search term or clear the filters to see more results.'
          }
          action={
            jobs.length === 0 ? (
              <Link to="/service-center/jobs/create">
                <Button className="h-10 rounded-xl bg-foreground px-4 text-background hover:bg-foreground/90">
                  <Plus className="mr-1.5 h-4 w-4" /> Create Job Card
                </Button>
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((job) => (
            <Link key={job.id} to={`/service-center/jobs/${job.id}`}>
              <div className="glass-card-hover rounded-2xl border border-border/40 p-5">
                {(() => {
                  const parsed = parseJobNotes(job.notes);
                  const meta = parsed.meta;

                  return (
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                          <span className="font-semibold">{job.customer_name}</span>
                          <span className="text-xs font-mono text-muted-foreground">{job.vehicle_number}</span>
                          <Badge className={`flex items-center gap-1.5 border px-2.5 py-1 text-xs font-semibold ${jobStatusColors[job.status] || ''}`}>
                            {job.status === 'delivered' && <Check className="h-5 w-5 text-emerald-600" strokeWidth={4} />}
                            {jobStatusLabels[job.status] || job.status}
                          </Badge>
                          {meta && <Badge className={`border text-xs ${priorityClasses(meta.priority)}`}>{meta.priority.toUpperCase()}</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {job.vehicle_model} • {job.mileage.toLocaleString()} km
                        </p>
                        <p className="mt-2 text-sm">{job.problem_description}</p>
                        {job.service_tasks && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {job.service_tasks.map((task) => (
                              <Badge key={task} variant="secondary" className="text-xs">
                                {task}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex-shrink-0 text-right">
                        <p className="font-semibold">Rs.{Number(job.actual_cost || job.estimated_cost).toLocaleString()}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{job.mechanic_name || 'Unassigned'}</p>
                        {meta?.estimatedDeliveryDate && (
                          <p className="text-xs text-muted-foreground">
                            ETA: {new Date(meta.estimatedDeliveryDate).toLocaleDateString()}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">{new Date(job.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default JobCards;
