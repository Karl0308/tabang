import React from 'react';
import './Loading.css'; // Import your CSS file

const Loading = () => {
    return (
        <div className="futuristic-loading">
            <div className="loading-animation">
                <div className="loading-wave">
                    <div className="wave wave-1"></div>
                    <div className="wave wave-2"></div>
                    <div className="wave wave-3"></div>
                </div>
            </div>
        </div>
    );
};

export default Loading;