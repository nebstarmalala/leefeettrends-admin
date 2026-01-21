import { Router } from 'express';
import { query, execute, transaction } from '../../src/lib/database';
import { RowDataPacket } from 'mysql2/promise';

export const ordersRouter = Router();

// Get all orders
ordersRouter.get('/', async (req, res) => {
  try {
    const orders = await query<RowDataPacket[]>(`
      SELECT o.*, c.name as customer_name, c.email as customer_email
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.id
      ORDER BY o.created_at DESC
    `);
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get order by ID with items
ordersRouter.get('/:id', async (req, res) => {
  try {
    const orders = await query<RowDataPacket[]>(`
      SELECT o.*, c.name as customer_name, c.email as customer_email
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.id
      WHERE o.id = ?
    `, [req.params.id]);

    if (orders.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const items = await query<RowDataPacket[]>(`
      SELECT oi.*, p.name as product_name
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `, [req.params.id]);

    res.json({ ...orders[0], items });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// Create order
ordersRouter.post('/', async (req, res) => {
  try {
    const { customer_id, order_number, status, total_amount, shipping_address, notes, items } = req.body;

    const result = await transaction(async (connection) => {
      const [orderResult] = await connection.execute(
        'INSERT INTO orders (customer_id, order_number, status, total_amount, shipping_address, notes) VALUES (?, ?, ?, ?, ?, ?)',
        [customer_id, order_number, status || 'pending', total_amount, shipping_address, notes]
      );

      const orderId = (orderResult as any).insertId;

      if (items && items.length > 0) {
        for (const item of items) {
          await connection.execute(
            'INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price) VALUES (?, ?, ?, ?, ?)',
            [orderId, item.product_id, item.quantity, item.unit_price, item.total_price]
          );
        }
      }

      return orderId;
    });

    res.status(201).json({ id: result, ...req.body });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Update order status
ordersRouter.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    await execute('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ id: req.params.id, status });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// Delete order
ordersRouter.delete('/:id', async (req, res) => {
  try {
    await execute('DELETE FROM orders WHERE id = ?', [req.params.id]);
    res.json({ message: 'Order deleted' });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ error: 'Failed to delete order' });
  }
});
