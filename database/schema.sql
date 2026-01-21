-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS leefeettrends CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Use the database
USE leefeettrends;

-- Customers Table
CREATE TABLE IF NOT EXISTS customers (
    customer_id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email)
);

-- Products Table
CREATE TABLE IF NOT EXISTS products (
    product_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    delivery_fee DECIMAL(10, 2) DEFAULT 0.00,
    review_count INT DEFAULT 0,
    average_rating DECIMAL(3, 2) DEFAULT 0.00,
    stock_quantity INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_price (price),
    INDEX idx_name (name)
);

-- Product Sizes Table (normalized approach for available sizes)
CREATE TABLE IF NOT EXISTS product_sizes (
    product_size_id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    size VARCHAR(10) NOT NULL,
    stock_quantity INT DEFAULT 0,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
    UNIQUE KEY unique_product_size (product_id, size)
);

-- Product Colors Table (normalized approach for available colors)
CREATE TABLE IF NOT EXISTS product_colors (
    product_color_id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    color VARCHAR(50) NOT NULL,
    color_code VARCHAR(7),
    stock_quantity INT DEFAULT 0,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
    UNIQUE KEY unique_product_color (product_id, color)
);

-- Product Images Table
CREATE TABLE IF NOT EXISTS product_images (
    image_id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    display_order INT DEFAULT 0,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
    order_id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT NOT NULL,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    order_status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    subtotal DECIMAL(10, 2) NOT NULL,
    delivery_fee DECIMAL(10, 2) DEFAULT 0.00,
    tax DECIMAL(10, 2) DEFAULT 0.00,
    total_amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50),
    payment_status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    shipping_address TEXT,
    billing_address TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
    INDEX idx_customer (customer_id),
    INDEX idx_status (order_status),
    INDEX idx_created (created_at)
);

-- Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
    order_item_id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    size VARCHAR(10) NOT NULL,
    color VARCHAR(50) NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);

-- Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
    review_id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    customer_id INT NOT NULL,
    order_id INT,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(200),
    comment TEXT,
    is_verified_purchase BOOLEAN DEFAULT FALSE,
    is_approved BOOLEAN DEFAULT TRUE,
    helpful_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE SET NULL,
    INDEX idx_product (product_id),
    INDEX idx_rating (rating),
    UNIQUE KEY unique_customer_product_review (customer_id, product_id, order_id)
);

-- Contact messages table
CREATE TABLE IF NOT EXISTS contact_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(255),
    message TEXT NOT NULL,
    status ENUM('unread', 'read', 'replied') DEFAULT 'unread',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_created (created_at)
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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_role (role),
    INDEX idx_active (is_active)
);

-- Trigger to update review count and average rating when a review is added
DELIMITER //
CREATE TRIGGER after_review_insert
AFTER INSERT ON reviews
FOR EACH ROW
BEGIN
    UPDATE products
    SET review_count = (SELECT COUNT(*) FROM reviews WHERE product_id = NEW.product_id AND is_approved = TRUE),
        average_rating = (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE product_id = NEW.product_id AND is_approved = TRUE)
    WHERE product_id = NEW.product_id;
END//

-- Trigger to update review count and average rating when a review is updated
CREATE TRIGGER after_review_update
AFTER UPDATE ON reviews
FOR EACH ROW
BEGIN
    UPDATE products
    SET review_count = (SELECT COUNT(*) FROM reviews WHERE product_id = NEW.product_id AND is_approved = TRUE),
        average_rating = (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE product_id = NEW.product_id AND is_approved = TRUE)
    WHERE product_id = NEW.product_id;
END//

-- Trigger to update review count and average rating when a review is deleted
CREATE TRIGGER after_review_delete
AFTER DELETE ON reviews
FOR EACH ROW
BEGIN
    UPDATE products
    SET review_count = (SELECT COUNT(*) FROM reviews WHERE product_id = OLD.product_id AND is_approved = TRUE),
        average_rating = (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE product_id = OLD.product_id AND is_approved = TRUE)
    WHERE product_id = OLD.product_id;
