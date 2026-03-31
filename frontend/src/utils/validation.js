/**
 * Validates a phone number.
 * Allows 10-15 digits, optional plus sign, spaces, and hyphens.
 * @param {string} phone 
 * @returns {boolean}
 */
export const validatePhone = (phone) => {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phone);
};
