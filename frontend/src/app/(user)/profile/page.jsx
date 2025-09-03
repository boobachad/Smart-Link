'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User, BusFront, Globe, CircleAlert, Headset, LogOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LanguageModal from '../_components/LanguageModal';

const ProfilePage = () => {
    const router = useRouter();
    const { t, i18n } = useTranslation();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const userMobileNumber = localStorage.getItem("number");

    const handleLogout = () => {
        console.log('User logged out');
        router.push('/login');
    };

    const handleLanguageChange = (lng) => {
        i18n.changeLanguage(lng);
        setIsModalOpen(false);
        console.log(`Language changed to: ${lng}`);
    };

    const handleBackClick = () => {
        if (window.history.length > 1) {
            router.back();
        } else {
            router.push('/home'); 
        }
    };

    return (
        <div className="bg-gray-100 min-h-screen">
            {/* Header */}
            <div className="flex items-center p-4 bg-white shadow-sm">
                <button onClick={handleBackClick} className="text-gray-600 mr-4">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-xl font-bold">{t('profile.account')}</h1>
            </div>

            {/* Mobile Number Card */}
            <div className="p-4">
                <div className="bg-white p-4 rounded-lg shadow-sm flex items-center space-x-4">
                    <User className="text-gray-400" size={20} />
                    <span className="text-lg font-semibold text-gray-800">{userMobileNumber}</span>
                </div>
            </div>

            {/* Menu Options */}
            <div className="bg-white mt-4 mx-4 rounded-lg shadow-sm">
                <ul className="divide-y divide-gray-200">
                    <li className="flex items-center space-x-4 p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                        <BusFront className="text-gray-600" size={20} />
                        <span className="text-gray-800">{t('profile.busStopsNearMe')}</span>
                    </li>
                    <li 
                        className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => setIsModalOpen(true)}
                    >
                        <div className="flex items-center space-x-4">
                            <Globe className="text-gray-600" size={20} />
                            <span className="text-gray-800">{t('profile.changeLanguage')}</span>
                        </div>
                        <span className="text-gray-500 text-sm">
                            {i18n.language === 'pa' ? t('language.punjabi') : 'English'}
                        </span>
                    </li>
                    <li className="flex items-center space-x-4 p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                        <CircleAlert className="text-red-500" size={20} />
                        <span className="text-gray-800">{t('profile.sos')}</span>
                    </li>
                    <li className="flex items-center space-x-4 p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                        <Headset className="text-gray-600" size={20} />
                        <span className="text-gray-800">{t('profile.customerSupport')}</span>
                    </li>
                </ul>
            </div>

            {/* Logout Button */}
            <div className="p-4 mt-8">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center space-x-2 bg-white text-red-500 font-semibold py-3 px-4 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
                >
                    <LogOut size={20} />
                    <span>{t('profile.logout')}</span>
                </button>
            </div>

            {/* Language Selection Modal */}
            <LanguageModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSelect={handleLanguageChange}
                currentLanguage={i18n.language}
            />
        </div>
    );
};

export default ProfilePage;