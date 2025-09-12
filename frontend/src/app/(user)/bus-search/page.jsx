"use client";
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { mockBuses } from "../../../data/buses"
import { ArrowUpDown, SlidersHorizontal } from "lucide-react"
import BusCard from './_components/BusCard';
import BusSearchSkeleton from './_components/BusSearchLoadingPageSkeleton';

export default function BusSearchPage() {

  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [buses, setBuses] = useState([]);

  const fromLocation = searchParams.get('from') || '';
  const toLocation = searchParams.get('to') || '';

  if (isLoading) {
    return <BusSearchSkeleton />
  }

    useEffect(() => {
    setTimeout(() => {
      const filteredBuses = mockBuses.filter((bus) => {
        const isMatchingFrom = bus.origin.toLowerCase() === fromLocation.toLowerCase();
        const isMatchingTo = bus.destination.toLowerCase() === toLocation.toLowerCase();
        return isMatchingFrom && isMatchingTo;
      });
      setBuses(filteredBuses);
      setIsLoading(false);
    }, 1500);
  }, [fromLocation, toLocation]);


  return (
    <div className="bg-gray-100 min-h-screen p-4">
      <div className="max-w-md mx-auto">
        {/* <SearchBar /> */}
        <div className="flex items-center justify-between mt-6 mb-4 text-sm text-gray-600">
          <span>Found {buses.length} buses</span>
          <div className="flex space-x-4">
            <button className="flex items-center space-x-1">
              <ArrowUpDown size={18} />
              <span>Sort</span>
            </button>
            <button className="flex items-center space-x-1">
              <SlidersHorizontal size={18} />
              <span>Filter</span>
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {buses.map((bus) => (
            <BusCard
              key={bus.id}
              bus={bus}
            />
          ))}
        </div>
      </div>
    </div>
  );
}