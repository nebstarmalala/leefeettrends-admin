import { query, execute, transaction } from '../lib/database';
import { Order, OrderItem, OrderWithItems, CreateOrderInput, PaginationParams, PaginatedResult } from '../types/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

interface OrderRow extends Order, RowDataPacket {}
interface OrderItemRow extends OrderItem, RowDataPacket {}
interface CountRow extends RowDataPacket { count: number }

export class OrderService {
  static async getAll(pagination?: PaginationParams): Promise<PaginatedResult<Order>> {
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 50;
    const offset = (page - 1) * limit;

    const [countResult] = await query<CountRow[]>('SELECT COUNT(*) as count FROM orders');
    const total = countResult.count;

    const sql = 'SELECT * FROM orders ORDER BY created_at DESC LIMIT ? OFFSET ?';
    const data = await query<OrderRow[]>(sql, [limit, offset]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  static async getById(id: number): Promise<Order | null> {
    const sql = 'SELECT * FROM orders WHERE id = ?';
    const results = await query<OrderRow[]>(sql, [id]);
    return results.length > 0 ? results[0] : null;
  }

  static async getByIdWithItems(id: number): Promise<OrderWithItems | null> {
    const order = await this.getById(id);
    if (!order) return null;

    const items = await OrderItemService.getByOrderId(id);
    return { ...order, items };
  }

  static async create(order: Omit<Order, 'id' | 'created_at' | 'updated_at'>): Promise<Order> {
    const sql = 'INSERT INTO orders (customer_id, order_number, status, total_amount, shipping_address, notes) VALUES (?, ?, ?, ?, ?, ?)';
    const result = await execute(sql, [
      order.customer_id,
      order.order_number,
      order.status || 'pending',
      order.total_amount,
      order.shipping_address ?? null,
      order.notes ?? null
    ]);
    const created = await this.getById(result.insertId);
    if (!created) throw new Error('Failed to create order');
    return created;
  }

  static async createWithItems(input: CreateOrderInput): Promise<OrderWithItems> {
    return await transaction(async (connection) => {
      const orderSql = 'INSERT INTO orders (customer_id, order_number, status, total_amount, shipping_address, notes) VALUES (?, ?, ?, ?, ?, ?)';
      const [orderResult] = await connection.execute<ResultSetHeader>(orderSql, [
        input.customer_id,
        input.order_number,
        input.status || 'pending',
        input.total_amount,
        input.shipping_address ?? null,
        input.notes ?? null
      ]);
      const orderId = orderResult.insertId;

      const itemSql = 'INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price) VALUES (?, ?, ?, ?, ?)';
      for (const item of input.items) {
        await connection.execute(itemSql, [
          orderId,
          item.product_id,
          item.quantity,
          item.unit_price,
          item.total_price
        ]);
      }

      const [orders] = await connection.execute<OrderRow[]>('SELECT * FROM orders WHERE id = ?', [orderId]);
      const [items] = await connection.execute<OrderItemRow[]>('SELECT * FROM order_items WHERE order_id = ?', [orderId]);

      return { ...orders[0], items };
    });
  }

  static async update(id: number, order: Partial<Order>): Promise<Order | null> {
    const fields: string[] = [];
    const values: unknown[] = [];

    if (order.customer_id !== undefined) {
      fields.push('customer_id = ?');
      values.push(order.customer_id);
    }
    if (order.order_number !== undefined) {
      fields.push('order_number = ?');
      values.push(order.order_number);
    }
    if (order.status !== undefined) {
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
    await execute(sql, [...values, id]);
    return await this.getById(id);
  }

  static async delete(id: number): Promise<boolean> {
    const sql = 'DELETE FROM orders WHERE id = ?';
    const result = await execute(sql, [id]);
    return result.affectedRows > 0;
  }

  static async getByStatus(status: Order['status'], pagination?: PaginationParams): Promise<PaginatedResult<Order>> {
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 50;
    const offset = (page - 1) * limit;

    const [countResult] = await query<CountRow[]>(
      'SELECT COUNT(*) as count FROM orders WHERE status = ?',
      [status]
    );
    const total = countResult.count;

    const sql = 'SELECT * FROM orders WHERE status = ? ORDER BY created_at DESC LIMIT ? OFFSET ?';
    const data = await query<OrderRow[]>(sql, [status, limit, offset]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  static async getByCustomer(customerId: number): Promise<Order[]> {
    const sql = 'SELECT * FROM orders WHERE customer_id = ? ORDER BY created_at DESC';
    return await query<OrderRow[]>(sql, [customerId]);
  }

  static async updateStatus(id: number, status: Order['status']): Promise<Order | null> {
    const sql = 'UPDATE orders SET status = ? WHERE id = ?';
    await execute(sql, [status, id]);
    return await this.getById(id);
  }

  static async recalculateTotal(id: number): Promise<Order | null> {
    const sql = `
      UPDATE orders o
      SET total_amount = (
        SELECT COALESCE(SUM(total_price), 0)
        FROM order_items
        WHERE order_id = o.id
      )
      WHERE o.id = ?
    `;
    await execute(sql, [id]);
    return await this.getById(id);
  }
}

export class OrderItemService {
  static async getAll(): Promise<OrderItem[]> {
    const sql = 'SELECT * FROM order_items ORDER BY id DESC';
    return await query<OrderItemRow[]>(sql);
  }

  static async getByOrderId(orderId: number): Promise<OrderItem[]> {
    const sql = 'SELECT * FROM order_items WHERE order_id = ?';
    return await query<OrderItemRow[]>(sql, [orderId]);
  }

  static async create(orderItem: Omit<OrderItem, 'id'>): Promise<OrderItem> {
    const sql = 'INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price) VALUES (?, ?, ?, ?, ?)';
    const result = await execute(sql, [
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
    const results = await query<OrderItemRow[]>(sql, [id]);
    return results.length > 0 ? results[0] : null;
  }

  static async delete(id: number): Promise<boolean> {
    const sql = 'DELETE FROM order_items WHERE id = ?';
    const result = await execute(sql, [id]);
    return result.affectedRows > 0;
  }

  static async deleteByOrderId(orderId: number): Promise<boolean> {
    const sql = 'DELETE FROM order_items WHERE order_id = ?';
    const result = await execute(sql, [orderId]);
    return result.affectedRows > 0;
  }

  static async updateQuantity(id: number, quantity: number): Promise<OrderItem | null> {
    const item = await this.getById(id);
    if (!item) return null;

    const newTotalPrice = item.unit_price * quantity;
    const sql = 'UPDATE order_items SET quantity = ?, total_price = ? WHERE id = ?';
    await execute(sql, [quantity, newTotalPrice, id]);
    return await this.getById(id);
  }
}