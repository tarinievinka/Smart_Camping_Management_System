require('dotenv').config(); // Load variables from .env
const path = require('path');
const express = require('express');
const cors = require('cors');
const app = express();
const connectDB = require('./src/config/db');
const paymentRoute = require('./src/routes/payment-route/paymentRoute');
const feedbackRoute = require('./src/routes/feedback-route/feedbackRoute');
const equipmentRouter = require('./src/routes/Equipment-route/EquipmentRoute');
const notifyRoute = require('./src/routes/Notify-route/NotifyRoute');
const userRoute = require('./src/routes/user-routes/userRoutes');
const guideRoute = require("./src/routes/guide-routes/guideRoute");
const guideBookingRoute = require("./src/routes/guide-booking-routes/guideBookingRoute");
const campsiteRoute = require('./src/routes/campsite-route/campsiteRoutes');
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 0314994bf65062d852853dc4a3f58bba40113109
const reservationRoute = require('./src/routes/reservation-routes/reservations');
<<<<<<< HEAD
=======
const customerNotificationRoute = require('./src/routes/customer-notification-route/CustomerNotificationRoute');
<<<<<<< HEAD
>>>>>>> 5ad9549d4f343c6385faa99801a01721940c0e37
=======
>>>>>>> 72d49f97b953854ffc2cce76cb28c3b75c102fd7
=======
>>>>>>> 875b8c7b1d28b08e2375464309804f17e9cb5e8d
>>>>>>> 0314994bf65062d852853dc4a3f58bba40113109

const port = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: [process.env.FRONTEND_URL || 'http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));
app.use(express.json());
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
app.use('/api/feedback', feedbackRoute);
app.use('/api/equipment', equipmentRouter);
app.use('/api/notify', notifyRoute);
app.use('/api', userRoute);
app.use('/api/guides', guideRoute);
app.use('/api/guide-bookings', guideBookingRoute);
app.use('/api/campsites', campsiteRoute);
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 0314994bf65062d852853dc4a3f58bba40113109
app.use('/api/reservations', reservationRoute);
<<<<<<< HEAD
=======
app.use('/api/customer-notifications', customerNotificationRoute);
<<<<<<< HEAD
>>>>>>> 5ad9549d4f343c6385faa99801a01721940c0e37
=======
>>>>>>> 72d49f97b953854ffc2cce76cb28c3b75c102fd7
=======
>>>>>>> 875b8c7b1d28b08e2375464309804f17e9cb5e8d
>>>>>>> 0314994bf65062d852853dc4a3f58bba40113109
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