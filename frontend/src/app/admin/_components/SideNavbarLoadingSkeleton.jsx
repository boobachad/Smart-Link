import React from 'react';
import { Bus } from 'lucide-react';

function SideNavbar() {

    return (
        <div className='max-w-1/3 h-screen border border-gray-200 bg-gray-100 flex flex-col'>
            <div className='p-4 flex items-center gap-2 border-b border-gray-200'>
                <Bus size={32} />
                <p className='text-xl text-semi-bold'>Smart_Link</p>
            </div>

            <div className='flex flex-col space-y-2 mt-4'>
                <div className='animate-pulse px-4 py-2 flex items-center gap-2'>
                    <div className='w-5 h-5 bg-gray-300 rounded-md'></div>
                    <div className='w-24 h-5 bg-gray-300 rounded-md'></div>
                </div>
                <div className='animate-pulse px-4 py-2 flex items-center gap-2'>
                    <div className='w-5 h-5 bg-gray-300 rounded-md'></div>
                    <div className='w-24 h-5 bg-gray-300 rounded-md'></div>
                </div>
                <div className='animate-pulse px-4 py-2 flex items-center gap-2'>
                    <div className='w-5 h-5 bg-gray-300 rounded-md'></div>
                    <div className='w-24 h-5 bg-gray-300 rounded-md'></div>
                </div>
                <div className='animate-pulse px-4 py-2 flex items-center gap-2'>
                    <div className='w-5 h-5 bg-gray-300 rounded-md'></div>
                    <div className='w-24 h-5 bg-gray-300 rounded-md'></div>
                </div>
            </div>
        </div>
    );
}

export default SideNavbar;
