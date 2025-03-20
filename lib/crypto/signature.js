'use client';

import CryptoJS from 'crypto-js';
import JSEncrypt from 'jsencrypt';
// Generate a key pair for a user
export const generateKeyPair = () => {
    const crypt = new JSEncrypt({ default_key_size: 2048 });
    const privateKey = crypt.getPrivateKey();
    const publicKey = crypt.getPublicKey();
  
  return { privateKey, publicKey };
};

// Sign a message using the private key
export const signMessage = (message, privateKey) => {
    const crypt = new JSEncrypt();
    crypt.setPrivateKey(privateKey);
    return crypt.sign(message, CryptoJS.SHA256, "sha256"); // Generate signature
};

// Verify a message using the public key and signature
export const verifySignature = (message, signature, senderPublicKey) => {
    const crypt = new JSEncrypt();
    crypt.setPublicKey(senderPublicKey);
    return crypt.verify(message, signature, CryptoJS.SHA256);
};

// Encrypt a message using the recipient's public key
export const encryptMessage = (message, recipientPublicKey) => {
    const encrypted = CryptoJS.AES.encrypt(message, recipientPublicKey).toString();
  return encrypted;
};

// Decrypt a message using the recipient's private key
export const decryptMessage = (encryptedMessage, privateKey) => {
  const decrypted = CryptoJS.AES.decrypt(encryptedMessage, privateKey).toString();
  return decrypted;
};

export const generateAES = () =>{
    return CryptoJS.lib.WordArray.random(32).toString(CryptoJS.enc.Base64);
}

export const decryptWithAES = (encryptedMessage, encryptedAESKey, privateKey) => {
    try {
        // Decrypt AES key with RSA private key
        const decryptRSA = new JSEncrypt();
        decryptRSA.setPrivateKey(privateKey);
        const decryptedAESKey = decryptRSA.decrypt(encryptedAESKey); // AES key is recovered
        
        if (!decryptedAESKey) {
            throw new Error('Failed to decrypt AES key');
        }

        // Decrypt the actual message using AES key
        const decryptedText = CryptoJS.AES.decrypt(encryptedMessage, decryptedAESKey).toString(CryptoJS.enc.Utf8);

        return decryptedText || 'Decryption failed';
    } catch (error) {
        console.error('Error decrypting message:', error);
        return 'Decryption failed';
    }
};

export const encryptAESKeyRSA = (publicKey, keyToEncrypt) =>{
    const encryptRSA = new JSEncrypt();
    encryptRSA.setPublicKey(publicKey);
    return encryptRSA.encrypt(keyToEncrypt); 
}