import React, { useState, useEffect } from 'react';

const FlyingMessage = ({ message }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);

    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 3000); // Display the message for 3 seconds

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`fixed top-10 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 p-3 text-sm rounded-lg shadow-lg transition-all opacity-0 ${isVisible ? 'opacity-100 top-5' : ''}`}>
      <p className="text-gray-800 dark:text-white font-semibold">{message}</p>
    </div>

  );
};

export default FlyingMessage;