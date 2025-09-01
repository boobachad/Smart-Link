"use client";
import React, { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation';
import { Phone, ArrowRight, BusFront, Bell, UserCircle, Search, MapPin, Flag, Ticket, Home, Snowflake, Wifi, PlugZap, Edit3, ArrowUpDown, SlidersHorizontal, Check, ArrowDown, Clock } from 'lucide-react';
import Link from 'next/link';

function Login() {

  const [number, setNumber] = useState("");
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    if(number.length === 10) {
      localStorage.setItem("phoneNumber", number);
      router.push("/OTP")
    } else if(number.length < 10) {
      alert("Enter a valid Mobile number");
    }
  };

   return (
        <div style={{ fontFamily: "'Inter', sans-serif" }} className="bg-gray-100 min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-sm">
                <div className="bg-white shadow-2xl rounded-2xl p-8">
                    <div className="flex flex-col items-center mb-3">
                        <Image 
                        src="/Smart_Link_Logo.png"
                        alt=''
                        width={250}
                        height={250}
                        />
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-600 mb-1">Phone Number</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Phone className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    // value={number}
                                    onChange={(e) => setNumber(e.target.value)}
                                    maxLength="10"
                                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                    placeholder="Enter your mobile number"
                                />
                            </div>
                        </div>

                        <button type="submit" className="w-full bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition flex items-center justify-center gap-2">
                            Send OTP <ArrowRight className="w-5 h-5" />
                        </button>

                    </form>

                     <p className="text-xs text-gray-400 mt-6 text-center">
                        By continuing, you agree to our Terms of Service and Privacy Policy.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Login