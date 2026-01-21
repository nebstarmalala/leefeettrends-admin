import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { customersRouter } from './routes/customers';
import { productsRouter } from './routes/products';
import { ordersRouter } from './routes/orders';
import { categoriesRouter } from './routes/categories';
import { contactRouter } from './routes/contact';
import { authRouter } from './routes/auth';
import { dashboardRouter } from './routes/dashboard';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/customers', customersRouter);
app.use('/api/products', productsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/contact', contactRouter);
app.use('/api/auth', authRouter);
app.use('/api/dashboard', dashboardRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
