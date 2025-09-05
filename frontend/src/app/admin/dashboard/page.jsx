'use client';

import React from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from "../../firebase/config"
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation'
import SideNavbar from '../_components/SideNavbar';

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
        <div className="min-h-screen grid grid-cols-2 bg-gray-100">
            <SideNavbar />
            <div className=' bg-red-300'></div>
        </div>
    );
}

export default AdminDashBoard