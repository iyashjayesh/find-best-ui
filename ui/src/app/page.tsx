'use client';

import { useState } from 'react';
import LoadingSpinner from './components/LoadingSpinner';
import ResultsDisplay from './components/ResultsDisplay';
import SearchForm from './components/SearchForm';

export interface Product {
  productName: string;
  price: string;
  currency: string;
  link: string;
}

export default function Home() {
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');

  const handleSearch = async (query: string, country: string) => {
    setLoading(true);
    setError(null);
    setSearchQuery(query);
    setSelectedCountry(country);
    setResults([]);

    try {
      // Call your Go backend API
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          country,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while searching');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800">
      {/* Navigation Bar */}
      <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">PriceHunter</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">Powered by AI</span>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <header className="text-center mb-16">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 mb-6 leading-tight">
              Smart Price Discovery
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              Compare prices across <span className="font-semibold text-blue-600 dark:text-blue-400">50+ retailers</span> worldwide.
              Find the best deals in seconds, not hours.
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500 dark:text-gray-400 mb-8">
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Real-time pricing</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Global coverage</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>No ads or tracking</span>
              </div>
            </div>
          </div>
        </header>

        {/* Search Form */}
        <div className="max-w-3xl mx-auto mb-16">
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 p-8">
            <SearchForm onSearch={handleSearch} disabled={loading} />
          </div>
        </div>

        {/* Stats Bar */}
        {!loading && !error && (
          <div className="max-w-4xl mx-auto mb-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/20 dark:border-gray-700/50">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">50+</div>
                <div className="text-gray-600 dark:text-gray-400 text-sm">Retailers Covered</div>
              </div>
              <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/20 dark:border-gray-700/50">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">&lt;5s</div>
                <div className="text-gray-600 dark:text-gray-400 text-sm">Average Search Time</div>
              </div>
              <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/20 dark:border-gray-700/50">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                  {results.length > 0 ? results.length : '∞'}
                </div>
                <div className="text-gray-600 dark:text-gray-400 text-sm">
                  {results.length > 0 ? 'Results Found' : 'Possibilities'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 p-12">
              <div className="flex flex-col items-center justify-center">
                <div className="relative mb-8">
                  <LoadingSpinner />
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full opacity-20 animate-ping"></div>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                  Searching the web for "{searchQuery}"
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-center max-w-md mb-6">
                  Our AI is scanning thousands of products across multiple retailers to find you the best deals
                </p>
                <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span>Analyzing prices...</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="max-w-3xl mx-auto mb-12">
            <div className="bg-red-50/80 dark:bg-red-900/30 backdrop-blur-sm border border-red-200/50 dark:border-red-800/50 rounded-2xl p-8 shadow-lg">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 19c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
                    Search Temporarily Unavailable
                  </h3>
                  <p className="text-red-700 dark:text-red-300 mb-4">
                    {error}
                  </p>
                  <div className="text-sm text-red-600 dark:text-red-400">
                    <p>• Check your internet connection</p>
                    <p>• Try a different search term</p>
                    <p>• Wait a moment and try again</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {!loading && results.length > 0 && (
          <div className="max-w-7xl mx-auto">
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
                <div className="flex items-center justify-between text-white">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Search Results</h2>
                    <p className="opacity-90">Found products for "{searchQuery}"</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold">{results.length}</div>
                    <div className="text-sm opacity-90">Total Results</div>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <ResultsDisplay results={results} searchQuery={searchQuery} selectedCountry={selectedCountry} />
              </div>
            </div>
          </div>
        )}

        {/* No Results */}
        {!loading && !error && results.length === 0 && searchQuery && (
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 p-12">
              <div className="w-20 h-20 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-full mx-auto mb-6 flex items-center justify-center">
                <svg className="w-10 h-10 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                No Products Found
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                We couldn't find any products matching "<span className="font-semibold">{searchQuery}</span>".
                This might be because the product is not available at our partner retailers.
              </p>
              <div className="text-sm text-gray-500 dark:text-gray-400 space-y-2">
                <p>💡 <strong>Try these tips:</strong></p>
                <p>• Use different or simpler keywords</p>
                <p>• Check your spelling</p>
                <p>• Try a more generic product name</p>
                <p>• Search for the brand name only</p>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="text-center mt-20 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-gray-700/50 p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                <div className="text-center">
                  <h4 className="font-semibold text-gray-800 dark:text-white mb-3">Supported Retailers</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Amazon, Apple, Walmart, Best Buy, Target, eBay, and 40+ more
                  </p>
                </div>
                <div className="text-center">
                  <h4 className="font-semibold text-gray-800 dark:text-white mb-3">Global Coverage</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    US, Canada, UK, India, Australia with localized pricing
                  </p>
                </div>
                <div className="text-center">
                  <h4 className="font-semibold text-gray-800 dark:text-white mb-3">Technology</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Powered by Go backend with Google Search API
                  </p>
                </div>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  © 2025 PriceHunter. Built with ❤️ using Next.js and Go
                </p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
