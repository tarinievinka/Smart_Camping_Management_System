import { useState } from 'react';
import ImageCarousel from '../components/camping-sites-management/ImageCarousel';
import SidebarBooking from '../components/camping-sites-management/SidebarBooking';
import AboutSection from '../components/camping-sites-management/AboutSection';
import AmenitiesSection from '../components/camping-sites-management/AmenitiesSection';
import CalendarSection from '../components/camping-sites-management/CalendarSection';
import MapSection from '../components/camping-sites-management/MapSection';

const Home = () => {
  const [checkInDate, setCheckInDate] = useState('05/08/2024');
  const [checkOutDate, setCheckOutDate] = useState('07/08/2024');

  return (
    <main className="main-container">
      <ImageCarousel />
      
      <div className="content-wrapper">
        <div className="left-section">
          <h1>Pine Ridge Sanctuary</h1>
          <div className="breadcrumb">Eco-Reserve, Evergreen National Park (Entire home hosted by Pine Ridge Team)</div>
          <div className="rating">
            <span className="stars">★★★★★</span>
            <span>4.5+ (245 reviews)</span>
          </div>

          <AboutSection />
          <AmenitiesSection />
          <CalendarSection />
          <MapSection />
        </div>

        <SidebarBooking 
          checkInDate={checkInDate}
          checkOutDate={checkOutDate}
          setCheckInDate={setCheckInDate}
          setCheckOutDate={setCheckOutDate}
        />
      </div>
    </main>
  );
};

export default Home;
