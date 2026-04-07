export default function AboutSection() {
  const features = [
    {
      icon: '♻️',
      title: 'Eco-conscious trip',
      description: 'Community dedicated to sustainable practices'
    },
    {
      icon: '🐾',
      title: 'Pet Friendly',
      description: 'Bring your furry friends and family'
    },
    {
      icon: '🧖',
      title: 'Private spa',
      description: 'Relax in our natural hot spring pools'
    },
    {
      icon: '⛺',
      title: 'Camping options',
      description: 'Multiple glamping and camping sites'
    }
  ]

  return (
    <div className="about-section">
      <h2>About this sanctuary</h2>
      
      <p className="about-description">
        Nestled within a lush private pine forest, Pine Ridge Sanctuary offers a tranquil escape for nature lovers. 
        Every aspect of your stay is designed with environmental consciousness and your comfort in mind. 
        Wake up to the sounds of the forest, enjoy fresh organic meals prepared locally, and experience true wilderness luxury.
      </p>

      <div className="amenities-grid">
        {features.map((feature, idx) => (
          <div key={idx} className="amenity-item">
            <div className="amenity-icon">{feature.icon}</div>
            <div className="amenity-text">
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
