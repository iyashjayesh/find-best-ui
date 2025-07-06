'use client';

export default function LoadingSpinner() {
    return (
        <div className="flex items-center justify-center">
            <div className="relative">
                {/* Outer ring */}
                <div className="w-16 h-16 border-4 border-blue-200 dark:border-blue-800 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin"></div>

                {/* Inner ring */}
                <div className="absolute top-2 left-2 w-12 h-12 border-4 border-indigo-200 dark:border-indigo-800 border-b-indigo-600 dark:border-b-indigo-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>

                {/* Center dot */}
                <div className="absolute top-6 left-6 w-4 h-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full animate-pulse"></div>
            </div>
        </div>
    );
}
