import { api } from '../lib/api';

export interface DashboardStats {
  totalCustomers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  totalStock: number;
  pendingOrders: number;
  unreadMessages: number;
  avgOrderValue: number;
  revenueChange: string;
  ordersChange: string;
  customersChange: string;
}

export interface SalesByCategory {
  name: string;
  value: number;
}

export interface MonthlyPerformance {
  month: string;
  orders: number;
  revenue: number;
}

export interface OrderStatus {
  name: string;
  value: number;
}

export interface TopProduct {
  id: number;
  name: string;
  price: number;
  total_sold: number;
  total_revenue: number;
}

export interface RecentOrder {
  id: number;
  order_number: string;
  customer_name: string;
  customer_email: string;
  total_amount: number;
  status: string;
  created_at: string;
}

export interface LowStockProduct {
  id: number;
  name: string;
  stock_quantity: number;
  price: number;
}

export class DashboardService {
  static async getStats(): Promise<DashboardStats> {
    return api.get<DashboardStats>('/dashboard/stats');
  }

  static async getSalesByCategory(): Promise<SalesByCategory[]> {
    return api.get<SalesByCategory[]>('/dashboard/sales-by-category');
  }

  static async getMonthlyPerformance(): Promise<MonthlyPerformance[]> {
    return api.get<MonthlyPerformance[]>('/dashboard/monthly-performance');
  }

  static async getOrderStatus(): Promise<OrderStatus[]> {
    return api.get<OrderStatus[]>('/dashboard/order-status');
  }

  static async getTopProducts(): Promise<TopProduct[]> {
    return api.get<TopProduct[]>('/dashboard/top-products');
  }

  static async getRecentOrders(): Promise<RecentOrder[]> {
    return api.get<RecentOrder[]>('/dashboard/recent-orders');
  }

  static async getLowStockProducts(): Promise<LowStockProduct[]> {
    return api.get<LowStockProduct[]>('/dashboard/low-stock');
  }
}
