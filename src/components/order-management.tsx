import { useState } from 'react'
import { Eye, Trash2, Search, Filter, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import StatusBadge from '@/components/ui/status-badge'
import OrderDetails from './order-details'
import ConfirmationModal from './confirmation-modal'
import { useAlert } from '@/context/alert-context'

interface Order {
  id: string
  customer: string
  email: string
  items: number
  total: number
  status: string
  date: string
}

const initialOrders: Order[] = [
  {
    id: '#ORD-2024-001',
    customer: 'John Smith',
    email: 'john@example.com',
    items: 2,
    total: 245.99,
    status: 'Completed',
    date: 'Jan 18, 2026',
  },
  {
    id: '#ORD-2024-002',
    customer: 'Sarah Johnson',
    email: 'sarah@example.com',
    items: 1,
    total: 129.99,
    status: 'Processing',
    date: 'Jan 18, 2026',
  },
  {
    id: '#ORD-2024-003',
    customer: 'Mike Davis',
    email: 'mike@example.com',
    items: 3,
    total: 412.97,
    status: 'Pending',
    date: 'Jan 17, 2026',
  },
  {
    id: '#ORD-2024-004',
    customer: 'Emily Brown',
    email: 'emily@example.com',
    items: 1,
    total: 89.99,
    status: 'Shipped',
    date: 'Jan 17, 2026',
  },
  {
    id: '#ORD-2024-005',
    customer: 'Alex Wilson',
    email: 'alex@example.com',
    items: 4,
    total: 598.95,
    status: 'Completed',
    date: 'Jan 16, 2026',
  },
]

export default function OrderManagement() {
  const { addAlert } = useAlert()
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const handleDeleteClick = (id: string) => {
    setOrderToDelete(id)
    setShowDeleteConfirm(true)
  }

  const confirmDelete = async () => {
    if (!orderToDelete) return
    setIsDeleting(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 500))
      const order = orders.find((o) => o.id === orderToDelete)
      setOrders(orders.filter((o) => o.id !== orderToDelete))
      addAlert('success', 'Deleted', `Order ${order?.id} has been deleted successfully`)
      setShowDeleteConfirm(false)
      setOrderToDelete(null)
    } catch (error) {
      addAlert('error', 'Error', 'Failed to delete order. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  const filteredOrders = orders.filter(
    (order) =>
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (selectedOrderId) {
    return (
      <OrderDetails
        orderId={selectedOrderId}
        onBack={() => setSelectedOrderId(null)}
      />
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-background min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">Orders</h2>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">View and manage customer orders</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-6">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-xl border-border bg-card"
          />
        </div>
        <Button variant="outline" className="flex items-center justify-center gap-2 rounded-xl">
          <Filter size={16} />
          Filters
        </Button>
      </div>

      {/* Mobile Card View */}
      <div className="block lg:hidden space-y-3">
        {filteredOrders.map((order) => (
          <div
            key={order.id}
            onClick={() => setSelectedOrderId(order.id)}
            className="bg-card border border-border rounded-xl p-4 active:scale-[0.99] transition-transform cursor-pointer"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 flex items-center justify-center flex-shrink-0">
                  <ShoppingBag size={18} className="text-emerald-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <code className="font-semibold text-foreground text-sm">{order.id}</code>
                  <p className="text-xs text-muted-foreground truncate">{order.customer}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedOrderId(order.id)
                  }}
                  className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
                  aria-label="View order"
                >
                  <Eye size={16} className="text-muted-foreground" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteClick(order.id)
                  }}
                  className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                  aria-label="Delete order"
                >
                  <Trash2 size={16} className="text-muted-foreground" />
                </button>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="font-semibold text-foreground">${order.total.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Items</p>
                  <p className="text-sm text-muted-foreground">{order.items} items</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Date</p>
                  <p className="text-sm text-muted-foreground">{order.date}</p>
                </div>
              </div>
              <StatusBadge status={order.status} size="sm" />
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="bg-secondary/50">
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Order</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Customer</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Items</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredOrders.map((order) => (
              <tr
                key={order.id}
                onClick={() => setSelectedOrderId(order.id)}
                className="group hover:bg-secondary/30 transition-colors cursor-pointer"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 flex items-center justify-center">
                      <ShoppingBag size={18} className="text-emerald-500" />
                    </div>
                    <code className="font-semibold text-foreground">{order.id}</code>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-foreground group-hover:text-primary transition-colors">{order.customer}</p>
                    <p className="text-xs text-muted-foreground">{order.email}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-muted-foreground bg-secondary px-2 py-1 rounded">{order.items} items</span>
                </td>
                <td className="px-6 py-4">
                  <span className="font-semibold text-foreground">${order.total.toFixed(2)}</span>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={order.status} />
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{order.date}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedOrderId(order.id)
                      }}
                      className="p-2 hover:bg-primary/10 rounded-lg transition-colors group/btn"
                      aria-label="View order"
                    >
                      <Eye size={16} className="text-muted-foreground group-hover/btn:text-primary transition-colors" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteClick(order.id)
                      }}
                      className="p-2 hover:bg-red-500/10 rounded-lg transition-colors group/btn"
                      aria-label="Delete order"
                    >
                      <Trash2 size={16} className="text-muted-foreground group-hover/btn:text-red-500 transition-colors" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <ShoppingBag size={48} className="mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">No orders found</p>
          </div>
        )}
      </div>

      {/* Mobile Empty State */}
      {filteredOrders.length === 0 && (
        <div className="block lg:hidden text-center py-12 bg-card border border-border rounded-xl">
          <ShoppingBag size={48} className="mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">No orders found</p>
        </div>
      )}

      {/* Pagination */}
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground order-2 sm:order-1">
          Showing <span className="font-medium text-foreground">{filteredOrders.length}</span> of <span className="font-medium text-foreground">{orders.length}</span> orders
        </p>
        <div className="flex gap-2 order-1 sm:order-2 w-full sm:w-auto">
          <Button variant="outline" className="rounded-xl flex-1 sm:flex-none" disabled>Previous</Button>
          <Button variant="outline" className="rounded-xl flex-1 sm:flex-none">Next</Button>
        </div>
      </div>

      <ConfirmationModal
        isOpen={showDeleteConfirm}
        title="Delete Order?"
        message="Are you sure you want to delete this order? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
        isLoading={isDeleting}
      />
    </div>
  )
}
