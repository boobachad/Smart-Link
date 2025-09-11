'use client';

import React, { useEffect, useState } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from "../../firebase/config"
import { useRouter } from 'next/navigation'
import SideNavbar from '../_components/SideNavbar';
import { useDashActivity } from '@/hooks/useDashActivity';
import DashBoardLoadingSkeleton from './_components/DashBoardLoadingSkeleton';

function AdminDashBoard() {

    const [user] = useAuthState(auth);
    const userSession = sessionStorage.getItem('user');
    const [activeSection, setActiveSection] = useState('Dashboard');
    const { data, loading, error } = useDashActivity()
    const router = useRouter();


    if (!user && !userSession) {
        router.push('/admin/login');
    }

    useEffect(() => {
        if (user) {
            user.getIdToken().then(token => {
                localStorage.setItem('userAuth', token);
                console.log("Token stored in localStorage:", token);
            });
        }
    }, [user]);

    if (loading) {
        return <DashBoardLoadingSkeleton />
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
                        <h2 className="text-xl font-semibold text-gray-700">Active Routes</h2>
                        <p className="text-4xl font-bold text-blue-600 mt-4">{data.routes}</p>
                        <span className='text-sm text-gray-400'>operational routes</span>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
                        <h2 className="text-xl font-semibold text-gray-700">Total Buses</h2>
                        <p className="text-4xl font-bold text-green-600 mt-4">{data.buses}</p>
                        <span className='text-sm text-gray-400'>Fleet Size</span>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
                        <h2 className="text-xl font-semibold text-gray-700">Bus Stations</h2>
                        <p className="text-4xl font-bold text-yellow-600 mt-4">{data.stations}</p>
                        <span className='text-sm text-gray-400'>Network Coverage</span>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
                        <h2 className="text-xl font-semibold text-gray-700">On-Time Performance</h2>
                        <p className="text-4xl font-bold text-red-600 mt-4">{data.onTimePerformance}%</p>
                        <span className='text-sm text-gray-400'>last 30 days</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminDashBoard