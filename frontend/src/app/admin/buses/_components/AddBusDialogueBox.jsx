"use client";
import React, { useState } from 'react'
import { X } from 'lucide-react';

function AddBusDialogueBox({ isOpen, onClose }) {

    const [newBus, setNewBus] = useState({
        number:'',
        model:'',
        capacity:'',
        year:'',
        routes:''
    })


    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewBus({ ...newBus, [name]: value });
    };

    const handleAddBus = (e) => {
        e.preventDefault();
        console.log("Bus Added:", newBus);
        onClose(true);
    }

    const handleCloseModal = () => {
        onClose(true);
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-white/50 flex items-center justify-center z-50">
            <div className="rounded-lg bg-white p-6 w-full max-w-md shadow-2xl">
                <div className="flex justify-between mb-4">
                    <h2 className="text-2xl font-bold mb-4">Add a New Bus</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-300">
                        <X className="w-7 h-7" />
                    </button>
                </div>
                <form onSubmit={handleAddBus}>

                    {/* Plate NUmber */}
                    <div className="mb-4">
                        <label className="block text-gray-700 font-semibold mb-2">Plate Number:</label>
                        <input
                            type="text"
                            name="number"
                            value={newBus.number}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., B-007"
                            required
                        />
                    </div>

                    {/* Bus Model */}
                    <div className="mb-4">
                        <label className="block text-gray-700 font-semibold mb-2">Model:</label>
                        
                        {/* <input
                            type="text"
                            name="busId"
                            value={newBus.busId}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., B-007"
                            required
                        /> */}
                    </div>

                    {/* Capacity */}
                    <div className="mb-4">
                        <label className="block text-gray-700 font-semibold mb-2">BusID:</label>
                        <input
                            type="text"
                            name="busId"
                            value={newBus.busId}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., B-007"
                            required
                        />
                    </div>

                    {/* Year */}
                    <div className="mb-4">
                        <label className="block text-gray-700 font-semibold mb-2">BusID:</label>
                        <input
                            type="text"
                            name="busId"
                            value={newBus.busId}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., B-007"
                            required
                        />
                    </div>

                    {/* Routes */}
                    <div className="mb-4">
                        <label className="block text-gray-700 font-semibold mb-2">BusID:</label>
                        <input
                            type="text"
                            name="busId"
                            value={newBus.busId}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., B-007"
                            required
                        />
                    </div>


                    
                    {/* Submit Button  */}
                    <div className="flex justify-end space-x-4">
                        <button
                            type="button"
                            onClick={handleCloseModal}
                            className="px-4 py-2 text-gray-600 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors"
                        >
                            Add Bus
                        </button>
                    </div>
                </form>
            </div>
            </div>
    )
}

export default AddBusDialogueBox