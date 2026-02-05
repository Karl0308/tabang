import React, { useState, useEffect } from "react";
import LoadComponent from "../../component/LoadComponent";
import axios from "axios";
import { APIURLS } from "../../../APIURLS";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { faL } from "@fortawesome/free-solid-svg-icons";
import { AdjustItemStockDTO, ItemStock } from "../../objects/ItemStock";
import ItemStockDetail from "./ItemStockDetail";
import { Category } from "../../objects/Category";
import Categories from "../Category/Categories";
import ItemStockAddSupply from "./ItemStockAddSupply";

const ITEMS_PER_PAGE = 10;

interface ItemStockDataQuery {
  itemStocks: ItemStock[];
  pageNumber: number;
  pageSize: number;
  totalRecords: number;
}

interface CategoryDataQuery {
  category: Category[];
  pageNumber: number;
  pageSize: number;
  totalRecords: number;
}

type FilterState = {
  search: string;
  categoryId: number;
  pageNumber: number;
  pageSize: number;
};
type FilterStateCategory = {
  search: string;
  pageNumber: number;
  pageSize: number;
};

const ItemStocks = () => {
  const [filter, setFilter] = useState<FilterState>({
    search: "",
    categoryId: 0,
    pageNumber: 1,
    pageSize: 10,
  });

  const [filterCategory, setFilterCategory] = useState<FilterStateCategory>({
    search: "",
    pageNumber: 1,
    pageSize: 10000,
  });

  const [dataInitialState, setDatainitialState] = useState<ItemStock>({
    id: 0,
    name: "",
    categoryId: 0,
    categoryName: "",
    quantityOnHand: 0,
  });
  const [dataAdjustInitialState, setDataAdjustInitialState] =
    useState<AdjustItemStockDTO>({
      categoryName: "",
      itemName: "",
      itemStockId: 0,
      refNo: "",
      stockType: 0,
      userId: 0,
      quantity: 0,
    });
  const [data, setData] = useState<ItemStockDataQuery>({
    itemStocks: [],
    pageNumber: 1,
    pageSize: 10,
    totalRecords: 0,
  });

  const [dataCategory, setDataCategory] = useState<CategoryDataQuery>({
    categories: [],
    pageNumber: 1,
    pageSize: 10,
    totalRecords: 0,
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [orderBy, setOrderBy] = useState("");
  const [orderDesc, setOrderDesc] = useState(false);
  const [selected, setSelected] = useState<ItemStock | null>(null);
  const [selectedAddSupply, setSelectedAddSupply] =
    useState<AdjustItemStockDTO | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const axiosInstance = axios.create({
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  interface CategoryDataQuery {
    categories: Category[];
    pageNumber: number;
    pageSize: number;
    totalRecords: number;
  }

  const notifySuccess = (message: string) =>
    toast.success(message, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
    });

  const notifyError = (message: string) =>
    toast.error(message, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
    });

  const fetchData = () => {
    setIsLoading(true);

    axiosInstance
      .post(APIURLS.itemStocks.getItemStocks(), filter)
      .then((res) => {
        const result = res.data as ItemStockDataQuery;
        setData(result);
      })
      .catch((error) => {
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const fetchCategories = () => {
    setIsLoading(true);

    axiosInstance
      .post(APIURLS.categories.getCategories(), filter)
      .then((res) => {
        const result = res.data as CategoryDataQuery;
        setDataCategory(result);
      })
      .catch((error) => {
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchCategories();
    fetchData();
  }, []);

  useEffect(() => {
    fetchData();
  }, [filter.pageNumber, filter.pageSize]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchData();
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [filter.search]);

  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;

  let filteredData = data.itemStocks.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (orderBy) {
    filteredData.sort((a, b) => {
      const aValue =
        typeof a[orderBy as keyof typeof a] === "string"
          ? (a[orderBy as keyof typeof a] as string).toLowerCase()
          : String(a[orderBy as keyof typeof a]);
      const bValue =
        typeof b[orderBy as keyof typeof b] === "string"
          ? (b[orderBy as keyof typeof b] as string).toLowerCase()
          : String(b[orderBy as keyof typeof b]);

      if (orderDesc) {
        return bValue.localeCompare(aValue);
      } else {
        return aValue.localeCompare(bValue);
      }
    });
  }

  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1);
  };

  const handleOrder = (columnName: string) => {
    if (orderBy === columnName) {
      setOrderDesc(!orderDesc);
    } else {
      setOrderBy(columnName);
      setOrderDesc(false);
    }
  };

  const handleRowClick = (data: ItemStock) => {
    setSelected(data);
  };

  const handleAdjustRowClick = (data: ItemStock) => {
    setSelectedAddSupply({
      categoryName: data.categoryName,
      itemName: data.name,
      itemStockId: data.id,
      refNo: "",
      stockType: 1,
      userId: parseInt(localStorage.getItem("id") || "0"),
      quantity: 0, // Default quantity to add
    });
  };

  const handleDelete = (data: ItemStock) => {
    const deletePromise = axiosInstance
      .delete(APIURLS.itemStocks.deleteItemStocks() + data.id)
      .then((res) => {
        setData((prevData) => ({
          ...prevData, // Keep other properties unchanged
          itemStocks: prevData.itemStocks.filter((item) => item.id !== data.id),
        }));

        setSelected(null);
      });

    toast.promise(
      deletePromise,
      {
        pending: "Deleting Item...",
        success: "Item Deleted!",
        error: "Error Deleting Item.",
      },
      {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
      }
    );
  };

  const AddData = () => {
    setSelected(dataInitialState);
  };

  const handleSave = (selected: any) => {
    if (selected.name.length < 1) {
      notifyError("Please complete all fields!");
      return;
    }

    let isAdd = selected.id === 0 ? true : false;
    const AddPromise = axiosInstance
      .post(APIURLS.itemStocks.saveItemStocks(), selected)
      .then((res) => {

        setData((prevData) => ({
          ...prevData,
          itemStocks: isAdd
            ? [...prevData.itemStocks, res.data]
            : prevData.itemStocks.map((item) =>
                item.id === res.data.id ? res.data : item
              ),
        }));

        setSelected(null);
      });
    toast.promise(
      AddPromise,
      {
        pending: selected.id === 0 ? "Adding Item..." : "Updating Item...",
        success: selected.id === 0 ? "Item Added!" : "Item Updated!",
        error: "Error Saving Item!",
      },
      {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
      }
    );
  };
  const handleAddSupplySave = (selected: any) => {
    if (selected.refNo.length < 1) {
      notifyError("Please enter a reference number!");
      return;
    }
    if (selected.quantity === 0) {
      notifyError("Please enter a valid quantity!");
      return;
    }
    const AddPromise = axiosInstance
      .post(APIURLS.itemStocks.updateItemStockSupply(), selected)
      .then((res) => {
        fetchData();
        setSelectedAddSupply(null);
      });
    toast.promise(
      AddPromise,
      {
        pending: "Stocking Item...",
        success: "Item Stocked!",
        error: "Error Saving Item!",
      },
      {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
      }
    );
  };

  const [inputPage, setInputPage] = useState<string>("");

  const handlePageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputPage(e.target.value);
  };

  const handlePageBlur = () => {
    let page = Number(inputPage);

    if (!inputPage) {
      setInputPage(filter.pageNumber.toString());
      return;
    }

    page = Math.max(
      1,
      Math.min(page, Math.ceil(data.totalRecords / filter.pageSize))
    );

    setFilter((prev) => ({
      ...prev,
      pageNumber: page,
    }));
    setInputPage(page.toString());
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      (e.target as HTMLInputElement).blur();
    }
  };

  useEffect(() => {
    setInputPage(filter.pageNumber.toString());
  }, [filter.pageNumber]);

  return (
    <div className="w-full mx-auto mt-4 px-16">
      <div className="flex justify-between items-center mt-4">
        {/* Input Field */}
        <input
          type="text"
          className="text-black dark:text-white w-full max-w-xs border border-gray-300 dark:border-gray-700 rounded-md p-2 mr-2 bg-white dark:bg-gray-800 placeholder-gray-500 dark:placeholder-gray-400"
          placeholder="Search..."
          value={filter.search}
          onChange={(e) =>
            setFilter((prev) => ({
              ...prev,
              search: e.target.value,
            }))
          }
        />

        {/* Button */}
        <button
          onClick={() => AddData()}
          className="flex items-center justify-center bg-blue-500 text-white rounded-md px-4 py-2 hover:bg-blue-600 dark:bg-blue-700 dark:hover:bg-blue-800"
        >
          Add Item
        </button>
      </div>

      <div className="overflow-x-auto mt-4">
        <table className="min-w-full">
          <thead>
            <tr>
              <th
                className="px-6 py-3 bg-gray-100 text-left text-xs font-bold text-gray-600 uppercase tracking-wider cursor-pointer dark:bg-gray-800 dark:text-white dark:border-gray-700"
                onClick={() => handleOrder("name")}
              >
                Name {orderBy === "name" && (orderDesc ? "↓" : "↑")}
              </th>
              <th
                className="px-6 py-3 bg-gray-100 text-left text-xs font-bold text-gray-600 uppercase tracking-wider cursor-pointer dark:bg-gray-800 dark:text-white dark:border-gray-700"
                onClick={() => handleOrder("name")}
              >
                Category {orderBy === "categoryName" && (orderDesc ? "↓" : "↑")}
              </th>
              <th
                className="px-6 py-3 bg-gray-100 text-left text-xs font-bold text-gray-600 uppercase tracking-wider cursor-pointer dark:bg-gray-800 dark:text-white dark:border-gray-700"
                onClick={() => handleOrder("name")}
              >
                Quantity{" "}
                {orderBy === "quantityOnHand" && (orderDesc ? "↓" : "↑")}
              </th>
              <th className="px-6 py-3 bg-gray-100 text-left text-xs font-bold text-gray-600 uppercase tracking-wider dark:bg-gray-800 dark:text-white dark:border-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {data.itemStocks.map((item, index) => (
              <tr
                key={item.id}
                className={`hover:bg-gray-200 dark:hover:bg-gray-700 ${
                  index !== currentItems.length - 1
                    ? "border-b border-gray-300 dark:border-gray-700"
                    : ""
                }`}
              >
                <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 text-left">
                  {item.name}
                </td>
                <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 text-left">
                  {item.categoryName}
                </td>
                <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 text-left">
                  {item.quantityOnHand}
                </td>
                <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 text-left">
                  <button
                    onClick={() => handleRowClick(item)}
                    className="mx-2 border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white font-bold px-2 rounded dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-600 dark:hover:text-white"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleAdjustRowClick(item)}
                    className="mx-2 border border-green-500 text-green-500 hover:bg-green-500 hover:text-white font-bold px-2 rounded dark:border-green-700 dark:text-green-300 dark:hover:bg-green-600 dark:hover:text-white"
                  >
                    Add Stock
                  </button>
                  {/* <button
                                        onClick={() => handleDelete(item)}
                                        className="mx-2 border border-red-500 text-red-500 hover:bg-red-500 hover:text-white font-bold px-2 rounded dark:border-red-700 dark:text-red-300 dark:hover:bg-red-600 dark:hover:text-white"
                                    >
                                        Delete
                                    </button> */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center mt-2 text-xs sm:text-sm">
        <p className="text-gray-600 dark:text-gray-300 ">
          Showing{" "}
          <span className="font-semibold">
            {(filter.pageNumber - 1) * filter.pageSize + 1}
          </span>
          &nbsp;to&nbsp;
          <span className="font-semibold">
            {Math.min(filter.pageNumber * filter.pageSize, data.totalRecords)}
          </span>
          &nbsp;of&nbsp;
          <span className="font-semibold">{data.totalRecords}</span>
          &nbsp; results
        </p>

        <div className="flex items-center space-x-1 bg-white dark:bg-gray-800 p-1 sm:p-2 rounded-md shadow-sm border border-gray-300 dark:border-gray-600">
          <button
            onClick={() =>
              setFilter((prev) => ({
                ...prev,
                pageNumber: prev.pageNumber - 1,
              }))
            }
            disabled={filter.pageNumber === 1}
            className="px-3 py-1 sm:px-4 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {"<"}
          </button>

          <input
            type="number"
            min="1"
            max={Math.ceil(data.totalRecords / filter.pageSize)}
            value={inputPage}
            onChange={handlePageChange}
            onBlur={handlePageBlur}
            onKeyDown={handleKeyDown}
            className="w-12 sm:w-14 text-center border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 text-gray-700 dark:text-white bg-white dark:bg-gray-800 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />

          <span className="text-gray-600 dark:text-gray-300 font-semibold w-16 block text-center">
            / {Math.ceil(data.totalRecords / filter.pageSize)}
          </span>

          <button
            onClick={() =>
              setFilter((prev) => ({
                ...prev,
                pageNumber: Math.min(
                  Math.ceil(data.totalRecords / prev.pageSize),
                  prev.pageNumber + 1
                ),
              }))
            }
            disabled={
              filter.pageNumber >=
              Math.ceil(data.totalRecords / filter.pageSize)
            }
            className="px-3 py-1 sm:px-4 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {">"}
          </button>
        </div>
      </div>

      <ItemStockDetail
        selected={selected}
        setSelected={setSelected}
        handleSave={() => handleSave(selected)}
        categories={dataCategory.categories}
      />
      <ItemStockAddSupply
        selected={selectedAddSupply}
        setSelected={setSelectedAddSupply}
        handleSave={() => handleAddSupplySave(selectedAddSupply)}
        categories={dataCategory.categories}
      />

      <LoadComponent loading={isLoading} />
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
};

export default ItemStocks;
