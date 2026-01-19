import { ShoppingCart, Users, Package, DollarSign, ArrowUpRight, Calendar } from 'lucide-react'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import MetricCard from './metric-card'
import SalesChart from './sales-chart'
import RecentOrders from './recent-orders'

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

const COLORS = ['#f97316', '#10b981', '#3b82f6', '#8b5cf6']

export default function Dashboard() {
  const metrics = [
    {
      title: 'Total Revenue',
      value: '$24,582',
      change: '+12.5%',
      trend: 'up' as const,
      icon: DollarSign,
      color: 'chart-1'
    },
    {
      title: 'Orders Today',
      value: '48',
      change: '+8.2%',
      trend: 'up' as const,
      icon: ShoppingCart,
      color: 'chart-2'
    },
    {
      title: 'New Customers',
      value: '12',
      change: '+2.1%',
      trend: 'up' as const,
      icon: Users,
      color: 'chart-3'
    },
    {
      title: 'Inventory Count',
      value: '2,345',
      change: '-3.4%',
      trend: 'down' as const,
      icon: Package,
      color: 'chart-4'
    },
  ]

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-background min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">Dashboard</h2>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">Welcome back! Here's your store overview.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-xl text-xs sm:text-sm text-muted-foreground w-fit">
          <Calendar size={14} className="sm:w-4 sm:h-4" />
          <span>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
        {metrics.map((metric) => (
          <MetricCard key={metric.title} {...metric} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="lg:col-span-2">
          <SalesChart />
        </div>
        <div className="lg:col-span-1">
          <RecentOrders />
        </div>
      </div>

      {/* Analytics Section */}
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg sm:text-xl font-bold text-foreground">Analytics Overview</h3>
          <button className="flex items-center gap-1 text-xs sm:text-sm text-primary hover:text-primary/80 transition-colors">
            View all reports
            <ArrowUpRight size={14} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {/* Pie Chart */}
        <div className="bg-card border border-border rounded-2xl p-4 sm:p-6 hover:shadow-lg hover:shadow-black/5 transition-all duration-300">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-semibold text-foreground">Sales by Category</h3>
            <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-full">This month</span>
          </div>
          <ResponsiveContainer width="100%" height={220} className="sm:!h-[280px]">
            <PieChart>
              <Pie
                data={salesByCategory}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={70}
                fill="#8884d8"
                paddingAngle={4}
                dataKey="value"
                className="sm:[&_.recharts-pie-sector]:!innerRadius-[60px] sm:[&_.recharts-pie-sector]:!outerRadius-[100px]"
              >
                {salesByCategory.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  fontSize: '12px',
                }}
                labelStyle={{ color: 'var(--foreground)' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 sm:gap-3 mt-4">
            {salesByCategory.map((item, index) => (
              <div key={item.name} className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: COLORS[index] }}
                />
                <span className="text-xs sm:text-sm text-muted-foreground truncate">{item.name}</span>
                <span className="text-xs sm:text-sm font-semibold text-foreground ml-auto">${item.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bar Chart */}
        <div className="bg-card border border-border rounded-2xl p-4 sm:p-6 hover:shadow-lg hover:shadow-black/5 transition-all duration-300">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-semibold text-foreground">Monthly Performance</h3>
            <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-full">Last 6 months</span>
          </div>
          <ResponsiveContainer width="100%" height={220} className="sm:!h-[280px]">
            <BarChart data={monthlyData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="month"
                stroke="var(--muted-foreground)"
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="var(--muted-foreground)"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value / 1000}k`}
                width={35}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  fontSize: '12px',
                }}
                labelStyle={{ color: 'var(--foreground)', fontWeight: 600 }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar
                dataKey="sales"
                name="Sales"
                fill="#f97316"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="revenue"
                name="Revenue"
                fill="#10b981"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div className="group bg-gradient-to-br from-orange-500/10 to-orange-500/5 border border-orange-500/20 rounded-2xl p-4 sm:p-6 hover:shadow-lg hover:shadow-orange-500/10 transition-all duration-300">
          <div className="flex items-center justify-between">
            <h4 className="text-xs sm:text-sm font-medium text-muted-foreground">Avg Order Value</h4>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
              <DollarSign size={14} className="sm:w-4 sm:h-4 text-orange-500" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-foreground mt-2 sm:mt-3">$187.50</p>
          <p className="text-xs sm:text-sm text-emerald-600 mt-1.5 sm:mt-2 flex items-center gap-1">
            <ArrowUpRight size={12} className="sm:w-3.5 sm:h-3.5" />
            5.2% from last month
          </p>
        </div>

        <div className="group bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 rounded-2xl p-4 sm:p-6 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300">
          <div className="flex items-center justify-between">
            <h4 className="text-xs sm:text-sm font-medium text-muted-foreground">Customer Lifetime Value</h4>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Users size={14} className="sm:w-4 sm:h-4 text-blue-500" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-foreground mt-2 sm:mt-3">$2,145</p>
          <p className="text-xs sm:text-sm text-emerald-600 mt-1.5 sm:mt-2 flex items-center gap-1">
            <ArrowUpRight size={12} className="sm:w-3.5 sm:h-3.5" />
            12.8% from last month
          </p>
        </div>

        <div className="group bg-gradient-to-br from-violet-500/10 to-violet-500/5 border border-violet-500/20 rounded-2xl p-4 sm:p-6 hover:shadow-lg hover:shadow-violet-500/10 transition-all duration-300">
          <div className="flex items-center justify-between">
            <h4 className="text-xs sm:text-sm font-medium text-muted-foreground">Conversion Rate</h4>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-violet-500/20 flex items-center justify-center">
              <ShoppingCart size={14} className="sm:w-4 sm:h-4 text-violet-500" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-foreground mt-2 sm:mt-3">3.24%</p>
          <p className="text-xs sm:text-sm text-red-500 mt-1.5 sm:mt-2 flex items-center gap-1">
            <ArrowUpRight size={12} className="sm:w-3.5 sm:h-3.5 rotate-90" />
            0.5% from last month
          </p>
        </div>
      </div>
    </div>
  )
}
