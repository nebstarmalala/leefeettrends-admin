import { query } from '../lib/database';
import { Order, OrderItem } from '../types/database';

export class OrderService {
  static async getAll(): Promise<Order[]> {
    const sql = 'SELECT * FROM orders ORDER BY created_at DESC';
    return await query(sql);
  }

  static async getById(id: number): Promise<Order | null> {
    const sql = 'SELECT * FROM orders WHERE id = ?';
    const results = await query(sql, [id]);
    return results.length > 0 ? results[0] : null;
  }

  static async create(order: Omit<Order, 'id' | 'created_at' | 'updated_at'>): Promise<Order> {
    const sql = 'INSERT INTO orders (customer_id, order_number, status, total_amount, shipping_address, notes) VALUES (?, ?, ?, ?, ?, ?)';
    const result = await query(sql, [
      order.customer_id,
      order.order_number,
      order.status,
      order.total_amount,
      order.shipping_address,
      order.notes
    ]);
    const created = await this.getById(result.insertId);
    if (!created) throw new Error('Failed to create order');
    return created;
  }

  static async update(id: number, order: Partial<Order>): Promise<Order | null> {
    const fields = [];
    const values = [];
    
    if (order.customer_id !== undefined) {
      fields.push('customer_id = ?');
      values.push(order.customer_id);
    }
    if (order.order_number) {
      fields.push('order_number = ?');
      values.push(order.order_number);
    }
    if (order.status) {
      fields.push('status = ?');
      values.push(order.status);
    }
    if (order.total_amount !== undefined) {
      fields.push('total_amount = ?');
      values.push(order.total_amount);
    }
    if (order.shipping_address !== undefined) {
      fields.push('shipping_address = ?');
      values.push(order.shipping_address);
    }
    if (order.notes !== undefined) {
      fields.push('notes = ?');
      values.push(order.notes);
    }
    
    if (fields.length === 0) return await this.getById(id);
    
    const sql = `UPDATE orders SET ${fields.join(', ')} WHERE id = ?`;
    await query(sql, [...values, id]);
    return await this.getById(id);
  }

  static async delete(id: number): Promise<boolean> {
    const sql = 'DELETE FROM orders WHERE id = ?';
    const result = await query(sql, [id]);
    return result.affectedRows > 0;
  }

  static async getByStatus(status: string): Promise<Order[]> {
    const sql = 'SELECT * FROM orders WHERE status = ? ORDER BY created_at DESC';
    return await query(sql, [status]);
  }

  static async getByCustomer(customerId: number): Promise<Order[]> {
    const sql = 'SELECT * FROM orders WHERE customer_id = ? ORDER BY created_at DESC';
    return await query(sql, [customerId]);
  }

  static async updateStatus(id: number, status: Order['status']): Promise<Order | null> {
    const sql = 'UPDATE orders SET status = ? WHERE id = ?';
    await query(sql, [status, id]);
    return await this.getById(id);
  }
}

export class OrderItemService {
  static async getAll(): Promise<OrderItem[]> {
    const sql = 'SELECT * FROM order_items ORDER BY id DESC';
    return await query(sql);
  }

  static async getByOrderId(orderId: number): Promise<OrderItem[]> {
    const sql = 'SELECT * FROM order_items WHERE order_id = ?';
    return await query(sql, [orderId]);
  }

  static async create(orderItem: Omit<OrderItem, 'id'>): Promise<OrderItem> {
    const sql = 'INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price) VALUES (?, ?, ?, ?, ?)';
    const result = await query(sql, [
      orderItem.order_id,
      orderItem.product_id,
      orderItem.quantity,
      orderItem.unit_price,
      orderItem.total_price
    ]);
    const created = await this.getById(result.insertId);
    if (!created) throw new Error('Failed to create order item');
    return created;
  }

  static async getById(id: number): Promise<OrderItem | null> {
    const sql = 'SELECT * FROM order_items WHERE id = ?';
    const results = await query(sql, [id]);
    return results.length > 0 ? results[0] : null;
  }

  static async delete(id: number): Promise<boolean> {
    const sql = 'DELETE FROM order_items WHERE id = ?';
    const result = await query(sql, [id]);
    return result.affectedRows > 0;
  }

  static async deleteByOrderId(orderId: number): Promise<boolean> {
    const sql = 'DELETE FROM order_items WHERE order_id = ?';
    const result = await query(sql, [orderId]);
    return result.affectedRows > 0;
  }
}