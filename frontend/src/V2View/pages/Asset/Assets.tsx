import React, { useState, useEffect } from 'react';
import AssetDetail from './AssetDetail';
import LoadComponent from '../../component/LoadComponent';
import { Asset } from '../../objects/Asset';
import axios from "axios";
import { APIURLS } from '../../../APIURLS';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'
import { faL } from '@fortawesome/free-solid-svg-icons';

const ITEMS_PER_PAGE = 10;

interface AssetDataQueryResult {
    assets: Asset[];
    pageNumber: number;
    pageSize: number;
    totalRecords: number;
}



type FilterState = {
    search: string;
    pageNumber: number;
    pageSize: number;
};


const Assets = () => {
    const [filter, setFilter] = useState<FilterState>({
        search: '',
        pageNumber: 1,
        pageSize: 10,
    });

    const [dataInitialState, setDatainitialState] = useState<Asset>({ id: 0, code: '', name: '', branch: '', equipment: '' });
    const [data, setData] = useState<AssetDataQueryResult>({
        assets: [],
        pageNumber: 1,
        pageSize: 10,
        totalRecords: 0
    });


    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [orderBy, setOrderBy] = useState('');
    const [orderDesc, setOrderDesc] = useState(false);
    const [selected, setSelected] = useState<Asset | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const axiosInstance = axios.create({
        headers: {
            'Authorization': `Bearer ${localStorage.getItem("token")}`
        }
    });

    const notifySuccess = (message: string) => toast.success(message, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light"
    });

    const notifyError = (message: string) => toast.error(message, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light"
    });

    const fetchData = () => {
        setIsLoading(true);

        axiosInstance.post(APIURLS.asset.getAssetTags(), filter)
            .then((res) => {
                const result = res.data as AssetDataQueryResult;
                setData(result);

            })
            .catch((error) => {
            })
            .finally(() => {
                setIsLoading(false);
            });
    }

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        fetchData();
    }, [
        filter.pageNumber,
        filter.pageSize
    ]);

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            fetchData();
        }, 500);

        return () => clearTimeout(delayDebounce);
    }, [filter.search]);

    const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
    const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;

    let filteredData = data.assets.filter(item =>
        item.code.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (orderBy) {
        filteredData.sort((a, b) => {
            const aValue = typeof a[orderBy as keyof typeof a] === 'string' ? (a[orderBy as keyof typeof a] as string).toLowerCase() : String(a[orderBy as keyof typeof a]);
            const bValue = typeof b[orderBy as keyof typeof b] === 'string' ? (b[orderBy as keyof typeof b] as string).toLowerCase() : String(b[orderBy as keyof typeof b]);

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

    const handleRowClick = (data: Asset) => {
        setSelected(data);
    };


    const handleDelete = (data: Asset) => {
        const deletePromise = axiosInstance.delete(APIURLS.asset.deleteAsset() + data.id)
            .then(res => {
                setData(prevData => ({
                    ...prevData, // Keep other properties unchanged
                    assets: prevData.assets.filter(item => item.id !== data.id) // Remove the asset by ID
                }));

                setSelected(null);
            });

        toast.promise(
            deletePromise,
            {
                pending: "Deleting Asset...",
                success: "Asset Deleted!",
                error: "Error Deleting Asset."
            },
            {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: "light"
            }
        );
    };

    const AddData = () => {
        setSelected(dataInitialState);
    };

    const handleSave = (selected: any) => {
        if (selected.name.length < 1) {
            notifyError("Please complete all fields!")
            return;
        }

        let isAdd = selected.id === 0 ? true : false;
        const AddPromise = axiosInstance.post(APIURLS.asset.addAsset(), selected)
            .then(res => {
                setData(prevData => ({
                    ...prevData,
                    assets: isAdd
                        ? [...prevData.assets, res.data]  // Add new asset if isAdd
                        : prevData.assets.map(item =>
                            item.id === res.data.id ? res.data : item // Update if it exists
                        )
                }));
            });

        toast.promise(
            AddPromise,
            {
                pending: selected.id === 0 ? "Adding Asset..." : "Updating Asset...",
                success: selected.id === 0 ? "Asset Added!" : "Asset Updated!",
                error: "Error Saving Asset!"
            },
            {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: "light"
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

        page = Math.max(1, Math.min(page, Math.ceil(data.totalRecords / filter.pageSize)));

        setFilter(prev => ({
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
                    Add Asset
                </button>
            </div>

            <div className="overflow-x-auto mt-4">
                <table className="min-w-full">
                    <thead>
                        <tr>
                            <th
                                className="px-6 py-3 bg-gray-100 text-left text-xs font-bold text-gray-600 uppercase tracking-wider cursor-pointer dark:bg-gray-800 dark:text-white dark:border-gray-700"
                                onClick={() => handleOrder('code')}
                            >
                                Asset Tag {orderBy === 'code' && (orderDesc ? '↓' : '↑')}
                            </th>
                            <th
                                className="px-6 py-3 bg-gray-100 text-left text-xs font-bold text-gray-600 uppercase tracking-wider cursor-pointer dark:bg-gray-800 dark:text-white dark:border-gray-700"
                                onClick={() => handleOrder('name')}
                            >
                                Description {orderBy === 'name' && (orderDesc ? '↓' : '↑')}
                            </th>
                            <th
                                className="px-6 py-3 bg-gray-100 text-left text-xs font-bold text-gray-600 uppercase tracking-wider cursor-pointer dark:bg-gray-800 dark:text-white dark:border-gray-700"
                                onClick={() => handleOrder('branch')}
                            >
                                Branch {orderBy === 'branch' && (orderDesc ? '↓' : '↑')}
                            </th>
                            <th
                                className="px-6 py-3 bg-gray-100 text-left text-xs font-bold text-gray-600 uppercase tracking-wider cursor-pointer dark:bg-gray-800 dark:text-white dark:border-gray-700"
                                onClick={() => handleOrder('equipment')}
                            >
                                Category {orderBy === 'equipment' && (orderDesc ? '↓' : '↑')}
                            </th>
                            <th className="px-6 py-3 bg-gray-100 text-left text-xs font-bold text-gray-600 uppercase tracking-wider dark:bg-gray-800 dark:text-white dark:border-gray-700">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.assets.map((item, index) => (
                            <tr
                                key={item.id}
                                className={`hover:bg-gray-200 dark:hover:bg-gray-700 ${index !== currentItems.length - 1 ? 'border-b border-gray-300 dark:border-gray-700' : ''}`}
                            >
                                <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 text-left">{item.code}</td>
                                <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 text-left">{item.name}</td>
                                <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 text-left">{item.branch}</td>
                                <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 text-left">{item.equipment}</td>
                                <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 text-left">
                                    <button
                                        onClick={() => handleRowClick(item)}
                                        className="mx-2 border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white font-bold px-2 rounded dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-600 dark:hover:text-white"
                                    >
                                        View
                                    </button>
                                    <button
                                        onClick={() => handleDelete(item)}
                                        className="mx-2 border border-red-500 text-red-500 hover:bg-red-500 hover:text-white font-bold px-2 rounded dark:border-red-700 dark:text-red-300 dark:hover:bg-red-600 dark:hover:text-white"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-between items-center mt-2 text-xs sm:text-sm">
                <p className="text-gray-600 dark:text-gray-300 ">
                    Showing <span className="font-semibold">{(filter.pageNumber - 1) * filter.pageSize + 1}</span>
                    &nbsp;to&nbsp;
                    <span className="font-semibold">{Math.min(filter.pageNumber * filter.pageSize, data.totalRecords)}</span>
                    &nbsp;of&nbsp;
                    <span className="font-semibold">{data.totalRecords}</span>
                    &nbsp;
                    results
                </p>



                <div className="flex items-center space-x-1 bg-white dark:bg-gray-800 p-1 sm:p-2 rounded-md shadow-sm border border-gray-300 dark:border-gray-600">
                    <button
                        onClick={() =>
                            setFilter((prev) => ({
                                ...prev,
                                pageNumber: prev.pageNumber - 1
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
                                )
                            }))
                        }
                        disabled={filter.pageNumber >= Math.ceil(data.totalRecords / filter.pageSize)}
                        className="px-3 py-1 sm:px-4 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {">"}
                    </button>
                </div>

            </div>

            <AssetDetail selected={selected} setSelected={setSelected} handleSave={() => handleSave(selected)} />
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

export default Assets;