'use client';

import { db } from './config';
import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc, 
  setDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp, 
  onSnapshot 
} from 'firebase/firestore';
import { signMessage, encryptMessage, generateAES, encryptAESKeyRSA } from '../crypto/signature';

// Create a new chat between two users
export const createChat = async (currentUserEmail, recipientEmail, currentUserPrivateKey) => {
  try {
    // Check if chat already exists
    const existingChat = await findChatByParticipants(currentUserEmail, recipientEmail);
    
    if (existingChat) {
      return existingChat.id;
    }
    
    const chatRef = await addDoc(collection(db, 'chats'), {
      participants: [currentUserEmail, recipientEmail],
      createdAt: serverTimestamp(),
      lastMessage: null,
      lastMessageTime: null
    });
    
    return chatRef.id;
  } catch (error) {
    console.error('Error creating chat:', error);
    throw error;
  }
};

// Find a chat by participants
export const findChatByParticipants = async (userEmail1, userEmail2) => {
  try {
    const q1 = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', userEmail1)
    );
    
    const querySnapshot = await getDocs(q1);
    
    for (const doc of querySnapshot.docs) {
      const chatData = doc.data();
      if (chatData.participants.includes(userEmail2)) {
        return { id: doc.id, ...chatData };
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error finding chat:', error);
    throw error;
  }
};

// Get all chats for a user
export const getUserChats = async (userEmail) => {
  try {
    const q = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', userEmail)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting user chats:', error);
    throw error;
  }
};

// Listen to real-time updates of user chats
export const listenToUserChats = (userEmail, callback) => {
  const q = query(
    collection(db, 'chats'),
    where('participants', 'array-contains', userEmail)
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const chats = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(chats);
  });
};

// Send a message in a chat
export const sendMessage = async (chatId, senderEmail, recipientEmail, messageText, senderPrivateKey, recipientPublicKey, senderPublicKey) => {
    try {
        const aesKey = generateAES() // Generate a random AES key
        // Encrypt the message with AES
        const encryptedMessage = encryptMessage(messageText, aesKey); //

        // Encrypt the AES key with the recipient's public key
        const encryptedAESR = encryptAESKeyRSA(recipientPublicKey, aesKey);
        // Encrypt the AES key with the sender's public key
        const encryptedAESS = encryptAESKeyRSA(senderPublicKey, aesKey);

        const signature = signMessage(messageText, senderPrivateKey);
        // Store in Firestore
        const messageRef = await addDoc(collection(db, 'chats', chatId, 'messages'), {
            text: encryptedMessage,
            sender: senderEmail,
            recipient: recipientEmail,
            recipientAES: encryptedAESR,
            senderAES: encryptedAESS,
            signature: signature,
            timestamp: serverTimestamp(),
            read: false
        });

        return messageRef.id;
    } catch (error) {
        console.error('Error sending message:', error);
        throw error;
    }
};
// Get messages for a chat
export const getChatMessages = async (chatId) => {
  try {
    const q = query(
      collection(db, 'chats', chatId, 'messages'),
      orderBy('timestamp', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting chat messages:', error);
    throw error;
  }
};

// Listen to real-time updates of chat messages
export const listenToChatMessages = (chatId, callback) => {
  const q = query(
    collection(db, 'chats', chatId, 'messages'),
    orderBy('timestamp', 'asc')
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const messages = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(messages);
  });
};