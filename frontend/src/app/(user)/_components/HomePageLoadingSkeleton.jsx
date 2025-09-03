import React from 'react';

const HomePageSkeleton = () => {
  return (
    <div className="bg-gray-100 min-h-screen pb-20 animate-pulse">
      {/* Header Skeleton */}
      <div className="bg-white p-4 shadow-sm h-16">
        <div className="w-24 h-4 bg-gray-200 rounded"></div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-4">
        {/* Search Card Skeleton */}
        <div className="bg-white p-6 rounded-2xl shadow-lg mb-6">
          <div className="h-6 w-3/4 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-4">
            <div className="relative h-12 bg-gray-200 rounded-lg">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 bg-gray-300 rounded-full"></div>
            </div>
            <div className="relative h-12 bg-gray-200 rounded-lg">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 bg-gray-300 rounded-full"></div>
            </div>
            <div className="w-full h-12 bg-gray-600 rounded-lg"></div>
          </div>
        </div>

        {/* Quick Actions Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="bg-white p-4 rounded-lg flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-gray-200 mb-2"></div>
              <div className="h-4 w-12 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>

        {/* Nearby Stops Skeleton */}
        <div className="mb-6">
          <div className="h-6 w-1/3 bg-gray-200 rounded mb-3"></div>
          <div className="space-y-3">
            {[...Array(2)].map((_, index) => (
              <div key={index} className="bg-white p-4 rounded-lg flex justify-between items-center">
                <div>
                  <div className="h-4 w-40 bg-gray-200 rounded mb-1"></div>
                  <div className="h-3 w-20 bg-gray-200 rounded"></div>
                </div>
                <div className="h-4 w-12 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>

        {/* My Ticket Skeleton */}
        <div>
          <div className="h-6 w-1/4 bg-gray-200 rounded mb-3"></div>
          <div className="bg-gray-600 text-white p-6 rounded-2xl shadow-xl relative overflow-hidden h-48">
            <div className="relative z-10 space-y-4">
              <div className="h-4 w-1/3 bg-white/20 rounded"></div>
              <div className="h-6 w-2/3 bg-white/20 rounded"></div>
              <div className="h-3 w-1/4 bg-white/20 rounded mt-6"></div>
              <div className="h-4 w-1/2 bg-white/20 rounded"></div>
              <div className="absolute top-4 right-4 h-6 w-16 bg-white/20 rounded-full"></div>
              <div className="absolute bottom-6 right-4 h-10 w-24 bg-white/50 rounded-lg"></div>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Navigation Skeleton */}
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-white shadow-top z-50 flex justify-around items-center">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="w-12 h-12 bg-gray-200 rounded-full"></div>
        ))}
      </div>
    </div>
  );
};

export default HomePageSkeleton;