require('dotenv').config(); // Load variables from .env
const express = require('express');
const app = express();
const connectDB = require('./src/config/db');
const paymentRoute = require('./src/routes/payment-route/paymentRoute');
const guideRoute = require("./src/routes/guide-routes/guideRoute");

// Use the port from .env, or fallback to 5000 if not found
const port = process.env.PORT || 5000;

// Middleware
app.use(express.json());

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
app.use('/api/guides', guideRoute);

const start = async () => {
  await connectDB();
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
};

start();