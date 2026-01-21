import { Router } from 'express';
import { query, execute } from '../../src/lib/database';
import { RowDataPacket } from 'mysql2/promise';

export const customersRouter = Router();

// Get all customers
customersRouter.get('/', async (req, res) => {
  try {
    const customers = await query<RowDataPacket[]>('SELECT * FROM customers ORDER BY created_at DESC');
    res.json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

// Get customer by ID
customersRouter.get('/:id', async (req, res) => {
  try {
    const customers = await query<RowDataPacket[]>('SELECT * FROM customers WHERE id = ?', [req.params.id]);
    if (customers.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json(customers[0]);
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({ error: 'Failed to fetch customer' });
  }
});

// Create customer
customersRouter.post('/', async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;
    const result = await execute(
      'INSERT INTO customers (name, email, phone, address) VALUES (?, ?, ?, ?)',
      [name, email, phone, address]
    );
    res.status(201).json({ id: result.insertId, name, email, phone, address });
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({ error: 'Failed to create customer' });
  }
});

// Update customer
customersRouter.put('/:id', async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;
    await execute(
      'UPDATE customers SET name = ?, email = ?, phone = ?, address = ? WHERE id = ?',
      [name, email, phone, address, req.params.id]
    );
    res.json({ id: req.params.id, name, email, phone, address });
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({ error: 'Failed to update customer' });
  }
});

// Delete customer
customersRouter.delete('/:id', async (req, res) => {
  try {
    await execute('DELETE FROM customers WHERE id = ?', [req.params.id]);
    res.json({ message: 'Customer deleted' });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({ error: 'Failed to delete customer' });
  }
});
