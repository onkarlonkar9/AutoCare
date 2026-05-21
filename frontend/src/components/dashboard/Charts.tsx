import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, ScatterChart, Scatter } from 'recharts';
import { monthlyMaintenanceCost, serviceFrequency, mileageVsMaintenance } from '@/data/mockData';

export function MaintenanceCostChart() {
  return (
    <div className="glass-card rounded-xl p-6">
      <h3 className="font-semibold mb-4">Monthly Maintenance Cost</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={monthlyMaintenanceCost}>
            <defs>
              <linearGradient id="costGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(192 85% 50%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(192 85% 50%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="month" className="text-xs" tick={{ fill: 'hsl(220 9% 46%)' }} />
            <YAxis className="text-xs" tick={{ fill: 'hsl(220 9% 46%)' }} tickFormatter={v => `₹${v}`} />
            <Tooltip formatter={(v: number) => [`₹${v}`, 'Cost']} contentStyle={{ borderRadius: '8px', border: '1px solid hsl(220 13% 91%)', background: 'hsl(0 0% 100% / 0.95)' }} />
            <Area type="monotone" dataKey="cost" stroke="hsl(192 85% 50%)" fillOpacity={1} fill="url(#costGrad)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function ServiceFrequencyChart() {
  return (
    <div className="glass-card rounded-xl p-6">
      <h3 className="font-semibold mb-4">Service Frequency</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={serviceFrequency}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="type" className="text-xs" tick={{ fill: 'hsl(220 9% 46%)' }} />
            <YAxis className="text-xs" tick={{ fill: 'hsl(220 9% 46%)' }} />
            <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid hsl(220 13% 91%)' }} />
            <Bar dataKey="count" fill="hsl(222 80% 28%)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function MileageChart() {
  return (
    <div className="glass-card rounded-xl p-6">
      <h3 className="font-semibold mb-4">Mileage vs Maintenance Cost</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="mileage" name="Mileage" tick={{ fill: 'hsl(220 9% 46%)' }} tickFormatter={v => `${v / 1000}k`} />
            <YAxis dataKey="cost" name="Cost" tick={{ fill: 'hsl(220 9% 46%)' }} tickFormatter={v => `₹${v}`} />
            <Tooltip formatter={(v: number, name: string) => [name === 'Mileage' ? `${v} km` : `₹${v}`, name]} contentStyle={{ borderRadius: '8px' }} />
            <Scatter data={mileageVsMaintenance} fill="hsl(192 85% 50%)" />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
