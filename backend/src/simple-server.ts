import express from 'express';
import cors from 'cors';
import { products } from './data/products.js';

// SECURITY: Block simple-server in production
if (process.env.NODE_ENV === 'production') {
  console.error('❌ CRITICAL SECURITY ERROR: simple-server.ts cannot be used in production!');
  console.error('❌ This server lacks essential security middleware:');
  console.error('   - No authentication');
  console.error('   - No CSRF protection');
  console.error('   - No helmet security headers');
  console.error('   - No rate limiting');
  console.error('❌ Use the main server (src/index.ts) instead.');
  process.exit(1);
}

const app = express();
const PORT = 3000;

console.warn('⚠️  WARNING: Running simple-server in development mode only!');
console.warn('⚠️  This server is NOT secure and should NEVER be used in production.');

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'MM05 Backend API is running' });
});

// Products endpoints
app.get('/api/products', (req, res) => {
  const { category, search, featured } = req.query;
  
  let filtered = [...products];
  
  if (category && category !== 'all') {
    filtered = filtered.filter(p => p.category === category);
  }
  
  if (search) {
    const searchLower = String(search).toLowerCase();
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(searchLower) ||
      p.description?.toLowerCase().includes(searchLower) ||
      p.category.toLowerCase().includes(searchLower)
    );
  }
  
  if (featured === 'true') {
    filtered = filtered.filter(p => p.isFeatured);
  }
  
  res.json({
    success: true,
    data: filtered,
    total: filtered.length
  });
});

app.get('/api/products/:slug', (req, res) => {
  const product = products.find(p => p.slug === req.params.slug);
  
  if (!product) {
    return res.status(404).json({
      success: false,
      error: 'Product not found'
    });
  }
  
  res.json({
    success: true,
    data: product
  });
});

// Categories endpoint
app.get('/api/categories', (req, res) => {
  const categories = [
    { name: "Кровати", slug: "krovati", count: products.filter(p => p.category === "Кровати").length },
    { name: "Шкафы", slug: "shkafy", count: products.filter(p => p.category === "Шкафы").length },
    { name: "Столы", slug: "stoly", count: products.filter(p => p.category === "Столы").length },
    { name: "Кресла", slug: "kresla", count: products.filter(p => p.category === "Кресла").length },
    { name: "Беседки", slug: "besedki", count: products.filter(p => p.category === "Беседки").length },
    { name: "Тумбы", slug: "tumby", count: products.filter(p => p.category === "Тумбы").length },
  ];
  
  res.json({
    success: true,
    data: categories
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 MM05 Backend API running on http://localhost:${PORT}`);
  console.log(`📦 Products loaded: ${products.length}`);
  console.log(`🔗 Frontend: http://localhost:5173`);
  console.log(`\n✅ Ready to accept requests!\n`);
});
