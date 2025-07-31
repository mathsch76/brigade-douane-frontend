// proxy-server.js
import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();

// Proxy vers auth-backend (corrigé avec le bon port)
app.use('/api', createProxyMiddleware({
  target: 'http://localhost:4002',  // Port corrigé
  changeOrigin: true,
 
}));

// Proxy vers rag-backend (pas de changement)
app.use('/api-rag', createProxyMiddleware({
  target: 'http://localhost:3003',
  changeOrigin: true,
  pathRewrite: {
    '^/api-rag': '',
  },
}));

// Fallback pour les routes non trouvées
app.use((req, res) => {
  res.status(404).send('Not found');
});

const PORT = 3005;
app.listen(PORT, () => {
  console.log(`🚀 Proxy server running at http://localhost:${PORT}`);
});
