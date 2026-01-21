import { Router } from 'express';
import { query, execute } from '../../src/lib/database';
import { RowDataPacket } from 'mysql2/promise';

export const contactRouter = Router();

// Get all contact messages
contactRouter.get('/', async (req, res) => {
  try {
    const messages = await query<RowDataPacket[]>('SELECT * FROM contact_messages ORDER BY created_at DESC');
    res.json(messages);
  } catch (error) {
    console.error('Error fetching contact messages:', error);
    res.status(500).json({ error: 'Failed to fetch contact messages' });
  }
});

// Get contact message by ID
contactRouter.get('/:id', async (req, res) => {
  try {
    const messages = await query<RowDataPacket[]>('SELECT * FROM contact_messages WHERE id = ?', [req.params.id]);
    if (messages.length === 0) {
      return res.status(404).json({ error: 'Message not found' });
    }
    res.json(messages[0]);
  } catch (error) {
    console.error('Error fetching contact message:', error);
    res.status(500).json({ error: 'Failed to fetch contact message' });
  }
});

// Create contact message
contactRouter.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    const result = await execute(
      'INSERT INTO contact_messages (name, email, subject, message) VALUES (?, ?, ?, ?)',
      [name, email, subject, message]
    );
    res.status(201).json({ id: result.insertId, name, email, subject, message });
  } catch (error) {
    console.error('Error creating contact message:', error);
    res.status(500).json({ error: 'Failed to create contact message' });
  }
});

// Update message status
contactRouter.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    await execute('UPDATE contact_messages SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ id: req.params.id, status });
  } catch (error) {
    console.error('Error updating message status:', error);
    res.status(500).json({ error: 'Failed to update message status' });
  }
});

// Delete contact message
contactRouter.delete('/:id', async (req, res) => {
  try {
    await execute('DELETE FROM contact_messages WHERE id = ?', [req.params.id]);
    res.json({ message: 'Contact message deleted' });
  } catch (error) {
    console.error('Error deleting contact message:', error);
    res.status(500).json({ error: 'Failed to delete contact message' });
  }
});
