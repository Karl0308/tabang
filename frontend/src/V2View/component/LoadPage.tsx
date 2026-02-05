import React, { useState, useEffect } from 'react';
import applogo from '../../img/iloilosupermart.png'

const LoadPage: React.FC = () => {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setIsLoading(false); // Simulating loading completion after 2 seconds
        }, 2000);

        return () => clearTimeout(timeout); // Cleanup the timeout on unmount
    }, []);

    const loadingStyle: React.CSSProperties = {
        transition: 'opacity 1s ease-in-out',
        opacity: isLoading ? 1 : 0,
        position: 'fixed', // Position fixed to keep it on top
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999, // Higher zIndex to ensure it's on top of other content
    };

    return (
        isLoading ? (
            <div className="bg-slate-200 dark:bg-gray-900 relative h-screen w-full" style={loadingStyle}>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex justify-center items-center">
                    <img
                        src={applogo}
                        alt="Loading"
                        className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl"
                    />
                </div>
            </div>

        ) : null
    );
};

export default LoadPage;
