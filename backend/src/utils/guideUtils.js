// Guide utilities

// Example: Generate a Guide ID
function generateGuideId() {
  return "GUIDE-" + Math.random().toString(36).substr(2, 9).toUpperCase();
}

// Example: Validate guide experience (must be >= 0)
function isValidExperience(experience) {
  return typeof experience === "number" && experience >= 0;
}

// Example: Validate guide availability
function isValidAvailability(status) {
  return typeof status === "boolean";
}

// Example: Validate supported languages for guides
function isValidLanguage(language) {
  const supportedLanguages = ["English", "Sinhala", "Tamil"];
  return supportedLanguages.includes(language);
}

module.exports = {
  generateGuideId,
  isValidExperience,
  isValidAvailability,
  isValidLanguage,
};