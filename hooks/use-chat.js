import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  doc, 
  getDoc, 
  updateDoc, 
  serverTimestamp, 
  getDocs 
} from 'firebase/firestore';
import { db } from '../lib/firebase/config';
import { useAuth } from './use-auth';
import { createSignedAndEncryptedMessage, verifyAndDecryptMessage } from '../lib/crypto/encryption';

/**
 * Hook to manage chat operations
 * @returns {Object} Chat operations and state
 */
export function useChat() {
  const { user } = useAuth();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch user's chats
  useEffect(() => {
    if (!user?.uid) {
      setChats([]);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    
    const chatsQuery = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', user.uid),
      orderBy('updatedAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(
      chatsQuery,
      async (snapshot) => {
        try {
          // Process chat documents
          const chatDocs = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          
          // Fetch chat participants data
          const chatsWithParticipants = await Promise.all(
            chatDocs.map(async (chat) => {
              const participantsData = await Promise.all(
                chat.participants
                  .filter((id) => id !== user.uid)
                  .map(async (id) => {
                    const userDoc = await getDoc(doc(db, 'users', id));
                    return userDoc.exists() ? userDoc.data() : { uid: id };
                  })
              );
              
              return {
                ...chat,
                participantsData,
              };
            })
          );
          
          setChats(chatsWithParticipants);
        } catch (err) {
          console.error('Error processing chats:', err);
          setError('Failed to load chats');
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        console.error('Error fetching chats:', err);
        setError('Failed to load chats');
        setLoading(false);
      }
    );
    
    return () => unsubscribe();
  }, [user?.uid]);
  
  /**
   * Create a new chat with a user by email
   * @param {string} email - Recipient email
   * @returns {Promise<string>} Chat ID
   */
  const createChat = async (email) => {
    if (!user?.uid) {
      throw new Error('You must be logged in to create a chat');
    }
    
    try {
      // Find user by email
      const usersQuery = query(collection(db, 'users'), where('email', '==', email));
      const usersSnapshot = await getDocs(usersQuery);
      
      if (usersSnapshot.empty) {
        throw new Error('User not found');
      }
      
      const recipientData = usersSnapshot.docs[0].data();
      const recipientId = recipientData.uid;
      
      // Check if chat already exists
      const existingChatQuery = query(
        collection(db, 'chats'),
        where('participants', 'array-contains', user.uid)
      );
      
      const existingChatSnapshot = await getDocs(existingChatQuery);
      
      const existingChat = existingChatSnapshot.docs.find((doc) => {
        const chatData = doc.data();
        return chatData.participants.includes(recipientId);
      });
      
      if (existingChat) {
        return existingChat.id;
      }
      
      // Create new chat
      const newChatRef = await addDoc(collection(db, 'chats'), {
        participants: [user.uid, recipientId],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastMessage: null,
      });
      
      return newChatRef.id;
    } catch (err) {
      console.error('Error creating chat:', err);
      throw err;
    }
  };
  
  /**
   * Send a message in a chat
   * @param {string} chatId - Chat ID
   * @param {string} content - Message content
   * @returns {Promise<void>}
   */
  const sendMessage = async (chatId, content) => {
    if (!user?.uid) {
      throw new Error('You must be logged in to send a message');
    }
    
    try {
      // Get chat document
      const chatDoc = await getDoc(doc(db, 'chats', chatId));
      
      if (!chatDoc.exists()) {
        throw new Error('Chat not found');
      }
      
      const chatData = chatDoc.data();
      
      // Get recipient ID
      const recipientId = chatData.participants.find((id) => id !== user.uid);
      
      // Get recipient's public key
      const recipientDoc = await getDoc(doc(db, 'users', recipientId));
      
      if (!recipientDoc.exists()) {
        throw new Error('Recipient not found');
      }
      
      const recipientData = recipientDoc.data();
      const recipientPublicKey = recipientData.publicKey;
      
      // Get sender's private key
      const senderPrivateKey = localStorage.getItem('privateKey');
      
      if (!senderPrivateKey) {
        throw new Error('Private key not found');
      }
      
      // Create signed and encrypted message
      const signedMessage = await createSignedAndEncryptedMessage(
        content,
        senderPrivateKey,
        recipientPublicKey
      );
      
      // Add message to Firestore
      const messagesRef = collection(db, 'chats', chatId, 'messages');
      await addDoc(messagesRef, {
        senderId: user.uid,
        encryptedContent: signedMessage.encryptedMessage,
        signature: signedMessage.signature,
        timestamp: serverTimestamp(),
        read: false,
      });
      
      // Update chat metadata
      await updateDoc(doc(db, 'chats', chatId), {
        lastMessage: {
          senderId: user.uid,
          content: 'Encrypted message',
          timestamp: serverTimestamp(),
        },
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error('Error sending message:', err);
      throw err;
    }
  };
  
  /**
   * Fetch messages for a chat
   * @param {string} chatId - Chat ID
   * @returns {Object} Messages and related functions
   */
  const useChatMessages = (chatId) => {
    const [messages, setMessages] = useState([]);
    const [messagesLoading, setMessagesLoading] = useState(true);
    const [messagesError, setMessagesError] = useState(null);
    
    useEffect(() => {
      if (!chatId || !user?.uid) {
        setMessages([]);
        setMessagesLoading(false);
        return;
      }
      
      setMessagesLoading(true);
      
      // Get chat document to get participants
      const getChatParticipants = async () => {
        try {
          const chatDoc = await getDoc(doc(db, 'chats', chatId));
          
          if (!chatDoc.exists()) {
            throw new Error('Chat not found');
          }
          
          const chatData = chatDoc.data();
          
          // Get participants' public keys
          const participantsData = await Promise.all(
            chatData.participants.map(async (participantId) => {
              const userDoc = await getDoc(doc(db, 'users', participantId));
              return userDoc.exists() ? userDoc.data() : { uid: participantId };
            })
          );
          
          // Create a map of user IDs to public keys
          const publicKeyMap = participantsData.reduce((acc, participant) => {
            acc[participant.uid] = participant.publicKey;
            return acc;
          }, {});
          
          // Get the private key for decryption
          const privateKey = localStorage.getItem('privateKey');
          
          if (!privateKey) {
            throw new Error('Private key not found');
          }
          
          // Set up messages listener
          const messagesQuery = query(
            collection(db, 'chats', chatId, 'messages'),
            orderBy('timestamp', 'asc')
          );
          
          const unsubscribe = onSnapshot(
            messagesQuery,
            async (snapshot) => {
              try {
                // Process message documents
                const messagePromises = snapshot.docs.map(async (doc) => {
                  const messageData = doc.data();
                  
                  // Try to decrypt the message
                  try {
                    // If the message is from the current user, use the recipient's public key
                    // Otherwise, use the sender's public key
                    const senderPublicKey = publicKeyMap[messageData.senderId];
                    
                    // Verify and decrypt the message
                    const { message, isVerified } = await verifyAndDecryptMessage(
                      {
                        encryptedMessage: messageData.encryptedContent,
                        signature: messageData.signature,
                      },
                      privateKey,
                      senderPublicKey
                    );
                    
                    return {
                      id: doc.id,
                      ...messageData,
                      content: message,
                      verified: isVerified,
                      timestamp: messageData.timestamp?.toDate(),
                    };
                  } catch (decryptionError) {
                    console.error('Error decrypting message:', decryptionError);
                    
                    // Return the message with an error flag
                    return {
                      id: doc.id,
                      ...messageData,
                      content: 'Unable to decrypt message',
                      decryptionError: true,
                      timestamp: messageData.timestamp?.toDate(),
                    };
                  }
                });
                
                const processedMessages = await Promise.all(messagePromises);
                setMessages(processedMessages);
              } catch (err) {
                console.error('Error processing messages:', err);
                setMessagesError('Failed to load messages');
              } finally {
                setMessagesLoading(false);
              }
            },
            (err) => {
              console.error('Error fetching messages:', err);
              setMessagesError('Failed to load messages');
              setMessagesLoading(false);
            }
          );
          
          return () => unsubscribe();
        } catch (err) {
          console.error('Error setting up message listener:', err);
          setMessagesError(err.message);
          setMessagesLoading(false);
        }
      };
      
      getChatParticipants();
    }, [chatId, user?.uid]);
    
    return { messages, loading: messagesLoading, error: messagesError };
  };
  
  return {
    chats,
    loading,
    error,
    createChat,
    sendMessage,
    useChatMessages,
  };
}