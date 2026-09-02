import app from './app';
import { env } from './config/env';
import { pool, checkDatabaseConnection } from './config/database';

async function startServer() {
  console.log('🚀 Starting ProctorAI Backend Application...');
  console.log(`🌍 Environment: ${env.NODE_ENV}`);

  // Connection check
  const dbStatus = await checkDatabaseConnection();
  if (dbStatus.connected) {
    console.log(`✅ ${dbStatus.message}`);
  } else {
    console.warn(`⚠️ Database check warning: ${dbStatus.message}`);
    console.warn('⚠️ Server starting in degraded mode. PostgreSQL connection will be retried on demand.');
  }

  const server = app.listen(env.PORT, () => {
    console.log(`🟢 Backend Server listening on http://localhost:${env.PORT}`);
    console.log(`📊 Health Endpoint available at http://localhost:${env.PORT}/api/health`);
  });

  const shutdown = async (signal: string) => {
    console.log(`\n🛑 ${signal} received. Closing HTTP server & Database pool...`);
    server.close(async () => {
      await pool.end();
      console.log('✅ Connections closed. Process exiting cleanly.');
      process.exit(0);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

startServer();
