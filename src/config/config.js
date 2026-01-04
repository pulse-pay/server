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
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
  },

  // Rate limiting (if implementing rate limiting)
  // rateLimit: {
  //   windowMs: 15 * 60 * 1000, // 15 minutes
  //   max: 100 // limit each IP to 100 requests per windowMs
  // }
};

export default config;

