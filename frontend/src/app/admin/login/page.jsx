'use client';
import React, { useState, useEffect } from 'react'
import { useSignInWithEmailAndPassword } from "react-firebase-hooks/auth"
import { auth } from '@/app/firebase/config';
import { useRouter } from 'next/navigation';

function Login() {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [customError, setCustomError] = useState(null);
  const [
    signInWithEmailAndPassword,
    user,
    loading,
    error,
  ] = useSignInWithEmailAndPassword(auth);

  const router = useRouter();

  useEffect(() => {
    if (error) {
      switch (error.code) {
        case 'auth/wrong-password':
          setCustomError('Incorrect password. Please try again.');
          break;
        case 'auth/user-not-found':
          setCustomError('No account found with that email.');
          break;
        case 'auth/invalid-email':
          setCustomError('Please enter a valid email address.');
          break;
        case 'auth/invalid-credential':
          setCustomError('Invalid login credentials. Please check your email and password.');
          break;
        default:
          setCustomError('An unexpected error occurred. Please try again.');
          break;
      }
    } else {
      setCustomError(null);
    }
  }, [error]);

  useEffect(() => {
    if (user) {
      console.log('User signed in successfully:', user);
      router.push('/admin/dashboard');
    }
  }, [user, router]);


  const handleLogin = async (e) => {
    e.preventDefault();
    setCustomError(null);
    await signInWithEmailAndPassword(email, password);
    sessionStorage.setItem('user', true);
    setEmail('');
    setPassword('');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-6 sm:p-8 space-y-8">
        <div className="flex flex-col items-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-blue-600 mb-2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6a4.5 4.5 0 1 0-9 0v4.5M19.5 10.5h-15a2.25 2.25 0 0 0-2.25 2.25v7.5A2.25 2.25 0 0 0 4.5 22.5h15a2.25 2.25 0 0 0 2.25-2.25v-7.5A2.25 2.25 0 0 0 19.5 10.5Z" />
          </svg>
          <h1 className="text-3xl font-extrabold text-gray-900 text-center">
            Admin Login
          </h1>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to manage the bus tracking system.
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleLogin}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <div className="mt-1">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-base"
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="mt-1">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-base"
                placeholder="Enter your password"
              />
            </div>
          </div>

          {customError && (
            <div className="p-3 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
              {customError}
            </div>
          )}

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              disabled={loading}
            >
              {loading ? 'Logging In...' : 'Log In'}
            </button>
          </div>
        </form>

        <div className="text-center text-sm">
          <p className="text-gray-600">Don't have an account?</p>
          <a href="/admin/signup" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
            Sign up here
          </a>
        </div>
      </div>
    </div>
  );
}

export default Login