import React from 'react';
import { Tent, Package, Map, ArrowUpRight } from 'lucide-react';

const HistoryCards = ({ payments = [] }) => {
  // Format currency
  const formatCurrency = (amount) => `Rs ${amount?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}`;

  // Calculate totals by category (including all statuses: pending, success, completed)
  const getCategoryTotal = (type) => {
    const searchTerms = type.toLowerCase().replace('booking', '');
    return payments
      .filter(p => {
        const pType = (p.bookingType || '').toLowerCase();
        return pType.includes(searchTerms);
      })
      .reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
  };

  const getCategoryCount = (type) => {
    const searchTerms = type.toLowerCase().replace('booking', '');
    return payments.filter(p => {
      const pType = (p.bookingType || '').toLowerCase();
      return pType.includes(searchTerms);
    }).length;
  };

  const categories = [
    {
      title: 'Camping Sites',
      type: 'CampsiteBooking',
      icon: <Tent className="w-6 h-6" />,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      accent: 'bg-emerald-600',
      total: getCategoryTotal('CampsiteBooking'),
      count: getCategoryCount('CampsiteBooking'),
      description: 'Site bookings & stays'
    },
    {
      title: 'Equipments',
      type: 'EquipmentBooking',
      icon: <Package className="w-6 h-6" />,
      color: 'bg-[#166534]/10 text-[#166534] border-[#166534]/20',
      accent: 'bg-[#166534]',
      total: getCategoryTotal('EquipmentBooking'),
      count: getCategoryCount('EquipmentBooking'),
      description: 'Gear & rental items'
    },
    {
      title: 'Professional Guides',
      type: 'GuideBooking',
      icon: <Map className="w-6 h-6" />,
      color: 'bg-orange-50 text-orange-600 border-orange-100',
      accent: 'bg-orange-600',
      total: getCategoryTotal('GuideBooking'),
      count: getCategoryCount('GuideBooking'),
      description: 'Guided treks & tours'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
      {categories.map((cat, idx) => (
        <div key={idx} className="group relative bg-white rounded-2xl p-6 shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden">
          {/* Background Decorative Element */}
          <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-[0.03] transition-transform duration-500 group-hover:scale-150 ${cat.accent}`} />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className={`p-3 rounded-xl ${cat.color} border transition-transform duration-300 group-hover:scale-110`}>
                {cat.icon}
              </div>
              <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                <span>View Details</span>
                <ArrowUpRight className="w-3 h-3 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="text-gray-500 text-xs font-bold uppercase tracking-widest">{cat.title}</h3>
              <p className="text-2xl font-black text-gray-900 tracking-tight">
                {formatCurrency(cat.total)}
              </p>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-gray-400">{cat.description}</span>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${cat.color}`}>
                {cat.count} {cat.count === 1 ? 'Booking' : 'Bookings'}
              </span>
            </div>
          </div>
          
          {/* Bottom Accent Bar */}
          <div className={`absolute bottom-0 left-0 h-1 transition-all duration-300 group-hover:w-full w-0 ${cat.accent}`} />
        </div>
      ))}
    </div>
  );
};

export default HistoryCards;
