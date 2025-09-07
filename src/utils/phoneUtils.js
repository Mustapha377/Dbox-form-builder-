// utils/phoneUtils.js
// Comprehensive phone number validation and formatting utility

// Extended country codes with validation patterns
export const COUNTRY_CODES = [
  { 
    code: '+1', 
    name: 'United States/Canada', 
    flag: '🇺🇸', 
    pattern: /^\+1\s?\(?([0-9]{3})\)?\s?[-.]?([0-9]{3})[-.]?([0-9]{4})$/,
    format: '+1 ($1) $2-$3',
    example: '+1 (555) 123-4567',
    minLength: 10,
    maxLength: 10
  },
  { 
    code: '+44', 
    name: 'United Kingdom', 
    flag: '🇬🇧', 
    pattern: /^\+44\s?([0-9]{2,4})\s?([0-9]{4,6})$/,
    format: '+44 $1 $2',
    example: '+44 20 1234 5678',
    minLength: 8,
    maxLength: 11
  },
  { 
    code: '+234', 
    name: 'Nigeria', 
    flag: '🇳🇬', 
    pattern: /^\+234\s?([0-9]{3})\s?([0-9]{3})\s?([0-9]{4})$/,
    format: '+234 $1 $2 $3',
    example: '+234 802 123 4567',
    minLength: 10,
    maxLength: 10
  },
  { 
    code: '+33', 
    name: 'France', 
    flag: '🇫🇷', 
    pattern: /^\+33\s?([0-9]{1})\s?([0-9]{2})\s?([0-9]{2})\s?([0-9]{2})\s?([0-9]{2})$/,
    format: '+33 $1 $2 $3 $4 $5',
    example: '+33 1 23 45 67 89',
    minLength: 9,
    maxLength: 9
  },
  { 
    code: '+49', 
    name: 'Germany', 
    flag: '🇩🇪', 
    pattern: /^\+49\s?([0-9]{3,4})\s?([0-9]{7,8})$/,
    format: '+49 $1 $2',
    example: '+49 30 12345678',
    minLength: 10,
    maxLength: 12
  },
  { 
    code: '+91', 
    name: 'India', 
    flag: '🇮🇳', 
    pattern: /^\+91\s?([0-9]{5})\s?([0-9]{5})$/,
    format: '+91 $1 $2',
    example: '+91 98765 43210',
    minLength: 10,
    maxLength: 10
  },
  { 
    code: '+86', 
    name: 'China', 
    flag: '🇨🇳', 
    pattern: /^\+86\s?([0-9]{3})\s?([0-9]{4})\s?([0-9]{4})$/,
    format: '+86 $1 $2 $3',
    example: '+86 138 0013 8000',
    minLength: 11,
    maxLength: 11
  },
  { 
    code: '+81', 
    name: 'Japan', 
    flag: '🇯🇵', 
    pattern: /^\+81\s?([0-9]{2,4})\s?([0-9]{4})\s?([0-9]{4})$/,
    format: '+81 $1 $2 $3',
    example: '+81 90 1234 5678',
    minLength: 10,
    maxLength: 11
  },
  { 
    code: '+61', 
    name: 'Australia', 
    flag: '🇦🇺', 
    pattern: /^\+61\s?([0-9]{1})\s?([0-9]{4})\s?([0-9]{4})$/,
    format: '+61 $1 $2 $3',
    example: '+61 4 1234 5678',
    minLength: 9,
    maxLength: 9
  },
  { 
    code: '+27', 
    name: 'South Africa', 
    flag: '🇿🇦', 
    pattern: /^\+27\s?([0-9]{2})\s?([0-9]{3})\s?([0-9]{4})$/,
    format: '+27 $1 $2 $3',
    example: '+27 82 123 4567',
    minLength: 9,
    maxLength: 9
  },
  { 
    code: '+55', 
    name: 'Brazil', 
    flag: '🇧🇷', 
    pattern: /^\+55\s?([0-9]{2})\s?([0-9]{4,5})\s?([0-9]{4})$/,
    format: '+55 $1 $2 $3',
    example: '+55 11 91234 5678',
    minLength: 10,
    maxLength: 11
  },
  { 
    code: '+52', 
    name: 'Mexico', 
    flag: '🇲🇽', 
    pattern: /^\+52\s?([0-9]{2,3})\s?([0-9]{3,4})\s?([0-9]{4})$/,
    format: '+52 $1 $2 $3',
    example: '+52 55 1234 5678',
    minLength: 10,
    maxLength: 11
  },
  { 
    code: '+7', 
    name: 'Russia', 
    flag: '🇷🇺', 
    pattern: /^\+7\s?([0-9]{3})\s?([0-9]{3})\s?([0-9]{2})\s?([0-9]{2})$/,
    format: '+7 $1 $2 $3 $4',
    example: '+7 495 123 45 67',
    minLength: 10,
    maxLength: 10
  }
];

