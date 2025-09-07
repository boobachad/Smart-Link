import React from 'react'
import { Wrench } from 'lucide-react'

function maintenanceCard() {
    return (
        <div className="bg-white shadow-lg rounded-xl p-8">
            <div className='flex justify-between items-center'>
                <h1 className="text-2xl font-medium text-gray-500">in Maintenance</h1>
                <Wrench className='text-red-400' size={30} />
            </div>
            <div className=''>
                <p className="text-4xl font-bold text-red-600 mt-2">4</p>
            </div>
        </div>
    )
}

export default maintenanceCard