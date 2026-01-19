import { query } from '../lib/database';
import { ContactMessage } from '../types/database';

export class ContactService {
  static async getAll(): Promise<ContactMessage[]> {
    const sql = 'SELECT * FROM contact_messages ORDER BY created_at DESC';
    return await query(sql);
  }

  static async getById(id: number): Promise<ContactMessage | null> {
    const sql = 'SELECT * FROM contact_messages WHERE id = ?';
    const results = await query(sql, [id]);
    return results.length > 0 ? results[0] : null;
  }

  static async create(message: Omit<ContactMessage, 'id' | 'created_at'>): Promise<ContactMessage> {
    const sql = 'INSERT INTO contact_messages (name, email, subject, message, status) VALUES (?, ?, ?, ?, ?)';
    const result = await query(sql, [
      message.name,
      message.email,
      message.subject,
      message.message,
      message.status || 'unread'
    ]);
    const created = await this.getById(result.insertId);
    if (!created) throw new Error('Failed to create contact message');
    return created;
  }

  static async updateStatus(id: number, status: ContactMessage['status']): Promise<ContactMessage | null> {
    const sql = 'UPDATE contact_messages SET status = ? WHERE id = ?';
    await query(sql, [status, id]);
    return await this.getById(id);
  }

  static async delete(id: number): Promise<boolean> {
    const sql = 'DELETE FROM contact_messages WHERE id = ?';
    const result = await query(sql, [id]);
    return result.affectedRows > 0;
  }

  static async getByStatus(status: ContactMessage['status']): Promise<ContactMessage[]> {
    const sql = 'SELECT * FROM contact_messages WHERE status = ? ORDER BY created_at DESC';
    return await query(sql, [status]);
  }

  static async getUnreadCount(): Promise<number> {
    const sql = 'SELECT COUNT(*) as count FROM contact_messages WHERE status = "unread"';
    const result = await query(sql);
    return result[0]?.count || 0;
  }
}