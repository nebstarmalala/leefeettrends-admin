

import { useAlert } from '@/context/alert-context'
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react'

export default function AlertDisplay() {
  const { alerts, removeAlert } = useAlert()

  const getAlertStyles = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-900'
      case 'error':
        return 'bg-red-50 border-red-200 text-red-900'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-900'
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-900'
      default:
        return 'bg-gray-50 border-gray-200 text-gray-900'
    }
  }

  const getIconStyles = (type: string) => {
    switch (type) {
      case 'success':
        return 'text-green-600'
      case 'error':
        return 'text-red-600'
      case 'warning':
        return 'text-yellow-600'
      case 'info':
        return 'text-blue-600'
      default:
        return 'text-gray-600'
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} />
      case 'error':
        return <AlertCircle size={20} />
      case 'warning':
        return <AlertTriangle size={20} />
      case 'info':
        return <Info size={20} />
      default:
        return <Info size={20} />
    }
  }

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 max-w-md">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={`border rounded-lg p-4 shadow-lg animate-in fade-in slide-in-from-top-2 duration-300 ${getAlertStyles(
            alert.type
          )}`}
        >
          <div className="flex items-start gap-3">
            <div className={getIconStyles(alert.type)}>
              {getIcon(alert.type)}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1">{alert.title}</h3>
              <p className="text-sm opacity-90">{alert.message}</p>
            </div>
            <button
              onClick={() => removeAlert(alert.id)}
              className="p-1 hover:bg-black/10 rounded transition-colors"
              aria-label="Close alert"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
