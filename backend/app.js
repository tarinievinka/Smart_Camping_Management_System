require('dotenv').config(); // Load variables from .env
const express = require('express');
const cors = require('cors');
const app = express();
const connectDB = require('./src/config/db');
const paymentRoute = require('./src/routes/payment-route/paymentRoute');
const userRoute = require('./src/routes/user-routes/userRoutes');
const feedbackRoute = require('./src/routes/feedback-route/feedbackRoute');

// Use the port from .env, or fallback to 5000 if not found
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: [process.env.FRONTEND_URL || 'http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));
const path = require('path');
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
app.use('/api', userRoute);
app.use('/api/feedback', feedbackRoute);

const start = async () => {
  await connectDB();
  const server = app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });

  server.on('error', (err) => {
    if (err && err.code === 'EADDRINUSE') {
      console.error(`Port ${port} is already in use. Free the port or set a different PORT in .env`);
      process.exit(1);
    }
    console.error('Server error:', err);
    process.exit(1);
  });
};

start();