// Get country data by code
export const getCountryByCode = (code) => {
  return COUNTRY_CODES.find(country => country.code === code);
};

// Detect country code from phone number
export const detectCountryCode = (phoneNumber) => {
  if (!phoneNumber || typeof phoneNumber !== 'string') return null;
  
  const cleaned = phoneNumber.replace(/[^\d+]/g, '');
  
  // Sort by code length (descending) to match longer codes first
  const sortedCodes = [...COUNTRY_CODES].sort((a, b) => b.code.length - a.code.length);
  
  for (const country of sortedCodes) {
    if (cleaned.startsWith(country.code)) {
      return country;
    }
  }
  
  return null;
};

// Validate phone number format
export const validatePhoneNumber = (phoneNumber, countryCode = null) => {
  if (!phoneNumber || typeof phoneNumber !== 'string') {
    return {
      isValid: false,
      error: 'Phone number is required',
      suggestion: 'Please enter a phone number'
    };
  }

  // Remove all non-digit characters except +
  const cleaned = phoneNumber.replace(/[^\d+]/g, '');
  
  // Must start with +
  if (!cleaned.startsWith('+')) {
    return {
      isValid: false,
      error: 'Phone number must include country code',
      suggestion: 'Please start with + followed by your country code'
    };
  }

  // Try to detect country or use provided one
  const country = countryCode ? getCountryByCode(countryCode) : detectCountryCode(cleaned);
  
  if (!country) {
    return {
      isValid: false,
      error: 'Unknown country code',
      suggestion: 'Please use a valid country code (e.g., +1, +44, +234)'
    };
  }

  // Extract the number without country code
  const numberWithoutCode = cleaned.slice(country.code.length);
  
  // Check length constraints
  if (numberWithoutCode.length < country.minLength) {
    return {
      isValid: false,
      error: `Phone number too short for ${country.name}`,
      suggestion: `${country.name} phone numbers require at least ${country.minLength} digits. Example: ${country.example}`
    };
  }
  
  if (numberWithoutCode.length > country.maxLength) {
    return {
      isValid: false,
      error: `Phone number too long for ${country.name}`,
      suggestion: `${country.name} phone numbers should have at most ${country.maxLength} digits. Example: ${country.example}`
    };
  }

  // Validate against country pattern if available
  if (country.pattern && !country.pattern.test(cleaned)) {
    return {
      isValid: false,
      error: `Invalid format for ${country.name}`,
      suggestion: `Please use the format: ${country.example}`
    };
  }

  return {
    isValid: true,
    country: country,
    formatted: formatPhoneNumber(phoneNumber, country.code),
    cleaned: cleaned
  };
};

