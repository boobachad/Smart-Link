import React from 'react'
import { Bell, UserCircle, BusFront } from 'lucide-react';
import Link from 'next/link';

function Header() {
  return (
    <header className="p-4 bg-white sticky top-0 z-20 shadow-sm">
      <div className="max-w-4xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center justify-center bg-blue-600 text-white w-8 h-8 rounded-full">
            <BusFront className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold text-gray-800">SmartLink</h1>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/notification">
            <Bell className="text-gray-500 cursor-pointer" />
          </Link>
          <Link href="/profile" >
            <UserCircle className="text-gray-500 cursor-pointer w-8 h-8" />
          </Link>
        </div>
      </div>
    </header>
  )
}

export default Header