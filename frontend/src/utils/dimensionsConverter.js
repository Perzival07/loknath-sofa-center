// Utility functions for converting dimensions between units

/**
 * Convert centimeters to feet and inches
 * @param {number} cm - Value in centimeters
 * @returns {Object} - {feet: number, inches: number}
 */
export const cmToFeetInches = (cm) => {
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round((totalInches % 12) * 10) / 10; // Round to 1 decimal place
  return { feet, inches };
};

/**
 * Convert centimeters to meters
 * @param {number} cm - Value in centimeters
 * @returns {number} - Value in meters (rounded to 2 decimal places)
 */
export const cmToMeters = (cm) => {
  return Math.round((cm / 100) * 100) / 100;
};

/**
 * Convert feet and inches to centimeters
 * @param {number} feet - Feet value
 * @param {number} inches - Inches value
 * @returns {number} - Value in centimeters
 */
export const feetInchesToCm = (feet, inches) => {
  return Math.round((feet * 12 + inches) * 2.54);
};

/**
 * Convert meters to centimeters
 * @param {number} meters - Value in meters
 * @returns {number} - Value in centimeters
 */
export const metersToCm = (meters) => {
  return Math.round(meters * 100);
};

/**
 * Format dimensions for display in both units
 * @param {Object} dimensions - {length: number, breadth: number, height: number} in cm
 * @returns {Object} - Formatted dimensions object with all conversions
 */
export const formatDimensions = (dimensions) => {
  if (!dimensions) return null;

  const formatDimension = (cm) => {
    const feetInches = cmToFeetInches(cm);
    const meters = cmToMeters(cm);
    return {
      cm: Math.round(cm),
      meters: meters,
      feet: feetInches.feet,
      inches: feetInches.inches,
      displayCm: `${Math.round(cm)} cm`,
      displayMeters: `${meters} m`,
      displayFeetInches: `${feetInches.feet}' ${feetInches.inches}"`
    };
  };

  return {
    length: formatDimension(dimensions.length),
    breadth: formatDimension(dimensions.breadth),
    height: formatDimension(dimensions.height)
  };
};

/** Cart / wishlist key: LxBxH in cm (matches backend product dimensions). */
export const dimensionsToKey = (dimensions) => {
  if (!dimensions) return "";
  const { length, breadth, height } = dimensions;
  return `${length}x${breadth}x${height}`;
};

