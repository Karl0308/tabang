import axios from "axios";
import React, { useEffect, useState } from "react";
import { APIURLS } from "../../../../APIURLS";
import { History } from "../../../objects/Ticket";
import userLogo from "../../../../img/user.png";

interface HistoryTabProps {
  ticketId: string | number;
}

const HistoryTab: React.FC<HistoryTabProps> = ({ ticketId }) => {
  const [historyList, setHistoryList] = useState<History[]>();
  const [isLoading, setIsLoading] = useState(false);
  const axiosInstance = axios.create({
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });


  const FetchHistory = () => {
    setIsLoading(true);
    axiosInstance
      .get(APIURLS.ticket.getTicketHistoriesById() + ticketId)
      .then((res) => {
        setHistoryList(res.data);
        setIsLoading(false);
      })
      .catch((error) => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    FetchHistory();
  }, []);





  return (
    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-md">
      {/* History List */}
      <div className="dark:bg-gray-700 p-4 rounded-md flex flex-col gap-3">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-6 min-h-[120px] text-gray-600 dark:text-gray-300">
            <p>Loading history...</p>
          </div>
        ) : historyList && historyList.length > 0 ? (
          <ul className="flex flex-col gap-4 py-4">
            {historyList.map((history, idx) => (
              <li
                key={idx}
                className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  {/* Avatar */}
                  <img
                    src={userLogo}
                    alt={history.userFullName}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-blue-400 flex-shrink-0"
                  />

                  {/* Content */}
                  <div className="flex-1 flex flex-col items-start">
                    {/* Timestamp */}
                    <span className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mb-1">
                      {new Date(history.createdText).toLocaleString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "numeric",
                        minute: "numeric",
                        hour12: true,
                      })}
                    </span>

                    {/* History Text */}
                    {idx === 0 ? (
                      <p className="text-gray-700 dark:text-gray-200 text-left text-sm sm:text-base break-words whitespace-pre-wrap">
                        <b>{history.userFullName}</b> created this ticket.
                      </p>
                    ) : (
                      <div className="flex flex-col text-gray-700 dark:text-gray-200 text-sm sm:text-base">
                        <p className="mb-1">
                          <b>{history.userFullName}</b> changed the <b>{history.propName}</b>
                        </p>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                          <p className="break-words">{history.oldData}</p>
                          <span className="inline-block sm:mx-1 font-bold text-blue-500 text-sm sm:text-base">&rarr;</span>
                          <p className="break-words">{history.newData}</p>
                        </div>

                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 min-h-[120px] text-gray-600 dark:text-gray-300 gap-2">
            <span className="text-2xl">📜</span>
            <span>No history available.</span>
          </div>
        )}
      </div>
    </div>

  );
};

export default HistoryTab;
