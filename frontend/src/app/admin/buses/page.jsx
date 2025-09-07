'use client';
import React, { useState } from 'react'
import { Plus } from 'lucide-react';
import SideNavbar from '../_components/SideNavbar';
import ActiveBusCard from './_components/activeBusCard';
import TotalBusCard from './_components/totalBusCard';
import MaintenanceCard from './_components/maintenanceCard';
import { Trash } from 'lucide-react';
import AddBusDialogueBox from './_components/AddBusDialogueBox';
import BusPageLoadingSkeleton from './_components/BusPageLoadingSkeleton';
import { DataTable } from './_components/BusTable/data-table';
import { columns } from './_components/BusTable/columns';
import {busData} from '@/data/bus_data'

function BusesPage() {

    const [activeSection, setActiveSection] = useState('Buses');
    const [isDialogueOpen, setIsDialogueOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    if (loading) {
        return <BusPageLoadingSkeleton />
    }

    return (
        <div className="flex h-screen bg-gray-50 overflow-y-hidden">
            <SideNavbar
                activeSection={activeSection}
                setActiveSection={setActiveSection}
            // loading={loading}
            />
            <div className="flex-1 p-6">
                <div onClick={() => setIsDialogueOpen(true)} className="flex items-center justify-between mb-8 border-b-2 border-gray-200 pb-4">
                    <h1 className="text-3xl font-bold text-gray-800">Buses Fleet Managment</h1>
                    <button
                        className='flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-300 '>
                        <Plus size={20} />
                        <span>Add Buses</span>
                    </button>
                </div>

                <div className="p-4">

                    <div className='grid grid-cols-3 gap-14'>
                        <TotalBusCard />
                        <ActiveBusCard />
                        <MaintenanceCard />
                    </div>

                    <div className='mt-10 border border-gray-300 shadow-lg p-6 rounded-lg'>
                        <h2 className='text-2xl font-semibold mb-6'>All Buses</h2>
                        <div className='overflow-x-auto'>
                            <DataTable columns={columns} data={busData} />
                        </div>
                    </div>
                </div>
                <AddBusDialogueBox isOpen={isDialogueOpen} onClose={() => setIsDialogueOpen(false)} />
            </div>
        </div>
    )
}

export default BusesPage