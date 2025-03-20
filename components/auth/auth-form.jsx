import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../hooks/use-auth';
import Input from '../ui/input';
import Button from '../ui/button';
import { isValidEmail, isValidPassword, isValidDisplayName } from '../../lib/utils/validation';

/**
 * Authentication form component for sign-in and sign-up
 * @param {string} type - Form type ('sign-in' or 'sign-up')
 * @returns {JSX.Element}
 */
const AuthForm = ({ type }) => {
  const router = useRouter();
  const { signIn, registerUser } = useAuth();
  
  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: '',
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');
  
  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear errors for the field being changed
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };
  
  // Validate form fields
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (type === 'sign-up' && !isValidPassword(formData.password)) {
      newErrors.password = 'Password must be at least 8 characters with at least one letter and one number';
    }
    
    if (type === 'sign-up' && !formData.displayName) {
      newErrors.displayName = 'Display name is required';
    } else if (type === 'sign-up' && !isValidDisplayName(formData.displayName)) {
      newErrors.displayName = 'Display name must be between 2 and 50 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (type === 'sign-in') {
        await signIn(formData.email, formData.password);
      } else {
        await registerUser(formData.email, formData.password, formData.displayName);
      }
      
      // Redirect to chats page on success
      router.push('/chats');
    } catch (error) {
      console.error('Authentication error:', error);
      
      // Handle specific Firebase errors
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        setGeneralError('Invalid email or password');
      } else if (error.code === 'auth/email-already-in-use') {
        setErrors((prev) => ({ ...prev, email: 'Email is already in use' }));
      } else {
        setGeneralError(error.message || 'An error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="w-full max-w-md p-6 bg-background rounded-lg shadow-sm border border-foreground/10">
      <h2 className="text-2xl font-bold mb-6 text-center">
        {type === 'sign-in' ? 'Sign In' : 'Create Account'}
      </h2>
      
      {generalError && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {generalError}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {type === 'sign-up' && (
          <Input
            label="Display Name"
            name="displayName"
            value={formData.displayName}
            onChange={handleChange}
            error={errors.displayName}
            placeholder="Enter your name"
            required
          />
        )}
        
        <Input
          label="Email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          placeholder="Enter your email"
          required
        />
        
        <Input
          label="Password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          placeholder="Enter your password"
          required
        />
        
        <Button type="submit" fullWidth isLoading={isLoading}>
          {type === 'sign-in' ? 'Sign In' : 'Sign Up'}
        </Button>
      </form>
      
      <div className="mt-4 text-center text-sm">
        {type === 'sign-in' ? (
          <p>
            Don't have an account?{' '}
            <Link href="/auth/sign-up" className="text-blue-600 hover:underline">
              Sign Up
            </Link>
          </p>
        ) : (
          <p>
            Already have an account?{' '}
            <Link href="/auth/sign-in" className="text-blue-600 hover:underline">
              Sign In
            </Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default AuthForm;