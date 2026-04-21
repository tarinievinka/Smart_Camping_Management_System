export default function MapSection() {
  return (
    <div className="map-section">
      <h2>Where you'll be</h2>
      
      <div className="map-container">
        <img 
          src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&h=400&fit=crop"
          alt="Map location"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div className="map-pin">📍</div>
      </div>

      <div className="location-name">
        EverGreen National Forest, OR
      </div>
    </div>
  )
}
