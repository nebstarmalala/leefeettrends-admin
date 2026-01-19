

import React from "react"

import { useState } from 'react'
import { ArrowLeft, X, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useAlert } from '@/context/alert-context'
import ConfirmationModal from './confirmation-modal'

interface Product {
  id: string
  name: string
  sku: string
  price: number
  stock: number
  category: string
  description: string
  images: string[]
}

interface ProductDetailsProps {
  productId?: string
  onBack: () => void
}

export default function ProductDetails({ productId, onBack }: ProductDetailsProps) {
  const { addAlert } = useAlert()
  const [formData, setFormData] = useState<Product>({
    id: productId || 'new',
    name: 'Running Shoe Pro',
    sku: 'RS-001',
    price: 129.99,
    stock: 45,
    category: 'Running',
    description: 'Premium running shoes with advanced cushioning technology',
    images: ['/api/placeholder/300/300'],
  })
  const [images, setImages] = useState<string[]>(formData.images)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'price' || name === 'stock' ? parseFloat(value) : value,
    }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      if (e.target.files.length + images.length > 10) {
        addAlert('warning', 'Limit Reached', 'Maximum 10 images allowed per product')
        return
      }
      Array.from(e.target.files).forEach((file) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          setImages((prev) => [...prev, reader.result as string])
          addAlert('success', 'Image Added', `${file.name} uploaded successfully`)
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
    addAlert('info', 'Image Removed', 'Image has been removed')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setShowConfirm(true)
  }

  const confirmSubmit = async () => {
    setIsSubmitting(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 800))
      setFormData((prev) => ({ ...prev, images }))
      console.log('Product saved:', { ...formData, images })
      addAlert('success', 'Success', `Product ${productId ? 'updated' : 'created'} successfully!`)
      setShowConfirm(false)
      setTimeout(() => onBack(), 1000)
    } catch (error) {
      addAlert('error', 'Error', 'Failed to save product. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-8">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-primary hover:text-primary/90 mb-6 transition-colors"
      >
        <ArrowLeft size={20} />
        <span>Back to Products</span>
      </button>

      <div className="max-w-4xl">
        <h2 className="text-3xl font-bold text-foreground mb-8">
          {productId ? 'Edit Product' : 'Add New Product'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Image Section */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Product Images</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {images.map((image, idx) => (
                <div key={idx} className="relative group">
                  <img
                    src={image || "/placeholder.svg"}
                    alt={`Product ${idx + 1}`}
                    className="w-full aspect-square object-cover rounded-lg border border-border"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 bg-destructive text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
              <label className="flex items-center justify-center aspect-square border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-secondary/50 transition-colors">
                <div className="flex flex-col items-center gap-2">
                  <Plus size={24} className="text-muted-foreground" />
                  <span className="text-xs text-muted-foreground text-center">Add Image</span>
                </div>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Basic Information */}
          <div className="bg-card border border-border rounded-lg p-6 space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Basic Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Product Name</label>
                <Input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter product name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">SKU</label>
                <Input
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleInputChange}
                  placeholder="Enter SKU"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Category</label>
                <Input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  placeholder="Enter category"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Price</label>
                <Input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="Enter price"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Stock</label>
                <Input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  placeholder="Enter stock quantity"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Description</label>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter product description"
                rows={4}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isSubmitting ? 'Saving...' : productId ? 'Update Product' : 'Add Product'}
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
      </div>

      <ConfirmationModal
        isOpen={showConfirm}
        title={productId ? 'Update Product?' : 'Add Product?'}
        message={`Are you sure you want to ${productId ? 'update' : 'add'} this product? This action can be undone.`}
        confirmText={productId ? 'Update' : 'Add'}
        onConfirm={confirmSubmit}
        onCancel={() => setShowConfirm(false)}
        isLoading={isSubmitting}
      />
    </div>
  )
}
