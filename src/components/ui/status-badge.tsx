interface StatusBadgeProps {
  status: string
  size?: 'sm' | 'md'
}

const statusStyles: { [key: string]: { bg: string; text: string; dot: string } } = {
  'Completed': {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-600',
    dot: 'bg-emerald-500'
  },
  'Processing': {
    bg: 'bg-blue-500/10',
    text: 'text-blue-600',
    dot: 'bg-blue-500'
  },
  'Pending': {
    bg: 'bg-amber-500/10',
    text: 'text-amber-600',
    dot: 'bg-amber-500'
  },
  'Shipped': {
    bg: 'bg-violet-500/10',
    text: 'text-violet-600',
    dot: 'bg-violet-500'
  },
  'Cancelled': {
    bg: 'bg-red-500/10',
    text: 'text-red-600',
    dot: 'bg-red-500'
  },
  'Active': {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-600',
    dot: 'bg-emerald-500'
  },
  'Inactive': {
    bg: 'bg-gray-500/10',
    text: 'text-gray-600',
    dot: 'bg-gray-500'
  },
  'New': {
    bg: 'bg-blue-500/10',
    text: 'text-blue-600',
    dot: 'bg-blue-500'
  },
  'Read': {
    bg: 'bg-gray-500/10',
    text: 'text-gray-600',
    dot: 'bg-gray-500'
  },
  'Replied': {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-600',
    dot: 'bg-emerald-500'
  },
  'In Stock': {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-600',
    dot: 'bg-emerald-500'
  },
  'Low Stock': {
    bg: 'bg-amber-500/10',
    text: 'text-amber-600',
    dot: 'bg-amber-500'
  },
  'Out of Stock': {
    bg: 'bg-red-500/10',
    text: 'text-red-600',
    dot: 'bg-red-500'
  },
}

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const styles = statusStyles[status] || {
    bg: 'bg-gray-500/10',
    text: 'text-gray-600',
    dot: 'bg-gray-500'
  }

  const sizeClasses = size === 'sm'
    ? 'px-2 py-0.5 text-xs'
    : 'px-2.5 py-1 text-xs'

  return (
    <span className={`inline-flex items-center gap-1.5 ${sizeClasses} ${styles.bg} ${styles.text} rounded-full font-medium`}>
      <span className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} />
      {status}
    </span>
  )
}

export function getStockStatus(stock: number): string {
  if (stock > 30) return 'In Stock'
  if (stock > 10) return 'Low Stock'
  return 'Out of Stock'
}
