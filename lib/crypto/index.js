// src/lib/crypto/index.js
import CryptoJS from 'crypto-js';
import { 
  decryptMessage as webCryptoDecrypt, 
  encryptMessage as webCryptoEncrypt 
} from './encryption';

/**
 * Unified decrypt function that attempts both methods
 * @param {string} encryptedText - Encrypted text
 * @param {string} privateKey - Private key for decryption
 * @returns {string} Decrypted text
 */
export async function decryptMessageUnified(encryptedText, privateKey) {
  try {
    // First, try to detect if it's a Web Crypto API encrypted message
    // These are typically in base64 format and can be parsed as JSON
    if (encryptedText.startsWith('eyJ')) {
      try {
        // Try parsing as JSON after base64 decoding
        const jsonStr = atob(encryptedText);
        JSON.parse(jsonStr);
        
        // If parsing succeeds, it's likely a Web Crypto API encrypted message
        return await webCryptoDecrypt(encryptedText, privateKey);
      } catch (parseError) {
        // Not a Web Crypto API message, fall through to CryptoJS
      }
    }
    
    // If not Web Crypto API or parsing failed, try CryptoJS
    return CryptoJS.AES.decrypt(encryptedText, privateKey).toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Error decrypting message:', error);
    throw new Error('Failed to decrypt message');
  }
}

/**
 * Get the user's public key from Firebase
 * @param {string} userEmail - Email of the user
 * @returns {Promise<string>} Public key
 */
export async function getUserPublicKey(userEmail) {
  // Implement this function to fetch the user's public key from Firebase
  // This is a placeholder - you'll need to implement this based on your Firebase structure
}

/**
 * Store keys in localStorage
 * @param {Object} keys - Object containing publicKey and privateKey
 */
export function storeKeys(keys) {
  localStorage.setItem('publicKey', keys.publicKey);
  localStorage.setItem('privateKey', keys.privateKey);
}

/**
 * Get keys from localStorage
 * @returns {Object} Object containing publicKey and privateKey
 */
export function getKeys() {
  return {
    publicKey: localStorage.getItem('publicKey'),
    privateKey: localStorage.getItem('privateKey')
  };
}