'use client';
import React, { useState, useEffect } from 'react';
import { Bus, ChartColumn, Route, BusFront, MapPin } from 'lucide-react';
import SideNavbarLoadingSkeleton from './SideNavbarLoadingSkeleton';
import { useRouter } from 'next/navigation';

function SideNavbar({ activeSection, setActiveSection, loading }) {
    const [isLoading, setIsLoading] = useState(loading);
    const router = useRouter();

    const sections = [
        { name: 'Dashboard', icon: <ChartColumn size={20} />, link: '/admin/dashboard' },
        { name: 'Routes', icon: <Route size={20} />, link: '/admin/routes' },
        { name: 'Buses', icon: <BusFront size={20} />, link: '/admin/buses' },
        { name: 'Station', icon: <MapPin size={20} />, link: '/admin/station' },
    ];

    const handleSectionClick = (sectionName, sectionLink) => {
        setActiveSection(sectionName);
        router.push(sectionLink);
    };

    useEffect(() => {
        let timer;
        if (loading) {
            timer = setTimeout(() => {
                setIsLoading(false);
            }, 1500);
        }
        return () => clearTimeout(timer);
    }, [loading]);

    if (isLoading) {
        return <SideNavbarLoadingSkeleton />;
    }

    return (
        <div className="w-64 h-screen border border-gray-200 bg-gray-100 flex flex-col">
            <div className="p-4 flex items-center gap-2 border-b border-gray-200">
                <Bus size={32} className="text-blue-600" />
                <p className="text-xl font-semibold">Smart_Link</p>
            </div>
            <div className="flex flex-col space-y-2 mt-4">
                {sections.map((section) => (
                    <div
                        key={section.name}
                        onClick={() => handleSectionClick(section.name, section.link)}
                        tabIndex={0}
                        className={`
                                px-4 py-2 flex items-center gap-2 cursor-pointer
                                rounded-lg mx-2 transition-all duration-300
                                ${activeSection === section.name
                                ? 'bg-slate-200 shadow-md transform scale-105 font-semibold text-blue-600'
                                : 'hover:bg-gray-200'}
                            `}
                    >
                        {section.icon}
                        <p className="text-md font-medium">{section.name}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
export default SideNavbar;