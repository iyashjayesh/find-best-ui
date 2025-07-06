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
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
                <div className="space-y-6">
                    <div>
                        <label htmlFor="search-query" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            What are you looking for?
                        </label>
                        <input
                            id="search-query"
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="e.g., iPhone 16 Pro, MacBook Air, Samsung TV..."
                            disabled={disabled}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                        />
                    </div>

                    {/* Country Selection */}
                    <div>
                        <label htmlFor="country" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Country/Region
                        </label>
                        <select
                            id="country"
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            disabled={disabled}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <option value="US">United States</option>
                            <option value="CA">Canada</option>
                            <option value="UK">United Kingdom</option>
                            <option value="AU">Australia</option>
                            <option value="IN">India</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={disabled || !query.trim()}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold py-4 px-8 rounded-lg transition-all duration-200 disabled:cursor-not-allowed transform hover:scale-105 disabled:hover:scale-100 shadow-lg text-lg"
                    >
                        {disabled ? (
                            <span className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Searching...
                            </span>
                        ) : (
                            <span className="flex items-center justify-center">
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                Search for Best Prices
                            </span>
                        )}
                    </button>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Popular searches:</p>
                    <div className="flex flex-wrap gap-2">
                        {[
                            'iPhone 16 Pro, 128GB',
                            'MacBook Air M3',
                            'Samsung Galaxy S24, 256GB',
                            'iPad Pro, 12.9 inch, 512GB',
                            'AirPods Pro, 2nd Gen',
                            'Sony PlayStation 5, Digital Edition',
                            'Dell XPS 13, 16GB RAM',
                            'LG OLED TV, 55 inch'
                        ].map((suggestion) => (
                            <button
                                key={suggestion}
                                type="button"
                                onClick={() => setQuery(suggestion)}
                                disabled={disabled}
                                className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {suggestion}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </form>
    );
}
