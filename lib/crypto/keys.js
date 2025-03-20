/**
 * Generate a new RSA key pair for digital signatures
 * @returns {Promise<Object>} Object containing publicKey and privateKey
 */
export async function generateKeyPair() {
    try {
      // Generate a new key pair
      const keyPair = await window.crypto.subtle.generateKey(
        {
          name: "RSA-OAEP",
          modulusLength: 2048,
          publicExponent: new Uint8Array([1, 0, 1]),
          hash: "SHA-256",
        },
        true, // extractable
        ["encrypt", "decrypt"] // key usage
      );
      
      // Export the public key as spki
      const publicKeyExported = await window.crypto.subtle.exportKey(
        "spki",
        keyPair.publicKey
      );
      
      // Export the private key as pkcs8
      const privateKeyExported = await window.crypto.subtle.exportKey(
        "pkcs8",
        keyPair.privateKey
      );
      
      // Convert exported keys to base64 for storage
      const publicKeyBase64 = arrayBufferToBase64(publicKeyExported);
      const privateKeyBase64 = arrayBufferToBase64(privateKeyExported);
      
      return {
        publicKey: publicKeyBase64,
        privateKey: privateKeyBase64,
      };
    } catch (error) {
      console.error('Error generating key pair:', error);
      throw error;
    }
  }
  
  /**
   * Import a public key from base64 format
   * @param {string} publicKeyBase64 - Public key in base64 format
   * @returns {Promise<CryptoKey>} Imported public key
   */
  export async function importPublicKey(publicKeyBase64) {
    try {
      const binaryKey = base64ToArrayBuffer(publicKeyBase64);
      
      // Import the public key
      const publicKey = await window.crypto.subtle.importKey(
        "spki",
        binaryKey,
        {
          name: "RSA-OAEP",
          hash: "SHA-256",
        },
        true,
        ["encrypt"]
      );
      
      return publicKey;
    } catch (error) {
      console.error('Error importing public key:', error);
      throw error;
    }
  }
  
  /**
   * Import a private key from base64 format
   * @param {string} privateKeyBase64 - Private key in base64 format
   * @returns {Promise<CryptoKey>} Imported private key
   */
  export async function importPrivateKey(privateKeyBase64) {
    try {
      const binaryKey = base64ToArrayBuffer(privateKeyBase64);
      
      // Import the private key
      const privateKey = await window.crypto.subtle.importKey(
        "pkcs8",
        binaryKey,
        {
          name: "RSA-OAEP",
          hash: "SHA-256",
        },
        true,
        ["decrypt"]
      );
      
      return privateKey;
    } catch (error) {
      console.error('Error importing private key:', error);
      throw error;
    }
  }
  
  /**
   * Convert ArrayBuffer to Base64 string
   * @param {ArrayBuffer} buffer - Array buffer to convert
   * @returns {string} Base64 string
   */
  export function arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }
  
  /**
   * Convert Base64 string to ArrayBuffer
   * @param {string} base64 - Base64 string to convert
   * @returns {ArrayBuffer} Converted array buffer
   */
  export function base64ToArrayBuffer(base64) {
    const binaryString = window.atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }
  
  /**
   * Generate a signature for a message using the private key
   * @param {string} message - Message to sign
   * @param {string} privateKeyBase64 - Private key in base64 format
   * @returns {Promise<string>} Base64 encoded signature
   */
  export async function signMessage(message, privateKeyBase64) {
    try {
      // Convert message to array buffer
      const encoder = new TextEncoder();
      const messageBuffer = encoder.encode(message);
      
      // Import private key
      const privateKey = await importPrivateKey(privateKeyBase64);
      
      // Create signature
      const signature = await window.crypto.subtle.sign(
        {
          name: "RSA-PSS",
          saltLength: 32,
        },
        privateKey,
        messageBuffer
      );
      
      // Convert signature to base64
      return arrayBufferToBase64(signature);
    } catch (error) {
      console.error('Error signing message:', error);
      throw error;
    }
  }
  
  /**
   * Verify a signature using the public key
   * @param {string} message - Original message
   * @param {string} signatureBase64 - Base64 encoded signature
   * @param {string} publicKeyBase64 - Public key in base64 format
   * @returns {Promise<boolean>} Whether the signature is valid
   */
  export async function verifySignature(message, signatureBase64, publicKeyBase64) {
    try {
      // Convert message to array buffer
      const encoder = new TextEncoder();
      const messageBuffer = encoder.encode(message);
      
      // Convert signature from base64
      const signatureBuffer = base64ToArrayBuffer(signatureBase64);
      
      // Import public key
      const publicKey = await importPublicKey(publicKeyBase64);
      
      // Verify signature
      const isValid = await window.crypto.subtle.verify(
        {
          name: "RSA-PSS",
          saltLength: 32,
        },
        publicKey,
        signatureBuffer,
        messageBuffer
      );
      
      return isValid;
    } catch (error) {
      console.error('Error verifying signature:', error);
      return false;
    }
  }