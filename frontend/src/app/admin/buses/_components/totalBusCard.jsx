import React from 'react'
import { BusFront } from 'lucide-react';

function totalBusCard({ totalBus }) {
    return (
        <div className="bg-white shadow-lg rounded-xl p-8">
            <div className='flex justify-between items-center'>
                <h1 className="text-2xl font-medium text-gray-500">Total Bus</h1>
                <BusFront className='text-gray-500' size={30} />
            </div>
            <div className=''>
                <p className="text-4xl font-bold text-gray-900 mt-2">{totalBus}</p>
            </div>
        </div>
    )
}

export default totalBusCard