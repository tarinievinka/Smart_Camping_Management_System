/** Same key used when creating a guide booking (must match for notifications). */
export function getCustomerBookingName() {
  return (
    localStorage.getItem("user_name") ||
    localStorage.getItem("userName") ||
    localStorage.getItem("name") ||
    "Guest"
  );
}
