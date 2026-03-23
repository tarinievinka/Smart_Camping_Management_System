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

const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors({ origin: 'http://localhost:3000' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));  

app.get('/', (req, res) => res.send('Server running!'));
app.use('/api/payment', paymentRoute);
app.use('/api/feedback', feedbackRoute);
app.use('/api/equipment', equipmentRouter);
app.use('/api/notify', notifyRoute); 

const start = async () => {
  await connectDB();
  app.listen(port, () => console.log(`Server running at http://localhost:${port}`));
};
start();