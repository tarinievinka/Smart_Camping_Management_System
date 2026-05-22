import { useState } from 'react'

export default function AmenitiesSection() {
  const [showAll, setShowAll] = useState(false)

  const amenities = [
    'Wifi',
    'Kitchen',
    'Parking',
    'AC',
    'Heating',
    'TV',
    'Washer',
    'Dryer',
    'First aid kit',
    'Fire extinguisher',
    'Smoke alarm',
    'Carbon monoxide alarm',
    'Swimming pool',
    'Hot tub',
    'Gym',
    'Yoga studio'
  ]

  const displayedAmenities = showAll ? amenities : amenities.slice(0, 9)

  return (
    <div className="amenities-section">
      <h2>What this place offers</h2>
      
      <div className="amenities-list">
        {displayedAmenities.map((amenity, idx) => (
          <div key={idx} className="amenity">
            <div className="amenity-check">✓</div>
            <span>{amenity}</span>
          </div>
        ))}
      </div>

      {!showAll && (
        <a className="see-all-link" onClick={() => setShowAll(true)}>
          See all {amenities.length} amenities
        </a>
      )}
    </div>
  )
}

