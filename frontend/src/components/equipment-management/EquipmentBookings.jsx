import React, { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
<<<<<<< HEAD
import { Heart, LayoutGrid, ShoppingCart, Star } from "lucide-react";
=======
import { Calendar, Heart, LayoutGrid, ShoppingCart, Star } from "lucide-react";
>>>>>>> 72d49f97b953854ffc2cce76cb28c3b75c102fd7
import { getEquipmentBookings } from "../../utils/equipmentBookings";

const EquipmentBookings = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const bookings = useMemo(() => getEquipmentBookings(), []);
  const totalBookedItems = bookings.reduce(
    (sum, booking) => sum + booking.items.reduce((sub, item) => sub + item.quantity, 0),
    0
  );

  const navItems = [
    { icon: LayoutGrid, label: "Browse Gear", path: "/equipment-store" },
    { icon: ShoppingCart, label: "My Cart", path: "/equipment-store" },
<<<<<<< HEAD
=======
    { icon: Calendar, label: "My Bookings", path: "/equipment-bookings" },
>>>>>>> 72d49f97b953854ffc2cce76cb28c3b75c102fd7
    { icon: Heart, label: "Favorites", path: "/equipment-store" },
  ];

  return (
<<<<<<< HEAD
    <div className="min-h-screen bg-gray-50">
      <main className="py-10 px-4 sm:px-6 lg:px-8 overflow-auto">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">My Equipment Bookings</h1>
            <p className="text-gray-500 mt-2 font-medium">
              Review your gear and add feedback.
            </p>
          </div>

          {/* Modern Tab Navigation */}
          <div className="flex items-center gap-2 mb-12 p-1.5 bg-gray-200/50 rounded-[20px] w-fit overflow-x-auto no-scrollbar">
            {navItems.map((item, idx) => (
              <button 
                key={idx} 
                onClick={() => navigate(item.path)} 
                className={`flex items-center gap-2.5 px-6 py-3 rounded-[16px] text-sm font-bold transition-all duration-200 whitespace-nowrap ${
                  location.pathname === item.path 
                    ? "bg-white text-[#166534] shadow-sm scale-[1.02]" 
                    : "text-gray-500 hover:text-gray-900 hover:bg-white/50"
                }`}
              >
                <item.icon size={18} /> 
                {item.label}
              </button>
            ))}
          </div>
=======
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col p-6 shrink-0 hidden lg:flex">
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                location.pathname === item.path
                  ? "text-white bg-[#166534]"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Equipment Bookings</h1>
            <p className="text-gray-500 mt-2 text-sm">
              Paid equipment appears here. You can review each booked item.
            </p>
>>>>>>> 72d49f97b953854ffc2cce76cb28c3b75c102fd7
            <div className="mt-4 inline-flex items-center rounded-full bg-emerald-50 px-4 py-1.5 text-xs font-semibold text-emerald-700">
              {bookings.length} booking{bookings.length !== 1 ? "s" : ""} • {totalBookedItems} item
              {totalBookedItems !== 1 ? "s" : ""}
            </div>
<<<<<<< HEAD

=======
          </div>
>>>>>>> 72d49f97b953854ffc2cce76cb28c3b75c102fd7

          {bookings.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center">
              <p className="text-gray-600 font-medium mb-4">No paid equipment bookings yet.</p>
              <button
                type="button"
                onClick={() => navigate("/equipment-store")}
                className="px-5 py-2.5 rounded-xl bg-[#166534] text-white font-semibold hover:bg-[#14532d]"
              >
                Browse Gear
              </button>
            </div>
          ) : (
            <div className="space-y-5">
<<<<<<< HEAD
              {bookings.map((booking, index) => (
                <div key={`${booking.bookingId}-${index}`} className="bg-white border border-gray-200 rounded-2xl p-5">
=======
              {bookings.map((booking) => (
                <div key={booking.bookingId} className="bg-white border border-gray-200 rounded-2xl p-5">
>>>>>>> 72d49f97b953854ffc2cce76cb28c3b75c102fd7
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                    <div>
                      <p className="font-bold text-gray-900 text-sm">Booking #{booking.bookingId}</p>
                      <p className="text-xs text-gray-500">
                        Paid on {new Date(booking.bookedAt).toLocaleDateString()} • {booking.paymentMethod}
                      </p>
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-wide bg-emerald-100 text-emerald-700 rounded-full px-3 py-1 w-fit">
                      {booking.status}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {booking.items.map((item, index) => (
                      <div
                        key={`${booking.bookingId}-${item._id}-${index}`}
                        className="border border-gray-100 rounded-xl p-4 bg-gray-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                      >
                        <div>
                          <p className="font-semibold text-gray-900">{item.name}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {item.mode === "buy" ? "Purchase" : "Rental"} • Qty {item.quantity}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
<<<<<<< HEAD
                            navigate("/equipment-feedback", {
=======
                            navigate("/feedbackreview", {
>>>>>>> 72d49f97b953854ffc2cce76cb28c3b75c102fd7
                              state: {
                                targetType: "equipment",
                                targetName: item.name,
                                targetId: item._id,
                              },
                            })
                          }
                          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-[#f0fdf4] text-[#166534] hover:bg-[#dcfce7]"
                        >
                          <Star size={16} />
                          Add Review
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default EquipmentBookings;
