'use client';

import { useState } from 'react';

interface SearchFormProps {
    onSearch: (query: string, country: string) => void;
    disabled?: boolean;
}

export default function SearchForm({ onSearch, disabled }: SearchFormProps) {
    const [query, setQuery] = useState('');
    const [country, setCountry] = useState('US');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            onSearch(query.trim(), country);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Main Search Section */}
            <div className="space-y-6">
                {/* Search Input with Enhanced Design */}
                <div className="relative">
                    <label htmlFor="search-query" className="block text-lg font-semibold text-gray-800 dark:text-white mb-4">
                        What product are you looking for?
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            id="search-query"
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="e.g., iPhone 16 Pro 128GB, MacBook Air M3, Samsung TV 55 inch..."
                            disabled={disabled}
                            className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 dark:border-gray-600 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed text-lg font-medium shadow-lg transition-all duration-200"
                        />
                    </div>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        💡 <strong>Tip:</strong> Include specific details like model, size, or color for better results
                    </p>
                </div>

                {/* Country Selection with Flags */}
                <div>
                    <label htmlFor="country" className="block text-lg font-semibold text-gray-800 dark:text-white mb-4">
                        Select your region
                    </label>
                    <div className="relative">
                        <select
                            id="country"
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            disabled={disabled}
                            className="w-full px-4 py-4 border-2 border-gray-200 dark:border-gray-600 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed text-lg font-medium shadow-lg appearance-none cursor-pointer transition-all duration-200"
                        >
                            <option value="US">🇺🇸 United States</option>
                            <option value="CA">🇨🇦 Canada</option>
                            <option value="UK">🇬🇧 United Kingdom</option>
                            <option value="AU">🇦🇺 Australia</option>
                            <option value="IN">🇮🇳 India</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Enhanced Search Button */}
                <button
                    type="submit"
                    disabled={disabled || !query.trim()}
                    className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-5 px-8 rounded-2xl transition-all duration-300 disabled:cursor-not-allowed transform hover:scale-[1.02] disabled:hover:scale-100 shadow-2xl text-lg relative overflow-hidden group"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    {disabled ? (
                        <span className="flex items-center justify-center relative z-10">
                            <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Searching the web...
                        </span>
                    ) : (
                        <span className="flex items-center justify-center relative z-10">
                            <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            Find Best Prices Now
                        </span>
                    )}
                </button>
            </div>

            {/* Enhanced Quick Search Suggestions */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-6 border border-blue-100 dark:border-gray-600">
                <div className="flex items-center mb-4">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">Popular searches right now:</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                        'iPhone 16 Pro',
                        'MacBook Air M3',
                        'Samsung Galaxy S24',
                        'iPad Pro 13-inch',
                        'AirPods Pro 2',
                        'Sony PlayStation 5'
                    ].map((suggestion) => (
                        <button
                            key={suggestion}
                            type="button"
                            onClick={() => setQuery(suggestion)}
                            disabled={disabled}
                            className="px-4 py-3 text-sm font-medium bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-700 dark:hover:text-blue-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-md text-left group"
                        >
                            <span className="flex items-center">
                                <svg className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                {suggestion}
                            </span>
                        </button>
                    ))}
                </div>
            </div>
        </form>
    );
}
