import React, { useState, useEffect } from 'react';
import copylogo from '../img/copy-icon.svg';
import FlyingMessage from "../components/FlyingMessage"

const CopyButton = ({ text }) => {
    const [copied, setCopied] = useState(false);
    const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 600);
    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(window.location.origin + "/ticketview/" + text);
            setCopied(true);

            // Reset the "copied" state after a brief delay
            setTimeout(() => {
                setCopied(false);
            }, 1500);
        } catch (error) {
        }
    };
    const handleResize = () => {
        setIsSmallScreen(window.innerWidth < 600);
    };

    useEffect(() => {
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <>
            <button onClick={copyToClipboard} style={{ background: "none", border: "none", padding: "10px" }}>
                <img
                    src={copylogo}
                    width={isSmallScreen ? 10 : 20}
                    height={isSmallScreen ? 10 : 20}
                    className="transition-colors dark:filter dark:invert hover:bg-gray-200 dark:hover:bg-gray-700"

                />
            </button>

            {copied ? <FlyingMessage message="Copied to clipboard!" /> : ""}
        </>
    );
};

export default CopyButton;