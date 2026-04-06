require('dotenv').config(); // Load variables from .env
const path = require('path');
const express = require('express');
const cors = require('cors');
const app = express();
const connectDB = require('./src/config/db');
const paymentRoute = require('./src/routes/payment-route/paymentRoute');
const guideRoute = require("./src/routes/guide-routes/guideRoute");
const guideBookingRoute = require("./src/routes/guide-booking-routes/guideBookingRoute");


// Use the port from .env, or fallback to 5000 if not found
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Uploaded guide images (see POST /api/guides/upload-image)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
app.use('/api/guide-bookings', guideBookingRoute);


const start = async () => {
  await connectDB();
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
};

start();