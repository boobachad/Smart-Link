import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function BusCard({ bus}) {

    const router = useRouter();
    const searchParams = useSearchParams();

    const handleTrackClick = () => {
        router.push(`/bus-track/${encodeURIComponent(bus.id)}`)
    };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-lg">{bus.route}</h3>
          <p className="text-sm text-gray-500">{bus.description}</p>
        </div>
        <span className={`px-2 py-1 text-xs rounded-full ${bus.statusColor}`}>
          {bus.status}
        </span>
      </div>

      <div className="flex items-center justify-between mt-4">
        <div>
          <p className="font-medium text-lg">{bus.startTime}</p>
          <p className="text-sm text-gray-500">{bus.origin}</p>
        </div>
        <div className="flex-1 mx-4 text-center">
          <div className="flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-gray-400"></div>
            <div className="flex-1 h-px bg-gray-400 border-dashed border-t"></div>
            <div className="w-2 h-2 rounded-full bg-gray-400"></div>
          </div>
          <p className="text-xs text-gray-500 mt-1">{bus.duration}</p>
        </div>
        <div className="text-right">
          <p className="font-medium text-lg">{bus.endTime}</p>
          <p className="text-sm text-gray-500">{bus.destination}</p>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 border-t pt-4">
        <span className="font-bold text-xl">₹ {bus.price}</span>
        <div className="flex space-x-2">
          <button className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg">
            Book
          </button>
          <button 
          onClick={handleTrackClick}
          className="px-4 py-2 text-white bg-blue-600 rounded-lg">
            Track
          </button>
        </div>
      </div>
    </div>
  );
}