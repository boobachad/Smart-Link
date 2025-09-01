"use client";
import React, { useState } from 'react'
import Link from 'next/link';

function Otp() {

    const [otp, setOtp] = useState(["","","",""]);
    const number = localStorage.getItem("phoneNumber")

  return (
         <div style={{ fontFamily: "'Inter', sans-serif" }} className="bg-gray-100 min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-sm">
                <div className="bg-white shadow-2xl rounded-2xl p-8 text-center">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Enter OTP</h1>
                    <p className="text-gray-500 mb-6">
                        A 4-digit code was sent to <br/> <span className="font-semibold text-gray-700">+91 {number}</span>
                    </p>

                    <form>
                        <div className="flex justify-center gap-3 mb-6">
                            {otp.map((data, index) => {
                                return (
                                    <input
                                        key={index}
                                        type="text"
                                        maxLength="1"
                                        value={data}
                                        onChange={e => handleChange(e.target, index)}
                                        onFocus={e => e.target.select()}
                                        className="w-14 h-14 text-center text-2xl font-semibold border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                );
                            })}
                        </div>
                        <button type="submit" className="w-full bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition">
                            Verify OTP
                        </button>
                    </form>

                    <p className="text-sm text-gray-500 mt-6">
                        Didn't receive code? <a href="#" className="font-semibold text-blue-600 hover:underline">Resend</a>
                    </p>
                    <Link href="/" >
                     <button className="mt-4 text-sm text-gray-500 hover:text-gray-700">
                        Back to login
                    </button>
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Otp