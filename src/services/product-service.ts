import { query } from '../lib/database';
import { Product, Category } from '../types/database';

export class ProductService {
  static async getAll(): Promise<Product[]> {
    const sql = 'SELECT * FROM products ORDER BY created_at DESC';
    return await query(sql);
  }

  static async getById(id: number): Promise<Product | null> {
    const sql = 'SELECT * FROM products WHERE id = ?';
    const results = await query(sql, [id]);
    return results.length > 0 ? results[0] : null;
  }

  static async create(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> {
    const sql = 'INSERT INTO products (name, description, price, category_id, stock_quantity, image_url, sku) VALUES (?, ?, ?, ?, ?, ?, ?)';
    const result = await query(sql, [
      product.name, 
      product.description, 
      product.price, 
      product.category_id, 
      product.stock_quantity, 
      product.image_url, 
      product.sku
    ]);
    const created = await this.getById(result.insertId);
    if (!created) throw new Error('Failed to create product');
    return created;
  }

  static async update(id: number, product: Partial<Product>): Promise<Product | null> {
    const fields = [];
    const values = [];
    
    if (product.name) {
      fields.push('name = ?');
      values.push(product.name);
    }
    if (product.description !== undefined) {
      fields.push('description = ?');
      values.push(product.description);
    }
    if (product.price !== undefined) {
      fields.push('price = ?');
      values.push(product.price);
    }
    if (product.category_id !== undefined) {
      fields.push('category_id = ?');
      values.push(product.category_id);
    }
    if (product.stock_quantity !== undefined) {
      fields.push('stock_quantity = ?');
      values.push(product.stock_quantity);
    }
    if (product.image_url !== undefined) {
      fields.push('image_url = ?');
      values.push(product.image_url);
    }
    if (product.sku !== undefined) {
      fields.push('sku = ?');
      values.push(product.sku);
    }
    
    if (fields.length === 0) return await this.getById(id);
    
    const sql = `UPDATE products SET ${fields.join(', ')} WHERE id = ?`;
    await query(sql, [...values, id]);
    return await this.getById(id);
  }

  static async delete(id: number): Promise<boolean> {
    const sql = 'DELETE FROM products WHERE id = ?';
    const result = await query(sql, [id]);
    return result.affectedRows > 0;
  }

  static async search(term: string): Promise<Product[]> {
    const sql = 'SELECT * FROM products WHERE name LIKE ? OR description LIKE ? ORDER BY created_at DESC';
    const searchTerm = `%${term}%`;
    return await query(sql, [searchTerm, searchTerm]);
  }

  static async getByCategory(categoryId: number): Promise<Product[]> {
    const sql = 'SELECT * FROM products WHERE category_id = ? ORDER BY created_at DESC';
    return await query(sql, [categoryId]);
  }
}

export class CategoryService {
  static async getAll(): Promise<Category[]> {
    const sql = 'SELECT * FROM categories ORDER BY name';
    return await query(sql);
  }

  static async getById(id: number): Promise<Category | null> {
    const sql = 'SELECT * FROM categories WHERE id = ?';
    const results = await query(sql, [id]);
    return results.length > 0 ? results[0] : null;
  }

  static async create(category: Omit<Category, 'id' | 'created_at'>): Promise<Category> {
    const sql = 'INSERT INTO categories (name, description) VALUES (?, ?)';
    const result = await query(sql, [category.name, category.description]);
    const created = await this.getById(result.insertId);
    if (!created) throw new Error('Failed to create category');
    return created;
  }

  static async update(id: number, category: Partial<Category>): Promise<Category | null> {
    const fields = [];
    const values = [];
    
    if (category.name) {
      fields.push('name = ?');
      values.push(category.name);
    }
    if (category.description !== undefined) {
      fields.push('description = ?');
      values.push(category.description);
    }
    
    if (fields.length === 0) return await this.getById(id);
    
    const sql = `UPDATE categories SET ${fields.join(', ')} WHERE id = ?`;
    await query(sql, [...values, id]);
    return await this.getById(id);
  }

  static async delete(id: number): Promise<boolean> {
    const sql = 'DELETE FROM categories WHERE id = ?';
    const result = await query(sql, [id]);
    return result.affectedRows > 0;
  }
}