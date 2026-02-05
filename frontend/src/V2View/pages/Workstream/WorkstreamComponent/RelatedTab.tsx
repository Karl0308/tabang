import React, { useEffect, useState } from "react";
import userLogo from "../../../../img/user.png";
import { APIURLS } from "../../../../APIURLS";
import { RelatedIssues } from "../../../objects/Ticket";
import axios from "axios";

interface RelatedTabProps {
  ticketId: string | number;
}

const RelatedTab: React.FC<RelatedTabProps> = ({ ticketId }) => {

  const [isLoading, setIsLoading] = useState(false);
  const [relatedList, setRelatedList] = useState<RelatedIssues[]>();
  const relatedInitial: RelatedIssues = {
    ticketId: Number(ticketId),
    linkTicketNumber: "",
  };

  const [related, setRelated] = useState<RelatedIssues>(relatedInitial);

  const axiosInstance = axios.create({
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  const FetchRelatedIssues = () => {
    setIsLoading(true);
    axiosInstance
      .get(APIURLS.ticket.getTicketRelatedIssuesById() + ticketId)
      .then((res) => {
        const rawData = res.data;
        if (rawData.length > 0) {
          if (typeof rawData === "string") {
            // Split the string by ".,."
            const links = rawData.split(".,.");

            const processedList: RelatedIssues[] = links.map((link) => {
              const lastSevenChars = link.slice(-7); // Get last 7 characters
              return {
                ticketId: Number(ticketId), // ensure it's a number
                linkTicketNumber: `${window.location.origin}/ticketview/${lastSevenChars}`,
              };
            });


            setRelatedList(processedList);
          } else {
          }
        }
        setIsLoading(false);
      })
      .catch((error) => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    FetchRelatedIssues();
  }, []);

  const WriteComment = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRelated((prev) => ({ ...prev, linkTicketNumber: e.target.value }));
  };

  const handleSubmit = () => {
    if (isLoading) {
      return;
    }
    setIsLoading(true);

    const AddPromise = axiosInstance
      .post(APIURLS.ticket.saveTicketLink(), related)
      .then((res) => {
        const cleanedLink = related.linkTicketNumber
          .trim()
          .replace(/\s+/g, "")
          .toUpperCase();

        // Remove window.location.origin if it exists
        const sanitizedLink = cleanedLink
          .replace(new RegExp(`^${window.location.origin}`, "i"), "")
          .replace(/^\/+/, ""); // Remove leading slashes

        const linkTicketNumber = `${window.location.origin}/${sanitizedLink}`;

        const relatedData: RelatedIssues = {
          ticketId: Number(ticketId), // ensure it's a number
          linkTicketNumber: linkTicketNumber,
        };

        setRelatedList((prevList) => [...(prevList ?? []), relatedData]);
        setRelated(relatedInitial);
        return res;
      })
      .catch((error) => {
        throw error; // Re-throw the error so `toast.promise` can handle it
      })
      .finally(() => {
        setIsLoading(false);
      });

  };


  return (
    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-md">
      {/* Add new related issue */}
      <div className="flex flex-col gap-3 mb-4">
        <div className="flex items-start gap-3 p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm">
          <img
            src={userLogo}
            alt="User Avatar"
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-blue-400 flex-shrink-0"
          />
          <div className="flex-1 flex items-center gap-2">
            <input
              type="text"
              placeholder="Add a related issue..."
              className="flex-1 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              value={related?.linkTicketNumber}
              onChange={WriteComment}
            />
            <button
              onClick={handleSubmit}
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-400 dark:hover:bg-blue-400"
            >
              Submit
            </button>
          </div>
        </div>
      </div>

      {/* Related issues list */}
      {isLoading ? (
        <div className="flex justify-center py-6 text-gray-600 dark:text-gray-300">
          Loading related issues...
        </div>
      ) : relatedList && relatedList.length > 0 ? (
        <ul className="flex flex-col gap-3">
          {relatedList.map((related, idx) => (
            <li
              key={idx}
              className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <img
                    src={userLogo}
                    alt="User Avatar"
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-blue-400"
                  />
                </div>

                {/* Issue content */}
                <div className="flex-1 flex items-center">
                  <a
                    href={related.linkTicketNumber}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 dark:text-blue-300 hover:underline text-sm sm:text-base" // Responsive font
                  >
                    {related.linkTicketNumber}
                  </a>
                </div>
              </div>
            </li>
          ))}
        </ul>


      ) : (
        <div className="flex flex-col items-center justify-center py-6 text-gray-600 dark:text-gray-400 gap-2">
          <span className="text-xl">🔗</span>
          <span>No related issues available.</span>
        </div>
      )}

    </div>
  );
};
export default RelatedTab;
