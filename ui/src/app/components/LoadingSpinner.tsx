'use client';

export default function LoadingSpinner() {
    return (
        <div className="flex items-center justify-center">
            <div className="relative w-16 h-16">
                {/* Outer Ring */}
                <div className="absolute inset-0 border-4 border-blue-200 dark:border-blue-800 rounded-full"></div>

                {/* Spinning Ring */}
                <div className="absolute inset-0 border-4 border-transparent border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin"></div>

                {/* Inner Pulse */}
                <div className="absolute inset-2 bg-blue-100 dark:bg-blue-900/50 rounded-full animate-pulse"></div>

                {/* Center Dot */}
                <div className="absolute inset-6 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
            </div>
        </div>
    );
}
