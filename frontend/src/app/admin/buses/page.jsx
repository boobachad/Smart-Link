'use client';
import React, { useState } from 'react'
import { Plus } from 'lucide-react';
import SideNavbar from '../_components/SideNavbar';
import ActiveBusCard from './_components/activeBusCard';
import TotalBusCard from './_components/totalBusCard';
import MaintenanceCard from './_components/maintenanceCard';
import { Trash } from 'lucide-react';
import AddBusDialogueBox from './_components/AddBusDialogueBox';

function BusesPage() {

    const [activeSection, setActiveSection] = useState('Buses');
    const [isDialogueOpen, setIsDialogueOpen] = useState(false);

    return (
        <div className="flex h-screen bg-gray-50">
            <SideNavbar
                activeSection={activeSection}
                setActiveSection={setActiveSection}
            // loading={loading}
            />
            <div className="flex-1 p-8">
                <div onClick={() => setIsDialogueOpen(true)} className="flex items-center justify-between mb-8 border-b-2 border-gray-200 pb-4">
                    <h1 className="text-3xl font-bold text-gray-800">Buses Fleet Managment</h1>
                    <button
                     className='flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-300 '>
                        <Plus size={20} />
                        <span>Add Buses</span>
                    </button>
                </div>

                <div className="p-8">

                    <div className='grid grid-cols-3 gap-14'>
                        <TotalBusCard />
                        <ActiveBusCard />
                        <MaintenanceCard />    
                    </div>

                    <div className='mt-14 border border-gray-300 shadow-lg p-6 rounded-lg'>
                        <h2 className='text-2xl font-semibold mb-6'>All Buses</h2>
                        <div className='overflow-x-auto'>
                            <table className='min-w-full border-b-gray-200'>
                                <thead className='hover:bg-gray-200'>
                                    <tr>
                                        <th className='py-3 px-6 border-b border-gray-200 text-center text-sm font-semibold text-gray-700'>Bus ID</th>
                                        <th className='py-3 px-6 border-b border-gray-200 text-center text-sm font-semibold text-gray-700'>Model</th>
                                        <th className='py-3 px-6 border-b border-gray-200 text-center text-sm font-semibold text-gray-700'>License Plate</th>
                                        <th className='py-3 px-6 border-b border-gray-200 text-center text-sm font-semibold text-gray-700'>Capacity</th>
                                        <th className='py-3 px-6 border-b border-gray-200 text-center text-sm font-semibold text-gray-700'>Status</th>
                                        <th className='py-3 px-6 border-b border-gray-200 text-center text-sm font-semibold text-gray-700'>Year</th>
                                        <th className='py-3 px-6 border-b border-gray-200 text-center text-sm font-semibold text-gray-700'>Assigned Routes</th>
                                        <th className='py-3 px-6 border-b border-gray-200 text-center text-sm font-semibold text-gray-700'>Last Maintenance</th>
                                        <th className='py-3 px-6 border-b border-gray-200 text-center text-sm font-semibold text-gray-700'>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* Example Row */}
                                    <tr className='hover:bg-gray-50'>
                                        <td className='py-4 px-6 border-b text-center border-gray-200 text-sm text-gray-700'>BUS1234</td>
                                        <td className='py-4 px-6 border-b text-center border-gray-200 text-sm text-gray-700'>Volvo 9700</td>
                                        <td className='py-4 px-6 border-b text-center border-gray-200 text-sm text-gray-700'>ABC-1234</td>
                                        <td className='py-4 px-6 border-b text-center border-gray-200 text-sm text-gray-700'>50</td>
                                        <td className='py-4 px-6 border-b text-center border-gray-200 text-sm text-green-600 font-semibold'>Active</td>
                                        <td className='py-4 px-6 border-b text-center border-gray-200 text-sm text-gray-700'>2024-06-15</td>
                                        <td className='py-4 px-6 border-b text-center border-gray-200 text-sm text-gray-700'>Route-1A1</td>
                                        <td className='py-4 px-6 border-b text-center border-gray-200 text-sm text-gray-700'>2024-06-15</td>
                                        <td className='py-4 px-6 border-b text-center border-gray-200 text-sm text-gray-700'><Trash className='text-red-500' size={16} /></td>
                                    </tr>
                                    {/* More rows can be added here */}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                <AddBusDialogueBox isOpen={isDialogueOpen} onClose={() => setIsDialogueOpen(false)} />
            </div>
        </div>
    )
}

export default BusesPage