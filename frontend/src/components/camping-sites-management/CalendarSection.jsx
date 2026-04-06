import { useState } from 'react'

export default function CalendarSection() {
  const [month, setMonth] = useState(9) // October (0-indexed)
  const [year, setYear] = useState(2024)

  const getDaysInMonth = (m, y) => {
    return new Date(y, m + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (m, y) => {
    return new Date(y, m, 1).getDay()
  }

  const getDayName = (day) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    return days[day]
  }

  const getMonthName = (m) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December']
    return months[m]
  }

  const daysInMonth = getDaysInMonth(month, year)
  const firstDay = getFirstDayOfMonth(month, year)
  const days = Array(firstDay).fill(null).concat(Array.from({ length: daysInMonth }, (_, i) => i + 1))

  const handlePrev = () => {
    if (month === 0) {
      setMonth(11)
      setYear(year - 1)
    } else {
      setMonth(month - 1)
    }
  }

  const handleNext = () => {
    if (month === 11) {
      setMonth(0)
      setYear(year + 1)
    } else {
      setMonth(month + 1)
    }
  }

  // Available dates (example)
  const availableDates = [5, 6, 7, 8, 12, 13, 14, 15, 20, 21, 22, 23]
  const selectedDates = [5, 6, 7]

  return (
    <div className="calendar-section">
      <h2>Real-time Availability</h2>
      
      <div className="calendar-header">
        <div>{getMonthName(month)} {year}</div>
        <div className="calendar-nav">
          <button onClick={handlePrev}>←</button>
          <button onClick={handleNext}>→</button>
        </div>
      </div>

      <div className="calendar">
        <div className="calendar-weekdays">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
            <div key={idx} className="calendar-day-header">{day}</div>
          ))}
        </div>

        <div className="calendar-days">
          {days.map((day, idx) => (
            <div
              key={idx}
              className={`calendar-day ${
                day === null ? 'disabled' : 
                selectedDates.includes(day) ? 'selected' :
                availableDates.includes(day) ? 'available' : 'disabled'
              }`}
            >
              {day}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
