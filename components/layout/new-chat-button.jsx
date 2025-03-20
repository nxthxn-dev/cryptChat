'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { IoAdd, IoClose } from 'react-icons/io5';
import { createChat } from '@/lib/firebase/firestore';
import { useAuth } from '@/context/auth-context';
import { query, where, getDocs, collection,doc, getDoc  } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
export default function NewChatButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [recipient, setRecipient] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setRecipient('');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!recipient.trim()) {
      setError('Please enter a recipient email');
      return;
    }
    
    if (!recipient.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    
    if (recipient === user.email) {
      setError('You cannot chat with yourself');
      return;
    }

    const usersQuery = query(collection(db, 'users'), where('email', '==', recipient));
    const usersSnapshot = await getDocs(usersQuery);

    if (usersSnapshot.empty) {
      setError('User with email not found');
      return;
    }
    
    setLoading(true);
    
    try {
      // Get private key from storage
      const privateKey = localStorage.getItem('privateKey');
      
      if (!privateKey) {
        setError('Private key not found. Please log out and sign in again.');
        setLoading(false);
        return;
      }
      
      const chatId = await createChat(user.email, recipient, privateKey);
      closeModal();
      router.push(`/chats/${chatId}`);
    } catch (error) {
      console.error('Error creating chat:', error);
      setError('Failed to create chat. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={openModal}
        className="fixed right-6 bottom-6 p-4 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        <IoAdd className="w-6 h-6" />
      </button>
      
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold dark:text-white">Start a New Chat</h2>
              <button
                onClick={closeModal}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <IoClose className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              {error && (
                <div className="mb-4 p-3 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800">
                  {error}
                </div>
              )}
              
              <div className="mb-4">
                <label htmlFor="recipient" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Recipient Email
                </label>
                <input
                  type="email"
                  id="recipient"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="Enter recipient's email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
              
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  className="mr-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-transparent rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-500 border border-transparent rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Start Chat'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}