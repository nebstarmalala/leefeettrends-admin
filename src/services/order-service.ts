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
    const sql = 'SELECT * FROM orders WHERE order_id = ?';
    const results = await query<OrderRow[]>(sql, [id]);
    return results.length > 0 ? results[0] : null;
  }

  static async getByOrderNumber(orderNumber: string): Promise<Order | null> {
    const sql = 'SELECT * FROM orders WHERE order_number = ?';
    const results = await query<OrderRow[]>(sql, [orderNumber]);
    return results.length > 0 ? results[0] : null;
  }

  static async getByIdWithItems(id: number): Promise<OrderWithItems | null> {
    const order = await this.getById(id);
    if (!order) return null;

    const items = await OrderItemService.getByOrderId(id);
    return { ...order, items };
  }

  static async create(order: Omit<Order, 'order_id' | 'created_at' | 'updated_at'>): Promise<Order> {
    const sql = `INSERT INTO orders (customer_id, order_number, order_status, subtotal, delivery_fee, tax, total_amount, payment_method, payment_status, shipping_address, billing_address, notes)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const result = await execute(sql, [
      order.customer_id,
      order.order_number,
      order.order_status || 'pending',
      order.subtotal,
      order.delivery_fee ?? 0,
      order.tax ?? 0,
      order.total_amount,
      order.payment_method ?? null,
      order.payment_status || 'pending',
      order.shipping_address ?? null,
      order.billing_address ?? null,
      order.notes ?? null
    ]);
    const created = await this.getById(result.insertId);
    if (!created) throw new Error('Failed to create order');
    return created;
  }

  static async createWithItems(input: CreateOrderInput): Promise<OrderWithItems> {
    return await transaction(async (connection) => {
      const orderSql = `INSERT INTO orders (customer_id, order_number, order_status, subtotal, delivery_fee, tax, total_amount, payment_method, payment_status, shipping_address, billing_address, notes)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      const [orderResult] = await connection.execute<ResultSetHeader>(orderSql, [
        input.customer_id,
        input.order_number,
        input.order_status || 'pending',
        input.subtotal,
        input.delivery_fee ?? 0,
        input.tax ?? 0,
        input.total_amount,
        input.payment_method ?? null,
        input.payment_status || 'pending',
        input.shipping_address ?? null,
        input.billing_address ?? null,
        input.notes ?? null
      ]);
      const orderId = orderResult.insertId;

      const itemSql = 'INSERT INTO order_items (order_id, product_id, size, color, quantity, unit_price, subtotal) VALUES (?, ?, ?, ?, ?, ?, ?)';
      for (const item of input.items) {
        await connection.execute(itemSql, [
          orderId,
          item.product_id,
          item.size,
          item.color,
          item.quantity,
          item.unit_price,
          item.subtotal
        ]);
      }

      const [orders] = await connection.execute<OrderRow[]>('SELECT * FROM orders WHERE order_id = ?', [orderId]);
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
    if (order.order_status !== undefined) {
      fields.push('order_status = ?');
      values.push(order.order_status);
    }
    if (order.subtotal !== undefined) {
      fields.push('subtotal = ?');
      values.push(order.subtotal);
    }
    if (order.delivery_fee !== undefined) {
      fields.push('delivery_fee = ?');
      values.push(order.delivery_fee);
    }
    if (order.tax !== undefined) {
      fields.push('tax = ?');
      values.push(order.tax);
    }
    if (order.total_amount !== undefined) {
      fields.push('total_amount = ?');
      values.push(order.total_amount);
    }
    if (order.payment_method !== undefined) {
      fields.push('payment_method = ?');
      values.push(order.payment_method);
    }
    if (order.payment_status !== undefined) {
      fields.push('payment_status = ?');
      values.push(order.payment_status);
    }
    if (order.shipping_address !== undefined) {
      fields.push('shipping_address = ?');
      values.push(order.shipping_address);
    }
    if (order.billing_address !== undefined) {
      fields.push('billing_address = ?');
      values.push(order.billing_address);
    }
    if (order.notes !== undefined) {
      fields.push('notes = ?');
      values.push(order.notes);
    }

    if (fields.length === 0) return await this.getById(id);

    const sql = `UPDATE orders SET ${fields.join(', ')} WHERE order_id = ?`;
    await execute(sql, [...values, id]);
    return await this.getById(id);
  }

  static async delete(id: number): Promise<boolean> {
    const sql = 'DELETE FROM orders WHERE order_id = ?';
    const result = await execute(sql, [id]);
    return result.affectedRows > 0;
  }

  static async getByStatus(status: Order['order_status'], pagination?: PaginationParams): Promise<PaginatedResult<Order>> {
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 50;
    const offset = (page - 1) * limit;

    const [countResult] = await query<CountRow[]>(
      'SELECT COUNT(*) as count FROM orders WHERE order_status = ?',
      [status]
    );
    const total = countResult.count;

    const sql = 'SELECT * FROM orders WHERE order_status = ? ORDER BY created_at DESC LIMIT ? OFFSET ?';
    const data = await query<OrderRow[]>(sql, [status, limit, offset]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  static async getByPaymentStatus(paymentStatus: Order['payment_status'], pagination?: PaginationParams): Promise<PaginatedResult<Order>> {
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 50;
    const offset = (page - 1) * limit;

    const [countResult] = await query<CountRow[]>(
      'SELECT COUNT(*) as count FROM orders WHERE payment_status = ?',
      [paymentStatus]
    );
    const total = countResult.count;

    const sql = 'SELECT * FROM orders WHERE payment_status = ? ORDER BY created_at DESC LIMIT ? OFFSET ?';
    const data = await query<OrderRow[]>(sql, [paymentStatus, limit, offset]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  static async getByCustomer(customerId: number, pagination?: PaginationParams): Promise<PaginatedResult<Order>> {
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 50;
    const offset = (page - 1) * limit;

    const [countResult] = await query<CountRow[]>(
      'SELECT COUNT(*) as count FROM orders WHERE customer_id = ?',
      [customerId]
    );
    const total = countResult.count;

    const sql = 'SELECT * FROM orders WHERE customer_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?';
    const data = await query<OrderRow[]>(sql, [customerId, limit, offset]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  static async updateStatus(id: number, status: Order['order_status']): Promise<Order | null> {
    const sql = 'UPDATE orders SET order_status = ? WHERE order_id = ?';
    await execute(sql, [status, id]);
    return await this.getById(id);
  }

  static async updatePaymentStatus(id: number, paymentStatus: Order['payment_status']): Promise<Order | null> {
    const sql = 'UPDATE orders SET payment_status = ? WHERE order_id = ?';
    await execute(sql, [paymentStatus, id]);
    return await this.getById(id);
  }

  static async recalculateTotal(id: number): Promise<Order | null> {
    const sql = `
      UPDATE orders o
      SET subtotal = (
        SELECT COALESCE(SUM(subtotal), 0)
        FROM order_items
        WHERE order_id = o.order_id
      ),
      total_amount = (
        SELECT COALESCE(SUM(subtotal), 0)
        FROM order_items
        WHERE order_id = o.order_id
      ) + o.delivery_fee + o.tax
      WHERE o.order_id = ?
    `;
    await execute(sql, [id]);
    return await this.getById(id);
  }
}

export class OrderItemService {
  static async getAll(): Promise<OrderItem[]> {
    const sql = 'SELECT * FROM order_items ORDER BY order_item_id DESC';
    return await query<OrderItemRow[]>(sql);
  }

  static async getByOrderId(orderId: number): Promise<OrderItem[]> {
    const sql = 'SELECT * FROM order_items WHERE order_id = ?';
    return await query<OrderItemRow[]>(sql, [orderId]);
  }

  static async getById(id: number): Promise<OrderItem | null> {
    const sql = 'SELECT * FROM order_items WHERE order_item_id = ?';
    const results = await query<OrderItemRow[]>(sql, [id]);
    return results.length > 0 ? results[0] : null;
  }

  static async create(orderItem: Omit<OrderItem, 'order_item_id'>): Promise<OrderItem> {
    const sql = 'INSERT INTO order_items (order_id, product_id, size, color, quantity, unit_price, subtotal) VALUES (?, ?, ?, ?, ?, ?, ?)';
    const result = await execute(sql, [
      orderItem.order_id,
      orderItem.product_id,
      orderItem.size,
      orderItem.color,
      orderItem.quantity,
      orderItem.unit_price,
      orderItem.subtotal
    ]);
    const created = await this.getById(result.insertId);
    if (!created) throw new Error('Failed to create order item');
    return created;
  }

  static async update(id: number, data: Partial<OrderItem>): Promise<OrderItem | null> {
    const fields: string[] = [];
    const values: unknown[] = [];

    if (data.size !== undefined) {
      fields.push('size = ?');
      values.push(data.size);
    }
    if (data.color !== undefined) {
      fields.push('color = ?');
      values.push(data.color);
    }
    if (data.quantity !== undefined) {
      fields.push('quantity = ?');
      values.push(data.quantity);
    }
    if (data.unit_price !== undefined) {
      fields.push('unit_price = ?');
      values.push(data.unit_price);
    }
    if (data.subtotal !== undefined) {
      fields.push('subtotal = ?');
      values.push(data.subtotal);
    }

    if (fields.length === 0) return await this.getById(id);

    const sql = `UPDATE order_items SET ${fields.join(', ')} WHERE order_item_id = ?`;
    await execute(sql, [...values, id]);
    return await this.getById(id);
  }

  static async delete(id: number): Promise<boolean> {
    const sql = 'DELETE FROM order_items WHERE order_item_id = ?';
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

    const newSubtotal = item.unit_price * quantity;
    const sql = 'UPDATE order_items SET quantity = ?, subtotal = ? WHERE order_item_id = ?';
    await execute(sql, [quantity, newSubtotal, id]);
    return await this.getById(id);
  }
}
