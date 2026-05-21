import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

type RevenuePoint = { day: string; revenue: number };
type MonthlyServicePoint = { month: string; count: number };
type RepairTypePoint = { type: string; count: number };

const PIE_COLORS = [
  'hsl(222 80% 28%)', 'hsl(192 85% 50%)', 'hsl(152 60% 42%)',
  'hsl(38 92% 50%)', 'hsl(0 72% 51%)', 'hsl(270 60% 50%)',
];

export function DailyRevenueChart({ data }: { data: RevenuePoint[] }) {
  const chartData = data.length ? data : [{ day: 'N/A', revenue: 0 }];
  return (
    <div className="glass-card rounded-xl p-6">
      <h3 className="font-semibold mb-4">Daily Revenue (This Week)</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(152 60% 42%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(152 60% 42%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="day" tick={{ fill: 'hsl(220 9% 46%)' }} />
            <YAxis tick={{ fill: 'hsl(220 9% 46%)' }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
            <Tooltip formatter={(v: number) => [`₹${v.toLocaleString()}`, 'Revenue']} contentStyle={{ borderRadius: '8px', border: '1px solid hsl(220 13% 91%)' }} />
            <Area type="monotone" dataKey="revenue" stroke="hsl(152 60% 42%)" fillOpacity={1} fill="url(#revGrad)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function MonthlyServicesChart({ data }: { data: MonthlyServicePoint[] }) {
  const chartData = data.length ? data : [{ month: 'N/A', count: 0 }];
  return (
    <div className="glass-card rounded-xl p-6">
      <h3 className="font-semibold mb-4">Monthly Service Count</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="month" tick={{ fill: 'hsl(220 9% 46%)' }} />
            <YAxis tick={{ fill: 'hsl(220 9% 46%)' }} />
            <Tooltip contentStyle={{ borderRadius: '8px' }} />
            <Bar dataKey="count" fill="hsl(222 80% 28%)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function RepairTypesChart({ data }: { data: RepairTypePoint[] }) {
  const chartData = data.length ? data : [{ type: 'No Data', count: 1 }];
  return (
    <div className="glass-card rounded-xl p-6">
      <h3 className="font-semibold mb-4">Most Common Repairs</h3>
      <div className="h-64 flex items-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={chartData} dataKey="count" nameKey="type" cx="50%" cy="50%" outerRadius={80} label={({ type, percent }) => `${type} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
              {chartData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
            </Pie>
            <Tooltip formatter={(v: number) => [v, 'Jobs']} contentStyle={{ borderRadius: '8px' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
