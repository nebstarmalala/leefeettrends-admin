import { useNavigate } from 'react-router-dom'
import { LayoutDashboard, Package, ShoppingCart, Users, Mail, LogOut, ChevronRight, X } from 'lucide-react'
import { useAuth } from '@/context/auth-context'

type Page = 'dashboard' | 'products' | 'orders' | 'customers' | 'messages'

interface SidebarProps {
  currentPage: Page
  setCurrentPage: (page: Page) => void
  isOpen: boolean
  onClose: () => void
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
  { id: 'products', label: 'Products', icon: Package, badge: '24' },
  { id: 'orders', label: 'Orders', icon: ShoppingCart, badge: '12' },
  { id: 'customers', label: 'Customers', icon: Users, badge: null },
  { id: 'messages', label: 'Messages', icon: Mail, badge: '3' },
]

export default function Sidebar({ currentPage, setCurrentPage, isOpen, onClose }: SidebarProps) {
  const navigate = useNavigate()
  const { logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handlePageChange = (page: Page) => {
    setCurrentPage(page)
    onClose() // Close sidebar on mobile after selection
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-72 bg-gradient-to-b from-sidebar to-sidebar/95
          border-r border-sidebar-border flex flex-col h-screen shadow-xl
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo Section */}
        <div className="p-4 sm:p-6 border-b border-sidebar-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg">
                <span className="text-primary-foreground font-bold text-lg">LF</span>
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-sidebar-foreground tracking-tight">Lee Feet Trends</h1>
                <p className="text-xs text-muted-foreground">Admin Dashboard</p>
              </div>
            </div>
            {/* Mobile Close Button */}
            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-lg hover:bg-sidebar-accent/80 text-sidebar-foreground"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 sm:p-4 space-y-1.5 overflow-y-auto">
          <p className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Menu</p>
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = currentPage === item.id

            return (
              <button
                key={item.id}
                onClick={() => handlePageChange(item.id as Page)}
                className={`group w-full flex items-center gap-3 px-3 sm:px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/25'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/80 active:scale-[0.98]'
                }`}
              >
                <div className={`p-2 rounded-lg ${isActive ? 'bg-white/20' : 'bg-sidebar-accent/50 group-hover:bg-sidebar-accent'}`}>
                  <Icon size={18} />
                </div>
                <span className="font-medium flex-1 text-left">{item.label}</span>
                {item.badge && (
                  <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-primary/10 text-primary'
                  }`}>
                    {item.badge}
                  </span>
                )}
                {isActive && <ChevronRight size={16} className="opacity-70 hidden sm:block" />}
              </button>
            )
          })}
        </nav>

        {/* Footer Section */}
        <div className="p-3 sm:p-4 border-t border-sidebar-border/50 space-y-3">
          {/* Help Card - Hidden on small screens */}
          <div className="hidden sm:block p-4 rounded-xl bg-gradient-to-br from-sidebar-accent to-sidebar-accent/50 border border-sidebar-border/30">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-sm">?</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-sidebar-foreground">Need help?</p>
                <p className="text-xs text-muted-foreground mt-0.5">Check our documentation</p>
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 sm:px-4 py-3 rounded-xl text-sidebar-foreground hover:bg-red-500/10 hover:text-red-500 transition-all duration-200 group active:scale-[0.98]"
          >
            <div className="p-2 rounded-lg bg-sidebar-accent/50 group-hover:bg-red-500/20 transition-colors">
              <LogOut size={18} />
            </div>
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>
    </>
  )
}
