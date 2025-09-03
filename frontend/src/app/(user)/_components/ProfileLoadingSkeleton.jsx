import React from 'react';

const ProfilePageSkeleton = () => {
  return (
    <div className="bg-gray-100 min-h-screen animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-center p-4 bg-white shadow-sm">
        <div className="w-6 h-6 bg-gray-200 rounded-full mr-4"></div>
        <div className="h-6 w-24 bg-gray-200 rounded"></div>
      </div>

      {/* Mobile Number Card Skeleton */}
      <div className="p-4">
        <div className="bg-white p-4 rounded-lg shadow-sm flex items-center space-x-4">
          <div className="w-5 h-5 bg-gray-200 rounded-full"></div>
          <div className="h-6 w-36 bg-gray-200 rounded"></div>
        </div>
      </div>

      {/* Menu Options Skeleton */}
      <div className="bg-white mt-4 mx-4 rounded-lg shadow-sm">
        <ul className="divide-y divide-gray-200">
          {[...Array(4)].map((_, index) => (
            <li key={index} className="flex items-center space-x-4 p-4">
              <div className="w-5 h-5 bg-gray-200 rounded-full"></div>
              <div className="h-4 w-40 bg-gray-200 rounded"></div>
            </li>
          ))}
        </ul>
      </div>

      {/* Logout Button Skeleton */}
      <div className="p-4 mt-8">
        <div className="w-full h-12 bg-gray-200 rounded-lg shadow-sm"></div>
      </div>
    </div>
  );
};

export default ProfilePageSkeleton;