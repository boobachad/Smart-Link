'use client';

import React, { useEffect } from 'react'
import { getAuth, signOut } from 'firebase/auth'
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

function logout() {

    const auth = getAuth();
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