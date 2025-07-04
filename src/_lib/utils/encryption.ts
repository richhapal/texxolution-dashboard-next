// Encryption utility for sensitive data storage
// Uses XOR encryption with Base64 encoding for basic obfuscation

const ENCRYPTION_KEY =
  process.env.NEXT_PUBLIC_ENCRYPTION_KEY || "texxolution_admin_key_2024";

/**
 * Encrypts a password using XOR encryption and Base64 encoding
 * @param password - The plain text password to encrypt
 * @returns Encrypted and Base64 encoded password string
 */
export const encryptPassword = (password: string): string => {
  try {
    if (!password) return "";

    // Simple XOR encryption (for basic obfuscation)
    let encrypted = "";
    for (let i = 0; i < password.length; i++) {
      encrypted += String.fromCharCode(
        password.charCodeAt(i) ^
          ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length)
      );
    }

    // Base64 encode to make it storable
    return btoa(encrypted);
  } catch (error) {
    console.error("Encryption failed:", error);
    return password; // Return original if encryption fails
  }
};

/**
 * Decrypts a password that was encrypted with encryptPassword
 * @param encryptedPassword - The encrypted and Base64 encoded password
 * @returns Decrypted plain text password
 */
export const decryptPassword = (encryptedPassword: string): string => {
  try {
    if (!encryptedPassword) return "";

    // Base64 decode first
    const encrypted = atob(encryptedPassword);

    // XOR decrypt
    let decrypted = "";
    for (let i = 0; i < encrypted.length; i++) {
      decrypted += String.fromCharCode(
        encrypted.charCodeAt(i) ^
          ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length)
      );
    }

    return decrypted;
  } catch (error) {
    console.error("Decryption failed:", error);
    return ""; // Return empty string if decryption fails
  }
};

/**
 * Encrypts any string data for localStorage storage
 * @param data - The plain text data to encrypt
 * @returns Encrypted and Base64 encoded data string
 */
export const encryptData = (data: string): string => {
  return encryptPassword(data); // Same encryption method
};

/**
 * Decrypts any string data from localStorage
 * @param encryptedData - The encrypted and Base64 encoded data
 * @returns Decrypted plain text data
 */
export const decryptData = (encryptedData: string): string => {
  return decryptPassword(encryptedData); // Same decryption method
};

/**
 * Safe localStorage operations with encryption
 */
export const secureStorage = {
  /**
   * Stores encrypted data in localStorage
   * @param key - The storage key
   * @param value - The plain text value to encrypt and store
   */
  setItem: (key: string, value: string): void => {
    try {
      const encryptedValue = encryptData(value);
      localStorage.setItem(key, encryptedValue);
    } catch (error) {
      console.error("Secure storage setItem failed:", error);
    }
  },

  /**
   * Retrieves and decrypts data from localStorage
   * @param key - The storage key
   * @returns Decrypted plain text value or null if not found
   */
  getItem: (key: string): string | null => {
    try {
      const encryptedValue = localStorage.getItem(key);
      if (!encryptedValue) return null;
      return decryptData(encryptedValue);
    } catch (error) {
      console.error("Secure storage getItem failed:", error);
      return null;
    }
  },

  /**
   * Removes an item from localStorage
   * @param key - The storage key to remove
   */
  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error("Secure storage removeItem failed:", error);
    }
  },
};
