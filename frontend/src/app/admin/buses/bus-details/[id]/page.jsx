'use client';
import React, { useEffect, useState } from 'react'
import { useBusDetails } from '@/hooks/useBusDetails';
import { EditIcon } from 'lucide-react';
import { useParams } from 'next/navigation';

export default function BusViewAndUpdate() {

    const { id } = useParams();

    const { busData, isEditing, isLoading, error, setIsEditing, handleSave, handleInputChange, refetch } = useBusDetails(id);
    const statusOptions = ['active', 'inactive', 'breakdown', 'maintenance'];

    const sectionTitleClass = "text-lg font-semibold text-gray-700 mb-2 border-b pb-2 border-gray-200";
    const inputClass = "w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500";
    const labelClass = "text-gray-700 font-medium";


    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleString();
    };

    console.log("Set is Editing:", isEditing);

    const navigateToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    useEffect(() => {
        refetch();
    }, [])

    // --- Conditional Rendering for UI states ---
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen p-4 bg-gray-100 font-inter">
                <div className="text-xl font-semibold text-gray-700">Loading bus details...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen p-4 bg-gray-100 font-inter">
                <div className="text-xl font-semibold text-red-600">Error: {error}</div>
            </div>
        );
    }

    const renderDetails = () => (
        <div className="flex-1 p-8 rounded-3xl w-full overflow-hidden">
            <div className='flex mb-6 gap-4 place-items-baseline cursor-pointer'>
                <p className="text-gray-600 mb-6 font-bold text-3xl">{busData.busNumber}</p>
                {/* Edit Button  */}
                <EditIcon onClick={() => setIsEditing(true)} />
            </div>
            {/* <button
                onClick={() => setIsEditing(true)}
                className="w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:bg-blue-700 transition duration-300 mb-8"
            >
                Edit Bus Details
            </button> */}

            {/* Main Content Area with sections */}
            <div className="space-y-6 ">
                {/* Vehicle Info Section */}
                <div id="vehicle-info" className="bg-white p-6 rounded-xl shadow-md">
                    <h3 className={sectionTitleClass}>Vehicle Information</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <p><strong>Make:</strong> {busData.vehicleInfo.make}</p>
                        <p><strong>Model:</strong> {busData.vehicleInfo.model}</p>
                        <p><strong>Year:</strong> {busData.vehicleInfo.year}</p>
                        <p><strong>Capacity:</strong> {busData.vehicleInfo.capacity}</p>
                        <p className="sm:col-span-2"><strong>License Plate:</strong> {busData.vehicleInfo.licensePlate}</p>
                    </div>
                </div>

                {/* Driver Info Section */}
                <div id="driver-details" className="bg-white p-6 rounded-xl shadow-md">
                    <h3 className={sectionTitleClass}>Driver Details</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <p><strong>Name:</strong> {busData.driverId.name}</p>
                        <p><strong>License Number:</strong> {busData.driverId.licenseNumber}</p>
                        {/* <p><strong>Driver ID:</strong> {busData.driver.driverId}</p> */}
                    </div>
                </div>

                {/* Status & Location Section */}
                <div id="status-location" className="bg-white p-6 rounded-xl shadow-md">
                    <h3 className={sectionTitleClass}>Status & Location</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <p>
                            <strong>Status:</strong>
                            <span className={`font-bold ${busData.currentStatus === 'inactive' ? 'text-red-600' : 'text-green-600'}`}>
                                {' '}{busData.currentStatus.toUpperCase()}
                            </span>
                        </p>
                        <p><strong>Last Updated:</strong> {formatDate(busData.location.lastUpdated)}</p>
                        <p><strong>Latitude:</strong> {busData.location.latitude}</p>
                        <p><strong>Longitude:</strong> {busData.location.longitude}</p>
                    </div>
                </div>

                {/* Schedule Section */}
                <div id="schedule" className="bg-white p-6 rounded-xl shadow-md">
                    <h3 className={sectionTitleClass}>Schedule</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <p><strong>Start Time:</strong> {busData.schedule.startTime}</p>
                        <p><strong>End Time:</strong> {busData.schedule.endTime}</p>
                        <p className="sm:col-span-2"><strong>Frequency:</strong> {busData.schedule.frequency} min</p>
                    </div>
                </div>

                {/* Maintenance Section */}
                <div id="maintenance" className="bg-white p-6 rounded-xl shadow-md">
                    <h3 className={sectionTitleClass}>Maintenance</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <p><strong>Last Service:</strong> {formatDate(busData.maintenance.lastServiceDate)}</p>
                        <p><strong>Next Service:</strong> {formatDate(busData.maintenance.nextServiceDate)}</p>
                        <p><strong>Mileage:</strong> {busData.maintenance.mileage} km</p>
                        <p><strong>Fuel Level:</strong> {busData.maintenance.fuelLevel}%</p>
                    </div>
                </div>

                {/* Operational & Tracking Data */}
                <div id="operational-data" className="bg-white p-6 rounded-xl shadow-md mb-4">
                    <h3 className={sectionTitleClass}>Operational Data</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <p><strong>Total Trips:</strong> {busData.operationalData.totalTrips}</p>
                        <p><strong>Total Distance:</strong> {busData.operationalData.totalDistance} km</p>
                        <p><strong>Average Speed:</strong> {busData.operationalData.averageSpeed} km/h</p>
                        <p><strong>On-Time %:</strong> {busData.operationalData.onTimePercentage}%</p>
                        <p>
                            <strong>Is Online:</strong>
                            <span className={`font-bold ${busData.tracking.isOnline ? 'text-green-600' : 'text-red-600'}`}>
                                {' '}{busData.tracking.isOnline ? 'YES' : 'NO'}
                            </span>
                        </p>
                        <p><strong>Last Seen:</strong> {formatDate(busData.tracking.lastSeen)}</p>
                        <p><strong>Device ID:</strong> {busData.tracking.deviceId}</p>
                        <p><strong>Signal Strength:</strong> {busData.tracking.signalStrength}</p>
                    </div>
                </div>
            </div>

        </div>
    );

    const renderEditForm = () => (
        <div className="flex-1 p-8 rounded-3xl w-full">
            <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-4xl space-y-8 mx-auto">
                <h1 className="text-4xl font-extrabold text-gray-900 text-center mb-4">
                    Edit Bus Details: {id}
                </h1>
                <div className="space-y-6">

                    {/* Vehicle Info Section */}
                    <div className="bg-gray-50 p-6 rounded-xl">
                        <h3 className={sectionTitleClass}>Vehicle Information</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <label className={labelClass}>Make</label>
                                <input
                                    type="text"
                                    value={busData.vehicleInfo?.make || ""}
                                    onChange={(e) => handleInputChange(e, "vehicleInfo", "make")}
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Model</label>
                                <input
                                    type="text"
                                    value={busData.vehicleInfo?.model || ""}
                                    onChange={(e) => handleInputChange(e, "vehicleInfo", "model")}
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Year</label>
                                <input
                                    type="number"
                                    value={busData.vehicleInfo?.year || ""}
                                    onChange={(e) => handleInputChange(e, "vehicleInfo", "year")}
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Capacity</label>
                                <input
                                    type="number"
                                    value={busData.vehicleInfo?.capacity || ""}
                                    onChange={(e) =>
                                        handleInputChange(e, "vehicleInfo", "capacity")
                                    }
                                    className={inputClass}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Driver Info Section */}
                    <div className="bg-gray-50 p-6 rounded-xl">
                        <h3 className={sectionTitleClass}>Driver Details</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <label className={labelClass}>Name</label>
                                <input
                                    type="text"
                                    value={busData.driverId?.name || ""}
                                    onChange={(e) => handleInputChange(e, "driverId", "name")}
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label className={labelClass}>License Number</label>
                                <input
                                    type="text"
                                    value={busData.driverId?.licenseNumber || ""}
                                    onChange={(e) =>
                                        handleInputChange(e, "driverId", "licenseNumber")
                                    }
                                    className={inputClass}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Status */}
                    <div className="bg-gray-50 p-6 rounded-xl">
                        <h3 className={sectionTitleClass}>Status</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <label className={labelClass}>Status</label>
                                <select
                                    value={busData.currentStatus || ""}
                                    onChange={(e) => handleInputChange(e, null, "currentStatus")}
                                    className={`${inputClass}`}
                                >
                                    <option value="" disabled>Select a status</option>
                                    {statusOptions.map((status, index) => (
                                        <option
                                            key={index}
                                            value={status}
                                        >
                                            {status.charAt(0).toUpperCase() + status.slice(1)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-4 pt-4">
                        <button
                            onClick={() => setIsEditing(false)}
                            className="bg-gray-300 text-gray-800 font-semibold py-2 px-6 rounded-xl shadow-md hover:bg-gray-400 transition duration-300"
                        >
                            Cancel
                        </button>
                        <button
                            type='button'
                            onClick={handleSave}
                            className="bg-green-600 text-white font-semibold py-2 px-6 rounded-xl shadow-md cursor-pointer hover:bg-green-700 transition duration-300"
                        >
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );


    if (isLoading) return <p>Loading bus data...</p>;
    if (error) return <p>Error: {error.message}</p>;


    return (
        <div className="flex bg-gray-100 font-inter max-h-screen">
            <>
                {/* Left Sidebar for Navigation */}
                <div className="w-1/4 max-w-xs bg-white shadow-lg p-6 rounded-r-3xl h-screen sticky top-0 self-start hidden lg:block">
                    <h2 className="text-2xl font-bold mb-6 text-gray-800">Bus Sections</h2>
                    <ul className="space-y-4">
                        <li>
                            <button onClick={() => navigateToSection('vehicle-info')} className="w-full text-left font-medium text-gray-600 hover:text-blue-600 transition duration-200">
                                Vehicle Info
                            </button>
                        </li>
                        <li>
                            <button onClick={() => navigateToSection('driver-details')} className="w-full text-left font-medium text-gray-600 hover:text-blue-600 transition duration-200">
                                Driver Details
                            </button>
                        </li>
                        <li>
                            <button onClick={() => navigateToSection('status-location')} className="w-full text-left font-medium text-gray-600 hover:text-blue-600 transition duration-200">
                                Status & Location
                            </button>
                        </li>
                        <li>
                            <button onClick={() => navigateToSection('schedule')} className="w-full text-left font-medium text-gray-600 hover:text-blue-600 transition duration-200">
                                Schedule
                            </button>
                        </li>
                        <li>
                            <button onClick={() => navigateToSection('maintenance')} className="w-full text-left font-medium text-gray-600 hover:text-blue-600 transition duration-200">
                                Maintenance
                            </button>
                        </li>
                        <li>
                            <button onClick={() => navigateToSection('operational-data')} className="w-full text-left font-medium text-gray-600 hover:text-blue-600 transition duration-200">
                                Operational Data
                            </button>
                        </li>
                    </ul>
                </div>
                {/* Main Content */}
                {isEditing ? (
                    <div className="flex-1 p-4 lg:p-8 overflow-y-auto">
                        {renderEditForm()}
                    </div>
                ) : (
                    <div className="flex-1 p-4 lg:p-8 overflow-y-auto">
                        {renderDetails()}
                    </div>
                )}

            </>
        </div>
    );
}