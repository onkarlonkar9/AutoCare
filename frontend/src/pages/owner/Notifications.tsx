import { Bell, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { aiAlerts } from '@/data/mockData';

const icons = {
  warning: AlertTriangle,
  destructive: AlertTriangle,
  success: CheckCircle,
  info: Info,
};

const Notifications = () => {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Bell className="h-6 w-6" /> Notifications</h1>
        <p className="text-muted-foreground text-sm">AI alerts and maintenance reminders</p>
      </div>

      <div className="space-y-3">
        {aiAlerts.map(alert => {
          const Icon = icons[alert.type] || Info;
          return (
            <div key={alert.id} className="glass-card-hover rounded-xl p-5 flex items-start gap-4">
              <Icon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                alert.type === 'warning' ? 'text-warning' :
                alert.type === 'destructive' ? 'text-destructive' :
                alert.type === 'success' ? 'text-success' : 'text-primary'
              }`} />
              <div className="flex-1">
                <p className="font-medium">{alert.title}</p>
                <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
              </div>
              <Badge variant="outline" className="flex-shrink-0">{alert.date}</Badge>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Notifications;
