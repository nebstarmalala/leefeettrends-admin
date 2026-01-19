import { useState, useEffect } from 'react'
import { Eye, Trash2, Search, Filter, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import StatusBadge from '@/components/ui/status-badge'
import OrderDetails from './order-details'
import ConfirmationModal from './confirmation-modal'
import { useAlert } from '@/context/alert-context'
import { OrderService, OrderItemService } from '@/services/order-service'
import { CustomerService } from '@/services/customer-service'
import { Order as DBOrder, OrderItem as DBOrderItem, Customer as DBCustomer } from '@/types/database'

interface Order {
  id: string
  customer: string
  email: string
  items: number
  total: number
  status: string
  date: string
}

const mapDBOrderToOrder = (
  dbOrder: any, 
  orderItems: any[], 
  customers: any[]
): Order => {
  const customer = customers.find((c: any) => c.id === dbOrder.customer_id);
  const items = orderItems.filter((item: any) => item.order_id === dbOrder.id);
  const itemCount = items.reduce((sum: number, item: any) => sum + item.quantity, 0);
  
  const status = String(dbOrder.status);
  
  return {
    id: `#ORD-${dbOrder.order_number}`,
    customer: customer?.name || 'Unknown Customer',
    email: customer?.email || 'unknown@example.com',
    items: itemCount,
    total: dbOrder.total_amount,
    status: status.charAt(0).toUpperCase() + status.slice(1),
    date: new Date(dbOrder.created_at).toLocaleDateString(),
  };
};

export default function OrderManagement() {
  const { addAlert } = useAlert()
  const [orders, setOrders] = useState<Order[]>([])
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true)
        const dbOrders = await OrderService.getAll()
        const orderItems = await OrderItemService.getAll()
        const customers = await CustomerService.getAll()
        
        const mappedOrders = dbOrders.map((order: DBOrder) => 
          mapDBOrderToOrder(order, orderItems, customers)
        )
        setOrders(mappedOrders)
      } catch (error: any) {
        console.error('Failed to load orders:', error)
        addAlert('error', 'Error', 'Failed to load orders')
      } finally {
        setLoading(false)
      }
    }

    loadOrders()
  }, [addAlert])

  const handleDeleteClick = (id: string) => {
    setOrderToDelete(id)
    setShowDeleteConfirm(true)
  }

  const confirmDelete = async () => {
    if (!orderToDelete) return
    setIsDeleting(true)
    try {
      const orderId = orderToDelete.replace('#ORD-', '')
      await OrderService.delete(parseInt(orderId))
      const order = orders.find((o: Order) => o.id === orderToDelete)
      setOrders(orders.filter((o: Order) => o.id !== orderToDelete))
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

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 bg-background min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading orders...</p>
        </div>
      </div>
    )
  }

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
