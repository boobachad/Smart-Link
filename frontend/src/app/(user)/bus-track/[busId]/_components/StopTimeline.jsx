// app/(user)/bus-track/[busId]/components/StopTimeline.jsx
import React from 'react';

const StopTimeline = ({ stops }) => {
  return (
    <div className="relative pl-6 overflow-y-scroll">
      {stops.map((stop, index) => (
        <div key={index} className="mb-4 flex items-start">
          {/* Vertical line and dot */}
          {/* <div className="absolute left-0 top-0 bottom-0 flex flex-col items-center">
            {stop.status === 'departed' && (
              <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              </div>
            )}
            {stop.status === 'next' && (
              <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white"></div>
              </div>
            )}
            {stop.status === 'upcoming' && (
              <div className="w-4 h-4 rounded-full border-2 border-gray-400"></div>
            )}
            {stop.status === 'destination' && ( // For the final destination marker
              <div className="w-4 h-4 rounded-full bg-black flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              </div>
            )}
            {index < stops.length - 1 && (
              <div className={`flex-1 w-px ${stop.status === 'departed' ? 'bg-green-500' : 'bg-gray-300'} ml-2`}></div>
            )}
          </div> */}

          {/* Stop details */}
          <div className="ml-4">
            <h3 className={`font-semibold`}>
              {stop.coordinates}
            </h3>
            <p className="text-sm text-gray-500">
              {stop.scheduledTime}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StopTimeline;