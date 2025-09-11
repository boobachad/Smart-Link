import React from 'react'
import SideNavbar from '../../_components/SideNavbarLoadingSkeleton'

function DashBoardLoadingSkeleton() {
    return (
        <div className='flex h-screen bg-gray-50'>
            <SideNavbar />
            <div className="animate-pulse flex-1 p-8">

                <div className="flex items-center justify-between mb-8 border-b-2 border-gray-200 pb-4">
                    <div className='w-52 h-8 bg-gray-300 rounded-md'></div>
                </div>

                <div className="grid grid-cols-4 gap-14 mb-8">
                    <div className="h-28 bg-gray-200 rounded-lg"></div>
                    <div className="h-28 bg-gray-200 rounded-lg"></div>
                    <div className="h-28 bg-gray-200 rounded-lg"></div>
                    <div className="h-28 bg-gray-200 rounded-lg"></div>
                </div>
            </div>
        </div>
    )
}

export default DashBoardLoadingSkeleton