import React, { useState } from "react";
import copylogo from "../../img/copy-icon.svg";
import FlyingMessage from "../../components/FlyingMessage";


const CopyButton: React.FC<{ text: string }> = ({ text }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (error) {
    }
  };

  return (
    <div className="w-6 h-6 flex items-center justify-center">
      <button
        onClick={copyToClipboard}
        className="w-full h-full flex items-center justify-center p-0 bg-transparent border-none"
      >
        <img src={copylogo} className="w-4 h-4 object-contain" alt="Copy" />
      </button>
      {copied && <FlyingMessage message="Copied to clipboard!" />}
    </div>
  );
};

export default CopyButton;
