export interface Customer {
  customer_id: number;
  first_name: string;
  last_name: string;
  email: string;
  password_hash: string;
  phone?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Product {
  product_id: number;
  name: string;
  description?: string;
  category: string;
  price: number;
  delivery_fee: number;
  review_count: number;
  average_rating: number;
  stock_quantity: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface ProductSize {
  product_size_id: number;
  product_id: number;
  size: string;
  stock_quantity: number;
}

export interface ProductColor {
  product_color_id: number;
  product_id: number;
  color: string;
  color_code?: string;
  stock_quantity: number;
}

export interface ProductImage {
  image_id: number;
  product_id: number;
  image_url: string;
  is_primary: boolean;
  display_order: number;
}

export interface ProductWithDetails extends Product {
  sizes: ProductSize[];
  colors: ProductColor[];
  images: ProductImage[];
}

export interface Order {
  order_id: number;
  customer_id: number;
  order_number: string;
  order_status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  subtotal: number;
  delivery_fee: number;
  tax: number;
  total_amount: number;
  payment_method?: string;
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
  shipping_address?: string;
  billing_address?: string;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface OrderItem {
  order_item_id: number;
  order_id: number;
  product_id: number;
  size: string;
  color: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface Review {
  review_id: number;
  product_id: number;
  customer_id: number;
  order_id?: number;
  rating: number;
  title?: string;
  comment?: string;
  is_verified_purchase: boolean;
  is_approved: boolean;
  helpful_count: number;
  created_at: Date;
  updated_at: Date;
}

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject?: string;
  message: string;
  status: 'unread' | 'read' | 'replied';
  created_at: Date;
}

export interface User {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  role: 'admin' | 'manager' | 'staff';
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface OrderWithItems extends Order {
  items: OrderItem[];
}

export interface OrderWithCustomer extends Order {
  customer: Customer;
}

export interface ReviewWithCustomer extends Review {
  customer: Customer;
}

export interface CreateOrderInput {
  customer_id: number;
  order_number: string;
  order_status?: Order['order_status'];
  subtotal: number;
  delivery_fee?: number;
  tax?: number;
  total_amount: number;
  payment_method?: string;
  payment_status?: Order['payment_status'];
  shipping_address?: string;
  billing_address?: string;
  notes?: string;
  items: Omit<OrderItem, 'order_item_id' | 'order_id'>[];
}

export interface CreateProductInput {
  name: string;
  description?: string;
  category: string;
  price: number;
  delivery_fee?: number;
  stock_quantity?: number;
  is_active?: boolean;
  sizes?: Omit<ProductSize, 'product_size_id' | 'product_id'>[];
  colors?: Omit<ProductColor, 'product_color_id' | 'product_id'>[];
  images?: Omit<ProductImage, 'image_id' | 'product_id'>[];
}

export interface CreateReviewInput {
  product_id: number;
  customer_id: number;
  order_id?: number;
  rating: number;
  title?: string;
  comment?: string;
  is_verified_purchase?: boolean;
}
