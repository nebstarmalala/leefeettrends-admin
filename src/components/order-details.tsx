

import React from "react"

import { useState } from 'react'
import { ArrowLeft, Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useAlert } from '@/context/alert-context'
import ConfirmationModal from './confirmation-modal'

interface OrderItem {
  id: string
  productName: string
  quantity: number
  price: number
}

interface Order {
  id: string
  customer: string
  email: string
  phone: string
  address: string
  city: string
  zipCode: string
  items: OrderItem[]
  status: string
  date: string
}

interface OrderDetailsProps {
  orderId?: string
  onBack: () => void
}

export default function OrderDetails({ orderId, onBack }: OrderDetailsProps) {
  const { addAlert } = useAlert()
  const [formData, setFormData] = useState<Order>({
    id: orderId || '#ORD-2024-001',
    customer: 'John Smith',
    email: 'john@example.com',
    phone: '(555) 123-4567',
    address: '123 Main Street',
    city: 'New York, NY',
    zipCode: '10001',
    items: [
      { id: '1', productName: 'Running Shoe Pro', quantity: 1, price: 129.99 },
      { id: '2', productName: 'Casual Loafer', quantity: 1, price: 89.99 },
    ],
    status: 'Processing',
    date: 'Jan 18, 2026',
  })

  const [newItem, setNewItem] = useState({ productName: '', quantity: 1, price: 0 })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'phone' || name === 'zipCode' || name === 'address' ? value : value,
    }))
  }

  const handleAddItem = () => {
    if (!newItem.productName.trim()) {
      addAlert('warning', 'Missing Info', 'Please enter a product name')
      return
    }
    if (newItem.quantity <= 0) {
      addAlert('warning', 'Invalid Quantity', 'Quantity must be greater than 0')
      return
    }
    if (newItem.price <= 0) {
      addAlert('warning', 'Invalid Price', 'Price must be greater than 0')
      return
    }

    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: Date.now().toString(),
          ...newItem,
        },
      ],
    }))
    addAlert('success', 'Item Added', `${newItem.productName} has been added to the order`)
    setNewItem({ productName: '', quantity: 1, price: 0 })
  }

  const handleRemoveItem = (itemId: string) => {
    const item = formData.items.find((i) => i.id === itemId)
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== itemId),
    }))
    addAlert('info', 'Item Removed', `${item?.productName} has been removed from the order`)
  }

  const handleStatusChange = (newStatus: string) => {
    setFormData((prev) => ({ ...prev, status: newStatus }))
    addAlert('info', 'Status Updated', `Order status changed to ${newStatus}`)
  }

  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => sum + item.quantity * item.price, 0)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.items.length === 0) {
      addAlert('error', 'No Items', 'Please add at least one item to the order')
      return
    }
    setShowConfirm(true)
  }

  const confirmSubmit = async () => {
    setIsSubmitting(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 800))
      console.log('Order saved:', formData)
      addAlert('success', 'Success', 'Order has been updated successfully!')
      setShowConfirm(false)
      setTimeout(() => onBack(), 1000)
    } catch (error) {
      addAlert('error', 'Error', 'Failed to save order. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800'
      case 'Processing':
        return 'bg-blue-100 text-blue-800'
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'Shipped':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="p-8">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-primary hover:text-primary/90 mb-6 transition-colors"
      >
        <ArrowLeft size={20} />
        <span>Back to Orders</span>
      </button>

      <div className="max-w-4xl">
        <h2 className="text-3xl font-bold text-foreground mb-2">Order {formData.id}</h2>
        <p className="text-muted-foreground mb-8">Manage and update order details</p>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Customer Information */}
          <div className="bg-card border border-border rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Customer Information</h3>
              <select
                value={formData.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="px-3 py-2 bg-background border border-border rounded-lg text-sm font-medium text-foreground"
              >
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Customer Name</label>
                <Input
                  type="text"
                  name="customer"
                  value={formData.customer}
                  onChange={handleInputChange}
                  placeholder="Enter customer name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Phone</label>
                <Input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter phone"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Zip Code</label>
                <Input
                  type="text"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleInputChange}
                  placeholder="Enter zip code"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-2">Address</label>
                <Input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Enter address"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-2">City</label>
                <Input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="Enter city"
                />
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-card border border-border rounded-lg p-6 space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Order Items</h3>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border">
                  <tr>
                    <th className="text-left py-2 px-3 font-medium text-foreground">Product</th>
                    <th className="text-left py-2 px-3 font-medium text-foreground">Quantity</th>
                    <th className="text-left py-2 px-3 font-medium text-foreground">Price</th>
                    <th className="text-left py-2 px-3 font-medium text-foreground">Total</th>
                    <th className="text-left py-2 px-3 font-medium text-foreground">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {formData.items.map((item) => (
                    <tr key={item.id} className="hover:bg-secondary/30 transition-colors">
                      <td className="py-3 px-3 text-foreground">{item.productName}</td>
                      <td className="py-3 px-3 text-foreground">{item.quantity}</td>
                      <td className="py-3 px-3 text-foreground">${item.price.toFixed(2)}</td>
                      <td className="py-3 px-3 font-medium text-foreground">
                        ${(item.quantity * item.price).toFixed(2)}
                      </td>
                      <td className="py-3 px-3">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          className="p-1 hover:bg-destructive/10 rounded transition-colors"
                        >
                          <X size={16} className="text-destructive" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Add New Item */}
            <div className="border-t border-border pt-4 space-y-3">
              <h4 className="text-sm font-medium text-foreground">Add Item</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <Input
                  type="text"
                  placeholder="Product name"
                  value={newItem.productName}
                  onChange={(e) => setNewItem((prev) => ({ ...prev, productName: e.target.value }))}
                />
                <Input
                  type="number"
                  placeholder="Quantity"
                  value={newItem.quantity}
                  onChange={(e) => setNewItem((prev) => ({ ...prev, quantity: parseInt(e.target.value) }))}
                  min="1"
                />
                <Input
                  type="number"
                  placeholder="Price"
                  value={newItem.price}
                  onChange={(e) => setNewItem((prev) => ({ ...prev, price: parseFloat(e.target.value) }))}
                  step="0.01"
                />
                <Button
                  type="button"
                  onClick={handleAddItem}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2"
                >
                  <Plus size={16} />
                  Add
                </Button>
              </div>
            </div>

            {/* Order Total */}
            <div className="border-t border-border pt-4 flex justify-end">
              <div className="bg-secondary/30 rounded-lg px-6 py-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold text-foreground">Order Total:</span>
                  <span className="text-2xl font-bold text-primary">${calculateTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isSubmitting ? 'Saving...' : 'Save Order'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </form>

        <ConfirmationModal
          isOpen={showConfirm}
          title="Save Order?"
          message="Are you sure you want to save these changes to the order? This action can be undone."
          confirmText="Save"
          onConfirm={confirmSubmit}
          onCancel={() => setShowConfirm(false)}
          isLoading={isSubmitting}
        />
      </div>
    </div>
  )
}
