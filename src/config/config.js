import dotenv from 'dotenv';
dotenv.config();

const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/pulsepay',

  // JWT Configuration (uncomment when implementing authentication)
  // jwt: {
  //   secret: process.env.JWT_SECRET,
  //   expire: process.env.JWT_EXPIRE || '30d'
  // },

  // CORS Configuration
  cors: {
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      const allowedOrigins = process.env.CORS_ORIGIN 
        ? process.env.CORS_ORIGIN.split(',') 
        : ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:5000'];
      
      if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    exposedHeaders: ['Content-Length', 'X-Request-Id'],
    maxAge: 86400, // 24 hours
    preflightContinue: false,
    optionsSuccessStatus: 204
  },

  // Rate limiting (if implementing rate limiting)
  // rateLimit: {
  //   windowMs: 15 * 60 * 1000, // 15 minutes
  //   max: 100 // limit each IP to 100 requests per windowMs
  // }
};

export default config;

