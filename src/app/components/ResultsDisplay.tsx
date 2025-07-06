'use client';

import { Product } from '../page';

interface ResultsDisplayProps {
    results: Product[];
    searchQuery: string;
}

export default function ResultsDisplay({ results, searchQuery }: ResultsDisplayProps) {
    const extractNumericPrice = (priceStr: string): number => {
        if (!priceStr || priceStr === 'Price not available') {
            return 999999;
        }
        const cleaned = priceStr.replace(/[^\d.]/g, '');
        const parsed = parseFloat(cleaned);
        return isNaN(parsed) ? 999999 : parsed;
    };

    const sortedResults = [...results].sort((a, b) =>
        extractNumericPrice(a.price) - extractNumericPrice(b.price)
    );

    const getRetailerName = (url: string): string => {
        try {
            const hostname = new URL(url).hostname.toLowerCase();
            if (hostname.includes('amazon')) return 'Amazon';
            if (hostname.includes('walmart')) return 'Walmart';
            if (hostname.includes('bestbuy')) return 'Best Buy';
            if (hostname.includes('target')) return 'Target';
            if (hostname.includes('ebay')) return 'eBay';
            if (hostname.includes('apple')) return 'Apple';
            if (hostname.includes('bhphotovideo')) return 'B&H Photo';
            return hostname.replace('www.', '').split('.')[0];
        } catch {
            return 'Unknown';
        }
    };

    const getRetailerEmoji = (url: string): string => {
        const hostname = new URL(url).hostname.toLowerCase();
        if (hostname.includes('amazon')) return '📦';
        if (hostname.includes('walmart')) return '🏪';
        if (hostname.includes('bestbuy')) return '🔵';
        if (hostname.includes('target')) return '🎯';
        if (hostname.includes('ebay')) return '🏷️';
        if (hostname.includes('apple')) return '🍎';
        if (hostname.includes('bhphotovideo')) return '📸';
        return '🛒';
    };

    const bestPrice = sortedResults.length > 0 ? extractNumericPrice(sortedResults[0].price) : 0;
    const hasValidPrices = sortedResults.some(product =>
        product.price && product.price !== 'Price not available'
    );

    return (
        <div className="max-w-6xl mx-auto">
            {/* Results Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
                        🎉 Found {results.length} Results for "{searchQuery}"
                    </h2>
                    {sortedResults.length > 0 && hasValidPrices && (
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 inline-block">
                            <div className="text-2xl font-bold text-green-800 dark:text-green-200">
                                🏆 Best Price: {sortedResults.find(p => p.price !== 'Price not available')?.price}
                            </div>
                            <div className="text-green-600 dark:text-green-300 mt-1">
                                Available at {getRetailerName(sortedResults.find(p => p.price !== 'Price not available')?.link || '')}
                            </div>
                        </div>
                    )}
                    {sortedResults.length > 0 && !hasValidPrices && (
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 inline-block">
                            <div className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                                📋 Products Found
                            </div>
                            <div className="text-blue-600 dark:text-blue-300 mt-1">
                                Visit retailers for current pricing
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Results Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {sortedResults.map((product, index) => {
                    const price = extractNumericPrice(product.price);
                    const isLowestPrice = hasValidPrices && price === bestPrice && product.price !== 'Price not available';
                    const retailerName = getRetailerName(product.link);
                    const retailerEmoji = getRetailerEmoji(product.link);

                    return (
                        <div
                            key={index}
                            className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 overflow-hidden ${isLowestPrice ? 'ring-2 ring-green-500 dark:ring-green-400' : ''
                                }`}
                        >
                            {isLowestPrice && (
                                <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-center py-2 px-4 font-semibold text-sm">
                                    🏆 BEST PRICE
                                </div>
                            )}

                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center space-x-2">
                                        <span className="text-2xl">{retailerEmoji}</span>
                                        <span className="font-semibold text-gray-800 dark:text-white">
                                            {retailerName}
                                        </span>
                                    </div>
                                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${isLowestPrice
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                        : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                                        }`}>
                                        #{index + 1}
                                    </div>
                                </div>


                                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3 line-clamp-2 leading-tight">
                                    {product.productName}
                                </h3>

                                <div className="mb-4">
                                    <div className={`text-3xl font-bold ${product.price === 'Price not available'
                                        ? 'text-gray-500 dark:text-gray-400'
                                        : isLowestPrice
                                            ? 'text-green-600 dark:text-green-400'
                                            : 'text-blue-600 dark:text-blue-400'
                                        }`}>
                                        {product.price === 'Price not available' ? 'Kindly check retailer for pricing' : product.price}
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                        {product.price === 'Price not available' ? 'Check retailer for pricing' : product.currency}
                                    </div>
                                </div>

                                {/* Action Button */}
                                <a
                                    href={product.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`w-full inline-flex items-center justify-center px-4 py-3 rounded-lg font-semibold text-white transition-all duration-200 transform hover:scale-105 ${isLowestPrice
                                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
                                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                                        }`}
                                >
                                    <span className="mr-2">🛒</span>
                                    View on {retailerName}
                                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                </a>
                            </div>
                        </div>
                    );
                })}
            </div>

            {sortedResults.length > 1 && hasValidPrices && (
                <div className="mt-12 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">
                        📊 Price Comparison
                    </h3>
                    <div className="space-y-4">
                        {sortedResults.filter(product => product.price !== 'Price not available').map((product, index) => {
                            const price = extractNumericPrice(product.price);
                            const validBestPrice = extractNumericPrice(sortedResults.find(p => p.price !== 'Price not available')?.price || '0');
                            const percentage = validBestPrice > 0 ? ((price - validBestPrice) / validBestPrice) * 100 : 0;
                            const widthPercentage = validBestPrice > 0 ? (price / validBestPrice) * 100 : 100;

                            return (
                                <div key={index} className="flex items-center space-x-4">
                                    <div className="w-20 text-sm font-medium text-gray-600 dark:text-gray-300">
                                        {getRetailerName(product.link)}
                                    </div>
                                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-8 relative overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-1000 ${index === 0
                                                ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                                                : 'bg-gradient-to-r from-blue-500 to-indigo-500'
                                                }`}
                                            style={{ width: `${Math.min(widthPercentage, 100)}%` }}
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="text-white font-semibold text-sm">
                                                {product.price}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="w-16 text-sm text-right">
                                        {index === 0 ? (
                                            <span className="text-green-600 dark:text-green-400 font-semibold">Best</span>
                                        ) : (
                                            <span className="text-red-600 dark:text-red-400">
                                                +{percentage.toFixed(0)}%
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
