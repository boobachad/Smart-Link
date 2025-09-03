'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';

const languages = [
    { code: 'en', name: 'English' },
    { code: 'pa', name: 'ਪੰਜਾਬੀ' },
    { code: 'hi', name: 'हिन्दी' },
    { code: 'gu', name: 'ગુજરાતી' },
];

const LanguageModal = ({ isOpen, onClose, onSelect, currentLanguage }) => {
    const { t } = useTranslation();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-sm">
                <div className="p-4 flex items-center justify-between border-b">
                    <h2 className="text-lg font-semibold">{t('profile.changeLanguage')}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        &times;
                    </button>
                </div>
                <ul className="p-2 space-y-1">
                    {languages.map((lang) => (
                        <li
                            key={lang.code}
                            onClick={() => onSelect(lang.code)}
                            className={`flex justify-between items-center p-3 rounded-md cursor-pointer hover:bg-gray-100 transition-colors ${
                                currentLanguage === lang.code ? 'bg-blue-50' : ''
                            }`}
                        >
                            <span className={`font-medium ${currentLanguage === lang.code ? 'text-blue-600' : 'text-gray-800'}`}>
                                {lang.name}
                            </span>
                            {currentLanguage === lang.code && (
                                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default LanguageModal;