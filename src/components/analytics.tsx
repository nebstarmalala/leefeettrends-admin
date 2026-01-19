

import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const salesByCategory = [
  { name: 'Running', value: 4200 },
  { name: 'Casual', value: 3800 },
  { name: 'Sports', value: 2800 },
  { name: 'Outdoor', value: 1900 },
]

const monthlyData = [
  { month: 'Jan', sales: 4000, revenue: 24000 },
  { month: 'Feb', sales: 3000, revenue: 18000 },
  { month: 'Mar', sales: 2000, revenue: 12000 },
  { month: 'Apr', sales: 2780, revenue: 16680 },
  { month: 'May', sales: 1890, revenue: 11340 },
  { month: 'Jun', sales: 2390, revenue: 14340 },
]

const COLORS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)']

export default function AnalyticsPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-foreground">Analytics</h2>
        <p className="text-muted-foreground mt-2">Detailed insights into your store performance</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Sales by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={salesByCategory}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {salesByCategory.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Monthly Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" stroke="var(--muted-foreground)" />
              <YAxis stroke="var(--muted-foreground)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--background)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: 'var(--foreground)' }}
              />
              <Legend />
              <Bar
                dataKey="sales"
                fill="var(--chart-1)"
                radius={[8, 8, 0, 0]}
              />
              <Bar
                dataKey="revenue"
                fill="var(--chart-2)"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <h4 className="text-sm font-medium text-muted-foreground mb-2">Avg Order Value</h4>
          <p className="text-3xl font-bold text-foreground">$187.50</p>
          <p className="text-xs text-green-600 mt-2">↑ 5.2% from last month</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <h4 className="text-sm font-medium text-muted-foreground mb-2">Customer Lifetime Value</h4>
          <p className="text-3xl font-bold text-foreground">$2,145</p>
          <p className="text-xs text-green-600 mt-2">↑ 12.8% from last month</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <h4 className="text-sm font-medium text-muted-foreground mb-2">Conversion Rate</h4>
          <p className="text-3xl font-bold text-foreground">3.24%</p>
          <p className="text-xs text-red-600 mt-2">↓ 0.5% from last month</p>
        </div>
      </div>
    </div>
  )
}
