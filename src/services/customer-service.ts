import { query, execute } from '../lib/database';
import { Customer, PaginationParams, PaginatedResult } from '../types/database';
import { RowDataPacket } from 'mysql2';

interface CustomerRow extends Customer, RowDataPacket {}
interface CountRow extends RowDataPacket { count: number }

export class CustomerService {
  static async getAll(pagination?: PaginationParams): Promise<PaginatedResult<Customer>> {
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 50;
    const offset = (page - 1) * limit;

    const [countResult] = await query<CountRow[]>('SELECT COUNT(*) as count FROM customers');
    const total = countResult.count;

    const sql = 'SELECT * FROM customers ORDER BY created_at DESC LIMIT ? OFFSET ?';
    const data = await query<CustomerRow[]>(sql, [limit, offset]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  static async getById(id: number): Promise<Customer | null> {
    const sql = 'SELECT * FROM customers WHERE id = ?';
    const results = await query<CustomerRow[]>(sql, [id]);
    return results.length > 0 ? results[0] : null;
  }

  static async create(customer: Omit<Customer, 'id' | 'created_at' | 'updated_at'>): Promise<Customer> {
    const sql = 'INSERT INTO customers (name, email, phone, address) VALUES (?, ?, ?, ?)';
    const result = await execute(sql, [customer.name, customer.email, customer.phone ?? null, customer.address ?? null]);
    const created = await this.getById(result.insertId);
    if (!created) throw new Error('Failed to create customer');
    return created;
  }

  static async update(id: number, customer: Partial<Customer>): Promise<Customer | null> {
    const fields: string[] = [];
    const values: unknown[] = [];

    if (customer.name !== undefined) {
      fields.push('name = ?');
      values.push(customer.name);
    }
    if (customer.email !== undefined) {
      fields.push('email = ?');
      values.push(customer.email);
    }
    if (customer.phone !== undefined) {
      fields.push('phone = ?');
      values.push(customer.phone);
    }
    if (customer.address !== undefined) {
      fields.push('address = ?');
      values.push(customer.address);
    }

    if (fields.length === 0) return await this.getById(id);

    const sql = `UPDATE customers SET ${fields.join(', ')} WHERE id = ?`;
    await execute(sql, [...values, id]);
    return await this.getById(id);
  }

  static async delete(id: number): Promise<boolean> {
    const sql = 'DELETE FROM customers WHERE id = ?';
    const result = await execute(sql, [id]);
    return result.affectedRows > 0;
  }

  static async search(term: string, pagination?: PaginationParams): Promise<PaginatedResult<Customer>> {
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 50;
    const offset = (page - 1) * limit;
    const searchTerm = `%${term}%`;

    const [countResult] = await query<CountRow[]>(
      'SELECT COUNT(*) as count FROM customers WHERE name LIKE ? OR email LIKE ?',
      [searchTerm, searchTerm]
    );
    const total = countResult.count;

    const sql = 'SELECT * FROM customers WHERE name LIKE ? OR email LIKE ? ORDER BY created_at DESC LIMIT ? OFFSET ?';
    const data = await query<CustomerRow[]>(sql, [searchTerm, searchTerm, limit, offset]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }
}