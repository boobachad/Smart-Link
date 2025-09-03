import React from 'react'
import { UserCircle, Search, Ticket, Home } from 'lucide-react';

const BottomNavItem = ({ icon, label, active }) => (
  <a
    href="#"
    className={`text-center flex flex-col items-center w-1/4 ${
      active ? "text-blue-600" : "text-gray-500 hover:text-blue-600"
    }`}
  >
    {icon}
    <span className={`text-xs ${active ? "font-semibold" : ""}`}>
      {label}
    </span>
  </a>
);

function BottomNavbar() {
    return (
        <nav className="fixed bottom-0 z-50 left-0 right-0 bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
            <div className="max-w-4xl mx-auto flex justify-around items-center h-16">
                <BottomNavItem icon={<Home />} label="Home" active />
                <BottomNavItem icon={<Search />} label="Search" />
                <BottomNavItem icon={<Ticket />} label="My Tickets" />
            </div>
        </nav>
    )
}

export default BottomNavbar