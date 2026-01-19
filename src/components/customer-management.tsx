import { useState } from 'react'
import { Trash2, Edit2, Eye, Search, Filter, Users, ArrowLeft, Mail, Phone, MapPin, ShoppingBag, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import StatusBadge from '@/components/ui/status-badge'
import { useAlert } from '@/context/alert-context'
import ConfirmationModal from './confirmation-modal'

interface Customer {
  id: string
  name: string
  email: string
  phone: string
  location: string
  orders: number
  spent: number
  status: string
  joinDate: string
}

const initialCustomers: Customer[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john@example.com',
    phone: '(555) 123-4567',
    location: 'New York, NY',
    orders: 5,
    spent: 1245.99,
    status: 'Active',
    joinDate: 'Dec 15, 2025',
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    phone: '(555) 234-5678',
    location: 'Los Angeles, CA',
    orders: 8,
    spent: 2156.50,
    status: 'Active',
    joinDate: 'Nov 20, 2025',
  },
  {
    id: '3',
    name: 'Mike Davis',
    email: 'mike@example.com',
    phone: '(555) 345-6789',
    location: 'Chicago, IL',
    orders: 3,
    spent: 412.97,
    status: 'Active',
    joinDate: 'Jan 5, 2026',
  },
  {
    id: '4',
    name: 'Emily Brown',
    email: 'emily@example.com',
    phone: '(555) 456-7890',
    location: 'Houston, TX',
    orders: 2,
    spent: 189.99,
    status: 'Inactive',
    joinDate: 'Oct 12, 2025',
  },
  {
    id: '5',
    name: 'Alex Wilson',
    email: 'alex@example.com',
    phone: '(555) 567-8901',
    location: 'Phoenix, AZ',
    orders: 12,
    spent: 3598.45,
    status: 'Active',
    joinDate: 'Aug 30, 2025',
  },
]

