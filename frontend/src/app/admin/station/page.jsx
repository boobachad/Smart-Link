'use client';
import React, { useState, useEffect } from 'react'
import { Car, Plus } from 'lucide-react'
import SideNavbar from '../_components/SideNavbar'
import { Users, MapPin } from 'lucide-react';
import { DataTable } from './_components/StationTable/data-table';
import { columns } from './_components/StationTable/columns';
import { useStation } from '@/hooks/useStation';
import { getStation } from '@/utils/api';
import StationLoadingSkeleton from './_components/StationLoadingSkeleton';


function Stations() {
    const [activeSection, setActiveSection] = useState("Station");
    const [page, setPage] = useState(1);
    const { station, totalPages, loading, error, count } = useStation(page, 10);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
        }
    };

    if (loading) {
        return <StationLoadingSkeleton />
    }

    return (
        <div className="flex h-screen bg-gray-50">
            <SideNavbar
                activeSection={activeSection}
                setActiveSection={setActiveSection}
            />
            <div className="flex-1 p-6 overflow-y-scroll">
                <div className="flex items-center justify-between mb-8 border-b-2 border-gray-200 pb-4">
                    <h1 className="text-3xl font-bold text-gray-800">Stations Managment</h1>
                    <button
                        className='flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-300 '>
                        <Plus size={20} />
                        <span>Add Station</span>
                    </button>
                </div>

                <div className="grid grid-cols-3 gap-6">
                    <div className="bg-white shadow-lg rounded-xl p-8">
                        <div className='flex justify-between items-center'>
                            <h1 className="text-2xl font-medium text-gray-500">Total Stations</h1>
                            <MapPin className='text-gray-500' size={30} />
                        </div>
                        <div className='mt-3'>
                            <p className="text-5xl font-bold  mt-2">{count?.total}</p>
                            <p className="text-sm   mt-2">Network Coverage</p>
                        </div>
                    </div>

                    <div className="bg-white shadow-lg rounded-xl p-8">
                        <div className='flex justify-between items-center'>
                            <h1 className="text-2xl font-medium text-gray-500">Active Stations</h1>
                            <div className='h-6 w-6 rounded-full bg-green-500'>
                            </div>
                        </div>
                        <div className='mt-3'>
                            <p className="text-5xl font-bold  mt-2">{count?.active}</p>
                            <p className="text-sm   mt-2">Currently Operational</p>
                        </div>
                    </div>

                    <div className="bg-white shadow-lg rounded-xl p-8">
                        <div className='flex justify-between items-center'>
                            <h1 className="text-2xl font-medium text-gray-500">Total  Capacity</h1>
                            <Users className='text-gray-500' size={30} />
                        </div>
                        <div className='mt-3'>
                            <p className="text-5xl font-bold  mt-2">50</p>
                            <p className="text-sm   mt-2">Passenger Capacity</p>
                        </div>
                    </div>
                </div>

                <div className='mt-10 border border-gray-300 shadow-lg p-6 rounded-lg'>
                    <h2 className='text-2xl font-semibold mb-6'>All Stations</h2>
                    <div className='overflow-x-auto'>
                        <DataTable columns={columns} data={station} page={page} totalPages={totalPages} onPageChange={handlePageChange} />
                    </div>
                </div>

                {/* <AddBusDialogueBox isOpen={isDialogueOpen} onClose={() => setIsDialogueOpen(false)} />  */}
            </div>
        </div>
    );
}

export default Stations;