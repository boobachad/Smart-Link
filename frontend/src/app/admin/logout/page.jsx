'use client';

import React, { useEffect } from 'react'
import { signOut } from 'firebase/auth'
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from "../../firebase/config"
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

function logout() {

    const router = useRouter();

    const handleSignOut = async () => {
        try{
            await signOut(auth);
            toast.success("User LoggOut Successfully");
            router.push('/admin/login');
        } catch (error) {
            console.log("Signout Error:", error.message);
        }
    }

    useEffect(() => {
        handleSignOut();
    },[]);

}

export default logout