import app from './app.js';
import { prisma } from './lib/prisma.js';

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🚀 MM05 Backend Server');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📡 Server: http://localhost:${PORT}`);
  console.log(`📱 Frontend: ${process.env.FRONTEND_URL}`);
  console.log(`🔐 Auth API: http://localhost:${PORT}/api/auth`);
  console.log(`👑 Admin API: http://localhost:${PORT}/api/admin`);
  console.log(`🛒 Cart API: http://localhost:${PORT}/api/cart`);
  console.log(`📦 Orders API: http://localhost:${PORT}/api/orders`);
  console.log(`💳 Checkout API: http://localhost:${PORT}/api/checkout`);
  console.log(`🔔 Webhook: http://localhost:${PORT}/api/webhook`);
  console.log(`💚 Health: http://localhost:${PORT}/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
});

// Graceful shutdown handler
const gracefulShutdown = async (signal: string) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);
  
  // Stop accepting new connections
  server.close(async () => {
    console.log('✅ HTTP server closed - no longer accepting connections');
    
    try {
      // Close database connections
      await prisma.$disconnect();
      console.log('✅ Database connections closed');
      
      console.log('👋 Graceful shutdown completed successfully');
      process.exit(0);
    } catch (error) {
      console.error('❌ Error during shutdown:', error);
      process.exit(1);
    }
  });
  
  // Force shutdown after 10 seconds if graceful shutdown hangs
  setTimeout(() => {
    console.error('⚠️ Forced shutdown after 10 second timeout');
    process.exit(1);
  }, 10000);
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('UNHANDLED_REJECTION');
});

export default app;
