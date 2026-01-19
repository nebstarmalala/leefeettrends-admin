import { useState } from 'react'
import { Menu } from 'lucide-react'
import DashboardView from '@/components/dashboard'
import ProductManagement from '@/components/product-management'
import OrderManagement from '@/components/order-management'
import CustomerManagement from '@/components/customer-management'
import ContactMessages from '@/components/contact-messages'
import Sidebar from '@/components/sidebar'

type Page = 'dashboard' | 'products' | 'orders' | 'customers' | 'messages'

const pageLabels: Record<Page, string> = {
  dashboard: 'Dashboard',
  products: 'Products',
  orders: 'Orders',
  customers: 'Customers',
  messages: 'Messages',
}

export default function Dashboard() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const renderPage = () => {
    switch (currentPage) {
      case 'products':
        return <ProductManagement />
      case 'orders':
        return <OrderManagement />
      case 'customers':
        return <CustomerManagement />
      case 'messages':
        return <ContactMessages />
      default:
        return <DashboardView />
    }
  }

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <main className="flex-1 overflow-auto flex flex-col">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 -ml-2 rounded-lg hover:bg-secondary active:scale-95 transition-all"
              aria-label="Open menu"
            >
              <Menu size={24} />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">LF</span>
              </div>
              <span className="font-semibold text-foreground">{pageLabels[currentPage]}</span>
            </div>
          </div>
        </header>
        <div className="flex-1">
          {renderPage()}
        </div>
      </main>
    </div>
  )
}
