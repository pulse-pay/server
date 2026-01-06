import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import config from './config/config.js';
import swaggerUi from 'swagger-ui-express';
import swaggerSpecs from './config/swagger.js';

// Import routes
import userRoutes from './routes/userRoutes.js';
import storeRoutes from './routes/storeRoutes.js';
import walletRoutes from './routes/walletRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import sessionRoutes from './routes/sessionRoutes.js';

// Initialize Express app
const app = express();

// Middleware
app.use(cors(config.cors)); // Enable CORS with config
app.use(morgan('dev')); // Logging
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/wallets', walletRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/sessions', sessionRoutes);

// Swagger Documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Root route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to PulsePay API',
    version: '1.0.0'
  });
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(config.nodeEnv === 'development' && { stack: err.stack })
  });
});

export default app;

