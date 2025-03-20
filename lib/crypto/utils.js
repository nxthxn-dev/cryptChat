'use client';

import CryptoJS from 'crypto-js';

/**
 * Decrypt a message using CryptoJS (compatible with your existing encryption)
 * @param {string} encryptedMessage - The encrypted message text
 * @param {string} privateKey - The private key for decryption
 * @returns {string} - The decrypted message text
 */
export function decryptWithCryptoJS(encryptedMessage, privateKey) {
  try {
    const decrypted = CryptoJS.AES.decrypt(encryptedMessage, privateKey);
    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Error decrypting with CryptoJS:', error);
    throw error;
  }
}

/**
 * Get the recipient's public key
 * This is a placeholder function - you'll need to implement this
 * based on your application's user data structure
 * 
 * @param {string} recipientEmail - The recipient's email
 * @returns {Promise<string>} - The recipient's public key
 */
export async function getRecipientPublicKey(recipientEmail) {
  // Implementation would fetch the user's public key from Firestore
  // For now, we'll use their email as a simple key (not secure, just for demonstration)
  return CryptoJS.SHA256(recipientEmail).toString();
}