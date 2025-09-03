"use client";
import React, { useState, useEffect } from 'react'
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

function Otp() {

    const [otp, setOtp] = useState(new Array(4).fill(""));
    const [error, setError] = useState("");
    const router = useRouter();
    const ssearchParams = useSearchParams();

    const number = ssearchParams.get("number")

    const handleChange = (value, index) => {
        if (/[^0-9]/.test(value)) return;
        const newOtp = [...otp]
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < otp.length - 1) {
            document.getElementById(`otp-input-${index + 1}`).focus();
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        const enteredOtp = otp.join("");
        localStorage.setItem("number", number);
        router.push("/home");
    };

    return (
        <div style={{ fontFamily: "'Inter', sans-serif" }} className="bg-gray-100 min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-sm">
                <div className="bg-white shadow-2xl rounded-2xl p-8 text-center">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Enter OTP</h1>
                    <p className="text-gray-500 mb-6">
                        A 4-digit code was sent to <br /> <span className="font-semibold text-gray-700">+91 {number}</span>
                    </p>

                    <form onSubmit={handleSubmit}>
                        <div className="flex justify-center gap-3 mb-6">
                            {otp.map((data, index) => {
                                return (
                                    <input
                                        key={index}
                                        id={`otp-input-${index}`}
                                        type="tel"
                                        maxLength="1"
                                        value={data}
                                        onChange={e => handleChange(e.target.value, index)}
                                        onFocus={e => e.target.select()}
                                        inputMode="numeric"
                                        className="w-12 h-12 text-center text-xl font-semibold border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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