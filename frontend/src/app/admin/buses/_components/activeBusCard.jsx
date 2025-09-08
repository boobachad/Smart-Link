import React from 'react'

function activeBusCard({ activeBus }) {
    return (
        <div className="bg-white shadow-lg rounded-xl p-8">
            <div className='flex justify-between items-center'>
                <h1 className="text-2xl font-medium text-gray-500">Active Bus</h1>
                <div className="w-5 h-5 bg-green-500 rounded-full"></div>
            </div>
            <div className=''>
                <p className="text-4xl font-bold text-gray-900 mt-2">{activeBus}</p>
            </div>
        </div>
    )
}

export default activeBusCard