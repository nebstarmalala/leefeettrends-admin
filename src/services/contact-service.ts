import { query, execute } from '../lib/database';
import { ContactMessage, PaginationParams, PaginatedResult } from '../types/database';
import { RowDataPacket } from 'mysql2';

interface ContactMessageRow extends ContactMessage, RowDataPacket {}
interface CountRow extends RowDataPacket { count: number }

export class ContactService {
  static async getAll(pagination?: PaginationParams): Promise<PaginatedResult<ContactMessage>> {
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 50;
    const offset = (page - 1) * limit;

    const [countResult] = await query<CountRow[]>('SELECT COUNT(*) as count FROM contact_messages');
    const total = countResult.count;

    const sql = 'SELECT * FROM contact_messages ORDER BY created_at DESC LIMIT ? OFFSET ?';
    const data = await query<ContactMessageRow[]>(sql, [limit, offset]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  static async getById(id: number): Promise<ContactMessage | null> {
    const sql = 'SELECT * FROM contact_messages WHERE id = ?';
    const results = await query<ContactMessageRow[]>(sql, [id]);
    return results.length > 0 ? results[0] : null;
  }

  static async create(message: Omit<ContactMessage, 'id' | 'created_at'>): Promise<ContactMessage> {
    const sql = 'INSERT INTO contact_messages (name, email, subject, message, status) VALUES (?, ?, ?, ?, ?)';
    const result = await execute(sql, [
      message.name,
      message.email,
      message.subject ?? null,
      message.message,
      message.status || 'unread'
    ]);
    const created = await this.getById(result.insertId);
    if (!created) throw new Error('Failed to create contact message');
    return created;
  }

  static async updateStatus(id: number, status: ContactMessage['status']): Promise<ContactMessage | null> {
    const sql = 'UPDATE contact_messages SET status = ? WHERE id = ?';
    await execute(sql, [status, id]);
    return await this.getById(id);
  }

  static async delete(id: number): Promise<boolean> {
    const sql = 'DELETE FROM contact_messages WHERE id = ?';
    const result = await execute(sql, [id]);
    return result.affectedRows > 0;
  }

  static async getByStatus(status: ContactMessage['status'], pagination?: PaginationParams): Promise<PaginatedResult<ContactMessage>> {
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 50;
    const offset = (page - 1) * limit;

    const [countResult] = await query<CountRow[]>(
      'SELECT COUNT(*) as count FROM contact_messages WHERE status = ?',
      [status]
    );
    const total = countResult.count;

    const sql = 'SELECT * FROM contact_messages WHERE status = ? ORDER BY created_at DESC LIMIT ? OFFSET ?';
    const data = await query<ContactMessageRow[]>(sql, [status, limit, offset]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  static async getUnreadCount(): Promise<number> {
    const sql = 'SELECT COUNT(*) as count FROM contact_messages WHERE status = ?';
    const [result] = await query<CountRow[]>(sql, ['unread']);
    return result.count;
  }

  static async markAsRead(id: number): Promise<ContactMessage | null> {
    return await this.updateStatus(id, 'read');
  }

  static async markAsReplied(id: number): Promise<ContactMessage | null> {
    return await this.updateStatus(id, 'replied');
  }
}