import { query } from '../lib/database';
import { Customer } from '../types/database';

export class CustomerService {
  static async getAll(): Promise<Customer[]> {
    const sql = 'SELECT * FROM customers ORDER BY created_at DESC';
    return await query(sql);
  }

  static async getById(id: number): Promise<Customer | null> {
    const sql = 'SELECT * FROM customers WHERE id = ?';
    const results = await query(sql, [id]);
    return results.length > 0 ? results[0] : null;
  }

  static async create(customer: Omit<Customer, 'id' | 'created_at' | 'updated_at'>): Promise<Customer> {
    const sql = 'INSERT INTO customers (name, email, phone, address) VALUES (?, ?, ?, ?)';
    const result = await query(sql, [customer.name, customer.email, customer.phone, customer.address]);
    const created = await this.getById(result.insertId);
    if (!created) throw new Error('Failed to create customer');
    return created;
  }

  static async update(id: number, customer: Partial<Customer>): Promise<Customer | null> {
    const fields = [];
    const values = [];
    
    if (customer.name) {
      fields.push('name = ?');
      values.push(customer.name);
    }
    if (customer.email) {
      fields.push('email = ?');
      values.push(customer.email);
    }
    if (customer.phone) {
      fields.push('phone = ?');
      values.push(customer.phone);
    }
    if (customer.address) {
      fields.push('address = ?');
      values.push(customer.address);
    }
    
    if (fields.length === 0) return await this.getById(id);
    
    const sql = `UPDATE customers SET ${fields.join(', ')} WHERE id = ?`;
    await query(sql, [...values, id]);
    return await this.getById(id);
  }

  static async delete(id: number): Promise<boolean> {
    const sql = 'DELETE FROM customers WHERE id = ?';
    const result = await query(sql, [id]);
    return result.affectedRows > 0;
  }

  static async search(term: string): Promise<Customer[]> {
    const sql = 'SELECT * FROM customers WHERE name LIKE ? OR email LIKE ? ORDER BY created_at DESC';
    const searchTerm = `%${term}%`;
    return await query(sql, [searchTerm, searchTerm]);
  }
}