export default function CustomerManagement() {
  const { addAlert } = useAlert()
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [customerToDelete, setCustomerToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const handleDeleteClick = (id: string) => {
    setCustomerToDelete(id)
    setShowDeleteConfirm(true)
  }

  const confirmDelete = async () => {
    if (!customerToDelete) return
    setIsDeleting(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 500))
      const customer = customers.find((c) => c.id === customerToDelete)
      setCustomers(customers.filter((c) => c.id !== customerToDelete))
      addAlert('success', 'Deleted', `${customer?.name} has been removed successfully`)
      setShowDeleteConfirm(false)
      setCustomerToDelete(null)
      if (selectedCustomer?.id === customerToDelete) {
        setSelectedCustomer(null)
      }
    } catch (error) {
      addAlert('error', 'Error', 'Failed to delete customer. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.location.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Customer Details View
  if (selectedCustomer) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 bg-background min-h-screen">
        <button
          onClick={() => setSelectedCustomer(null)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 sm:mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to Customers</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Customer Info Card */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-2xl p-4 sm:p-6">
              <div className="text-center mb-4 sm:mb-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <span className="text-xl sm:text-2xl font-bold text-primary">
                    {selectedCustomer.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-foreground">{selectedCustomer.name}</h2>
                <div className="mt-2">
                  <StatusBadge status={selectedCustomer.status} />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-xl">
                  <Mail size={16} className="text-muted-foreground flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground">Email</p>
                    <a href={`mailto:${selectedCustomer.email}`} className="text-sm text-foreground hover:text-primary truncate block">
                      {selectedCustomer.email}
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-xl">
                  <Phone size={16} className="text-muted-foreground flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <a href={`tel:${selectedCustomer.phone}`} className="text-sm text-foreground hover:text-primary">
                      {selectedCustomer.phone}
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-xl">
                  <MapPin size={16} className="text-muted-foreground flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground">Location</p>
                    <p className="text-sm text-foreground">{selectedCustomer.location}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-border">
                <p className="text-xs text-muted-foreground">Customer since</p>
                <p className="text-sm font-medium text-foreground">{selectedCustomer.joinDate}</p>
              </div>
            </div>
          </div>

          {/* Stats & Activity */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Total Orders</p>
                    <p className="text-2xl sm:text-3xl font-bold text-foreground mt-1">{selectedCustomer.orders}</p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                    <ShoppingBag size={20} className="sm:w-6 sm:h-6 text-emerald-500" />
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Total Spent</p>
                    <p className="text-2xl sm:text-3xl font-bold text-foreground mt-1">${selectedCustomer.spent.toFixed(2)}</p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                    <DollarSign size={20} className="sm:w-6 sm:h-6 text-blue-500" />
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Orders Placeholder */}
            <div className="bg-card border border-border rounded-2xl p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-foreground mb-4">Recent Orders</h3>
              <div className="text-center py-6 sm:py-8 text-muted-foreground">
                <ShoppingBag size={32} className="sm:w-10 sm:h-10 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No recent orders to display</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Button className="flex items-center justify-center gap-2">
                <Mail size={16} />
                Send Email
              </Button>
              <Button variant="outline" className="flex items-center justify-center gap-2">
                <Edit2 size={16} />
                Edit Customer
              </Button>
              <Button
                variant="outline"
                className="text-red-500 hover:bg-red-500/10 hover:text-red-500 border-red-500/30 sm:ml-auto"
                onClick={() => handleDeleteClick(selectedCustomer.id)}
              >
                <Trash2 size={16} />
                <span className="sm:hidden ml-2">Delete</span>
              </Button>
            </div>
          </div>
        </div>

        <ConfirmationModal
          isOpen={showDeleteConfirm}
          title="Delete Customer?"
          message="Are you sure you want to delete this customer? This action cannot be undone."
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

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-background min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">Customers</h2>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">Manage and view customer information</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-6">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search customers..."
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
        {filteredCustomers.map((customer) => (
          <div
            key={customer.id}
            onClick={() => setSelectedCustomer(customer)}
            className="bg-card border border-border rounded-xl p-4 active:scale-[0.99] transition-transform cursor-pointer"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-semibold text-primary">
                    {customer.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground truncate">{customer.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{customer.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedCustomer(customer)
                  }}
                  className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
                  aria-label="View customer"
                >
                  <Eye size={16} className="text-muted-foreground" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteClick(customer.id)
                  }}
                  className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                  aria-label="Delete customer"
                >
                  <Trash2 size={16} className="text-muted-foreground" />
                </button>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Orders</p>
                  <p className="text-sm font-medium text-foreground">{customer.orders}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Spent</p>
                  <p className="text-sm font-semibold text-foreground">${customer.spent.toFixed(2)}</p>
                </div>
              </div>
              <StatusBadge status={customer.status} size="sm" />
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="bg-secondary/50">
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Customer</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Contact</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Location</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Orders</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Spent</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredCustomers.map((customer) => (
              <tr
                key={customer.id}
                onClick={() => setSelectedCustomer(customer)}
                className="group hover:bg-secondary/30 transition-colors cursor-pointer"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary">
                        {customer.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <p className="font-medium text-foreground group-hover:text-primary transition-colors">{customer.name}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <p className="text-sm text-foreground">{customer.email}</p>
                    <p className="text-xs text-muted-foreground">{customer.phone}</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{customer.location}</td>
                <td className="px-6 py-4">
                  <span className="text-sm text-muted-foreground bg-secondary px-2 py-1 rounded">{customer.orders} orders</span>
                </td>
                <td className="px-6 py-4 font-semibold text-foreground">${customer.spent.toFixed(2)}</td>
                <td className="px-6 py-4">
                  <StatusBadge status={customer.status} />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedCustomer(customer)
                      }}
                      className="p-2 hover:bg-primary/10 rounded-lg transition-colors group/btn"
                      aria-label="View customer"
                    >
                      <Eye size={16} className="text-muted-foreground group-hover/btn:text-primary transition-colors" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteClick(customer.id)
                      }}
                      className="p-2 hover:bg-red-500/10 rounded-lg transition-colors group/btn"
                      aria-label="Delete customer"
                    >
                      <Trash2 size={16} className="text-muted-foreground group-hover/btn:text-red-500 transition-colors" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredCustomers.length === 0 && (
          <div className="text-center py-12">
            <Users size={48} className="mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">No customers found</p>
          </div>
        )}
      </div>

      {/* Mobile Empty State */}
      {filteredCustomers.length === 0 && (
        <div className="block lg:hidden text-center py-12 bg-card border border-border rounded-xl">
          <Users size={48} className="mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">No customers found</p>
        </div>
      )}

      {/* Pagination */}
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground order-2 sm:order-1">
          Showing <span className="font-medium text-foreground">{filteredCustomers.length}</span> of <span className="font-medium text-foreground">{customers.length}</span> customers
        </p>
        <div className="flex gap-2 order-1 sm:order-2 w-full sm:w-auto">
          <Button variant="outline" className="rounded-xl flex-1 sm:flex-none" disabled>Previous</Button>
          <Button variant="outline" className="rounded-xl flex-1 sm:flex-none">Next</Button>
        </div>
      </div>

      <ConfirmationModal
        isOpen={showDeleteConfirm}
        title="Delete Customer?"
        message="Are you sure you want to delete this customer? This action cannot be undone."
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