// Format phone number according to country standards
export const formatPhoneNumber = (phoneNumber, countryCode = null) => {
  if (!phoneNumber || typeof phoneNumber !== 'string') return phoneNumber;

  const validation = validatePhoneNumber(phoneNumber, countryCode);
  
  if (!validation.isValid) return phoneNumber;

  const country = validation.country;
  const cleaned = validation.cleaned;

  // Apply country-specific formatting if pattern exists
  if (country.pattern && country.format) {
    const match = cleaned.match(country.pattern);
    if (match) {
      return cleaned.replace(country.pattern, country.format);
    }
  }

  // Default formatting: +CC NNN NNN NNNN
  const numberPart = cleaned.slice(country.code.length);
  
  if (numberPart.length <= 4) {
    return `${country.code} ${numberPart}`;
  } else if (numberPart.length <= 7) {
    return `${country.code} ${numberPart.slice(0, 3)} ${numberPart.slice(3)}`;
  } else {
    const firstPart = numberPart.slice(0, 3);
    const secondPart = numberPart.slice(3, 6);
    const thirdPart = numberPart.slice(6);
    return `${country.code} ${firstPart} ${secondPart} ${thirdPart}`;
  }
};

// Real-time phone number formatter for input fields
export const formatPhoneAsUserTypes = (value, selectedCountryCode = '+1') => {
  if (!value) return value;

  // Remove all non-digits
  const digits = value.replace(/[^\d]/g, '');
  
  if (!digits) return selectedCountryCode + ' ';

  const country = getCountryByCode(selectedCountryCode);
  if (!country) return `${selectedCountryCode} ${digits}`;

  // Apply progressive formatting based on country
  const maxDigits = country.maxLength;
  const limitedDigits = digits.slice(0, maxDigits);

  // Country-specific formatting rules
  switch (selectedCountryCode) {
    case '+1': // US/Canada
      if (limitedDigits.length >= 6) {
        return `${selectedCountryCode} (${limitedDigits.slice(0, 3)}) ${limitedDigits.slice(3, 6)}-${limitedDigits.slice(6)}`;
      } else if (limitedDigits.length >= 3) {
        return `${selectedCountryCode} (${limitedDigits.slice(0, 3)}) ${limitedDigits.slice(3)}`;
      }
      return `${selectedCountryCode} ${limitedDigits}`;

    case '+44': // UK
      if (limitedDigits.length >= 4) {
        return `${selectedCountryCode} ${limitedDigits.slice(0, 2)} ${limitedDigits.slice(2)}`;
      }
      return `${selectedCountryCode} ${limitedDigits}`;

    case '+234': // Nigeria
      if (limitedDigits.length >= 7) {
        return `${selectedCountryCode} ${limitedDigits.slice(0, 3)} ${limitedDigits.slice(3, 6)} ${limitedDigits.slice(6)}`;
      } else if (limitedDigits.length >= 3) {
        return `${selectedCountryCode} ${limitedDigits.slice(0, 3)} ${limitedDigits.slice(3)}`;
      }
      return `${selectedCountryCode} ${limitedDigits}`;

    default:
      // Generic formatting for other countries
      if (limitedDigits.length >= 7) {
        return `${selectedCountryCode} ${limitedDigits.slice(0, 3)} ${limitedDigits.slice(3, 6)} ${limitedDigits.slice(6)}`;
      } else if (limitedDigits.length >= 3) {
        return `${selectedCountryCode} ${limitedDigits.slice(0, 3)} ${limitedDigits.slice(3)}`;
      }
      return `${selectedCountryCode} ${limitedDigits}`;
  }
};

// Get example phone number for a country
export const getPhoneExample = (countryCode) => {
  const country = getCountryByCode(countryCode);
  return country ? country.example : '+1 (555) 123-4567';
};

// Professional validation messages for phone numbers
export const getPhoneValidationMessage = (phoneNumber, countryCode = null) => {
  const validation = validatePhoneNumber(phoneNumber, countryCode);
  
  if (validation.isValid) {
    return {
      type: 'success',
      message: `Valid ${validation.country.name} phone number`
    };
  }
  
  return {
    type: 'error',
    message: validation.error,
    suggestion: validation.suggestion
  };
};

export default {
  COUNTRY_CODES,
  getCountryByCode,
  detectCountryCode,
  validatePhoneNumber,
  formatPhoneNumber,
  formatPhoneAsUserTypes,
  getPhoneExample,
  getPhoneValidationMessage
};