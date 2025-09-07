'use client';

import React, { useEffect, useState } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from "../../firebase/config"
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation'
import SideNavbar from '../_components/SideNavbar';

function AdminDashBoard() {

    const [user, loading, error] = useAuthState(auth);
    const userSession = sessionStorage.getItem('user');
    const [activeSection, setActiveSection] = useState('Dashboard');
    const router = useRouter();


    if (!user && !userSession) {
        router.push('/admin/login');
    }


    if (loading) {
        return <div className="min-h-screen flex items-center justify-center text-lg">Loading...</div>;
    }



    return (
        <div className="flex h-screen bg-gray-50">
            <SideNavbar
                activeSection={activeSection}
                setActiveSection={setActiveSection}
                loading={loading}
            />
            <div className="flex-1 p-8">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
                    <p className="text-gray-600">Welcome back, Admin!</p>
                </div>

                {/* Stats Cards Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
                        <h2 className="text-xl font-semibold text-gray-700">Total Buses</h2>
                        <p className="text-4xl font-bold text-blue-600 mt-2">42</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
                        <h2 className="text-xl font-semibold text-gray-700">Active Routes</h2>
                        <p className="text-4xl font-bold text-green-600 mt-2">18</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
                        <h2 className="text-xl font-semibold text-gray-700">Total Stations</h2>
                        <p className="text-4xl font-bold text-yellow-600 mt-2">120</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
                        <h2 className="text-xl font-semibold text-gray-700">Online Drivers</h2>
                        <p className="text-4xl font-bold text-red-600 mt-2">35</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminDashBoard