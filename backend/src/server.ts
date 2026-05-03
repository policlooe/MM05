import app from './app.js';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
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

export default app;
