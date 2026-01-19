# Leefeet Trends Admin

A modern, responsive admin dashboard for managing Leefeet Trends e-commerce platform. Built with React, TypeScript, and Tailwind CSS.

## 🚀 Features

- **Dashboard Analytics** - Real-time sales metrics and analytics visualization
- **Order Management** - Complete order lifecycle management with status tracking
- **Product Management** - Product catalog management with CRUD operations
- **Customer Management** - Customer data and relationship management
- **Contact Messages** - Centralized customer inquiry management
- **User Authentication** - Secure login system with protected routes
- **Dark/Light Theme** - Seamless theme switching with system preference detection
- **Responsive Design** - Mobile-first design that works on all devices

## 🛠️ Tech Stack

- **Frontend**: React 19.2.0 with TypeScript
- **Build Tool**: Vite 6.0.7
- **Styling**: Tailwind CSS 4.1.9 with Radix UI components
- **Routing**: React Router DOM 7.1.1
- **Forms**: React Hook Form with Zod validation
- **Charts**: Recharts 2.15.4 for data visualization
- **Database**: MySQL with custom ORM layer
- **Icons**: Lucide React
- **State Management**: React Context API

## 📋 Prerequisites

- Node.js 18+ 
- MySQL 8.0+
- npm or yarn package manager

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd leefeettrends-admin
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Configure your database connection and other environment variables in `.env`:
   ```env
   DATABASE_URL=mysql://username:password@localhost:3306/leefeetrends
   JWT_SECRET=your-jwt-secret-key
   ```

4. **Initialize the database**
   ```bash
   npm run init-db
   ```

5. **Run database migrations**
   ```bash
   npm run migrate
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   Navigate to `http://localhost:5173`

## 📁 Project Structure

```
leefeettrends-admin/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # Base UI components (Radix UI)
│   │   ├── dashboard.tsx   # Main dashboard component
│   │   ├── order-management.tsx
│   │   ├── product-management.tsx
│   │   ├── customer-management.tsx
│   │   ├── contact-messages.tsx
│   │   └── analytics.tsx
│   ├── context/            # React context providers
│   │   ├── auth-context.tsx
│   │   ├── theme-context.tsx
│   │   └── alert-context.tsx
│   ├── hooks/              # Custom React hooks
│   ├── services/           # API service layer
│   ├── types/              # TypeScript type definitions
│   ├── lib/                # Utility functions
│   ├── pages/              # Page components
│   └── main.tsx           # Application entry point
├── database/               # Database scripts
├── scripts/               # Build and utility scripts
└── public/                # Static assets
```

## 🎯 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run init-db` - Initialize database with schema
- `npm run migrate` - Run database migrations

## 🔧 Configuration

### Database Configuration

The application uses MySQL as the database. Ensure your database server is running and configured correctly in your `.env` file:

```env
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_NAME=leefeettrends
DATABASE_USER=your_username
DATABASE_PASSWORD=your_password
```

### Theme Configuration

The application supports light/dark themes with system preference detection. Theme settings are persisted in localStorage under the key `leefeet-theme`.

## 🔐 Authentication

The application implements JWT-based authentication with the following features:

- Secure login endpoint
- Protected routes with automatic redirection
- Token-based authentication
- Session management

## 📊 Data Management

### Order Management
- View all orders with filtering and pagination
- Update order status (pending, processing, shipped, delivered, cancelled)
- View detailed order information including customer and product details

### Product Management
- Complete CRUD operations for products
- Category management
- Inventory tracking
- Product search and filtering

### Customer Management
- View customer profiles and order history
- Customer data management
- Search and filter customers

### Analytics Dashboard
- Real-time sales metrics
- Revenue charts and trends
- Order statistics
- Product performance analytics

## 🎨 UI Components

The application uses a comprehensive UI component library built with Radix UI and Tailwind CSS:

- **Form Components**: Input, select, textarea, checkbox, radio groups
- **Navigation**: Sidebar, breadcrumb, navigation menu
- **Feedback**: Toast notifications, alerts, loading spinners
- **Data Display**: Tables, cards, charts, badges
- **Layout**: Resizable panels, scroll areas, separators

## 📱 Responsive Design

The application is built with a mobile-first approach and includes:

- Responsive navigation with collapsible sidebar
- Touch-friendly interface elements
- Adaptive layouts for different screen sizes
- Mobile-optimized tables and data views

## 🧪 Development

### Code Style

The project uses TypeScript for type safety and follows React best practices. ESLint is configured for code linting.

### Component Development

Components are organized by feature and use:
- TypeScript interfaces for props
- Custom hooks for reusable logic
- Context API for state management
- Tailwind CSS for styling

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

The build output will be in the `dist/` directory.

### Environment Variables

Ensure the following environment variables are set in production:

- `DATABASE_URL` - Database connection string
- `JWT_SECRET` - JWT signing secret
- `NODE_ENV` - Set to `production`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the existing issues in the repository
2. Create a new issue with detailed information
3. Include steps to reproduce any bugs
4. Provide environment details if applicable

## 🔄 Version History

- **0.1.0** - Initial release with core admin functionality
  - Dashboard with analytics
  - Order, product, and customer management
  - Authentication system
  - Responsive design with dark mode support

---

Built with ❤️ for Leefeet Trends e-commerce platform