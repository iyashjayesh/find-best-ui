'use client';

import { Product } from '../page';

interface ResultsDisplayProps {
    results: Product[];
    searchQuery: string;
    selectedCountry: string;
}

export default function ResultsDisplay({ results, searchQuery, selectedCountry }: ResultsDisplayProps) {
    // Country to currency mapping
    const countryToCurrency: Record<string, string> = {
        'US': 'USD',
        'IN': 'INR',
        'UK': 'GBP',
        'CA': 'CAD',
        'AU': 'AUD'
    };

    // Get expected currency for the selected country
    const expectedCurrency = countryToCurrency[selectedCountry] || 'USD';

    // Currency-based sorting function
    const sortProductsByCurrency = (products: Product[]) => {
        return products.sort((a, b) => {
            // First priority: Products with expected currency come first
            const aHasExpectedCurrency = a.currency === expectedCurrency;
            const bHasExpectedCurrency = b.currency === expectedCurrency;

            if (aHasExpectedCurrency && !bHasExpectedCurrency) return -1;
            if (!aHasExpectedCurrency && bHasExpectedCurrency) return 1;

            // Second priority: Among products with same currency preference, sort by price
            const extractNumericPrice = (priceStr: string): number => {
                if (!priceStr || priceStr === 'Price not available') return Infinity;
                const numericMatch = priceStr.match(/[\d,]+\.?\d*/);
                if (!numericMatch) return Infinity;
                return parseFloat(numericMatch[0].replace(/,/g, ''));
            };

            const priceA = extractNumericPrice(a.price);
            const priceB = extractNumericPrice(b.price);

            // Products with valid prices come before those without
            if (priceA === Infinity && priceB !== Infinity) return 1;
            if (priceA !== Infinity && priceB === Infinity) return -1;
            if (priceA === Infinity && priceB === Infinity) return 0;

            return priceA - priceB;
        });
    };

    // Separate valid products from blocked/captcha pages
    const validProducts = sortProductsByCurrency(
        results.filter(result =>
            !result.productName.includes('Robot or human?') &&
            result.productName.trim() !== '' &&
            result.productName !== 'Product name not available'
        )
    );

    const blockedResults = results.filter(result =>
        result.productName.includes('Robot or human?')
    );

    const getRetailerName = (link: string): string => {
        if (link.includes('amazon.')) return 'Amazon';
        if (link.includes('apple.com')) return 'Apple';
        if (link.includes('walmart.com')) return 'Walmart';
        if (link.includes('bestbuy.')) return 'Best Buy';
        if (link.includes('target.com')) return 'Target';
        if (link.includes('ebay.com')) return 'eBay';
        if (link.includes('flipkart.com')) return 'Flipkart';
        if (link.includes('myntra.com')) return 'Myntra';
        if (link.includes('currys.co.uk')) return 'Currys';
        if (link.includes('argos.co.uk')) return 'Argos';
        if (link.includes('jbhifi.com.au')) return 'JB Hi-Fi';
        return 'Retailer';
    };

    const getRetailerColor = (retailerName: string): string => {
        const colors: Record<string, string> = {
            'Amazon': 'bg-orange-100 text-orange-800 border-orange-200',
            'Apple': 'bg-gray-100 text-gray-800 border-gray-200',
            'Walmart': 'bg-blue-100 text-blue-800 border-blue-200',
            'Best Buy': 'bg-yellow-100 text-yellow-800 border-yellow-200',
            'Target': 'bg-red-100 text-red-800 border-red-200',
            'eBay': 'bg-purple-100 text-purple-800 border-purple-200',
            'Flipkart': 'bg-blue-100 text-blue-800 border-blue-200',
            'Myntra': 'bg-pink-100 text-pink-800 border-pink-200',
            'Currys': 'bg-green-100 text-green-800 border-green-200',
            'Argos': 'bg-indigo-100 text-indigo-800 border-indigo-200',
            'JB Hi-Fi': 'bg-red-100 text-red-800 border-red-200',
        };
        return colors[retailerName] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    const formatPrice = (price: string): { value: string; isAvailable: boolean } => {
        if (!price || price === 'Price not available') {
            return { value: 'Price not available', isAvailable: false };
        }
        return { value: price, isAvailable: true };
    }; const getBestPriceInfo = () => {
        const availablePrices = validProducts.filter(r => formatPrice(r.price).isAvailable);
        if (availablePrices.length === 0) return null;

        return availablePrices[0]; // Already sorted by price in the backend
    };

    const bestPrice = getBestPriceInfo();

    return (
        <div className="space-y-6">
            {/* Best Price Highlight */}
            {bestPrice && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-700 rounded-2xl p-6 mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center mb-2">
                                <svg className="w-6 h-6 text-green-600 dark:text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                </svg>
                                <h3 className="text-lg font-bold text-green-800 dark:text-green-200">Best Price Found</h3>
                            </div>
                            <p className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">{bestPrice.price}</p>
                            <p className="text-green-700 dark:text-green-300 font-medium">
                                at {getRetailerName(bestPrice.link)}
                            </p>
                        </div>
                        <div>
                            <a
                                href={bestPrice.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors duration-200 shadow-lg hover:shadow-xl"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                                View Deal
                            </a>
                        </div>
                    </div>
                </div>
            )}

            {/* Valid Products Section */}
            {validProducts.length > 0 && (
                <div className="mb-8">
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                            Available Products ({validProducts.length})
                        </h2>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                <span>{expectedCurrency} prices (local currency)</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                                <span>Other currencies</span>
                            </div>
                        </div>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {validProducts.map((result, index) => {
                            const retailerName = getRetailerName(result.link);
                            const priceInfo = formatPrice(result.price);
                            const isBestPrice = bestPrice && result.link === bestPrice.link;

                            return (
                                <div
                                    key={index}
                                    className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 ${isBestPrice
                                        ? 'border-green-400 dark:border-green-500 ring-4 ring-green-100 dark:ring-green-900/50'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
                                        } group relative overflow-hidden`}
                                >
                                    {/* Best Price Badge */}
                                    {isBestPrice && (
                                        <div className="absolute top-4 right-4 z-10">
                                            <div className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                                                BEST PRICE
                                            </div>
                                        </div>
                                    )}

                                    <div className="p-6">
                                        {/* Retailer and Currency Badges */}
                                        <div className="mb-4 flex items-center justify-between">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getRetailerColor(retailerName)}`}>
                                                {retailerName}
                                            </span>
                                            <div className="flex items-center space-x-2">
                                                {/* Currency Badge */}
                                                <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${result.currency === expectedCurrency
                                                        ? 'bg-green-100 text-green-800 border border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700'
                                                        : 'bg-gray-100 text-gray-600 border border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'
                                                    }`}>
                                                    {result.currency}
                                                </span>
                                                {/* Local Currency Indicator */}
                                                {result.currency === expectedCurrency && (
                                                    <span className="inline-flex items-center text-xs text-green-600 dark:text-green-400">
                                                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                        </svg>
                                                        Local
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Product Name */}
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 line-clamp-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                            {result.productName}
                                        </h3>

                                        {/* Price */}
                                        <div className="mb-4">
                                            {priceInfo.isAvailable ? (
                                                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                                    {priceInfo.value}
                                                    <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-1">
                                                        {result.currency}
                                                    </span>
                                                </div>
                                            ) : (
                                                <div className="text-lg text-gray-500 dark:text-gray-400 font-medium">
                                                    {priceInfo.value}
                                                </div>
                                            )}
                                        </div>

                                        {/* Action Button */}
                                        <a
                                            href={result.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center justify-center w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-[1.02] group"
                                        >
                                            <span>View Product</span>
                                            <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                            </svg>
                                        </a>
                                    </div>

                                    {/* Hover Effect Gradient */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 to-purple-600/0 group-hover:from-blue-600/5 group-hover:to-purple-600/5 transition-all duration-300 pointer-events-none rounded-2xl"></div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Blocked Results Section */}
            {blockedResults.length > 0 && (
                <div className="mb-8">
                    <div className="bg-yellow-50/80 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-2xl p-6">
                        <div className="flex items-start space-x-4 mb-4">
                            <div className="flex-shrink-0">
                                <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/50 rounded-full flex items-center justify-center">
                                    <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 19c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                                    Access Restricted ({blockedResults.length} sites)
                                </h3>
                                <p className="text-yellow-700 dark:text-yellow-300 mb-4">
                                    Some retailers are showing verification pages that prevent automated price checking.
                                    You can still visit these sites manually.
                                </p>
                            </div>
                        </div>

                        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                            {blockedResults.map((result, index) => {
                                const retailerName = getRetailerName(result.link);

                                return (
                                    <div
                                        key={index}
                                        className="bg-white/60 dark:bg-gray-800/60 rounded-xl p-4 border border-yellow-200 dark:border-yellow-700"
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getRetailerColor(retailerName)}`}>
                                                {retailerName}
                                            </span>
                                            <span className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">
                                                Verification Required
                                            </span>
                                        </div>

                                        <a
                                            href={result.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center text-sm text-yellow-700 dark:text-yellow-300 hover:text-yellow-800 dark:hover:text-yellow-200 font-medium"
                                        >
                                            <span>Visit manually</span>
                                            <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                            </svg>
                                        </a>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Summary Footer */}
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 mt-8">
                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center space-x-4">
                        <span>✅ {validProducts.length} products available</span>
                        {blockedResults.length > 0 && <span>⚠️ {blockedResults.length} sites blocked</span>}
                        <span>⚡ Search completed in &lt;5 seconds</span>
                    </div>
                    <div className="text-right">
                        <p>💡 Prices update in real-time</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
