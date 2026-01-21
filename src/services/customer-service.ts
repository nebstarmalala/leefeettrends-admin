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
    const sql = 'SELECT * FROM customers WHERE customer_id = ?';
    const results = await query<CustomerRow[]>(sql, [id]);
    return results.length > 0 ? results[0] : null;
  }

  static async getByEmail(email: string): Promise<Customer | null> {
    const sql = 'SELECT * FROM customers WHERE email = ?';
    const results = await query<CustomerRow[]>(sql, [email]);
    return results.length > 0 ? results[0] : null;
  }

  static async create(customer: Omit<Customer, 'customer_id' | 'created_at' | 'updated_at'>): Promise<Customer> {
    const sql = 'INSERT INTO customers (first_name, last_name, email, password_hash, phone) VALUES (?, ?, ?, ?, ?)';
    const result = await execute(sql, [
      customer.first_name,
      customer.last_name,
      customer.email,
      customer.password_hash,
      customer.phone ?? null
    ]);
    const created = await this.getById(result.insertId);
    if (!created) throw new Error('Failed to create customer');
    return created;
  }

  static async update(id: number, customer: Partial<Customer>): Promise<Customer | null> {
    const fields: string[] = [];
    const values: unknown[] = [];

    if (customer.first_name !== undefined) {
      fields.push('first_name = ?');
      values.push(customer.first_name);
    }
    if (customer.last_name !== undefined) {
      fields.push('last_name = ?');
      values.push(customer.last_name);
    }
    if (customer.email !== undefined) {
      fields.push('email = ?');
      values.push(customer.email);
    }
    if (customer.password_hash !== undefined) {
      fields.push('password_hash = ?');
      values.push(customer.password_hash);
    }
    if (customer.phone !== undefined) {
      fields.push('phone = ?');
      values.push(customer.phone);
    }

    if (fields.length === 0) return await this.getById(id);

    const sql = `UPDATE customers SET ${fields.join(', ')} WHERE customer_id = ?`;
    await execute(sql, [...values, id]);
    return await this.getById(id);
  }

  static async delete(id: number): Promise<boolean> {
    const sql = 'DELETE FROM customers WHERE customer_id = ?';
    const result = await execute(sql, [id]);
    return result.affectedRows > 0;
  }

  static async search(term: string, pagination?: PaginationParams): Promise<PaginatedResult<Customer>> {
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 50;
    const offset = (page - 1) * limit;
    const searchTerm = `%${term}%`;

    const [countResult] = await query<CountRow[]>(
      'SELECT COUNT(*) as count FROM customers WHERE first_name LIKE ? OR last_name LIKE ? OR email LIKE ?',
      [searchTerm, searchTerm, searchTerm]
    );
    const total = countResult.count;

    const sql = 'SELECT * FROM customers WHERE first_name LIKE ? OR last_name LIKE ? OR email LIKE ? ORDER BY created_at DESC LIMIT ? OFFSET ?';
    const data = await query<CustomerRow[]>(sql, [searchTerm, searchTerm, searchTerm, limit, offset]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }
}
