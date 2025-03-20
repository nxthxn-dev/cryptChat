import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    signOut as firebaseSignOut,
    updateProfile,
    sendPasswordResetEmail,
    onAuthStateChanged
  } from 'firebase/auth';
  import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
  import { auth, db } from './config';
  import { generateKeyPair } from '../crypto/keys';
  
  /**
   * Register a new user
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {string} displayName - User display name
   * @returns {Promise<Object>} User data
   */
  export async function registerUser(email, password, displayName) {
    try {
      // Create user with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update profile with display name
      await updateProfile(user, { displayName });
      
      // Generate key pair for digital signatures
      const { publicKey, privateKey } = await generateKeyPair();
      
      // Store user data in Firestore
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName,
        publicKey,
        createdAt: serverTimestamp(),
        lastSeen: serverTimestamp(),
      });
      
      // Store private key in localStorage (in a real app, consider more secure storage options)
      localStorage.setItem('privateKey', privateKey);
      
      return {
        uid: user.uid,
        email: user.email,
        displayName,
      };
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  }
  
  /**
   * Sign in an existing user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} User data
   */
  export async function signIn(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update last seen timestamp
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, { lastSeen: serverTimestamp() }, { merge: true });
      
      // Get user data including public key
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        
        // Check if private key exists in localStorage, if not, we need to regenerate keys
        if (!localStorage.getItem('privateKey')) {
          // In a real app, you might want to handle this differently
          // For now, we'll regenerate keys if private key is missing
          const { publicKey, privateKey } = await generateKeyPair();
          await setDoc(userRef, { publicKey }, { merge: true });
          localStorage.setItem('privateKey', privateKey);
        }
        
        return {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          ...userData
        };
      }
      
      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
      };
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  }
  
  /**
   * Sign out the current user
   * @returns {Promise<void>}
   */
  export async function signOut() {
    try {
      // Update last seen timestamp before signing out
      if (auth.currentUser) {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        await setDoc(userRef, { lastSeen: serverTimestamp() }, { merge: true });
      }
      
      // Sign out from Firebase Auth
      await firebaseSignOut(auth);
      
      // Clear private key from localStorage
      localStorage.removeItem('privateKey');
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }
  
  /**
   * Reset user password
   * @param {string} email - User email
   * @returns {Promise<void>}
   */
  export async function resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  }
  
  /**
   * Set up auth state observer
   * @param {Function} callback - Callback function to handle auth state changes
   * @returns {Function} Unsubscribe function
   */
  export function setupAuthObserver(callback) {
    return onAuthStateChanged(auth, callback);
  }
  
  /**
   * Get the current authenticated user
   * @returns {Object|null} Current user or null if not authenticated
   */
  export function getCurrentUser() {
    return auth.currentUser;
  }