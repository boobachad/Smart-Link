import React from 'react';

const BusSearchSkeleton = () => {
  return (
    <div className="bg-gray-100 min-h-screen p-4 animate-pulse">
      <div className="max-w-md mx-auto">
        {/* Search Bar Skeleton */}
        <div className="h-12 bg-white rounded-xl shadow-sm"></div>

        {/* Header and Filter Buttons Skeleton */}
        <div className="flex items-center justify-between mt-6 mb-4 text-sm text-gray-600">
          <div className="h-4 w-24 bg-gray-200 rounded"></div>
          <div className="flex space-x-4">
            <div className="flex items-center space-x-1">
              <div className="h-5 w-5 bg-gray-200 rounded-full"></div>
              <div className="h-4 w-12 bg-gray-200 rounded"></div>
            </div>
            <div className="flex items-center space-x-1">
              <div className="h-5 w-5 bg-gray-200 rounded-full"></div>
              <div className="h-4 w-12 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>

        {/* Bus Card Skeletons */}
        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm p-4">
              {/* Bus Route and Status Skeleton */}
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="h-5 w-24 bg-gray-200 rounded mb-1"></div>
                  <div className="h-3 w-32 bg-gray-200 rounded"></div>
                </div>
                <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
              </div>

              {/* Time and Price Skeleton */}
              <div className="flex items-center justify-between mt-4">
                <div className="h-5 w-20 bg-gray-200 rounded"></div>
                <div className="h-5 w-12 bg-gray-200 rounded"></div>
                <div className="h-5 w-20 bg-gray-200 rounded"></div>
              </div>

              {/* Action Buttons Skeleton */}
              <div className="flex items-center justify-between mt-4 border-t pt-4">
                <div className="h-6 w-16 bg-gray-200 rounded"></div>
                <div className="flex space-x-2">
                  <div className="h-10 w-20 bg-gray-200 rounded-lg"></div>
                  <div className="h-10 w-20 bg-gray-200 rounded-lg"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BusSearchSkeleton;