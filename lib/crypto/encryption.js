import { importPublicKey, importPrivateKey, arrayBufferToBase64, base64ToArrayBuffer } from './keys';

/**
 * Encrypt a message using the recipient's public key
 * @param {string} message - Message to encrypt
 * @param {string} recipientPublicKeyBase64 - Recipient's public key in base64 format
 * @returns {Promise<string>} Encrypted message in base64 format
 */
export async function encryptMessage(message, recipientPublicKeyBase64) {
  try {
    // Convert message to array buffer
    const encoder = new TextEncoder();
    const messageBuffer = encoder.encode(message);
    
    // Import recipient's public key
    const publicKey = await importPublicKey(recipientPublicKeyBase64);
    
    // Generate a random AES key
    const aesKey = await window.crypto.subtle.generateKey(
      {
        name: "AES-GCM",
        length: 256,
      },
      true,
      ["encrypt", "decrypt"]
    );
    
    // Generate random IV (Initialization Vector)
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    
    // Encrypt the message with AES key
    const encryptedMessage = await window.crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      aesKey,
      messageBuffer
    );
    
    // Export the AES key
    const exportedAesKey = await window.crypto.subtle.exportKey("raw", aesKey);
    
    // Encrypt the AES key with recipient's public key
    const encryptedAesKey = await window.crypto.subtle.encrypt(
      {
        name: "RSA-OAEP",
      },
      publicKey,
      exportedAesKey
    );
    
    // Create the final encrypted message object
    const encryptedData = {
      iv: arrayBufferToBase64(iv),
      encryptedMessage: arrayBufferToBase64(encryptedMessage),
      encryptedAesKey: arrayBufferToBase64(encryptedAesKey),
    };
    
    // Convert to JSON string and then to base64
    return btoa(JSON.stringify(encryptedData));
  } catch (error) {
    console.error('Error encrypting message:', error);
    throw error;
  }
}

/**
 * Decrypt a message using the recipient's private key
 * @param {string} encryptedMessageBase64 - Encrypted message in base64 format
 * @param {string} privateKeyBase64 - Recipient's private key in base64 format
 * @returns {Promise<string>} Decrypted message
 */
export async function decryptMessage(encryptedMessageBase64, privateKeyBase64) {
  try {
    // Parse the encrypted message
    const encryptedData = JSON.parse(atob(encryptedMessageBase64));
    
    // Convert base64 data back to array buffers
    const iv = base64ToArrayBuffer(encryptedData.iv);
    const encryptedMessage = base64ToArrayBuffer(encryptedData.encryptedMessage);
    const encryptedAesKey = base64ToArrayBuffer(encryptedData.encryptedAesKey);
    
    // Import private key
    const privateKey = await importPrivateKey(privateKeyBase64);
    
    // Decrypt the AES key
    const aesKeyBuffer = await window.crypto.subtle.decrypt(
      {
        name: "RSA-OAEP",
      },
      privateKey,
      encryptedAesKey
    );
    
    // Import the decrypted AES key
    const aesKey = await window.crypto.subtle.importKey(
      "raw",
      aesKeyBuffer,
      {
        name: "AES-GCM",
        length: 256,
      },
      false,
      ["decrypt"]
    );
    
    // Decrypt the message
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: new Uint8Array(iv),
      },
      aesKey,
      encryptedMessage
    );
    
    // Convert array buffer back to string
    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
  } catch (error) {
    console.error('Error decrypting message:', error);
    throw error;
  }
}

/**
 * Create a signed and encrypted message
 * @param {string} message - Message to encrypt and sign
 * @param {string} senderPrivateKeyBase64 - Sender's private key in base64 format
 * @param {string} recipientPublicKeyBase64 - Recipient's public key in base64 format
 * @returns {Promise<Object>} Object containing encrypted message and signature
 */
export async function createSignedAndEncryptedMessage(message, senderPrivateKeyBase64, recipientPublicKeyBase64) {
  try {
    // Import sender's private key for signing
    const senderPrivateKey = await importPrivateKey(senderPrivateKeyBase64);
    
    // Create a signature using the message
    const encoder = new TextEncoder();
    const messageBuffer = encoder.encode(message);
    const signature = await window.crypto.subtle.sign(
      {
        name: "RSA-PSS",
        saltLength: 32,
      },
      senderPrivateKey,
      messageBuffer
    );
    
    // Encrypt the message
    const encryptedMessage = await encryptMessage(message, recipientPublicKeyBase64);
    
    return {
      encryptedMessage,
      signature: arrayBufferToBase64(signature),
    };
  } catch (error) {
    console.error('Error creating signed and encrypted message:', error);
    throw error;
  }
}

/**
 * Verify and decrypt a signed message
 * @param {Object} signedMessage - Object containing encrypted message and signature
 * @param {string} recipientPrivateKeyBase64 - Recipient's private key in base64 format
 * @param {string} senderPublicKeyBase64 - Sender's public key in base64 format
 * @returns {Promise<Object>} Object containing decrypted message and verification result
 */
export async function verifyAndDecryptMessage(signedMessage, recipientPrivateKeyBase64, senderPublicKeyBase64) {
  try {
    // Decrypt the message
    const decryptedMessage = await decryptMessage(
      signedMessage.encryptedMessage,
      recipientPrivateKeyBase64
    );
    
    // Import sender's public key for verification
    const senderPublicKey = await importPublicKey(senderPublicKeyBase64);
    
    // Verify the signature
    const encoder = new TextEncoder();
    const messageBuffer = encoder.encode(decryptedMessage);
    const signatureBuffer = base64ToArrayBuffer(signedMessage.signature);
    
    const isVerified = await window.crypto.subtle.verify(
      {
        name: "RSA-PSS",
        saltLength: 32,
      },
      senderPublicKey,
      signatureBuffer,
      messageBuffer
    );
    
    return {
      message: decryptedMessage,
      isVerified,
    };
  } catch (error) {
    console.error('Error verifying and decrypting message:', error);
    throw error;
  }
}