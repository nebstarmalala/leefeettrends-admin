import { Router } from 'express';
import { query, execute } from '../../src/lib/database';
import { RowDataPacket } from 'mysql2/promise';

export const categoriesRouter = Router();

// Get all categories
categoriesRouter.get('/', async (req, res) => {
  try {
    const categories = await query<RowDataPacket[]>('SELECT * FROM categories ORDER BY name');
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Get category by ID
categoriesRouter.get('/:id', async (req, res) => {
  try {
    const categories = await query<RowDataPacket[]>('SELECT * FROM categories WHERE id = ?', [req.params.id]);
    if (categories.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json(categories[0]);
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ error: 'Failed to fetch category' });
  }
});

// Create category
categoriesRouter.post('/', async (req, res) => {
  try {
    const { name, description } = req.body;
    const result = await execute(
      'INSERT INTO categories (name, description) VALUES (?, ?)',
      [name, description]
    );
    res.status(201).json({ id: result.insertId, name, description });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// Update category
categoriesRouter.put('/:id', async (req, res) => {
  try {
    const { name, description } = req.body;
    await execute(
      'UPDATE categories SET name = ?, description = ? WHERE id = ?',
      [name, description, req.params.id]
    );
    res.json({ id: req.params.id, name, description });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
});

// Delete category
categoriesRouter.delete('/:id', async (req, res) => {
  try {
    await execute('DELETE FROM categories WHERE id = ?', [req.params.id]);
    res.json({ message: 'Category deleted' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});
