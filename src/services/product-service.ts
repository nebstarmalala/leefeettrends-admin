import { query, execute, transaction } from '../lib/database';
import {
  Product,
  ProductSize,
  ProductColor,
  ProductImage,
  ProductWithDetails,
  CreateProductInput,
  PaginationParams,
  PaginatedResult
} from '../types/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

interface ProductRow extends Product, RowDataPacket {}
interface ProductSizeRow extends ProductSize, RowDataPacket {}
interface ProductColorRow extends ProductColor, RowDataPacket {}
interface ProductImageRow extends ProductImage, RowDataPacket {}
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

  static async getActive(pagination?: PaginationParams): Promise<PaginatedResult<Product>> {
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 50;
    const offset = (page - 1) * limit;

    const [countResult] = await query<CountRow[]>('SELECT COUNT(*) as count FROM products WHERE is_active = TRUE');
    const total = countResult.count;

    const sql = 'SELECT * FROM products WHERE is_active = TRUE ORDER BY created_at DESC LIMIT ? OFFSET ?';
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
    const sql = 'SELECT * FROM products WHERE product_id = ?';
    const results = await query<ProductRow[]>(sql, [id]);
    return results.length > 0 ? results[0] : null;
  }

  static async getByIdWithDetails(id: number): Promise<ProductWithDetails | null> {
    const product = await this.getById(id);
    if (!product) return null;

    const sizes = await ProductSizeService.getByProductId(id);
    const colors = await ProductColorService.getByProductId(id);
    const images = await ProductImageService.getByProductId(id);

    return { ...product, sizes, colors, images };
  }

  static async create(product: Omit<Product, 'product_id' | 'review_count' | 'average_rating' | 'created_at' | 'updated_at'>): Promise<Product> {
    const sql = `INSERT INTO products (name, description, category, price, delivery_fee, stock_quantity, is_active)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const result = await execute(sql, [
      product.name,
      product.description ?? null,
      product.category,
      product.price,
      product.delivery_fee ?? 0,
      product.stock_quantity ?? 0,
      product.is_active ?? true
    ]);
    const created = await this.getById(result.insertId);
    if (!created) throw new Error('Failed to create product');
    return created;
  }

  static async createWithDetails(input: CreateProductInput): Promise<ProductWithDetails> {
    return await transaction(async (connection) => {
      const productSql = `INSERT INTO products (name, description, category, price, delivery_fee, stock_quantity, is_active)
                          VALUES (?, ?, ?, ?, ?, ?, ?)`;
      const [productResult] = await connection.execute<ResultSetHeader>(productSql, [
        input.name,
        input.description ?? null,
        input.category,
        input.price,
        input.delivery_fee ?? 0,
        input.stock_quantity ?? 0,
        input.is_active ?? true
      ]);
      const productId = productResult.insertId;

      if (input.sizes && input.sizes.length > 0) {
        const sizeSql = 'INSERT INTO product_sizes (product_id, size, stock_quantity) VALUES (?, ?, ?)';
        for (const size of input.sizes) {
          await connection.execute(sizeSql, [productId, size.size, size.stock_quantity ?? 0]);
        }
      }

      if (input.colors && input.colors.length > 0) {
        const colorSql = 'INSERT INTO product_colors (product_id, color, color_code, stock_quantity) VALUES (?, ?, ?, ?)';
        for (const color of input.colors) {
          await connection.execute(colorSql, [productId, color.color, color.color_code ?? null, color.stock_quantity ?? 0]);
        }
      }

      if (input.images && input.images.length > 0) {
        const imageSql = 'INSERT INTO product_images (product_id, image_url, is_primary, display_order) VALUES (?, ?, ?, ?)';
        for (const image of input.images) {
          await connection.execute(imageSql, [productId, image.image_url, image.is_primary ?? false, image.display_order ?? 0]);
        }
      }

      const [products] = await connection.execute<ProductRow[]>('SELECT * FROM products WHERE product_id = ?', [productId]);
      const [sizes] = await connection.execute<ProductSizeRow[]>('SELECT * FROM product_sizes WHERE product_id = ?', [productId]);
      const [colors] = await connection.execute<ProductColorRow[]>('SELECT * FROM product_colors WHERE product_id = ?', [productId]);
      const [images] = await connection.execute<ProductImageRow[]>('SELECT * FROM product_images WHERE product_id = ? ORDER BY display_order', [productId]);

      return { ...products[0], sizes, colors, images };
    });
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
    if (product.category !== undefined) {
      fields.push('category = ?');
      values.push(product.category);
    }
    if (product.price !== undefined) {
      fields.push('price = ?');
      values.push(product.price);
    }
    if (product.delivery_fee !== undefined) {
      fields.push('delivery_fee = ?');
      values.push(product.delivery_fee);
    }
    if (product.stock_quantity !== undefined) {
      fields.push('stock_quantity = ?');
      values.push(product.stock_quantity);
    }
    if (product.is_active !== undefined) {
      fields.push('is_active = ?');
      values.push(product.is_active);
    }

    if (fields.length === 0) return await this.getById(id);

    const sql = `UPDATE products SET ${fields.join(', ')} WHERE product_id = ?`;
    await execute(sql, [...values, id]);
    return await this.getById(id);
  }

  static async delete(id: number): Promise<boolean> {
    const sql = 'DELETE FROM products WHERE product_id = ?';
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

  static async getByCategory(category: string, pagination?: PaginationParams): Promise<PaginatedResult<Product>> {
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 50;
    const offset = (page - 1) * limit;

    const [countResult] = await query<CountRow[]>(
      'SELECT COUNT(*) as count FROM products WHERE category = ?',
      [category]
    );
    const total = countResult.count;

    const sql = 'SELECT * FROM products WHERE category = ? ORDER BY created_at DESC LIMIT ? OFFSET ?';
    const data = await query<ProductRow[]>(sql, [category, limit, offset]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  static async getCategories(): Promise<string[]> {
    const sql = 'SELECT DISTINCT category FROM products ORDER BY category';
    const results = await query<RowDataPacket[]>(sql);
    return results.map(row => row.category as string);
  }

  static async updateStock(id: number, quantityChange: number): Promise<Product | null> {
    const sql = 'UPDATE products SET stock_quantity = stock_quantity + ? WHERE product_id = ? AND stock_quantity + ? >= 0';
    const result = await execute(sql, [quantityChange, id, quantityChange]);
    if (result.affectedRows === 0) {
      throw new Error('Insufficient stock or product not found');
    }
    return await this.getById(id);
  }

  static async toggleActive(id: number): Promise<Product | null> {
    const sql = 'UPDATE products SET is_active = NOT is_active WHERE product_id = ?';
    await execute(sql, [id]);
    return await this.getById(id);
  }
}

export class ProductSizeService {
  static async getByProductId(productId: number): Promise<ProductSize[]> {
    const sql = 'SELECT * FROM product_sizes WHERE product_id = ? ORDER BY size';
    return await query<ProductSizeRow[]>(sql, [productId]);
  }

  static async getById(id: number): Promise<ProductSize | null> {
    const sql = 'SELECT * FROM product_sizes WHERE product_size_id = ?';
    const results = await query<ProductSizeRow[]>(sql, [id]);
    return results.length > 0 ? results[0] : null;
  }

  static async create(size: Omit<ProductSize, 'product_size_id'>): Promise<ProductSize> {
    const sql = 'INSERT INTO product_sizes (product_id, size, stock_quantity) VALUES (?, ?, ?)';
    const result = await execute(sql, [size.product_id, size.size, size.stock_quantity ?? 0]);
    const created = await this.getById(result.insertId);
    if (!created) throw new Error('Failed to create product size');
    return created;
  }

  static async update(id: number, data: Partial<ProductSize>): Promise<ProductSize | null> {
    const fields: string[] = [];
    const values: unknown[] = [];

    if (data.size !== undefined) {
      fields.push('size = ?');
      values.push(data.size);
    }
    if (data.stock_quantity !== undefined) {
      fields.push('stock_quantity = ?');
      values.push(data.stock_quantity);
    }

    if (fields.length === 0) return await this.getById(id);

    const sql = `UPDATE product_sizes SET ${fields.join(', ')} WHERE product_size_id = ?`;
    await execute(sql, [...values, id]);
    return await this.getById(id);
  }

  static async delete(id: number): Promise<boolean> {
    const sql = 'DELETE FROM product_sizes WHERE product_size_id = ?';
    const result = await execute(sql, [id]);
    return result.affectedRows > 0;
  }

  static async deleteByProductId(productId: number): Promise<boolean> {
    const sql = 'DELETE FROM product_sizes WHERE product_id = ?';
    const result = await execute(sql, [productId]);
    return result.affectedRows > 0;
  }

  static async updateStock(id: number, quantityChange: number): Promise<ProductSize | null> {
    const sql = 'UPDATE product_sizes SET stock_quantity = stock_quantity + ? WHERE product_size_id = ? AND stock_quantity + ? >= 0';
    const result = await execute(sql, [quantityChange, id, quantityChange]);
    if (result.affectedRows === 0) {
      throw new Error('Insufficient stock or size not found');
    }
    return await this.getById(id);
  }
}

export class ProductColorService {
  static async getByProductId(productId: number): Promise<ProductColor[]> {
    const sql = 'SELECT * FROM product_colors WHERE product_id = ? ORDER BY color';
    return await query<ProductColorRow[]>(sql, [productId]);
  }

  static async getById(id: number): Promise<ProductColor | null> {
    const sql = 'SELECT * FROM product_colors WHERE product_color_id = ?';
    const results = await query<ProductColorRow[]>(sql, [id]);
    return results.length > 0 ? results[0] : null;
  }

  static async create(color: Omit<ProductColor, 'product_color_id'>): Promise<ProductColor> {
    const sql = 'INSERT INTO product_colors (product_id, color, color_code, stock_quantity) VALUES (?, ?, ?, ?)';
    const result = await execute(sql, [color.product_id, color.color, color.color_code ?? null, color.stock_quantity ?? 0]);
    const created = await this.getById(result.insertId);
    if (!created) throw new Error('Failed to create product color');
    return created;
  }

  static async update(id: number, data: Partial<ProductColor>): Promise<ProductColor | null> {
    const fields: string[] = [];
    const values: unknown[] = [];

    if (data.color !== undefined) {
      fields.push('color = ?');
      values.push(data.color);
    }
    if (data.color_code !== undefined) {
      fields.push('color_code = ?');
      values.push(data.color_code);
    }
    if (data.stock_quantity !== undefined) {
      fields.push('stock_quantity = ?');
      values.push(data.stock_quantity);
    }

    if (fields.length === 0) return await this.getById(id);

    const sql = `UPDATE product_colors SET ${fields.join(', ')} WHERE product_color_id = ?`;
    await execute(sql, [...values, id]);
    return await this.getById(id);
  }

  static async delete(id: number): Promise<boolean> {
    const sql = 'DELETE FROM product_colors WHERE product_color_id = ?';
    const result = await execute(sql, [id]);
    return result.affectedRows > 0;
  }

  static async deleteByProductId(productId: number): Promise<boolean> {
    const sql = 'DELETE FROM product_colors WHERE product_id = ?';
    const result = await execute(sql, [productId]);
    return result.affectedRows > 0;
  }

  static async updateStock(id: number, quantityChange: number): Promise<ProductColor | null> {
    const sql = 'UPDATE product_colors SET stock_quantity = stock_quantity + ? WHERE product_color_id = ? AND stock_quantity + ? >= 0';
    const result = await execute(sql, [quantityChange, id, quantityChange]);
    if (result.affectedRows === 0) {
      throw new Error('Insufficient stock or color not found');
    }
    return await this.getById(id);
  }
}

export class ProductImageService {
  static async getByProductId(productId: number): Promise<ProductImage[]> {
    const sql = 'SELECT * FROM product_images WHERE product_id = ? ORDER BY display_order';
    return await query<ProductImageRow[]>(sql, [productId]);
  }

  static async getPrimaryImage(productId: number): Promise<ProductImage | null> {
    const sql = 'SELECT * FROM product_images WHERE product_id = ? AND is_primary = TRUE LIMIT 1';
    const results = await query<ProductImageRow[]>(sql, [productId]);
    return results.length > 0 ? results[0] : null;
  }

  static async getById(id: number): Promise<ProductImage | null> {
    const sql = 'SELECT * FROM product_images WHERE image_id = ?';
    const results = await query<ProductImageRow[]>(sql, [id]);
    return results.length > 0 ? results[0] : null;
  }

  static async create(image: Omit<ProductImage, 'image_id'>): Promise<ProductImage> {
    const sql = 'INSERT INTO product_images (product_id, image_url, is_primary, display_order) VALUES (?, ?, ?, ?)';
    const result = await execute(sql, [image.product_id, image.image_url, image.is_primary ?? false, image.display_order ?? 0]);
    const created = await this.getById(result.insertId);
    if (!created) throw new Error('Failed to create product image');
    return created;
  }

  static async update(id: number, data: Partial<ProductImage>): Promise<ProductImage | null> {
    const fields: string[] = [];
    const values: unknown[] = [];

    if (data.image_url !== undefined) {
      fields.push('image_url = ?');
      values.push(data.image_url);
    }
    if (data.is_primary !== undefined) {
      fields.push('is_primary = ?');
      values.push(data.is_primary);
    }
    if (data.display_order !== undefined) {
      fields.push('display_order = ?');
      values.push(data.display_order);
    }

    if (fields.length === 0) return await this.getById(id);

    const sql = `UPDATE product_images SET ${fields.join(', ')} WHERE image_id = ?`;
    await execute(sql, [...values, id]);
    return await this.getById(id);
  }

  static async delete(id: number): Promise<boolean> {
    const sql = 'DELETE FROM product_images WHERE image_id = ?';
    const result = await execute(sql, [id]);
    return result.affectedRows > 0;
  }

  static async deleteByProductId(productId: number): Promise<boolean> {
    const sql = 'DELETE FROM product_images WHERE product_id = ?';
    const result = await execute(sql, [productId]);
    return result.affectedRows > 0;
  }

  static async setPrimary(imageId: number, productId: number): Promise<ProductImage | null> {
    await execute('UPDATE product_images SET is_primary = FALSE WHERE product_id = ?', [productId]);
    await execute('UPDATE product_images SET is_primary = TRUE WHERE image_id = ?', [imageId]);
    return await this.getById(imageId);
  }
}
