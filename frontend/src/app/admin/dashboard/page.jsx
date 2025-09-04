'use client';

import React, { useEffect } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from "../../firebase/config"
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation'

function AdminDashBoard() {

    const [user, loading, error] = useAuthState(auth);
    const userSession = sessionStorage.getItem('user');
    const router = useRouter();

    if(!user && !userSession) {
        router.push('/admin/login');
    }

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center text-lg">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center p-8">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-6">Admin Dashboard</h1>
            <p className="text-lg text-gray-600 mb-8">Welcome, you are logged in!</p>
            <div className="bg-white rounded-xl shadow-2xl p-6 sm:p-8 space-y-4 max-w-lg w-full">
                <p>User Email: {user?.email}</p>
                <button
                    onClick={async () => {
                        await signOut(auth);
                        sessionStorage.removeItem('user');
                    }}
                    className="w-full py-2 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                >
                    Logout
                </button>
            </div>
        </div>
    );
}

export default AdminDashBoard