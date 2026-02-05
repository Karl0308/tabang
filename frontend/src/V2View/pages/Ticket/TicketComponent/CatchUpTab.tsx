import React from "react";

interface CatchUpTabProps {
  ticketId: string | number;
}

const CatchUpTab: React.FC<CatchUpTabProps> = ({ ticketId }) => {
  const catchups: any[] = []; // Placeholder for future fetched data

  if (catchups.length === 0) {
    return (
      <div className="py-6 text-gray-600 dark:text-gray-300 text-center min-h-[120px] flex flex-col items-center justify-center gap-2">
        <span className="text-lg">⏱️</span>
        <span>No catch-ups scheduled.</span>
      </div>
    );
  }

  return (
    <div className="py-6">
      {catchups.map((item, idx) => (
        <div key={idx} className="p-3 border-b border-gray-200 dark:border-gray-700">
          <p>{item.title}</p>
        </div>
      ))}
    </div>
  );
};

export default CatchUpTab;
