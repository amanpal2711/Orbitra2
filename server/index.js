import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { getRequiredEnv } from './config/env.js';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import itineraryRoutes from './routes/itineraries.js';

const app = express();

// Render.com assigns port dynamically via PORT environment variable
// For local development, fallback to 10000
const PORT = process.env.PORT || process.env.RENDER_EXTERNAL_PORT || 10000;
const HOST = '0.0.0.0'; // Always bind to all network interfaces for Render compatibility

getRequiredEnv('JWT_SECRET');

const localOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

const configuredOrigins = [process.env.FRONTEND_URL, process.env.FRONTEND_URLS]
  .filter(Boolean)
  .flatMap((value) =>
    value
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean)
  );

const normalizeOrigin = (value) => {
  try {
    return new URL(value).origin;
  } catch {
    return value;
  }
};

const isLocalOrigin = (origin) => {
  try {
    const { hostname } = new URL(origin);
    return hostname === 'localhost' || hostname === '127.0.0.1';
  } catch {
    return false;
  }
};

const isVercelOrigin = (origin) => {
  try {
    const { hostname, protocol } = new URL(origin);
    return protocol === 'https:' && hostname.endsWith('.vercel.app');
  } catch {
    return false;
  }
};

const isRenderOrigin = (origin) => {
  try {
    const { hostname, protocol } = new URL(origin);
    return protocol === 'https:' && hostname.endsWith('.onrender.com');
  } catch {
    return false;
  }
};

const allowedOrigins = new Set([
  ...localOrigins.map(normalizeOrigin),
  ...configuredOrigins.map(normalizeOrigin),
]);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }

    const normalizedOrigin = normalizeOrigin(origin);
    const isAllowed =
      allowedOrigins.has(normalizedOrigin) ||
      isLocalOrigin(origin) ||
      isVercelOrigin(origin) ||
      isRenderOrigin(origin);

    return callback(null, isAllowed);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Orbitra Itinerary API',
    version: '1.0.0',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
      },
      itineraries: {
        generate: 'POST /api/itineraries/generate',
        list: 'GET /api/itineraries',
        get: 'GET /api/itineraries/:id',
        share: 'GET /api/itineraries/share/:shareToken',
        delete: 'DELETE /api/itineraries/:id',
      },
    },
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/itineraries', itineraryRoutes);

app.use((req, res) => {
  res.status(404).json({
    message: `Route ${req.originalUrl} not found`,
  });
});

app.use((err, req, res, _next) => {
  console.error(err.stack || err.message);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(PORT, HOST, () => {
      console.log(`Server is running on port ${PORT}`);
      const host = HOST === '0.0.0.0' ? '0.0.0.0' : 'localhost';
      console.log(`API available at http://${host}:${PORT}`);
    });

    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(
          `Port ${PORT} is already in use. Stop the other backend process or change PORT in server/.env.`
        );
        process.exit(1);
      }

      throw error;
    });
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
};

startServer();

export default app;
