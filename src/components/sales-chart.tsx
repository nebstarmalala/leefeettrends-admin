import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
import { TrendingUp } from 'lucide-react'

const data = [
  { date: 'Mon', sales: 4000, orders: 24 },
  { date: 'Tue', sales: 3000, orders: 18 },
  { date: 'Wed', sales: 2000, orders: 14 },
  { date: 'Thu', sales: 2780, orders: 22 },
  { date: 'Fri', sales: 1890, orders: 18 },
  { date: 'Sat', sales: 2390, orders: 28 },
  { date: 'Sun', sales: 3490, orders: 32 },
]

export default function SalesChart() {
  const totalSales = data.reduce((sum, d) => sum + d.sales, 0)
  const totalOrders = data.reduce((sum, d) => sum + d.orders, 0)

  return (
    <div className="bg-card border border-border rounded-2xl p-4 sm:p-6 h-full">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4 sm:mb-6">
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-foreground">Sales Overview</h3>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">Weekly performance metrics</p>
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="text-left sm:text-right">
            <p className="text-lg sm:text-2xl font-bold text-foreground">${totalSales.toLocaleString()}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Total Sales</p>
          </div>
          <div className="w-px h-8 sm:h-10 bg-border" />
          <div className="text-left sm:text-right">
            <p className="text-lg sm:text-2xl font-bold text-foreground">{totalOrders}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Total Orders</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 sm:gap-6 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-orange-500" />
          <span className="text-xs sm:text-sm text-muted-foreground">Sales ($)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-emerald-500" />
          <span className="text-xs sm:text-sm text-muted-foreground">Orders</span>
        </div>
        <div className="flex items-center gap-1 ml-auto text-emerald-600 text-xs sm:text-sm">
          <TrendingUp size={12} className="sm:w-3.5 sm:h-3.5" />
          <span>+12.5% vs last week</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={200} className="sm:!h-[260px]">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f97316" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="date"
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
            labelStyle={{ color: 'var(--foreground)', fontWeight: 600, marginBottom: '4px' }}
          />
          <Area
            type="monotone"
            dataKey="sales"
            stroke="#f97316"
            strokeWidth={2}
            fill="url(#salesGradient)"
          />
          <Area
            type="monotone"
            dataKey="orders"
            stroke="#10b981"
            strokeWidth={2}
            fill="url(#ordersGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
