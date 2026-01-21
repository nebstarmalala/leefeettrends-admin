import { Router } from 'express';
import { query, execute } from '../../src/lib/database';
import { RowDataPacket } from 'mysql2/promise';

export const productsRouter = Router();

// Get all products
productsRouter.get('/', async (req, res) => {
  try {
    const products = await query<RowDataPacket[]>(`
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.created_at DESC
    `);
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get product by ID
productsRouter.get('/:id', async (req, res) => {
  try {
    const products = await query<RowDataPacket[]>(`
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `, [req.params.id]);
    if (products.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(products[0]);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Create product
productsRouter.post('/', async (req, res) => {
  try {
    const { name, description, price, category_id, stock_quantity, image_url, sku } = req.body;
    const result = await execute(
      'INSERT INTO products (name, description, price, category_id, stock_quantity, image_url, sku) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, description, price, category_id, stock_quantity, image_url, sku]
    );
    res.status(201).json({ id: result.insertId, ...req.body });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Update product
productsRouter.put('/:id', async (req, res) => {
  try {
    const { name, description, price, category_id, stock_quantity, image_url, sku } = req.body;
    await execute(
      'UPDATE products SET name = ?, description = ?, price = ?, category_id = ?, stock_quantity = ?, image_url = ?, sku = ? WHERE id = ?',
      [name, description, price, category_id, stock_quantity, image_url, sku, req.params.id]
    );
    res.json({ id: req.params.id, ...req.body });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Delete product
productsRouter.delete('/:id', async (req, res) => {
  try {
    await execute('DELETE FROM products WHERE id = ?', [req.params.id]);
    res.json({ message: 'Product deleted' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});
