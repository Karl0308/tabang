import React, { useEffect, useRef, useState } from "react";
import userLogo from "../../../../img/user.png";
import { APIURLS } from "../../../../APIURLS";
import axios from "axios";
import { Asset } from "../../../objects/Asset";

interface AssetsTabProps {
  ticketId: string | number;
}

const AssetsTab: React.FC<AssetsTabProps> = ({ ticketId }) => {

  const [isLoading, setIsLoading] = useState(false);
  const [selectedAssetList, setSelectedAssetList] = useState<Asset[]>([]);
  const [assetList, setAssetList] = useState<Asset[]>([]);
  const assetInitial = {
    id: 0,
    code: "",
    name: "",
    branch: "",
    equipment: "",
  };
  const [asset, setAsset] = useState<Asset>(assetInitial);
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([]);
  const [inputValue, setInputValue] = useState<string>("");

  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const axiosInstance = axios.create({
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  const FetchAssets = () => {
    setIsLoading(true);
    axiosInstance
      .get(APIURLS.asset.getAssetTagByTicketId() + ticketId)
      .then((res) => {
        setSelectedAssetList(res.data);
        setIsLoading(false);
      })
      .catch((error) => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    FetchAssets();
  }, []);
  const fetchOptionAssets = async (query: string) => {
    setIsLoading(true);
    try {
      const searchTermParam = query != null ? query : ""; // Use query directly

      // // Make the API call
      const response = await axiosInstance.get(
        `${APIURLS.ticket.ticketBase()}GetAssets?searchTerm=${searchTermParam}`
      );

      // Filter assets based on the search term if necessary
      // const assets: Asset[] = response.data.filter((asset: Asset) =>
      //     asset.name.toLowerCase().includes(query.toLowerCase())
      // );
      const assets: Asset[] = response.data;
      setAssetList(assets);
      setFilteredAssets(assets);

      // Stop loading
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    if (value.trim() !== "") {
      fetchOptionAssets(value); // Fetch assets dynamically based on input
    } else {
      setFilteredAssets([]);
    }
  };

  const handleAssetClick = (selectedAsset: Asset) => {
    setAsset(selectedAsset);
    setInputValue(selectedAsset.code + " - " + selectedAsset.name);
    setFilteredAssets([]);
    inputRef.current?.focus();
  };


  const submitInput = () => {
    const isAlreadyAdded = selectedAssetList.some(
      (curasset) => curasset.id === asset.id
    );
    if (isAlreadyAdded) {
      return;
    }
    setIsLoading(true);
    axiosInstance
      .post(
        APIURLS.ticket.saveTicketProp() +
        "userId= " +
        localStorage.getItem("id") +
        "&ticketId= " +
        ticketId +
        "&name=ticketAssets&value=" +
        asset.id
      )
      .then(
        (result) => {
          setSelectedAssetList((prevList) => {
            const isAlreadyAdded = prevList.some(
              (curasset) => curasset.id === asset.id
            );
            if (!isAlreadyAdded) {
              return [...prevList, asset];
            }
            return prevList;
          });
          // Reset input and asset
          setInputValue("");
          setAsset(assetInitial);
          setFilteredAssets([]);
          setIsLoading(false);
        },
        (error) => {
          setIsLoading(false);
        }
      );
  };

  const handleDeleteAsset = (id: number) => {
    setIsLoading(true);
    axiosInstance
      .delete(APIURLS.ticket.deleteTicketAsset() + id + "/" + ticketId)
      .then(
        (result) => {
          setSelectedAssetList((prevList) =>
            prevList.filter((asset) => asset.id !== id)
          );
          setIsLoading(false);
        },
        (error) => {
          setIsLoading(false);
        }
      );
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-md">
      {/* Add new asset */}
      <div className="flex flex-col gap-3 mb-4">
        <div className="flex items-start gap-3 p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm">
          <img
            src={userLogo}
            alt="User Avatar"
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-blue-400 flex-shrink-0"
          />
          <div className="flex-1 flex items-center gap-2 relative">
            <input
              type="text"
              placeholder="Search and select an asset..."
              className="flex-1 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600 dark:text-gray-100"
              value={inputValue}
              onChange={handleInputChange}
            />
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-400 dark:hover:bg-blue-400"
              onClick={submitInput}
              disabled={isLoading || !asset.name}
            >
              Submit
            </button>

            {/* Dropdown */}
            {filteredAssets.length > 0 && (
              <ul className="absolute top-full left-0 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg mt-1 z-10 max-h-60 overflow-y-auto">
                {filteredAssets.map((asset) => (
                  <li
                    key={asset.id}
                    className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-gray-700 dark:text-gray-200"
                    onClick={() => handleAssetClick(asset)}
                  >
                    {asset.code} - {asset.name}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Asset list */}
      {isLoading ? (
        <div className="flex justify-center py-6 text-gray-600 dark:text-gray-400">
          Loading assets...
        </div>
      ) : selectedAssetList && selectedAssetList.length > 0 ? (
        <ul className="flex flex-col gap-3">
          {selectedAssetList.map((asset) => (
            <li
              key={asset.id}
              className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-start gap-3">
                {/* Avatar placeholder */}
                <div className="flex-shrink-0">
                  <img
                    src={userLogo}
                    alt="User Avatar"
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-blue-400"
                  />
                </div>

                {/* Asset content */}
                <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
                  <p className="text-gray-700 dark:text-gray-200 text-sm sm:text-base break-words">
                    {asset.code} - {asset.name}
                  </p>
                  <button
                    className="ml-0 sm:ml-4 bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 dark:bg-red-600 dark:hover:bg-red-500 text-sm"
                    onClick={() => handleDeleteAsset(asset.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

      ) : (
        <div className="flex flex-col items-center justify-center py-6 text-gray-600 dark:text-gray-400 gap-2">
          <span className="text-xl">🛠️</span>
          <span>No assets available.</span>
        </div>
      )}
    </div>

  );
};

export default AssetsTab;
