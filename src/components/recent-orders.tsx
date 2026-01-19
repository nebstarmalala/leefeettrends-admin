import { useState, useEffect } from 'react'
import StatusBadge from '@/components/ui/status-badge'
import { ArrowUpRight } from 'lucide-react'
import { OrderService, OrderItemService } from '@/services/order-service'
import { CustomerService } from '@/services/customer-service'

export default function RecentOrders() {
  const [loading, setLoading] = useState(true)
  const [recentOrders, setRecentOrders] = useState<any[]>([])

  useEffect(() => {
    const loadRecentOrders = async () => {
      try {
        setLoading(true)
        
        const [orders, orderItems, customers] = await Promise.all([
          OrderService.getAll(),
          OrderItemService.getAll(),
          CustomerService.getAll()
        ])

        // Get recent orders with customer info and calculate amounts
        const recentOrdersData = orders.slice(0, 5).map((order: any) => {
          const customer = customers.find((c: any) => c.id === order.customer_id)
          const orderItemAmount = orderItems
            .filter((item: any) => item.order_id === order.id)
            .reduce((sum: any, item: any) => sum + item.total_price, 0)
          
          // Calculate time ago (mock for now)
          const now = new Date()
          const orderTime = new Date(order.created_at)
          const diffInHours = (now.getTime() - orderTime.getTime()) / (1000 * 60 * 60)
          let timeAgo = 'Just now'
          
          if (diffInHours < 1) {
            timeAgo = `${Math.floor(diffInHours * 60)} min ago`
          } else if (diffInHours < 24) {
            timeAgo = `${Math.floor(diffInHours)} hours ago`
          } else {
            timeAgo = `${Math.floor(diffInHours / 24)} days ago`
          }
          
          return {
            id: `#ORD-${order.order_number}`,
            customer: customer?.name || 'Unknown',
            amount: `$${orderItemAmount.toFixed(2)}`,
            status: order.status.charAt(0).toUpperCase() + order.status.slice(1),
            time: timeAgo,
          }
        })

        setRecentOrders(recentOrdersData)
      } catch (error: any) {
        console.error('Failed to load recent orders:', error)
      } finally {
        setLoading(false)
      }
    }

    loadRecentOrders()
  }, [])

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-2xl p-4 sm:p-6 h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground text-xs">Loading...</p>
        </div>
      </div>
    )
  }
  return (
    <div className="bg-card border border-border rounded-2xl p-4 sm:p-6 h-full">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h3 className="text-base sm:text-lg font-semibold text-foreground">Recent Orders</h3>
        <button className="flex items-center gap-1 text-xs sm:text-sm text-primary hover:text-primary/80 transition-colors">
          View all
          <ArrowUpRight size={12} className="sm:w-3.5 sm:h-3.5" />
        </button>
      </div>
      <div className="space-y-1">
        {recentOrders.map((order, index) => (
          <div
            key={order.id}
            className={`group flex items-center justify-between p-2 sm:p-3 rounded-xl hover:bg-secondary/80 transition-all cursor-pointer ${
              index === 0 ? 'bg-secondary/50' : ''
            }`}
          >
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-xs sm:text-sm font-semibold text-primary flex-shrink-0">
                {order.customer.split(' ').map((n: string) => n[0]).join('')}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">
                  {order.customer}
                </p>
                <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{order.id} • {order.time}</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-0.5 sm:gap-1 flex-shrink-0 ml-2">
              <span className="text-xs sm:text-sm font-semibold text-foreground">{order.amount}</span>
              <StatusBadge status={order.status} size="sm" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
