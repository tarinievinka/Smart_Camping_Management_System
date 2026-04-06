require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');                         
const app = express();
const connectDB = require('./src/config/db');
const paymentRoute = require('./src/routes/payment-route/paymentRoute');
const feedbackRoute = require('./src/routes/feedback-route/feedbackRoute');
const equipmentRouter = require('./src/routes/Equipment-route/EquipmentRoute');
const notifyRoute = require('./src/routes/Notify-route/NotifyRoute'); 
const userRoute = require('./src/routes/user-routes/userRoutes');

const port = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: [process.env.FRONTEND_URL || 'http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => res.send('Server running!'));
app.use('/api/payment', paymentRoute);
app.use('/api/feedback', feedbackRoute);
app.use('/api/equipment', equipmentRouter);
app.use('/api/notify', notifyRoute); 
app.use('/api', userRoute);

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