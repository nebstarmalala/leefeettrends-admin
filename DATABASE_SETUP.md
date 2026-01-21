# Database Setup Guide

This guide will help you set up MariaDB for your leefeettrends-admin application.

## Prerequisites

1. **MariaDB Server** - Download and install MariaDB from [mariadb.org](https://mariadb.org/)
2. **Node.js** - Already installed with your project

## Setup Steps

### 1. Install MariaDB

- **Windows**: Download from mariadb.org and run the installer
- **macOS**: `brew install mariadb`
- **Linux**: `sudo apt-get install mariadb-server` (Ubuntu/Debian)

### 2. Start MariaDB Service

- **Windows**: Start from Services or run `net start mysql`
- **macOS**: `brew services start mariadb`
- **Linux**: `sudo systemctl start mariadb`

### 3. Configure Database

1. Open MariaDB command line:
   ```bash
   mysql -u root -p
   ```

2. Create a database user (optional but recommended):
   ```sql
   CREATE USER 'leefeettrends'@'localhost' IDENTIFIED BY 'your_password';
   GRANT ALL PRIVILEGES ON leefeettrends.* TO 'leefeettrends'@'localhost';
   FLUSH PRIVILEGES;
   ```

### 4. Update Environment Configuration

Edit the `.env` file in your project root:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root                    # or 'leefeettrends' if you created a user
DB_PASSWORD=                    # add your password if set
DB_NAME=leefeettrends_db
```

### 5. Initialize Database

Run the database initialization script:

```bash
npm run init-db
```

This will:
- Test the database connection
- Create the database schema
- Insert sample data

### 6. Verify Setup

Start your application:

```bash
npm run dev
```

Navigate to the Customers page to verify that database data is loading correctly.

## Database Schema

The database includes the following tables:

- **customers** - Customer information
- **products** - Product catalog
- **categories** - Product categories
- **orders** - Order records
- **order_items** - Order line items
- **contact_messages** - Contact form submissions
- **users** - Admin user accounts

## Troubleshooting

### Connection Issues

1. **Check MariaDB is running**: Verify the service is started
2. **Verify credentials**: Ensure DB_USER and DB_PASSWORD are correct
3. **Check firewall**: Make sure port 3306 is accessible

### Migration Issues

1. **Run migrations manually**: `npm run migrate`
2. **Reset database**: Delete and recreate the database, then run `npm run init-db`

### Permission Issues

1. **Grant privileges**: Ensure the database user has proper permissions
2. **Check file permissions**: Verify the project directory is accessible

## Sample Data

The initialization script includes sample data for:
- 5 customers
- 5 products
- 5 categories
- 3 orders
- 1 admin user

You can modify the `database/schema.sql` file to customize the initial data.