import 'dotenv/config';
import dns from 'node:dns';
import app from './app.js';
import { connectDB } from './config/db.js';

// Work around the local Windows DNS SRV lookup failure.
// Production environments use their own DNS configuration.
if (process.env.NODE_ENV !== 'production') {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
}

const PORT = Number(process.env.PORT) || 5000;

async function startServer() {
  try {
    await connectDB();

    const server = app.listen(PORT, () => {
      console.log('TaskFlow API listening on port', PORT);
      console.log(`Health check: http://localhost:${PORT}/api/health`);
    });

    function shutdown(signal) {
      console.log(`${signal} received. Closing server...`);

      server.close(() => {
        process.exit(0);
      });

      setTimeout(() => process.exit(1), 10000).unref();
    }

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error) {
    console.error('Failed to start TaskFlow API:', error.message);
    process.exit(1);
  }
}

startServer();
