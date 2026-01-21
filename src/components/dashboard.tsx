import { useState, useEffect } from 'react'
import { ShoppingCart, Users, Package, DollarSign, ArrowUpRight, ArrowDownRight, Calendar } from 'lucide-react'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import MetricCard from './metric-card'
import {
  DashboardService,
  DashboardStats,
  SalesByCategory,
  MonthlyPerformance,
  RecentOrder,
  LowStockProduct
} from '@/services/dashboard-service'

const COLORS = ['#f97316', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6']

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [salesByCategory, setSalesByCategory] = useState<SalesByCategory[]>([])
  const [monthlyData, setMonthlyData] = useState<MonthlyPerformance[]>([])
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([])

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true)

        const [
          statsData,
          salesByCategoryData,
          monthlyPerformanceData,
          recentOrdersData,
          lowStockData
        ] = await Promise.all([
          DashboardService.getStats(),
          DashboardService.getSalesByCategory(),
          DashboardService.getMonthlyPerformance(),
          DashboardService.getRecentOrders(),
          DashboardService.getLowStockProducts()
        ])

        setStats(statsData)
        setSalesByCategory(salesByCategoryData)
        setMonthlyData(monthlyPerformanceData)
        setRecentOrders(recentOrdersData)
        setLowStockProducts(lowStockData)
      } catch (error) {
        console.error('Failed to load dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  if (loading || !stats) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 bg-background min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const metrics = [
    {
      title: 'Total Revenue',
      value: `$${stats.totalRevenue.toLocaleString()}`,
      change: `${parseFloat(stats.revenueChange) >= 0 ? '+' : ''}${stats.revenueChange}%`,
      trend: parseFloat(stats.revenueChange) >= 0 ? 'up' as const : 'down' as const,
      icon: DollarSign,
      color: 'chart-1'
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders.toString(),
      change: `${parseFloat(stats.ordersChange) >= 0 ? '+' : ''}${stats.ordersChange}%`,
      trend: parseFloat(stats.ordersChange) >= 0 ? 'up' as const : 'down' as const,
      icon: ShoppingCart,
      color: 'chart-2'
    },
    {
      title: 'Total Customers',
      value: stats.totalCustomers.toString(),
      change: `${parseFloat(stats.customersChange) >= 0 ? '+' : ''}${stats.customersChange}%`,
      trend: parseFloat(stats.customersChange) >= 0 ? 'up' as const : 'down' as const,
      icon: Users,
      color: 'chart-3'
    },
    {
      title: 'Inventory Count',
      value: stats.totalStock.toLocaleString(),
      change: `${stats.totalProducts} products`,
      trend: 'up' as const,
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
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-foreground mb-4">Recent Orders</h3>
          {recentOrders.length > 0 ? (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-xl">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{order.order_number}</p>
                    <p className="text-xs text-muted-foreground truncate">{order.customer_name || 'Unknown'}</p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-sm font-semibold text-foreground">${order.total_amount?.toLocaleString()}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      order.status === 'delivered' ? 'bg-green-500/20 text-green-600' :
                      order.status === 'shipped' ? 'bg-blue-500/20 text-blue-600' :
                      order.status === 'processing' ? 'bg-yellow-500/20 text-yellow-600' :
                      order.status === 'cancelled' ? 'bg-red-500/20 text-red-600' :
                      'bg-gray-500/20 text-gray-600'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">No recent orders</p>
          )}
        </div>

        {/* Low Stock Alert */}
        <div className="lg:col-span-1 bg-card border border-border rounded-2xl p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-foreground mb-4">Low Stock Alert</h3>
          {lowStockProducts.length > 0 ? (
            <div className="space-y-3">
              {lowStockProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-red-500/10 rounded-xl border border-red-500/20">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{product.name}</p>
                    <p className="text-xs text-muted-foreground">${product.price}</p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-sm font-bold text-red-500">{product.stock_quantity}</p>
                    <p className="text-xs text-muted-foreground">in stock</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">All products well stocked</p>
          )}
        </div>
      </div>

      {/* Analytics Section */}
      <div className="mb-4 sm:mb-6">
        <h3 className="text-lg sm:text-xl font-bold text-foreground">Analytics Overview</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {/* Pie Chart - Sales by Category */}
        <div className="bg-card border border-border rounded-2xl p-4 sm:p-6 hover:shadow-lg hover:shadow-black/5 transition-all duration-300">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-semibold text-foreground">Sales by Category</h3>
            <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-full">All time</span>
          </div>
          {salesByCategory.length > 0 && salesByCategory[0].value > 0 ? (
            <>
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
                  >
                    {salesByCategory.map((_, index) => (
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
                    formatter={(value: number) => [`$${value.toLocaleString()}`, 'Sales']}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 sm:gap-3 mt-4">
                {salesByCategory.map((item, index) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-xs sm:text-sm text-muted-foreground truncate">{item.name}</span>
                    <span className="text-xs sm:text-sm font-semibold text-foreground ml-auto">${item.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-[280px] text-muted-foreground">
              No sales data available
            </div>
          )}
        </div>

        {/* Bar Chart - Monthly Performance */}
        <div className="bg-card border border-border rounded-2xl p-4 sm:p-6 hover:shadow-lg hover:shadow-black/5 transition-all duration-300">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-semibold text-foreground">Monthly Performance</h3>
            <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-full">Last 6 months</span>
          </div>
          {monthlyData.length > 0 ? (
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
                  tickFormatter={(value) => value >= 1000 ? `$${value / 1000}k` : `$${value}`}
                  width={45}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    fontSize: '12px',
                  }}
                  formatter={(value: number, name: string) => [
                    name === 'revenue' ? `$${value.toLocaleString()}` : value,
                    name === 'revenue' ? 'Revenue' : 'Orders'
                  ]}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar
                  dataKey="orders"
                  name="Orders"
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
          ) : (
            <div className="flex items-center justify-center h-[280px] text-muted-foreground">
              No monthly data available
            </div>
          )}
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
          <p className="text-2xl sm:text-3xl font-bold text-foreground mt-2 sm:mt-3">
            ${stats.avgOrderValue.toFixed(2)}
          </p>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 sm:mt-2">
            Based on {stats.totalOrders} orders
          </p>
        </div>

        <div className="group bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 rounded-2xl p-4 sm:p-6 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300">
          <div className="flex items-center justify-between">
            <h4 className="text-xs sm:text-sm font-medium text-muted-foreground">Pending Orders</h4>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <ShoppingCart size={14} className="sm:w-4 sm:h-4 text-blue-500" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-foreground mt-2 sm:mt-3">{stats.pendingOrders}</p>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 sm:mt-2">
            Awaiting processing
          </p>
        </div>

        <div className="group bg-gradient-to-br from-violet-500/10 to-violet-500/5 border border-violet-500/20 rounded-2xl p-4 sm:p-6 hover:shadow-lg hover:shadow-violet-500/10 transition-all duration-300">
          <div className="flex items-center justify-between">
            <h4 className="text-xs sm:text-sm font-medium text-muted-foreground">Unread Messages</h4>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-violet-500/20 flex items-center justify-center">
              <Users size={14} className="sm:w-4 sm:h-4 text-violet-500" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-foreground mt-2 sm:mt-3">{stats.unreadMessages}</p>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 sm:mt-2">
            Contact inquiries
          </p>
        </div>
      </div>
    </div>
  )
}
