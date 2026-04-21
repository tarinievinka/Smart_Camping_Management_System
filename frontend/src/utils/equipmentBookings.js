const DEFAULT_BOOKING_STATUS = "paid";

const safeParseJson = (raw) => {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (error) {
    console.warn("Failed to parse JSON from localStorage", error);
    return null;
  }
};

export const getCurrentUserSnapshot = () => {
  return (
    safeParseJson(localStorage.getItem("user")) ||
    safeParseJson(localStorage.getItem("userInfo")) ||
    null
  );
};

export const getEquipmentBookingsStorageKey = (userId) => `equipment_bookings_${userId || "guest"}`;

export const getEquipmentBookings = () => {
  const user = getCurrentUserSnapshot();
  const userId = user?._id || user?.id || "guest";
  const raw = localStorage.getItem(getEquipmentBookingsStorageKey(userId));
  const parsed = safeParseJson(raw);
  return Array.isArray(parsed) ? parsed : [];
};

export const saveEquipmentBooking = (bookingDraft, options = {}) => {
  if (!bookingDraft || !Array.isArray(bookingDraft.items) || bookingDraft.items.length === 0) {
    return null;
  }

  const user = getCurrentUserSnapshot();
  const userId = user?._id || user?.id || "guest";
  const userName = user?.name || user?.fullName || user?.username || "Guest";
  const key = getEquipmentBookingsStorageKey(userId);

  const existing = getEquipmentBookings();
  const bookedAt = options.bookedAt || new Date().toISOString();
  const booking = {
    bookingId: options.bookingId || `EQB-${Date.now()}`,
    bookingType: "EquipmentBooking",
    status: options.status || DEFAULT_BOOKING_STATUS,
    paymentMethod: options.paymentMethod || "card",
    transactionId: options.transactionId || "",
    totalAmount: options.totalAmount ?? bookingDraft.totalAmount ?? 0,
    pickupDate: bookingDraft.pickupDate || "",
    returnDate: bookingDraft.returnDate || "",
    days: bookingDraft.days || 1,
    userId,
    userName,
    bookedAt,
    items: bookingDraft.items.map((item) => ({
      _id: item._id,
      name: item.name,
      mode: item.mode,
      quantity: Number(item.quantity) || 1,
      unitPrice: Number(item.unitPrice) || 0,
      imageUrl: item.imageUrl || "",
      lineTotal: Number(item.lineTotal) || 0,
    })),
  };

  localStorage.setItem(key, JSON.stringify([booking, ...existing]));
  
  // Clear the equipment cart after successful booking
  localStorage.removeItem(`equipment_cart_${userId}`);
  
  return booking;
};
