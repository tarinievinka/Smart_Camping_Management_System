import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './src/routes/auth-routes/auth.js';
import userRoutes from './src/routes/user-routes/users.js';
import campsiteRoutes from './src/routes/campingsite-routes/campsites.js';
import reservationRoutes from './src/routes/reservation-routes/reservations.js';
import Campsite from './src/models/camping-site-models/Campsite.js';
import User from './src/models/user-models/User.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// MongoDB connection + seeding
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Seed admin if missing
    const adminCount = await User.countDocuments({ username: 'admin' });
    if (adminCount === 0) {
      await User.create({
        username: 'admin',
        email: 'admin@campingsite.com',
        password: 'Admin@12345',
        role: 'admin'
      });
      console.log('Seeded default admin user');
    }

    // Seed sample campsites if none exist
    const siteCount = await Campsite.countDocuments();
    if (siteCount === 0) {
      await Campsite.insertMany([
        {
          title: 'Pine Ridge Sanctuary',
          description: 'A serene eco-reserve nestled in the heart of the evergreen forest. Perfect for families and nature lovers alike.',
          location: 'Evergreen National Park',
          price: 120,
          amenities: ['Free WiFi', 'Outdoor Kitchen', 'Free Parking', 'Fire Pit', 'Hiking Trails'],
          availability: true,
        },
        {
          title: 'Lakeside Retreat',
          description: 'Wake up to the sound of lapping waves at this beautiful lakeside camping spot with panoramic water views.',
          location: 'Crystal Lake Reserve',
          price: 95,
          amenities: ['Kayak Rental', 'Fishing Dock', 'BBQ Area', 'Campfire Ring'],
          availability: true,
        },
        {
          title: 'Mountain Peak Camp',
          description: 'Experience breathtaking sunrise views from high altitude. A paradise for hikers and adventure seekers.',
          location: 'Rocky Summit Trail, Colorado',
          price: 150,
          amenities: ['Stargazing Deck', 'Guided Hikes', 'Equipment Rental', 'Hot Showers'],
          availability: true,
        },
        {
          title: 'Meadow Bliss',
          description: 'A peaceful open meadow campsite with vibrant wildflowers and wide open skies, great for families.',
          location: 'Sunflower Meadow Park',
          price: 75,
          amenities: ['Picnic Area', 'Playground', 'Pet Friendly', 'Water Hookup'],
          availability: true,
        },
      ]);
      console.log('Seeded 4 sample campsites');
    }
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

connectDB();

app.get('/api/status', (req, res) => {
  res.json({ message: 'API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/campsites', campsiteRoutes);
app.use('/api/reservations', reservationRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
