require('dotenv').config(); // Load variables from .env
const express = require('express');
const app = express();
const connectDB = require('./src/config/db');
const paymentRoute = require('./src/routes/payment-route/paymentRoute');
const campsiteRoute = require('./src/routes/campingsite-routes/campingsiteRoutes');

// Use the port from .env, or fallback to 5000 if not found
const port = process.env.PORT || 5000;

// Middleware
app.use(express.json());

// Normalize duplicate slashes and log normalization events to avoid 404s
app.use((req, res, next) => {
  if (req.url && req.url.includes('//')) {
    const normalized = req.url.replace(/\/{2,}/g, '/');
    if (normalized !== req.url) {
      console.log(`Normalized URL: ${req.url} -> ${normalized}`);
      req.url = normalized;
      if (req.originalUrl) req.originalUrl = normalized;
    }
  }
  next();
});

// Error handling for JSON parse errors
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Invalid JSON: ' + err.message });
  }
  next();
});

// Routes
app.get('/', (req, res) => {
  res.send('Server running with .env port!');
});

app.use('/api/payment', paymentRoute);
app.use('/api/campsites', campsiteRoute);

const start = async () => {
  await connectDB();
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
};

start();
