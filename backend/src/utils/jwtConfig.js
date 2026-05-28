/** Single secret for sign + verify (must match across login, register, protect). */
function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (secret && String(secret).trim()) return String(secret).trim();
  return "mysecretkey123";
}

module.exports = { getJwtSecret };
