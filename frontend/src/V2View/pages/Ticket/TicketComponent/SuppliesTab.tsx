import React from "react";

interface SuppliesTabProps {
  ticketId: string | number;
}

const SuppliesTab: React.FC<SuppliesTabProps> = ({ ticketId }) => {
  const supplies: any[] = []; // Placeholder for future fetched data

  if (supplies.length === 0) {
    return (
      <div className="py-6 text-gray-600 dark:text-gray-300 text-center min-h-[120px] flex flex-col items-center justify-center gap-2">
        <span className="text-lg">🛠️</span>
        <span>No supplies linked.</span>
      </div>
    );
  }

  return (
    <div className="py-6">
      {supplies.map((item, idx) => (
        <div key={idx} className="p-3 border-b border-gray-200 dark:border-gray-700">
          <p>{item.name}</p>
        </div>
      ))}
    </div>
  );
};

export default SuppliesTab;
