import { useState, useEffect } from 'react'
import { Plus, Trash2, Edit2, Search, Filter, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import StatusBadge, { getStockStatus } from '@/components/ui/status-badge'
import ProductDetails from './product-details'
import ConfirmationModal from './confirmation-modal'
import { useAlert } from '@/context/alert-context'
import { ProductService, CategoryService } from '@/services/product-service'
import { Product as DBProduct, Category as DBCategory } from '@/types/database'

interface Product {
  id: string
  name: string
  sku: string
  price: number
  stock: number
  category: string
}

const mapDBProductToProduct = async (dbProduct: DBProduct, categories: DBCategory[]): Promise<Product> => {
  const category = categories.find(c => c.id === dbProduct.category_id);
  return {
    id: dbProduct.id.toString(),
    name: dbProduct.name,
    sku: dbProduct.sku || 'N/A',
    price: dbProduct.price,
    stock: dbProduct.stock_quantity,
    category: category?.name || 'Uncategorized'
  };
};

export default function ProductManagement() {
  const { addAlert } = useAlert()
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [productToDelete, setProductToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true)
        const [dbProducts, categories] = await Promise.all([
          ProductService.getAll(),
          CategoryService.getAll()
        ])
        const mappedProducts = await Promise.all(
          dbProducts.map(product => mapDBProductToProduct(product, categories))
        )
        setProducts(mappedProducts)
      } catch (error) {
        console.error('Failed to load products:', error)
        addAlert('error', 'Error', 'Failed to load products')
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [addAlert])

  const handleDeleteClick = (id: string) => {
    setProductToDelete(id)
    setShowDeleteConfirm(true)
  }

  const confirmDelete = async () => {
    if (!productToDelete) return
    setIsDeleting(true)
    try {
      await ProductService.delete(parseInt(productToDelete))
      const product = products.find((p) => p.id === productToDelete)
      setProducts(products.filter((p) => p.id !== productToDelete))
      addAlert('success', 'Deleted', `${product?.name} has been deleted successfully`)
      setShowDeleteConfirm(false)
      setProductToDelete(null)
    } catch (error) {
      addAlert('error', 'Error', 'Failed to delete product. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (selectedProductId) {
    return (
      <ProductDetails
        productId={selectedProductId}
        onBack={() => setSelectedProductId(null)}
      />
    )
  }

  if (isAddingNew) {
    return (
      <ProductDetails
        onBack={() => setIsAddingNew(false)}
      />
    )
  }

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 bg-background min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading products...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-background min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">Products</h2>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">Manage your product inventory</p>
        </div>
        <Button
          onClick={() => setIsAddingNew(true)}
          className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl px-4 sm:px-5 py-2 sm:py-2.5 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all w-full sm:w-auto justify-center"
        >
          <Plus size={18} />
          Add Product
        </Button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-6">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products..."
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
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            onClick={() => setSelectedProductId(product.id)}
            className="bg-card border border-border rounded-xl p-4 active:scale-[0.99] transition-transform cursor-pointer"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0">
                  <Package size={18} className="text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground truncate">{product.name}</p>
                  <p className="text-xs text-muted-foreground">{product.sku}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedProductId(product.id)
                  }}
                  className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
                  aria-label="Edit product"
                >
                  <Edit2 size={16} className="text-muted-foreground" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteClick(product.id)
                  }}
                  className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                  aria-label="Delete product"
                >
                  <Trash2 size={16} className="text-muted-foreground" />
                </button>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Price</p>
                  <p className="font-semibold text-foreground">${product.price.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Stock</p>
                  <p className="text-sm text-muted-foreground">{product.stock} units</p>
                </div>
              </div>
              <StatusBadge status={getStockStatus(product.stock)} size="sm" />
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="bg-secondary/50">
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Product</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">SKU</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Price</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Stock</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Category</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredProducts.map((product) => (
              <tr
                key={product.id}
                onClick={() => setSelectedProductId(product.id)}
                className="group hover:bg-secondary/30 transition-colors cursor-pointer"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                      <Package size={18} className="text-primary" />
                    </div>
                    <p className="font-medium text-foreground group-hover:text-primary transition-colors">{product.name}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <code className="text-sm text-muted-foreground bg-secondary px-2 py-1 rounded">{product.sku}</code>
                </td>
                <td className="px-6 py-4">
                  <span className="font-semibold text-foreground">${product.price.toFixed(2)}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{product.stock} units</span>
                    <StatusBadge status={getStockStatus(product.stock)} size="sm" />
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-muted-foreground bg-secondary/80 px-3 py-1 rounded-full">{product.category}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedProductId(product.id)
                      }}
                      className="p-2 hover:bg-primary/10 rounded-lg transition-colors group/btn"
                      aria-label="Edit product"
                    >
                      <Edit2 size={16} className="text-muted-foreground group-hover/btn:text-primary transition-colors" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteClick(product.id)
                      }}
                      className="p-2 hover:bg-red-500/10 rounded-lg transition-colors group/btn"
                      aria-label="Delete product"
                    >
                      <Trash2 size={16} className="text-muted-foreground group-hover/btn:text-red-500 transition-colors" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package size={48} className="mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">No products found</p>
          </div>
        )}
      </div>

      {/* Mobile Empty State */}
      {filteredProducts.length === 0 && (
        <div className="block lg:hidden text-center py-12 bg-card border border-border rounded-xl">
          <Package size={48} className="mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">No products found</p>
        </div>
      )}

      {/* Pagination */}
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground order-2 sm:order-1">
          Showing <span className="font-medium text-foreground">{filteredProducts.length}</span> of <span className="font-medium text-foreground">{products.length}</span> products
        </p>
        <div className="flex gap-2 order-1 sm:order-2 w-full sm:w-auto">
          <Button variant="outline" className="rounded-xl flex-1 sm:flex-none" disabled>Previous</Button>
          <Button variant="outline" className="rounded-xl flex-1 sm:flex-none">Next</Button>
        </div>
      </div>

      <ConfirmationModal
        isOpen={showDeleteConfirm}
        title="Delete Product?"
        message="Are you sure you want to delete this product? This action cannot be undone."
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
