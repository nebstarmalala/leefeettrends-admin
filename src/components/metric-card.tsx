import { TrendingUp, TrendingDown, type LucideIcon } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: string
  change: string
  trend: 'up' | 'down'
  icon: LucideIcon
  color: string
}

export default function MetricCard({
  title,
  value,
  change,
  trend,
  icon: Icon,
  color,
}: MetricCardProps) {
  const colorStyles: { [key: string]: { bg: string; icon: string; gradient: string } } = {
    'chart-1': {
      bg: 'bg-orange-500/10',
      icon: 'text-orange-500',
      gradient: 'from-orange-500/20 to-orange-500/5'
    },
    'chart-2': {
      bg: 'bg-emerald-500/10',
      icon: 'text-emerald-500',
      gradient: 'from-emerald-500/20 to-emerald-500/5'
    },
    'chart-3': {
      bg: 'bg-blue-500/10',
      icon: 'text-blue-500',
      gradient: 'from-blue-500/20 to-blue-500/5'
    },
    'chart-4': {
      bg: 'bg-violet-500/10',
      icon: 'text-violet-500',
      gradient: 'from-violet-500/20 to-violet-500/5'
    },
  }

  const styles = colorStyles[color] || colorStyles['chart-1']

  return (
    <div className="group relative bg-card border border-border rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 hover:shadow-lg hover:shadow-black/5 transition-all duration-300 hover:-translate-y-1 overflow-hidden">
      {/* Background Gradient */}
      <div className={`absolute top-0 right-0 w-20 sm:w-32 h-20 sm:h-32 bg-gradient-to-bl ${styles.gradient} rounded-full -translate-y-1/2 translate-x-1/2 opacity-60 group-hover:opacity-100 transition-opacity`} />

      <div className="relative flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">{title}</p>
          <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mt-1 sm:mt-2 tracking-tight">{value}</p>
          <div className="flex items-center gap-1 sm:gap-2 mt-2 sm:mt-3 flex-wrap">
            <div className={`flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold ${
              trend === 'up'
                ? 'bg-emerald-500/10 text-emerald-600'
                : 'bg-red-500/10 text-red-600'
            }`}>
              {trend === 'up' ? (
                <TrendingUp size={10} className="sm:w-3.5 sm:h-3.5" />
              ) : (
                <TrendingDown size={10} className="sm:w-3.5 sm:h-3.5" />
              )}
              {change}
            </div>
            <span className="text-muted-foreground text-[10px] sm:text-xs hidden sm:inline">vs last day</span>
          </div>
        </div>
        <div className={`${styles.bg} p-2 sm:p-2.5 lg:p-3.5 rounded-lg sm:rounded-xl shadow-sm flex-shrink-0`}>
          <Icon size={16} className={`sm:w-5 sm:h-5 lg:w-6 lg:h-6 ${styles.icon}`} />
        </div>
      </div>
    </div>
  )
}
