'use client';

import React, { useState, useEffect } from 'react';
import { useCreateUserWithEmailAndPassword } from 'react-firebase-hooks/auth';
import { auth } from '@/app/firebase/config';
import { useRouter } from 'next/navigation';

function Signup() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [customError, setCustomError] = useState(null);

    const [
        createUserWithEmailAndPassword,
        user,
        loading,
        error,
    ] = useCreateUserWithEmailAndPassword(auth);

    const router = useRouter();

    useEffect(() => {
        if (user) {
            console.log('User signed up successfully:', user);
            router.push('/admin/dashboard');
        }
    }, [user, router]);

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


    const handleSignup = async (e) => {
        e.preventDefault();

        const res = await createUserWithEmailAndPassword(email, password);
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 sm:p-6 lg:p-8">
            <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-6 sm:p-8 space-y-8">
                <div className="flex flex-col items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-blue-600 mb-2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21V12a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 12v9m-1.5-10.5h.008v.008h-.008zM12 21a2.25 2.25 0 0 0 2.25-2.25V15a2.25 2.25 0 0 0-2.25-2.25H9.75A2.25 2.25 0 0 0 7.5 15v3.75m4.5-5.625 2.25 2.25m-2.25 2.25-2.25-2.25" />
                    </svg>
                    <h1 className="text-3xl font-extrabold text-gray-900 text-center">
                        Admin Sign Up
                    </h1>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Create an account to manage the bus tracking system.
                    </p>
                </div>

                <form className="space-y-6" onSubmit={handleSignup}>
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
                                autoComplete="new-password"
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
                            {loading ? 'Signing Up...' : 'Sign Up'}
                        </button>
                    </div>
                </form>

                <div className="text-center text-sm">
                    <p className="text-gray-600">Already have an account?</p>
                    <a href="/admin/login" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
                        Log in here
                    </a>
                </div>
            </div>
        </div>
    );
}

export default Signup;
