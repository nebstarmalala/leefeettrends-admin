import StatusBadge from '@/components/ui/status-badge'
import { ArrowUpRight } from 'lucide-react'

const recentOrders = [
  {
    id: '#ORD-001',
    customer: 'John Smith',
    amount: '$245.00',
    status: 'Completed',
    time: '2 min ago',
  },
  {
    id: '#ORD-002',
    customer: 'Sarah Johnson',
    amount: '$189.50',
    status: 'Processing',
    time: '15 min ago',
  },
  {
    id: '#ORD-003',
    customer: 'Mike Davis',
    amount: '$412.30',
    status: 'Pending',
    time: '1 hour ago',
  },
  {
    id: '#ORD-004',
    customer: 'Emily Brown',
    amount: '$156.75',
    status: 'Completed',
    time: '2 hours ago',
  },
  {
    id: '#ORD-005',
    customer: 'Alex Wilson',
    amount: '$298.00',
    status: 'Shipped',
    time: '3 hours ago',
  },
]

export default function RecentOrders() {
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
                {order.customer.split(' ').map(n => n[0]).join('')}
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
