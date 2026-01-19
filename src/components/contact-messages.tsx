import { useState } from 'react'
import { Trash2, Eye, Mail, Search, Filter, MessageSquare, ArrowLeft, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import StatusBadge from '@/components/ui/status-badge'
import { useAlert } from '@/context/alert-context'
import ConfirmationModal from './confirmation-modal'

interface ContactMessage {
  id: string
  name: string
  email: string
  phone: string
  subject: string
  message: string
  status: string
  date: string
}

const initialMessages: ContactMessage[] = [
  {
    id: '1',
    name: 'Jennifer Lee',
    email: 'jen@example.com',
    phone: '(555) 111-2222',
    subject: 'Question about shoe sizes',
    message: 'Hi, I would like to know if you have the Running Shoe Pro in size 12. Also, what is the return policy?',
    status: 'New',
    date: 'Jan 19, 2026',
  },
  {
    id: '2',
    name: 'Robert Martinez',
    email: 'robert@example.com',
    phone: '(555) 222-3333',
    subject: 'Order inquiry',
    message: 'I placed an order 2 weeks ago and still haven\'t received it. Order #ORD-2024-102. Please advise.',
    status: 'Replied',
    date: 'Jan 18, 2026',
  },
  {
    id: '3',
    name: 'Lisa Anderson',
    email: 'lisa@example.com',
    phone: '(555) 333-4444',
    subject: 'Product review request',
    message: 'I would like to provide a review of the Basketball High Top shoes I purchased. They are amazing!',
    status: 'New',
    date: 'Jan 18, 2026',
  },
  {
    id: '4',
    name: 'David Thompson',
    email: 'david@example.com',
    phone: '(555) 444-5555',
    subject: 'Bulk order inquiry',
    message: 'We are interested in ordering 50 pairs of Casual Loafers for our company event. Can you provide a quote?',
    status: 'Pending',
    date: 'Jan 17, 2026',
  },
  {
    id: '5',
    name: 'Michelle White',
    email: 'michelle@example.com',
    phone: '(555) 555-6666',
    subject: 'Defective product',
    message: 'The sole on my Hiking Boot started peeling after one month. I would like a replacement or refund.',
    status: 'Replied',
    date: 'Jan 17, 2026',
  },
]

export default function ContactMessages() {
  const { addAlert } = useAlert()
  const [messages, setMessages] = useState<ContactMessage[]>(initialMessages)
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const handleDeleteClick = (id: string) => {
    setMessageToDelete(id)
    setShowDeleteConfirm(true)
  }

  const confirmDelete = async () => {
    if (!messageToDelete) return
    setIsDeleting(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 500))
      setMessages(messages.filter((m) => m.id !== messageToDelete))
      addAlert('success', 'Deleted', 'Message has been deleted successfully')
      setShowDeleteConfirm(false)
      setMessageToDelete(null)
      if (selectedMessage?.id === messageToDelete) {
        setSelectedMessage(null)
      }
    } catch (error) {
      addAlert('error', 'Error', 'Failed to delete message. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  const updateStatus = (id: string, newStatus: string) => {
    setMessages(
      messages.map((m) =>
        m.id === id ? { ...m, status: newStatus } : m
      )
    )
    addAlert('success', 'Status Updated', `Message status changed to ${newStatus}`)
  }

  const filteredMessages = messages.filter(
    (message) =>
      message.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.subject.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Message Detail View
  if (selectedMessage) {
    return (
      <div className="p-8 bg-background min-h-screen">
        <button
          onClick={() => setSelectedMessage(null)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to Messages</span>
        </button>

        <div className="max-w-3xl">
          <div className="bg-card border border-border rounded-2xl p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                  <span className="text-lg font-semibold text-primary">
                    {selectedMessage.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">{selectedMessage.name}</h2>
                  <p className="text-sm text-muted-foreground">{selectedMessage.date}</p>
                </div>
              </div>
              <StatusBadge status={selectedMessage.status} />
            </div>

            {/* Subject */}
            <h3 className="text-lg font-semibold text-foreground mb-4">{selectedMessage.subject}</h3>

            {/* Message */}
            <div className="bg-secondary/30 rounded-xl p-4 mb-6">
              <p className="text-foreground leading-relaxed">{selectedMessage.message}</p>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-secondary/20 rounded-xl">
              <div className="flex items-center gap-3">
                <Mail size={18} className="text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <a href={`mailto:${selectedMessage.email}`} className="text-sm text-foreground hover:text-primary">
                    {selectedMessage.email}
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={18} className="text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <a href={`tel:${selectedMessage.phone}`} className="text-sm text-foreground hover:text-primary">
                    {selectedMessage.phone}
                  </a>
                </div>
              </div>
            </div>

            {/* Status Update */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-foreground mb-2">Update Status</label>
              <select
                value={selectedMessage.status}
                onChange={(e) => {
                  updateStatus(selectedMessage.id, e.target.value)
                  setSelectedMessage((prev) => (prev ? { ...prev, status: e.target.value } : null))
                }}
                className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground"
              >
                <option value="New">New</option>
                <option value="Pending">Pending</option>
                <option value="Replied">Replied</option>
              </select>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <Button className="flex items-center gap-2">
                <Mail size={16} />
                Reply via Email
              </Button>
              <Button variant="outline" onClick={() => setSelectedMessage(null)}>
                Close
              </Button>
              <Button
                variant="outline"
                className="text-red-500 hover:bg-red-500/10 hover:text-red-500 border-red-500/30 ml-auto"
                onClick={() => handleDeleteClick(selectedMessage.id)}
              >
                <Trash2 size={16} />
              </Button>
            </div>
          </div>
        </div>

        <ConfirmationModal
          isOpen={showDeleteConfirm}
          title="Delete Message?"
          message="Are you sure you want to delete this message? This action cannot be undone."
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

  return (
    <div className="p-8 bg-background min-h-screen">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-foreground tracking-tight">Messages</h2>
          <p className="text-muted-foreground mt-1">View and manage contact form messages</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-xl border-border bg-card"
          />
        </div>
        <Button variant="outline" className="flex items-center gap-2 rounded-xl">
          <Filter size={16} />
          Filters
        </Button>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="bg-secondary/50">
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">From</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Subject</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredMessages.map((message) => (
              <tr
                key={message.id}
                onClick={() => setSelectedMessage(message)}
                className="group hover:bg-secondary/30 transition-colors cursor-pointer"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500/20 to-violet-500/5 flex items-center justify-center">
                      <MessageSquare size={18} className="text-violet-500" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground group-hover:text-primary transition-colors">{message.name}</p>
                      <p className="text-xs text-muted-foreground">{message.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-foreground font-medium">{message.subject}</p>
                  <p className="text-xs text-muted-foreground truncate max-w-xs mt-1">
                    {message.message}
                  </p>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={message.status} />
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{message.date}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedMessage(message)
                      }}
                      className="p-2 hover:bg-primary/10 rounded-lg transition-colors group/btn"
                      aria-label="View message"
                    >
                      <Eye size={16} className="text-muted-foreground group-hover/btn:text-primary transition-colors" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteClick(message.id)
                      }}
                      className="p-2 hover:bg-red-500/10 rounded-lg transition-colors group/btn"
                      aria-label="Delete message"
                    >
                      <Trash2 size={16} className="text-muted-foreground group-hover/btn:text-red-500 transition-colors" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredMessages.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare size={48} className="mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">No messages found</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing <span className="font-medium text-foreground">{filteredMessages.length}</span> of <span className="font-medium text-foreground">{messages.length}</span> messages
        </p>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-xl" disabled>Previous</Button>
          <Button variant="outline" className="rounded-xl">Next</Button>
        </div>
      </div>

      <ConfirmationModal
        isOpen={showDeleteConfirm}
        title="Delete Message?"
        message="Are you sure you want to delete this message? This action cannot be undone."
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
