import { Router } from 'express';
import { query } from '../../src/lib/database';
import { RowDataPacket } from 'mysql2/promise';

export const dashboardRouter = Router();

interface CountResult extends RowDataPacket {
  count: number;
}

interface SumResult extends RowDataPacket {
  total: number;
}

// Get dashboard stats
dashboardRouter.get('/stats', async (req, res) => {
  try {
    const [customers] = await query<CountResult[]>('SELECT COUNT(*) as count FROM customers');
    const [products] = await query<CountResult[]>('SELECT COUNT(*) as count FROM products');
    const [orders] = await query<CountResult[]>('SELECT COUNT(*) as count FROM orders');
    const [revenue] = await query<SumResult[]>('SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE status != "cancelled"');
    const [pendingOrders] = await query<CountResult[]>('SELECT COUNT(*) as count FROM orders WHERE status = "pending"');
    const [unreadMessages] = await query<CountResult[]>('SELECT COUNT(*) as count FROM contact_messages WHERE status = "unread"');
    const [totalStock] = await query<SumResult[]>('SELECT COALESCE(SUM(stock_quantity), 0) as total FROM products');

    // Calculate average order value
    const avgOrderValue = orders.count > 0 ? revenue.total / orders.count : 0;

    // Get last month's data for comparison
    const [lastMonthRevenue] = await query<SumResult[]>(`
      SELECT COALESCE(SUM(total_amount), 0) as total FROM orders
      WHERE status != 'cancelled'
      AND created_at >= DATE_SUB(CURDATE(), INTERVAL 2 MONTH)
      AND created_at < DATE_SUB(CURDATE(), INTERVAL 1 MONTH)
    `);
    const [lastMonthOrders] = await query<CountResult[]>(`
      SELECT COUNT(*) as count FROM orders
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 2 MONTH)
      AND created_at < DATE_SUB(CURDATE(), INTERVAL 1 MONTH)
    `);
    const [lastMonthCustomers] = await query<CountResult[]>(`
      SELECT COUNT(*) as count FROM customers
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 2 MONTH)
      AND created_at < DATE_SUB(CURDATE(), INTERVAL 1 MONTH)
    `);

    // This month's data
    const [thisMonthRevenue] = await query<SumResult[]>(`
      SELECT COALESCE(SUM(total_amount), 0) as total FROM orders
      WHERE status != 'cancelled'
      AND created_at >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)
    `);
    const [thisMonthOrders] = await query<CountResult[]>(`
      SELECT COUNT(*) as count FROM orders
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)
    `);
    const [thisMonthCustomers] = await query<CountResult[]>(`
      SELECT COUNT(*) as count FROM customers
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)
    `);

    // Calculate percentage changes
    const revenueChange = lastMonthRevenue.total > 0
      ? ((thisMonthRevenue.total - lastMonthRevenue.total) / lastMonthRevenue.total * 100).toFixed(1)
      : '0';
    const ordersChange = lastMonthOrders.count > 0
      ? ((thisMonthOrders.count - lastMonthOrders.count) / lastMonthOrders.count * 100).toFixed(1)
      : '0';
    const customersChange = lastMonthCustomers.count > 0
      ? ((thisMonthCustomers.count - lastMonthCustomers.count) / lastMonthCustomers.count * 100).toFixed(1)
      : '0';

    res.json({
      totalCustomers: customers.count,
      totalProducts: products.count,
      totalOrders: orders.count,
      totalRevenue: revenue.total,
      totalStock: totalStock.total,
      pendingOrders: pendingOrders.count,
      unreadMessages: unreadMessages.count,
      avgOrderValue: avgOrderValue,
      revenueChange,
      ordersChange,
      customersChange
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

// Get sales by category
dashboardRouter.get('/sales-by-category', async (req, res) => {
  try {
    const salesByCategory = await query<RowDataPacket[]>(`
      SELECT
        COALESCE(c.name, 'Uncategorized') as name,
        COALESCE(SUM(oi.total_price), 0) as value
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.status != 'cancelled'
      GROUP BY c.id, c.name
      ORDER BY value DESC
    `);

    res.json(salesByCategory.length > 0 ? salesByCategory : [
      { name: 'No sales data', value: 0 }
    ]);
  } catch (error) {
    console.error('Error fetching sales by category:', error);
    res.status(500).json({ error: 'Failed to fetch sales by category' });
  }
});

// Get monthly performance data
dashboardRouter.get('/monthly-performance', async (req, res) => {
  try {
    const monthlyData = await query<RowDataPacket[]>(`
      SELECT
        DATE_FORMAT(created_at, '%b') as month,
        DATE_FORMAT(created_at, '%Y-%m') as sort_key,
        COUNT(*) as orders,
        COALESCE(SUM(total_amount), 0) as revenue
      FROM orders
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
      AND status != 'cancelled'
      GROUP BY DATE_FORMAT(created_at, '%Y-%m'), DATE_FORMAT(created_at, '%b')
      ORDER BY sort_key ASC
    `);

    res.json(monthlyData);
  } catch (error) {
    console.error('Error fetching monthly performance:', error);
    res.status(500).json({ error: 'Failed to fetch monthly performance' });
  }
});

// Get order status distribution
dashboardRouter.get('/order-status', async (req, res) => {
  try {
    const statusData = await query<RowDataPacket[]>(`
      SELECT
        status as name,
        COUNT(*) as value
      FROM orders
      GROUP BY status
    `);

    res.json(statusData);
  } catch (error) {
    console.error('Error fetching order status:', error);
    res.status(500).json({ error: 'Failed to fetch order status' });
  }
});

// Get top selling products
dashboardRouter.get('/top-products', async (req, res) => {
  try {
    const topProducts = await query<RowDataPacket[]>(`
      SELECT
        p.id,
        p.name,
        p.price,
        SUM(oi.quantity) as total_sold,
        SUM(oi.total_price) as total_revenue
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.status != 'cancelled'
      GROUP BY p.id, p.name, p.price
      ORDER BY total_sold DESC
      LIMIT 5
    `);

    res.json(topProducts);
  } catch (error) {
    console.error('Error fetching top products:', error);
    res.status(500).json({ error: 'Failed to fetch top products' });
  }
});

// Get recent orders
dashboardRouter.get('/recent-orders', async (req, res) => {
  try {
    const orders = await query<RowDataPacket[]>(`
      SELECT o.*, c.name as customer_name, c.email as customer_email
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.id
      ORDER BY o.created_at DESC
      LIMIT 5
    `);
    res.json(orders);
  } catch (error) {
    console.error('Error fetching recent orders:', error);
    res.status(500).json({ error: 'Failed to fetch recent orders' });
  }
});

// Get low stock products
dashboardRouter.get('/low-stock', async (req, res) => {
  try {
    const products = await query<RowDataPacket[]>(`
      SELECT id, name, stock_quantity, price
      FROM products
      WHERE stock_quantity < 10
      ORDER BY stock_quantity ASC
      LIMIT 5
    `);
    res.json(products);
  } catch (error) {
    console.error('Error fetching low stock products:', error);
    res.status(500).json({ error: 'Failed to fetch low stock products' });
  }
});
