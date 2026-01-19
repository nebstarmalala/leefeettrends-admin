
import { useState, useEffect } from 'react'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { OrderService, OrderItemService } from '@/services/order-service'
import { ProductService } from '@/services/product-service'
import { CategoryService } from '@/services/product-service'

const COLORS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)']

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [salesByCategory, setSalesByCategory] = useState<any[]>([])
  const [monthlyData, setMonthlyData] = useState<any[]>([])
  const [metrics, setMetrics] = useState<any>({})

  useEffect(() => {
    const loadAnalyticsData = async () => {
      try {
        setLoading(true)
        
        const [orders, products, categories, orderItems] = await Promise.all([
          OrderService.getAll(),
          ProductService.getAll(),
          CategoryService.getAll(),
          OrderItemService.getAll()
        ])

        // Calculate sales by category
        const categorySales = categories.map((category: any) => {
          const categoryProducts = products.filter((p: any) => p.category_id === category.id)
          const categoryOrderItems = orderItems.filter((item: any) => 
            categoryProducts.some((p: any) => p.id === item.product_id)
          )
          const totalSales = categoryOrderItems.reduce((sum: any, item: any) => sum + item.total_price, 0)
          
          return {
            name: category.name,
            value: totalSales
          }
        }).filter((item: any) => item.value > 0)

        // Calculate monthly data (mock for now)
        const totalRevenue = orders.reduce((sum: any, order: any) => sum + (order.total_amount || 0), 0)
        const monthlyRevenue = [
          { month: 'Jan', sales: orders.length, revenue: totalRevenue * 0.3 },
          { month: 'Feb', sales: Math.floor(orders.length * 0.8), revenue: totalRevenue * 0.25 },
          { month: 'Mar', sales: Math.floor(orders.length * 0.6), revenue: totalRevenue * 0.2 },
          { month: 'Apr', sales: Math.floor(orders.length * 0.7), revenue: totalRevenue * 0.15 },
          { month: 'May', sales: Math.floor(orders.length * 0.5), revenue: totalRevenue * 0.1 },
        ]

        // Calculate metrics
        const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0
        const customerLifetimeValue = avgOrderValue * 3.5 // Mock calculation
        const conversionRate = 3.24 // Mock percentage

        setSalesByCategory(categorySales)
        setMonthlyData(monthlyRevenue)
        setMetrics({
          avgOrderValue,
          customerLifetimeValue,
          conversionRate
        })
      } catch (error: any) {
        console.error('Failed to load analytics data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadAnalyticsData()
  }, [])

  if (loading) {
    return (
      <div className="p-8 bg-background min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    )
  }
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
          <p className="text-3xl font-bold text-foreground">${metrics.avgOrderValue?.toFixed(2) || '0.00'}</p>
          <p className="text-xs text-green-600 mt-2">↑ 5.2% from last month</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <h4 className="text-sm font-medium text-muted-foreground mb-2">Customer Lifetime Value</h4>
          <p className="text-3xl font-bold text-foreground">${metrics.customerLifetimeValue?.toFixed(0) || '0'}</p>
          <p className="text-xs text-green-600 mt-2">↑ 12.8% from last month</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <h4 className="text-sm font-medium text-muted-foreground mb-2">Conversion Rate</h4>
          <p className="text-3xl font-bold text-foreground">{metrics.conversionRate || '0'}%</p>
          <p className="text-xs text-red-600 mt-2">↓ 0.5% from last month</p>
        </div>
      </div>
    </div>
  )
}
