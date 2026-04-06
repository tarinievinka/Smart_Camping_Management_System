import { useMemo } from 'react';

/**
 * Shows a 2-month calendar view highlighting booked dates in red.
 * bookedRanges: array of { checkInDate, checkOutDate }
 */
const AvailabilityCalendar = ({ bookedRanges = [] }) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isBooked = (date) => {
    return bookedRanges.some(range => {
      const start = new Date(range.checkInDate);
      const end = new Date(range.checkOutDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);
      return date >= start && date < end;
    });
  };

  const isPast = (date) => date < today;

  const renderMonth = (year, month) => {
    const monthName = new Date(year, month).toLocaleString('default', { month: 'long', year: 'numeric' });
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));

    return (
      <div className="avail-month" key={`${year}-${month}`}>
        <div className="avail-month-title">{monthName}</div>
        <div className="avail-grid-headers">
          {weekDays.map(wd => <div key={wd} className="avail-weekday">{wd}</div>)}
        </div>
        <div className="avail-grid">
          {cells.map((date, i) => {
            if (!date) return <div key={`empty-${i}`} className="avail-day empty" />;
            const booked = isBooked(date);
            const past = isPast(date);
            return (
              <div key={date.toISOString()}
                className={`avail-day ${booked ? 'booked' : ''} ${past ? 'past' : 'available'}`}
                title={booked ? 'Booked' : past ? 'Past' : 'Available'}>
                {date.getDate()}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const month1 = { year: today.getFullYear(), month: today.getMonth() };
  const month2 = today.getMonth() === 11
    ? { year: today.getFullYear() + 1, month: 0 }
    : { year: today.getFullYear(), month: today.getMonth() + 1 };

  return (
    <div className="avail-calendar-container">
      <div className="avail-legend">
        <span className="avail-legend-item"><span className="avail-dot booked" />Booked</span>
        <span className="avail-legend-item"><span className="avail-dot available" />Available</span>
        <span className="avail-legend-item"><span className="avail-dot past" />Past</span>
      </div>
      <div className="avail-months-row">
        {renderMonth(month1.year, month1.month)}
        {renderMonth(month2.year, month2.month)}
      </div>
    </div>
  );
};

export default AvailabilityCalendar;
