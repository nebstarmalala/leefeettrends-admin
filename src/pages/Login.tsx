import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAlert } from '@/context/alert-context'
import { useAuth } from '@/context/auth-context'

export default function Login() {
  const navigate = useNavigate()
  const { addAlert } = useAlert()
  const { login } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.email.trim()) {
      addAlert('warning', 'Missing Email', 'Please enter your email address')
      return
    }

    if (!formData.password.trim()) {
      addAlert('warning', 'Missing Password', 'Please enter your password')
      return
    }

    if (!formData.email.includes('@')) {
      addAlert('warning', 'Invalid Email', 'Please enter a valid email address')
      return
    }

    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      login()
      addAlert('success', 'Login Successful', 'Welcome back to Lee Feet Trends!')
      setTimeout(() => {
        navigate('/')
      }, 500)
    } catch (error) {
      addAlert('error', 'Login Failed', 'Invalid email or password. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-primary-foreground font-bold text-xl sm:text-2xl">LF</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold text-foreground mb-1 sm:mb-2">Lee Feet Trends</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Admin Dashboard</p>
        </div>

        {/* Login Card */}
        <div className="bg-card border border-border rounded-2xl shadow-lg p-5 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-1 sm:mb-2">Welcome Back</h2>
          <p className="text-sm sm:text-base text-muted-foreground mb-5 sm:mb-6">Sign in to your account to continue</p>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5 sm:mb-2">
                Email Address
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="admin@example.com"
                className="w-full h-11 sm:h-10 text-base sm:text-sm"
              />
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1.5 sm:mb-2">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className="w-full h-11 sm:h-10 text-base sm:text-sm pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-border bg-secondary accent-primary"
                />
                <span className="text-foreground">Remember me</span>
              </label>
              <a href="#" className="text-primary hover:text-primary/90 transition-colors">
                Forgot password?
              </a>
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-11 sm:h-10 text-base sm:text-sm font-medium"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-5 sm:mt-6 pt-5 sm:pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground text-center mb-2 sm:mb-3">Demo Credentials:</p>
            <div className="space-y-1.5 sm:space-y-2 text-xs text-muted-foreground bg-secondary/50 rounded-xl p-3">
              <p><span className="font-medium text-foreground">Email:</span> admin@example.com</p>
              <p><span className="font-medium text-foreground">Password:</span> demo123</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-4 sm:mt-6 text-xs sm:text-sm text-muted-foreground">
          <p>
            Protected Admin Area{' '}
            <span className="text-foreground font-medium">© 2026</span>
          </p>
        </div>
      </div>
    </div>
  )
}
