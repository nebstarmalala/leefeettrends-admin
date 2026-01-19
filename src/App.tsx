import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from '@/context/theme-context'
import { AuthProvider, useAuth } from '@/context/auth-context'
import { AlertProvider } from '@/context/alert-context'
import AlertDisplay from '@/components/alert-display'
import Login from '@/pages/Login'
import Dashboard from '@/pages/Dashboard'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider defaultTheme="system" storageKey="leefeet-theme">
        <AuthProvider>
          <AlertProvider>
            <AlertDisplay />
            <AppRoutes />
          </AlertProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
