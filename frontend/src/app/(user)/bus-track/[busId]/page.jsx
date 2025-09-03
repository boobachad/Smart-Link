'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, InfoIcon } from "lucide-react";
import { mockBuses } from '@/data/buses';
import RouteMap from "./_components/RouteMap"; // Import the new map component
import StopTimeline from './_components/StopTimeline'; // Import the new timeline component
import { getCoordinates } from '../../../utils/geocode';
import BusTrackingSkeleton from './_components/BusTrackingLoadingSkeleton';

const busDetails = {
    id: 1,
    route: 'Route 101A',
    origin: 'ISBT',
    destination: 'MP Nagar',
    busNumber: 'PB-04 AB1234',
    estimatedArrival: '4:30',
    minutesRemaining: '40 mins',
    status: 'delayed 15 min',
    stops: [
        { name: 'Start', time: '3:30 AM', status: 'departed' },
        { name: 'Stop 1', time: '3:55 AM', status: 'next' },
        { name: 'Stop 2', time: '4:10', status: 'upcoming' },
        { name: 'Destination', time: '4:30', status: 'upcoming' },
    ],
    // These would ideally come from your actual bus data or map service
};

export default function BusTrackingPage() {
    const router = useRouter();
    const { busId } = useParams();

    const Bus = mockBuses.find(bus => bus.id === Number(busId));

    // In a real app, you'd fetch busDetails using busId
    // For now, we use our dummy data
    const bus = busDetails; // Assume we found the bus details

    const [coords, setCoords] = useState({ start: null, end: null });

    useEffect(() => {
        async function fetchCoords() {
        const start = await getCoordinates(Bus.origin);
        const end = await getCoordinates(Bus.destination);
        setCoords({ start, end });
        }
        fetchCoords();
    }, [Bus]);

    if (!coords.start || !coords.end) {
        return <BusTrackingSkeleton />;
    }

    return (
        <div className="bg-gray-100 min-h-screen">
            {/* Top Bar */}
            <div className="flex items-center justify-between p-4 bg-white shadow-sm">
                <button onClick={() => router.back()} className="text-gray-600">
                    <ArrowLeft />
                </button>
                <div className="flex-1 text-center">
                    <h1 className="font-semibold text-lg">{Bus.route}</h1>
                    <p className="text-sm text-gray-500">{Bus.origin} to {Bus.destination}</p>
                </div>
                <button className="text-blue-600 flex items-center space-x-1">
                    <InfoIcon />
                    <span>Report Issue</span>
                </button>
            </div>

            {/* Map Section */}
            <div className="h-68">
                <RouteMap
                    origin={Bus.origin}
                    destination={Bus.destination}
                    mapData={{
                        startCoords: coords.start,
                        endCoords: coords.end 
                    }}
                />
            </div>

            {/* Details Section */}
            <div className="bg-white rounded-t-2xl shadow-lg p-4 -mt-4 relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <p className="text-sm text-gray-500">Estimated Arrival at {bus.destination}</p>
                        <p className="text-3xl font-bold flex items-baseline">
                            {bus.estimatedArrival} <span className="ml-2 text-base font-normal text-gray-600">({bus.minutesRemaining})</span>
                        </p>
                    </div>
                    <div className="flex items-center space-x-2">
                        {/* Bus Icon */}
                        <span className="text-4xl">🚌</span>
                        <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold">
                            {bus.status}
                        </span>
                    </div>
                </div>
                <p className="text-sm text-gray-500 mb-4">Bus No: <span className="font-semibold text-gray-800">{bus.busNumber}</span></p>

                {/* Stop Timeline */}
                <StopTimeline stops={bus.stops} />
            </div>
        </div>
    );
}