-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS leefeettrends CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Use the database
USE leefeettrends;

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  category_id INT,
  stock_quantity INT DEFAULT 0,
  image_url VARCHAR(500),
  sku VARCHAR(100) UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  order_number VARCHAR(100) UNIQUE NOT NULL,
  status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
  total_amount DECIMAL(10, 2) NOT NULL,
  shipping_address TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
);

-- Contact messages table
CREATE TABLE IF NOT EXISTS contact_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  subject VARCHAR(255),
  message TEXT NOT NULL,
  status ENUM('unread', 'read', 'replied') DEFAULT 'unread',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users table (for admin authentication)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'manager', 'staff') DEFAULT 'staff',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT IGNORE INTO categories (id, name, description) VALUES 
(1, 'Electronics', 'Electronic devices and accessories'),
(2, 'Clothing', 'Fashion and apparel items'),
(3, 'Home & Garden', 'Home decoration and garden supplies'),
(4, 'Books', 'Books and educational materials'),
(5, 'Sports', 'Sports equipment and gear');

INSERT IGNORE INTO products (id, name, description, price, category_id, stock_quantity, sku) VALUES 
(1, 'Laptop Pro', 'High-performance laptop for professionals', 1299.99, 1, 50, 'LP-001'),
(2, 'Wireless Mouse', 'Ergonomic wireless mouse', 29.99, 1, 200, 'WM-002'),
(3, 'Cotton T-Shirt', 'Comfortable cotton t-shirt', 19.99, 2, 100, 'CT-003'),
(4, 'Running Shoes', 'Professional running shoes', 89.99, 5, 75, 'RS-004'),
(5, 'Coffee Maker', 'Automatic coffee maker', 149.99, 3, 30, 'CM-005');

INSERT IGNORE INTO customers (id, name, email, phone, address) VALUES 
(1, 'John Doe', 'john@example.com', '+1234567890', '123 Main St, City, State 12345'),
(2, 'Jane Smith', 'jane@example.com', '+0987654321', '456 Oak Ave, Town, State 67890'),
(3, 'Bob Johnson', 'bob@example.com', '+1122334455', '789 Pine Rd, Village, State 13579');

INSERT IGNORE INTO orders (id, customer_id, order_number, status, total_amount, shipping_address) VALUES 
(1, 1, 'ORD-001', 'delivered', 1329.98, '123 Main St, City, State 12345'),
(2, 2, 'ORD-002', 'processing', 109.98, '456 Oak Ave, Town, State 67890'),
(3, 3, 'ORD-003', 'pending', 89.99, '789 Pine Rd, Village, State 13579');

INSERT IGNORE INTO order_items (id, order_id, product_id, quantity, unit_price, total_price) VALUES 
(1, 1, 1, 1, 1299.99, 1299.99),
(2, 1, 2, 1, 29.99, 29.99),
(3, 2, 3, 3, 19.99, 59.97),
(4, 2, 4, 1, 49.99, 49.99),
(5, 3, 4, 1, 89.99, 89.99);

INSERT IGNORE INTO users (id, username, email, password_hash, role) VALUES 
(1, 'admin', 'admin@leefeettrends.com', '$2b$10$placeholder_hash', 'admin');