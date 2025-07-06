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

  const handleSearch = async (query: string, country: string) => {
    setLoading(true);
    setError(null);
    setSearchQuery(query);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-800 dark:text-white mb-4">
            Price Comparison Tool
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Find the best prices across multiple retailers instantly
          </p>
        </header>

        {/* Search Form */}
        <div className="max-w-2xl mx-auto mb-12">
          <SearchForm onSearch={handleSearch} disabled={loading} />
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <LoadingSpinner />
            <p className="text-gray-600 dark:text-gray-300 mt-4 text-lg">
              Searching for &quot;{searchQuery}&quot;...
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
              This may take a few moments as we search across multiple retailers
            </p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-lg p-6">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-red-500 rounded-full mr-3 flex-shrink-0"></div>
                <div>
                  <h3 className="text-red-800 dark:text-red-200 font-semibold">
                    Search Failed
                  </h3>
                  <p className="text-red-600 dark:text-red-300 mt-1">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {!loading && results.length > 0 && (
          <ResultsDisplay results={results} searchQuery={searchQuery} />
        )}

        {/* No Results */}
        {!loading && !error && results.length === 0 && searchQuery && (
          <div className="max-w-2xl mx-auto text-center py-12">
            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
              No products found
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Try adjusting your search terms or check if the retailers are available
            </p>
          </div>
        )}

        {/* Footer */}
        <footer className="text-center mt-16 py-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400">
            Made with ☕️ and 🥐 by
            <a
              href="https://www.yashchauhan.dev/"
              className="text-emerald-500 hover:text-emerald-600 ml-1"
              target="_blank"
            >Yash</a>
          </p>
        </footer>
      </div>
    </div>
  );
}
