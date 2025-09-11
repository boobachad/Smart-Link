"use client";
import { useState, useEffect } from 'react';
import { Search, MapPin, Flag, BusFront } from 'lucide-react';
import Header from '../_components/Header';
import { useRouter } from 'next/navigation';
import BottomNavbar from '../_components/BottomNavbar';
import NearbyStop from '../_components/NearbyStops';
import HomePageSkeleton from '../_components/HomePageLoadingSkeleton';
import { useStation } from '@/hooks/useStation';

const QuickActionButton = ({ icon, label }) => (
    <div className="bg-white p-4 rounded-2xl shadow-sm text-center flex flex-col items-center justify-center gap-2 cursor-pointer hover:shadow-md transition">
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">{icon}</div>
        <p className="text-sm font-semibold text-gray-700">{label}</p>
    </div>
);

export default function HomePage() {
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [fromSuggestions, setFromSuggestions] = useState([]);
    const [toSuggestions, setToSuggestions] = useState([]);
    const [showFromSuggestions, setShowFromSuggestions] = useState(false);
    const [showToSuggestions, setShowToSuggestions] = useState(false);

    const { station, loading, error } = useStation(1,1000);
    const router = useRouter();

    const handleSearch = () => {
        console.log("Search Result", from , to)
        // router.push(`/bus-search?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`);
    };

    // Suggestion logic for 'from' input
    useEffect(() => {
        if (from && station?.length) {
            const filtered = station.filter(s => s.name?.toLowerCase().includes(from.toLowerCase()));
            setFromSuggestions(filtered.slice(0, 6));
            setShowFromSuggestions(true);
        } else {
            setFromSuggestions([]);
            setShowFromSuggestions(false);
        }
    }, [from, station]);

    // Suggestion logic for 'to' input
    useEffect(() => {
        if (to && station?.length) {
            const filtered = station.filter(s => s.name?.toLowerCase().includes(to.toLowerCase()));
            setToSuggestions(filtered.slice(0, 6));
            setShowToSuggestions(true);
        } else {
            setToSuggestions([]);
            setShowToSuggestions(false);
        }
    }, [to, station]);

    if(loading) {
        return <HomePageSkeleton />
    }

    return (
        <div className="bg-gray-100 min-h-screen pb-20">
            {/* Header */}
            <Header />

            {/* Main Content */}
            <main className="max-w-4xl mx-auto p-4">
                {/* Search Card */}
                <div className="bg-white p-6 rounded-2xl shadow-lg mb-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Where are you going?</h2>
                    <div className="space-y-4">
                        <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={from}
                                onChange={(e) => setFrom(e.target.value)}
                                onFocus={() => setShowFromSuggestions(true)}
                                onBlur={() => setTimeout(() => setShowFromSuggestions(false), 150)}
                                placeholder="From: Enter starting point"
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 bg-gray-50 rounded-lg focus:ring-2 focus:ring-blue-500" />
                            {showFromSuggestions && fromSuggestions.length > 0 && (
                                <ul className="absolute left-0 right-0 top-full bg-white border border-gray-200 rounded-lg shadow-lg z-10 mt-1 max-h-48 overflow-y-auto">
                                    {fromSuggestions.map((s, idx) => (
                                        <li
                                            key={s._id || s.id || idx}
                                            className="px-4 py-2 cursor-pointer hover:bg-blue-100"
                                            onMouseDown={() => { setFrom(s.name); setShowFromSuggestions(false); }}
                                        >
                                            {s.name}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        <div className="relative">
                            <Flag className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={to}
                                onChange={(e) => setTo(e.target.value)}
                                onFocus={() => setShowToSuggestions(true)}
                                onBlur={() => setTimeout(() => setShowToSuggestions(false), 150)}
                                placeholder="To: Enter destination"
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 bg-gray-50 rounded-lg focus:ring-2 focus:ring-blue-500" />
                            {showToSuggestions && toSuggestions.length > 0 && (
                                <ul className="absolute left-0 right-0 top-full bg-white border border-gray-200 rounded-lg shadow-lg z-10 mt-1 max-h-48 overflow-y-auto">
                                    {toSuggestions.map((s, idx) => (
                                        <li
                                            key={s._id || s.id || idx}
                                            className="px-4 py-2 cursor-pointer hover:bg-blue-100"
                                            onMouseDown={() => { setTo(s.name); setShowToSuggestions(false); }}
                                        >
                                            {s.name}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        <button 
                        onClick={handleSearch}
                        className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg shadow-md hover:bg-blue-700 flex items-center justify-center gap-2">
                            <Search className="w-5 h-5" /> Search Buses
                        </button>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <QuickActionButton icon={<BusFront className="text-blue-600" />} label="Bus" />
                    <QuickActionButton icon={<MapPin className="text-green-600" />} label="Live Map" />
                </div>

                {/* Nearby Stops */}
                <div className="mb-6">
                    <h3 className="font-semibold text-gray-800 mb-3">Nearby Stops</h3>
                    <div className="space-y-3">
                        <NearbyStop name="Swargate Bus Stand" distance="500m away" liveBuses={3} />
                        <NearbyStop name="Pune Station" distance="2.1km away" liveBuses={5} />
                    </div>
                </div>

                {/* My Ticket */}
                <div>
                    <h3 className="font-semibold text-gray-800 mb-3">My Ticket</h3>
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-6 rounded-2xl shadow-xl relative overflow-hidden">
                        <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full"></div>
                        <div className="absolute bottom-4 left-4 w-16 h-16 bg-white/10 rounded-full"></div>
                        <div className="relative z-10">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm opacity-80">Route 101A</p>
                                    <p className="text-xl font-bold">Pune to Mumbai</p>
                                </div>
                                <div className="bg-white/20 px-3 py-1 rounded-full text-xs font-semibold">
                                    LIVE
                                </div>
                            </div>
                            <div className="mt-6 flex justify-between items-end">
                                <div>
                                    <p className="text-sm opacity-80">Departure</p>
                                    <p className="font-semibold text-lg">13:30</p>
                                </div>
                                <button className="bg-white text-blue-600 font-bold py-2 px-4 rounded-lg">
                                    View Details
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Bottom Navigation */}
            <BottomNavbar />

        </div>
    );
};