END//
DELIMITER ;

-- Insert sample data
INSERT IGNORE INTO customers (customer_id, first_name, last_name, email, password_hash, phone) VALUES
(1, 'John', 'Doe', 'john@example.com', '$2b$10$placeholder_hash', '+1234567890'),
(2, 'Jane', 'Smith', 'jane@example.com', '$2b$10$placeholder_hash', '+0987654321'),
(3, 'Bob', 'Johnson', 'bob@example.com', '$2b$10$placeholder_hash', '+1122334455');

INSERT IGNORE INTO products (product_id, name, description, category, price, delivery_fee, stock_quantity) VALUES
(1, 'Classic Sneakers', 'Comfortable everyday sneakers', 'Footwear', 89.99, 5.00, 50),
(2, 'Running Shoes Pro', 'Professional running shoes with extra cushioning', 'Footwear', 129.99, 5.00, 75),
(3, 'Casual Loafers', 'Stylish casual loafers', 'Footwear', 69.99, 5.00, 100),
(4, 'Sports Sandals', 'Durable sports sandals', 'Footwear', 49.99, 3.00, 200),
(5, 'Leather Boots', 'Premium leather boots', 'Footwear', 199.99, 7.00, 30);

INSERT IGNORE INTO product_sizes (product_id, size, stock_quantity) VALUES
(1, '38', 10), (1, '39', 15), (1, '40', 10), (1, '41', 10), (1, '42', 5),
(2, '39', 20), (2, '40', 25), (2, '41', 15), (2, '42', 10), (2, '43', 5),
(3, '38', 25), (3, '39', 25), (3, '40', 25), (3, '41', 15), (3, '42', 10);

INSERT IGNORE INTO product_colors (product_id, color, color_code, stock_quantity) VALUES
(1, 'White', '#FFFFFF', 25), (1, 'Black', '#000000', 15), (1, 'Navy', '#000080', 10),
(2, 'Red', '#FF0000', 30), (2, 'Blue', '#0000FF', 25), (2, 'Black', '#000000', 20),
(3, 'Brown', '#8B4513', 50), (3, 'Black', '#000000', 30), (3, 'Tan', '#D2B48C', 20);

INSERT IGNORE INTO product_images (product_id, image_url, is_primary, display_order) VALUES
(1, '/images/products/classic-sneakers-1.jpg', TRUE, 1),
(1, '/images/products/classic-sneakers-2.jpg', FALSE, 2),
(2, '/images/products/running-shoes-1.jpg', TRUE, 1),
(3, '/images/products/casual-loafers-1.jpg', TRUE, 1);

INSERT IGNORE INTO orders (order_id, customer_id, order_number, order_status, subtotal, delivery_fee, tax, total_amount, payment_method, payment_status, shipping_address) VALUES
(1, 1, 'ORD-001', 'delivered', 219.98, 10.00, 17.60, 247.58, 'credit_card', 'completed', '123 Main St, City, State 12345'),
(2, 2, 'ORD-002', 'processing', 69.99, 5.00, 5.60, 80.59, 'paypal', 'completed', '456 Oak Ave, Town, State 67890'),
(3, 3, 'ORD-003', 'pending', 129.99, 5.00, 10.40, 145.39, 'credit_card', 'pending', '789 Pine Rd, Village, State 13579');

INSERT IGNORE INTO order_items (order_id, product_id, size, color, quantity, unit_price, subtotal) VALUES
(1, 1, '40', 'White', 1, 89.99, 89.99),
(1, 2, '41', 'Red', 1, 129.99, 129.99),
(2, 3, '39', 'Brown', 1, 69.99, 69.99),
(3, 2, '42', 'Blue', 1, 129.99, 129.99);

INSERT IGNORE INTO users (id, username, email, password_hash, role) VALUES
(1, 'admin', 'admin@leefeettrends.com', '$2b$10$placeholder_hash', 'admin');
