import React from 'react'
import { BusFront } from "lucide-react";

const NearbyStop = ({ name, distance, liveBuses }) => (
    <div className="bg-white p-4 rounded-xl shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <BusFront className="w-5 h-5 text-blue-600" />
            </div>
            <div>
                <p className="font-semibold text-gray-800">{name}</p>
                <p className="text-xs text-gray-500">{distance}</p>
            </div>
        </div>
        <div className="text-right">
             <div className="text-sm font-semibold text-green-600">{liveBuses} Live</div>
             <p className="text-xs text-gray-500">buses</p>
        </div>
    </div>
);

export default NearbyStop;
