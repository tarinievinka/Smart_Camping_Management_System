import { useState } from 'react'

export default function ImageCarousel() {
  const [selectedIndex, setSelectedIndex] = useState(0)

  // Using free stock images from Unsplash
  const images = [
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&h=500&fit=crop', // Forest
    'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=1200&h=500&fit=crop', // Tent camping
    'https://images.unsplash.com/photo-1432405972618-c60b0b63dcb9?w=1200&h=500&fit=crop', // Campfire
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=500&fit=crop', // Lake
  ]

  const smallImages = [images[1], images[2], images[3]]

  return (
    <div className="carousel-container">
      <img 
        src={images[selectedIndex]} 
        alt="Pine Ridge Sanctuary" 
        className="carousel-large"
        onClick={() => setSelectedIndex(0)}
      />
      
      <div className="carousel-grid">
        {smallImages.map((img, idx) => (
          <img 
            key={idx}
            src={img}
            alt={`Gallery ${idx + 1}`}
            className="carousel-small"
            onClick={() => setSelectedIndex(idx + 1)}
            style={{ cursor: 'pointer', opacity: selectedIndex === idx + 1 ? 0.8 : 1 }}
          />
        ))}
      </div>
    </div>
  )
}
