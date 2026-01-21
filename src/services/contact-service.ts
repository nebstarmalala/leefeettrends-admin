import { api } from '../lib/api';
import { ContactMessage } from '../types/database';

export class ContactService {
  static async getAll(): Promise<ContactMessage[]> {
    return api.get<ContactMessage[]>('/contact');
  }

  static async getById(id: number): Promise<ContactMessage | null> {
    try {
      return await api.get<ContactMessage>(`/contact/${id}`);
    } catch {
      return null;
    }
  }

  static async create(message: Omit<ContactMessage, 'id' | 'created_at'>): Promise<ContactMessage> {
    return api.post<ContactMessage>('/contact', message);
  }

  static async updateStatus(id: number, status: ContactMessage['status']): Promise<ContactMessage> {
    return api.patch<ContactMessage>(`/contact/${id}/status`, { status });
  }

  static async delete(id: number): Promise<boolean> {
    await api.delete(`/contact/${id}`);
    return true;
  }

  static async markAsRead(id: number): Promise<ContactMessage> {
    return this.updateStatus(id, 'read');
  }

  static async markAsReplied(id: number): Promise<ContactMessage> {
    return this.updateStatus(id, 'replied');
  }
}
