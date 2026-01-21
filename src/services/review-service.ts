import { query, execute } from '../lib/database';
import { Review, CreateReviewInput, PaginationParams, PaginatedResult } from '../types/database';
import { RowDataPacket } from 'mysql2';

interface ReviewRow extends Review, RowDataPacket {}
interface CountRow extends RowDataPacket { count: number }

export class ReviewService {
  static async getAll(pagination?: PaginationParams): Promise<PaginatedResult<Review>> {
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 50;
    const offset = (page - 1) * limit;

    const [countResult] = await query<CountRow[]>('SELECT COUNT(*) as count FROM reviews');
    const total = countResult.count;

    const sql = 'SELECT * FROM reviews ORDER BY created_at DESC LIMIT ? OFFSET ?';
    const data = await query<ReviewRow[]>(sql, [limit, offset]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  static async getById(id: number): Promise<Review | null> {
    const sql = 'SELECT * FROM reviews WHERE review_id = ?';
    const results = await query<ReviewRow[]>(sql, [id]);
    return results.length > 0 ? results[0] : null;
  }

  static async getByProductId(productId: number, pagination?: PaginationParams): Promise<PaginatedResult<Review>> {
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 50;
    const offset = (page - 1) * limit;

    const [countResult] = await query<CountRow[]>(
      'SELECT COUNT(*) as count FROM reviews WHERE product_id = ? AND is_approved = TRUE',
      [productId]
    );
    const total = countResult.count;

    const sql = 'SELECT * FROM reviews WHERE product_id = ? AND is_approved = TRUE ORDER BY created_at DESC LIMIT ? OFFSET ?';
    const data = await query<ReviewRow[]>(sql, [productId, limit, offset]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  static async getByCustomerId(customerId: number, pagination?: PaginationParams): Promise<PaginatedResult<Review>> {
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 50;
    const offset = (page - 1) * limit;

    const [countResult] = await query<CountRow[]>(
      'SELECT COUNT(*) as count FROM reviews WHERE customer_id = ?',
      [customerId]
    );
    const total = countResult.count;

    const sql = 'SELECT * FROM reviews WHERE customer_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?';
    const data = await query<ReviewRow[]>(sql, [customerId, limit, offset]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  static async getPendingApproval(pagination?: PaginationParams): Promise<PaginatedResult<Review>> {
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 50;
    const offset = (page - 1) * limit;

    const [countResult] = await query<CountRow[]>(
      'SELECT COUNT(*) as count FROM reviews WHERE is_approved = FALSE'
    );
    const total = countResult.count;

    const sql = 'SELECT * FROM reviews WHERE is_approved = FALSE ORDER BY created_at DESC LIMIT ? OFFSET ?';
    const data = await query<ReviewRow[]>(sql, [limit, offset]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  static async create(input: CreateReviewInput): Promise<Review> {
    const sql = `INSERT INTO reviews (product_id, customer_id, order_id, rating, title, comment, is_verified_purchase)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const result = await execute(sql, [
      input.product_id,
      input.customer_id,
      input.order_id ?? null,
      input.rating,
      input.title ?? null,
      input.comment ?? null,
      input.is_verified_purchase ?? false
    ]);
    const created = await this.getById(result.insertId);
    if (!created) throw new Error('Failed to create review');
    return created;
  }

  static async update(id: number, data: Partial<Review>): Promise<Review | null> {
    const fields: string[] = [];
    const values: unknown[] = [];

    if (data.rating !== undefined) {
      fields.push('rating = ?');
      values.push(data.rating);
    }
    if (data.title !== undefined) {
      fields.push('title = ?');
      values.push(data.title);
    }
    if (data.comment !== undefined) {
      fields.push('comment = ?');
      values.push(data.comment);
    }
    if (data.is_approved !== undefined) {
      fields.push('is_approved = ?');
      values.push(data.is_approved);
    }
    if (data.helpful_count !== undefined) {
      fields.push('helpful_count = ?');
      values.push(data.helpful_count);
    }

    if (fields.length === 0) return await this.getById(id);

    const sql = `UPDATE reviews SET ${fields.join(', ')} WHERE review_id = ?`;
    await execute(sql, [...values, id]);
    return await this.getById(id);
  }

  static async delete(id: number): Promise<boolean> {
    const sql = 'DELETE FROM reviews WHERE review_id = ?';
    const result = await execute(sql, [id]);
    return result.affectedRows > 0;
  }

  static async approve(id: number): Promise<Review | null> {
    const sql = 'UPDATE reviews SET is_approved = TRUE WHERE review_id = ?';
    await execute(sql, [id]);
    return await this.getById(id);
  }

  static async reject(id: number): Promise<Review | null> {
    const sql = 'UPDATE reviews SET is_approved = FALSE WHERE review_id = ?';
    await execute(sql, [id]);
    return await this.getById(id);
  }

  static async incrementHelpful(id: number): Promise<Review | null> {
    const sql = 'UPDATE reviews SET helpful_count = helpful_count + 1 WHERE review_id = ?';
    await execute(sql, [id]);
    return await this.getById(id);
  }

  static async getByRating(rating: number, pagination?: PaginationParams): Promise<PaginatedResult<Review>> {
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 50;
    const offset = (page - 1) * limit;

    const [countResult] = await query<CountRow[]>(
      'SELECT COUNT(*) as count FROM reviews WHERE rating = ? AND is_approved = TRUE',
      [rating]
    );
    const total = countResult.count;

    const sql = 'SELECT * FROM reviews WHERE rating = ? AND is_approved = TRUE ORDER BY created_at DESC LIMIT ? OFFSET ?';
    const data = await query<ReviewRow[]>(sql, [rating, limit, offset]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  static async getVerifiedPurchases(productId: number, pagination?: PaginationParams): Promise<PaginatedResult<Review>> {
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 50;
    const offset = (page - 1) * limit;

    const [countResult] = await query<CountRow[]>(
      'SELECT COUNT(*) as count FROM reviews WHERE product_id = ? AND is_verified_purchase = TRUE AND is_approved = TRUE',
      [productId]
    );
    const total = countResult.count;

    const sql = 'SELECT * FROM reviews WHERE product_id = ? AND is_verified_purchase = TRUE AND is_approved = TRUE ORDER BY created_at DESC LIMIT ? OFFSET ?';
    const data = await query<ReviewRow[]>(sql, [productId, limit, offset]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  static async hasCustomerReviewedProduct(customerId: number, productId: number, orderId?: number): Promise<boolean> {
    let sql = 'SELECT COUNT(*) as count FROM reviews WHERE customer_id = ? AND product_id = ?';
    const params: unknown[] = [customerId, productId];

    if (orderId !== undefined) {
      sql += ' AND order_id = ?';
      params.push(orderId);
    }

    const [result] = await query<CountRow[]>(sql, params);
    return result.count > 0;
  }
}
