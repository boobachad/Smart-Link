// app/(user)/bus-track/[busId]/components/BusTrackingSkeleton.jsx
import React from 'react';

const BusTrackingSkeleton = () => {
  return (
    <div className="bg-gray-100 min-h-screen animate-pulse">
      {/* Top Bar Skeleton */}
      <div className="flex items-center justify-between p-4 bg-white shadow-sm">
        <div className="w-8 h-8 rounded-full bg-gray-200"></div>
        <div className="flex-1 text-center">
          <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-1"></div>
          <div className="h-3 bg-gray-200 rounded w-1/3 mx-auto"></div>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-5 h-5 rounded-full bg-gray-200"></div>
          <div className="h-4 w-20 rounded bg-gray-200"></div>
        </div>
      </div>

      {/* Map Section Skeleton */}
      <div className="h-68 bg-gray-200"></div>

      {/* Details Section Skeleton */}
      <div className="bg-white rounded-t-2xl shadow-lg p-4 -mt-4 relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="h-3 bg-gray-200 rounded w-40 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-48"></div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-full bg-gray-200"></div>
            <div className="h-6 w-24 rounded-full bg-gray-200"></div>
          </div>
        </div>
        <div className="h-4 bg-gray-200 rounded w-32 mb-4"></div>

        {/* Stop Timeline Skeleton */}
        <div className="relative pl-6">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="mb-4 flex items-start">
              {/* Vertical line and dot skeleton */}
              <div className="absolute left-0 top-0 bottom-0 flex flex-col items-center">
                <div className="w-4 h-4 rounded-full bg-gray-200"></div>
                {index < 3 && <div className="flex-1 w-px bg-gray-300 ml-2"></div>}
              </div>
              {/* Stop details skeleton */}
              <div className="ml-4">
                <div className="h-4 w-32 rounded bg-gray-200 mb-1"></div>
                <div className="h-3 w-40 rounded bg-gray-200"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BusTrackingSkeleton;