import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/auth-context';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase/config';
import { setupAuthObserver } from '../lib/firebase/auth';

/**
 * Custom hook to access authentication context
 * @returns {Object} Authentication context values
 */
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

/**
 * Hook to get user data from Firestore
 * @param {string} userId - User ID
 * @returns {Object} User data and loading state
 */
export function useUserData(userId) {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    
    const fetchUserData = async () => {
      try {
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        } else {
          setError('User not found');
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [userId]);
  
  return { userData, loading, error };
}

/**
 * Hook to set up auth state listener
 * @param {Function} onAuthStateChanged - Callback function
 */
export function useAuthStateListener(onAuthStateChanged) {
  useEffect(() => {
    const unsubscribe = setupAuthObserver((user) => {
      onAuthStateChanged(user);
    });
    
    return () => unsubscribe();
  }, [onAuthStateChanged]);
}