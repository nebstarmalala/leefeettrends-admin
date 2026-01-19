import { query, execute } from '../lib/database';
import { Product, Category, PaginationParams, PaginatedResult } from '../types/database';
import { RowDataPacket } from 'mysql2';

interface ProductRow extends Product, RowDataPacket {}
interface CategoryRow extends Category, RowDataPacket {}
interface CountRow extends RowDataPacket { count: number }

export class ProductService {
  static async getAll(pagination?: PaginationParams): Promise<PaginatedResult<Product>> {
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 50;
    const offset = (page - 1) * limit;

    const [countResult] = await query<CountRow[]>('SELECT COUNT(*) as count FROM products');
    const total = countResult.count;

    const sql = 'SELECT * FROM products ORDER BY created_at DESC LIMIT ? OFFSET ?';
    const data = await query<ProductRow[]>(sql, [limit, offset]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  static async getById(id: number): Promise<Product | null> {
    const sql = 'SELECT * FROM products WHERE id = ?';
    const results = await query<ProductRow[]>(sql, [id]);
    return results.length > 0 ? results[0] : null;
  }

  static async create(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> {
    const sql = 'INSERT INTO products (name, description, price, category_id, stock_quantity, image_url, sku) VALUES (?, ?, ?, ?, ?, ?, ?)';
    const result = await execute(sql, [
      product.name,
      product.description ?? null,
      product.price,
      product.category_id ?? null,
      product.stock_quantity,
      product.image_url ?? null,
      product.sku ?? null
    ]);
    const created = await this.getById(result.insertId);
    if (!created) throw new Error('Failed to create product');
    return created;
  }

  static async update(id: number, product: Partial<Product>): Promise<Product | null> {
    const fields: string[] = [];
    const values: unknown[] = [];

    if (product.name !== undefined) {
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
    await execute(sql, [...values, id]);
    return await this.getById(id);
  }

  static async delete(id: number): Promise<boolean> {
    const sql = 'DELETE FROM products WHERE id = ?';
    const result = await execute(sql, [id]);
    return result.affectedRows > 0;
  }

  static async search(term: string, pagination?: PaginationParams): Promise<PaginatedResult<Product>> {
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 50;
    const offset = (page - 1) * limit;
    const searchTerm = `%${term}%`;

    const [countResult] = await query<CountRow[]>(
      'SELECT COUNT(*) as count FROM products WHERE name LIKE ? OR description LIKE ?',
      [searchTerm, searchTerm]
    );
    const total = countResult.count;

    const sql = 'SELECT * FROM products WHERE name LIKE ? OR description LIKE ? ORDER BY created_at DESC LIMIT ? OFFSET ?';
    const data = await query<ProductRow[]>(sql, [searchTerm, searchTerm, limit, offset]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  static async getByCategory(categoryId: number, pagination?: PaginationParams): Promise<PaginatedResult<Product>> {
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 50;
    const offset = (page - 1) * limit;

    const [countResult] = await query<CountRow[]>(
      'SELECT COUNT(*) as count FROM products WHERE category_id = ?',
      [categoryId]
    );
    const total = countResult.count;

    const sql = 'SELECT * FROM products WHERE category_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?';
    const data = await query<ProductRow[]>(sql, [categoryId, limit, offset]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  static async updateStock(id: number, quantityChange: number): Promise<Product | null> {
    const sql = 'UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ? AND stock_quantity + ? >= 0';
    const result = await execute(sql, [quantityChange, id, quantityChange]);
    if (result.affectedRows === 0) {
      throw new Error('Insufficient stock or product not found');
    }
    return await this.getById(id);
  }
}

export class CategoryService {
  static async getAll(): Promise<Category[]> {
    const sql = 'SELECT * FROM categories ORDER BY name';
    return await query<CategoryRow[]>(sql);
  }

  static async getById(id: number): Promise<Category | null> {
    const sql = 'SELECT * FROM categories WHERE id = ?';
    const results = await query<CategoryRow[]>(sql, [id]);
    return results.length > 0 ? results[0] : null;
  }

  static async create(category: Omit<Category, 'id' | 'created_at'>): Promise<Category> {
    const sql = 'INSERT INTO categories (name, description) VALUES (?, ?)';
    const result = await execute(sql, [category.name, category.description ?? null]);
    const created = await this.getById(result.insertId);
    if (!created) throw new Error('Failed to create category');
    return created;
  }

  static async update(id: number, category: Partial<Category>): Promise<Category | null> {
    const fields: string[] = [];
    const values: unknown[] = [];

    if (category.name !== undefined) {
      fields.push('name = ?');
      values.push(category.name);
    }
    if (category.description !== undefined) {
      fields.push('description = ?');
      values.push(category.description);
    }

    if (fields.length === 0) return await this.getById(id);

    const sql = `UPDATE categories SET ${fields.join(', ')} WHERE id = ?`;
    await execute(sql, [...values, id]);
    return await this.getById(id);
  }

  static async delete(id: number): Promise<boolean> {
    const sql = 'DELETE FROM categories WHERE id = ?';
    const result = await execute(sql, [id]);
    return result.affectedRows > 0;
  }

  static async getWithProductCount(): Promise<(Category & { product_count: number })[]> {
    const sql = `
      SELECT c.*, COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id
      GROUP BY c.id
      ORDER BY c.name
    `;
    return await query(sql);
  }
}