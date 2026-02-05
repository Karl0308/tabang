import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import LoadComponent from "../../component/LoadComponent";
import { Link } from "react-router-dom";
import { Workstream } from "../../objects/Workstream";
import axios from "axios";
import { APIURLS } from "../../../APIURLS";
import { Branch } from "../../objects/Branch";
import { DocumentType } from "../../objects/DocumentType";
import { User } from "../../objects/User";
import CopyButton from "../../component/CopyButton";
import Select, { MultiValue, ActionMeta } from "react-select";
import { AppSetting } from "../../objects/AppSetting";
import { SelectContainer } from "react-select/dist/declarations/src/components/containers";
import { DepartmentBase } from "../../objects/enum";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import userLogo from "../../../../src/img/user.png";
import {
  faPlusCircle,
  faChevronDown,
  faChevronUp,
  faTicketAlt,
  faClock,
  faSpinner,
  faCheckCircle,
  faPauseCircle,
  faFilter,
} from "@fortawesome/free-solid-svg-icons";
import { Department } from "../../objects/Department";
import WorkstreamViewPopup from "./WorkstreamViewPopup";

const ITEMS_PER_PAGE = 10;

type FilterSearch = {
  value: string | number;
};

interface FilterStatus {
  value: number;
  label: string;
}
interface FilterDepartmentBase {
  value: number;
  label: string;
}
interface FilterPriority {
  value: number;
  label: string;
}
interface FilterOwner {
  value: string | number | null;
  label: string;
}
interface FilterBranch {
  value: string | number;
  label: string;
}
interface WorkstreamQueryResult {
  workstreams: Workstream[];
  pageNumber: number;
  pageSize: number;
  totalRecords: number;
  total: number;
  totalActive: number;
  totalPlanning: number;
  totalOnHold: number;
  totalCompleted: number;
  totalCancelled: number;
}

type FilterState = {
  search: string;
  status: MultiValue<FilterStatus>;
  owners: MultiValue<FilterOwner>;
  branches: MultiValue<FilterBranch>;
  priority: MultiValue<FilterPriority>;
  userId: number;
  pageNumber: number;
  pageSize: number;
  fromDate: Date | null; // start of date range
  toDate: Date | null; // end of date range
};

const Workstreams = () => {
  const { workstreamNum } = useParams();

  const [data, setData] = useState<WorkstreamQueryResult>({
    workstreams: [],
    pageNumber: 1,
    pageSize: 10,
    totalRecords: 0,
    total: 0,
    totalPlanning: 0,
    totalActive: 0,
    totalOnHold: 0,
    totalCompleted: 0,
    totalCancelled: 0,
  });

  let userRole = localStorage.getItem("role");

  const [openFilter, setOpenFilter] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [orderBy, setOrderBy] = useState("");
  const [orderDesc, setOrderDesc] = useState(false);
  const [selectedWorkstream, setSelectedWorkstream] =
    useState<Workstream | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [appSetting, setAppSetting] = useState<AppSetting | null>(null);

  const filterStatusInitialState: FilterStatus = {
    value: 0,
    label: "Planning",
  };
  const [filter, setFilter] = useState<FilterState>({
    search: "",
    status: [filterStatusInitialState],
    owners: [],
    branches: [],
    priority: [],
    userId: localStorage.getItem("id")
      ? parseInt(localStorage.getItem("id") as string)
      : 0,
    pageNumber: 1,
    pageSize: 10,
    fromDate: null, // initialize fromDate
    toDate: null, // initialize toDate
  });

  const StatusList = [
    { value: 10, label: "ALL" },
    { value: 0, label: "PLANNING" },
    { value: 1, label: "ACTIVE" },
    { value: 2, label: "ON HOLD" },
    { value: 3, label: "COMPLETED" },
    { value: 4, label: "CANCELLED" },
  ];
  const PriorityList = [
    { value: 1, label: "Low" },
    { value: 2, label: "Medium" },
    { value: 3, label: "High" },
    { value: 4, label: "Critical" },
  ];

  const OwnerList =
    localStorage.getItem("role") === "1"
      ? [{ value: localStorage.getItem("id") ?? "0", label: "Current User" }]
      : [
          { value: localStorage.getItem("id") ?? "0", label: "Current User" },
          { value: null, label: "Unassigned" },
          ...users
            .filter((x) => x.role !== 2)
            .sort((a, b) => (a.fullName ?? "").localeCompare(b.fullName ?? ""))
            .map((user) => ({
              value: user.id,
              label: user.fullName ?? "Unnamed User",
            })),
        ];

  const BranchList = [
    { value: 0, label: "Unassigned" },
    ...branches
      .sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""))
      .map((branch) => ({
        value: branch.id,
        label: branch.name ?? "Unnamed Branch",
      })),
  ];

  const axiosInstance = axios.create({
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  const getUser = (id?: number) => {
    if (id === undefined) {
      return "Unassigned";
    }
    const reporter = users.find((x) => x.id == id);
    if (reporter == undefined) {
      return "Unassigned";
    } else {
      return reporter.fullName;
    }
  };
  const getBranch = (id?: number) => {
    if (id === undefined) {
      return "Unassigned";
    }
    const branch = branches.find((x) => x.id == id);
    if (branch == undefined) {
      return "Unassigned";
    } else {
      return branch.name;
    }
  };
  const FetchUsers = () => {
    setIsLoading(true);
    axiosInstance
      .get(APIURLS.appsetting.getAppSettings())
      .then((res) => {
        setAppSetting(res.data);
      })
      .catch((error) => {
      });
  };
  const FetchAppSettings = () => {
    setIsLoading(true);
    axiosInstance
      .get(APIURLS.user.getUsers())
      .then((res) => res.data)
      .then(
        (result) => {
          setUsers(result);
          setIsLoading(false);
        },
        (error) => {}
      );
  };
  const FetchBranches = () => {
    setIsLoading(true);
    axiosInstance
      .get(APIURLS.branch.getBranches())
      .then((res) => res.data)
      .then(
        (result) => {
          setBranches(result);
          setIsLoading(false);
        },
        (error) => {
        }
      );
  };

  const [counter, setCounter] = useState(0);

  const fetchDataTimer = useCallback(() => {
    const transformedFilter = {
      ...filter,
      status: filter.status.map((s) => s.value),
      owners: filter.owners.map((u) => u.value),
      branches: filter.branches.map((b) => b.value),
      priority: filter.priority.map((p) => p.value),
    };

    setIsLoading(true);
    axiosInstance
      .post(APIURLS.workstream.getWorkstreams(), transformedFilter)
      .then((res) => {
        const result = res.data as WorkstreamQueryResult;
        setData(result);

        if (workstreamNum !== undefined) {
          fetchDataFromWorkstreamNum();
        }
      })
      .catch((error) => {
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [filter]); // Ensure fetchData updates when filter changes

  useEffect(() => {
    if (selectedWorkstream === null) {
      const timeout = setTimeout(() => {
        setCounter(counter + 1);
        fetchData();
      }, 180000);

      return () => {
        clearTimeout(timeout);
      };
    }
  }, [counter, selectedWorkstream, fetchDataTimer]); // Include `fetchData` as a dependency

  useEffect(() => {
    fetchData();
  }, [
    filter.status,
    filter.owners,
    filter.branches,
    filter.priority,
    filter.userId,
    filter.pageNumber,
    filter.pageSize,
    filter.fromDate,
    filter.toDate,
  ]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchData();
    }, 1000);

    return () => clearTimeout(delayDebounce);
  }, [filter.search]);

  useEffect(() => {
    fetchDataFromWorkstreamNum();
  }, [workstreamNum]);

  const fetchData = () => {
    const transformedFilter = {
      ...filter,
      status: filter.status.map((s) => s.value),
      owners: filter.owners.map((u) => u.value),
      branches: filter.branches.map((b) => b.value),
      priority: filter.priority.map((p) => p.value),
    };

    setIsLoading(true);
    axiosInstance
      .post(APIURLS.workstream.getWorkstreams(), transformedFilter)
      .then((res) => {
        const result = res.data as WorkstreamQueryResult;
        setData(result);
      })
      .catch((error) => {
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const fetchDataFromWorkstreamNum = () => {
    if (selectedWorkstream !== null) {
      return;
    }

    setIsLoading(true);
    axiosInstance
      .get(APIURLS.workstream.getWorkstreamNum() + workstreamNum)
      .then((res) => {
        const selectedWorkstream = res.data as Workstream;
        if (selectedWorkstream) {
          setSelectedWorkstream(selectedWorkstream);
        }
        setIsLoading(false);
      })
      .catch((error) => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    FetchAppSettings();
    FetchUsers();
    FetchBranches();
    fetchData();
  }, []);

  const onChangeStatusFilter = (
    newValue: MultiValue<FilterStatus>,
    actionMeta: ActionMeta<FilterStatus>
  ) => {
    setFilter((prevFilter) => ({
      ...prevFilter,
      status: newValue, // newValue is the selected options array
    }));

    if (newValue.length === 0) {
      setFilter((prevFilter) => ({
        ...prevFilter,
        status: [filterStatusInitialState], // Reset to default status if no selection
      }));
    }
  };

  const onChangePriorityFilter = (
    newValue: MultiValue<FilterPriority>,
    actionMeta: ActionMeta<FilterPriority>
  ) => {
    setFilter((filter) => ({
      ...filter,
      priority: newValue,
    }));
  };

  const onChangeUserFilter = (
    newValue: MultiValue<FilterOwner>,
    actionMeta: ActionMeta<FilterOwner>
  ) => {
    setFilter((filter) => ({
      ...filter,
      userOption: newValue,
    }));
  };

  const onChangeBranchFilter = (
    newValue: MultiValue<FilterBranch>,
    actionMeta: ActionMeta<FilterBranch>
  ) => {
    setFilter((filter) => ({
      ...filter,
      branches: newValue,
    }));
  };

  const handleOrder = (columnName: string) => {
    if (orderBy === columnName) {
      setOrderDesc(!orderDesc);
    } else {
      setOrderBy(columnName);
      setOrderDesc(false);
    }
  };

  const handleRowClick = (workstream: Workstream) => {
    setSelectedWorkstream(workstream);
  };

  const handleSave = () => {
    setSelectedWorkstream(null);
  };
  const handleClose = () => {
    setSelectedWorkstream(null);
    fetchData();
  };
  // Priority color mapping - Enhanced with gradients
  const getPriorityColor = (priority: string) => {
    switch (priority.toUpperCase()) {
      case "CRITICAL":
        return "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-500/30";
      case "HIGH":
        return "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md shadow-orange-500/30";
      case "MEDIUM":
        return "bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 shadow-md shadow-yellow-500/30";
      case "LOW":
        return "bg-gradient-to-r from-green-400 to-green-500 text-white shadow-md shadow-green-500/30";
      default:
        return "bg-gray-300 text-gray-700 dark:bg-gray-600 dark:text-gray-200";
    }
  };

  // Status color mapping - Enhanced with gradients
  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "PLANNING":
        return "bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 shadow-md";
      case "ACTIVE":
        return "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md shadow-blue-500/30";
      case "ON HOLD":
        return "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md shadow-red-500/30";
      case "COMPLETED":
        return "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md shadow-green-500/30";
      case "CANCELLED":
        return "bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-md";
      default:
        return "bg-gray-300 text-gray-700 dark:bg-gray-600 dark:text-gray-200";
    }
  };

  const formatTimeDifference = (from: string, to: string) => {
    const currentDate = new Date(from);
    const creationDate = new Date(to);

    const timeDifference = currentDate.getTime() - creationDate.getTime();

    const seconds = Math.floor(timeDifference / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}d ${hours % 24}h ${minutes % 60}m ago`;
    } else if (hours > 0) {
      return `${hours}h ${minutes % 60}m ago`;
    } else {
      return `${minutes}m ago`;
    }
  };
  const formatTimeDifferenceInMinutes = (from: string, to: string) => {
    const currentDate = new Date(from);
    const creationDate = new Date(to);

    const timeDifference = currentDate.getTime() - creationDate.getTime();
    const minutes = Math.floor(timeDifference / 60000); // Convert ms to minutes

    return minutes;
  };

  // const getAppSettingsColor = (dateEntry: Date, status: number) => {
  //     if (status === 0) {
  //         return "bg-green-200";
  //     }

  //     if (appSetting) {
  //         const colorMap: Record<string, string> = {
  //             red: "bg-red-200",
  //             blue: "bg-blue-200",
  //             yellow: "bg-yellow-200",
  //             green: "bg-green-200",
  //             gray: "bg-gray-200",
  //         };

  //         const newColor = colorMap[appSetting.newColor] || "bg-gray-200";
  //         const warningColor = colorMap[appSetting.warningColor] || "bg-gray-200";
  //         const severeColor = colorMap[appSetting.severeColor] || "bg-gray-200";

  //         const newFrom = parseInt(appSetting.newFrom, 10);
  //         const newTo = parseInt(appSetting.newTo, 10);
  //         const warningFrom = parseInt(appSetting.warningFrom, 10);
  //         const warningTo = parseInt(appSetting.warningTo, 10);
  //         const severeFrom = parseInt(appSetting.severeFrom, 10);

  //         const entryDate = new Date(dateEntry);
  //         const currentDate = new Date();
  //         const minutes = Math.floor((currentDate.getTime() - entryDate.getTime()) / 60000); // Convert ms to minutes

  //         if (minutes >= newFrom && minutes < newTo) {
  //             return newColor;
  //         } else if (minutes >= warningFrom && minutes < warningTo) {
  //             return warningColor;
  //         } else if (minutes >= severeFrom) {
  //             return severeColor;
  //         }
  //     }

  //     return "bg-gray-200";
  // };

  const getAppSettingsColor = (dateEntry: Date, status: number) => {
    if (status === 0) {
      return "bg-green-800";
    }

    if (appSetting) {
      const colorMap: Record<string, string> = {
        red: "bg-red-400",
        blue: "bg-blue-400",
        yellow: "bg-yellow-400",
        green: "bg-green-400",
        gray: "bg-gray-400",
        orange: "bg-orange-400",
      };

      const newColor = colorMap[appSetting.newColor] || "bg-gray-400";
      const warningColor = colorMap[appSetting.warningColor] || "bg-gray-400";
      const severeColor = colorMap[appSetting.severeColor] || "bg-gray-400";

      const newFrom = parseInt(appSetting.newFrom, 10); // already in minutes
      const newTo = parseInt(appSetting.newTo, 10); // already in minutes
      const warningFrom = parseInt(appSetting.warningFrom, 10); // already in minutes
      const warningTo = parseInt(appSetting.warningTo, 10); // already in minutes
      const severeFrom = parseInt(appSetting.severeFrom, 10); // already in minutes
      const severeTo = parseInt(appSetting.severeTo, 10); // already in minutes

      const entryDate = new Date(dateEntry);
      const currentDate = new Date();

      // Calculate the time difference in minutes
      const timeDifference =
        (currentDate.getTime() - entryDate.getTime()) / (1000 * 60); // Convert to minutes
      const minutes = Math.floor(timeDifference);

      let selectedColor = "bg-gray-400"; // Default color

      // Color logic based on minutes
      if (minutes >= newFrom && minutes < newTo) {
        selectedColor = newColor; // New Color (in minutes)
      }
      if (minutes >= warningFrom && minutes < warningTo) {
        selectedColor = warningColor; // Warning Color (in minutes)
      }
      if (minutes >= severeFrom) {
        selectedColor = severeColor; // Severe Color (in minutes)
      }

      return selectedColor;
    }

    return "bg-gray-400"; // Default color if no settings match
  };

  if (orderBy) {
    data.workstreams.sort((a, b) => {
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

  const [theme, setTheme] = useState<string>(() => {
    return localStorage.getItem("theme") || "light";
  });

  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

  const defaultColumns = {
    workstream: true,
    title: true,
    duration: true,
    branch: true,
    owner: true,
    priority: true,
    status: true,
  };

  const [visibleColumns, setVisibleColumns] = useState(() => {
    const stored = localStorage.getItem("workstream_columns");
    return stored ? JSON.parse(stored) : defaultColumns;
  });

  useEffect(() => {
    localStorage.setItem("workstream_columns", JSON.stringify(visibleColumns));
  }, [visibleColumns]);

  // Drag & Drop state
  const [columns, setColumns] = useState(
    Object.keys(visibleColumns).filter((key) => visibleColumns[key])
  );
  const dragCol = useRef<string | null>(null);

  useEffect(() => {
    // Sync columns whenever visibleColumns changes
    setColumns((prev) => {
      const updated = prev.filter((col) => visibleColumns[col]); // remove hidden columns
      Object.keys(visibleColumns).forEach((col) => {
        if (visibleColumns[col] && !updated.includes(col)) updated.push(col); // add newly visible columns at the end
      });
      return updated;
    });
  }, [visibleColumns]);

  const handleDragStart = (key: string) => {
    dragCol.current = key;
  };

  const handleDragOver = (e: React.DragEvent<HTMLTableCellElement>) => {
    e.preventDefault();
  };

  const handleDrop = (key: string) => {
    if (!dragCol.current || dragCol.current === key) return;
    const newCols = [...columns];
    const fromIndex = newCols.indexOf(dragCol.current);
    const toIndex = newCols.indexOf(key);
    newCols.splice(fromIndex, 1);
    newCols.splice(toIndex, 0, dragCol.current);
    setColumns(newCols);
    dragCol.current = null;
  };

  return (
    <>
      <div className="flex flex-col h-full mx-auto w-full">
        <div className="container mx-auto flex-grow overflow-auto">
          <div className="p-4 sm:p-6">
            {/* Enhanced Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 mb-2">
                  Workstreams
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                  Manage and track all workstreams efficiently
                </p>
              </div>
            </div>

            <>
              {/* Enhanced Filter Button */}
              <button
                onClick={() => setOpenFilter(!openFilter)}
                className={`inline-flex items-center gap-3 px-6 py-3 mb-6 rounded-xl shadow-lg hover:shadow-xl active:scale-95 transition-all duration-200 font-semibold ${
                  openFilter
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500"
                }`}
              >
                <FontAwesomeIcon icon={faFilter} />
                <span>Filters</span>
                <FontAwesomeIcon
                  icon={openFilter ? faChevronUp : faChevronDown}
                  className="text-sm"
                />
              </button>

              <div
                className={
                  `overflow-hidden transition-all duration-300 ease-in-out ` +
                  (openFilter
                    ? "max-h-[1000px] opacity-100"
                    : "max-h-0 opacity-0")
                }
              >
                <div
                  className={
                    `transform transition-all duration-300 ` +
                    (openFilter ? "translate-y-0" : "-translate-y-2")
                  }
                >
                  <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 mb-6">
                    <div className="col-span-1 sm:col-span-2 lg:col-span-6">
                      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-2 lg:mb-0">
                          Date Range
                        </h3>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Select start and end dates
                        </span>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3 pb-4 rounded-2xl bg-white dark:bg-gray-800 dark:border-gray-700 items-center">
                        {/* From Date */}
                        <input
                          type="date"
                          className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={
                            filter.fromDate
                              ? filter.fromDate.toISOString().split("T")[0]
                              : ""
                          }
                          onChange={(e) =>
                            setFilter((prev) => ({
                              ...prev,
                              fromDate: e.target.value
                                ? new Date(e.target.value)
                                : null,
                            }))
                          }
                        />

                        {/* To Date */}
                        <input
                          type="date"
                          className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={
                            filter.toDate
                              ? filter.toDate.toISOString().split("T")[0]
                              : ""
                          }
                          onChange={(e) =>
                            setFilter((prev) => ({
                              ...prev,
                              toDate: e.target.value
                                ? new Date(e.target.value)
                                : null,
                            }))
                          }
                        />

                        {/* Clear Button */}
                        <button
                          type="button"
                          onClick={() =>
                            setFilter((prev) => ({
                              ...prev,
                              fromDate: null,
                              toDate: null,
                            }))
                          }
                          className="px-4 py-2 mt-2 sm:mt-0 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition"
                        >
                          Clear
                        </button>
                      </div>
                    </div>

                    {/* Content */}

                    <div
                      className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 transition-all duration-300 overflow-hidden ${
                        openFilter
                          ? "max-h-[1000px] opacity-100"
                          : "max-h-0 opacity-0"
                      }`}
                    >
                      {/* Enhanced Search */}
                      <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                          Search
                        </label>
                        <div className="relative">
                          <svg className="absolute left-3 top-3 w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                          <input
                            type="text"
                            placeholder="Search workstreams..."
                            className="w-full pl-10 pr-10 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-gray-400 dark:placeholder-gray-400"
                            value={filter.search}
                            onChange={(e) =>
                              setFilter((prev) => ({
                                ...prev,
                                search: e.target.value,
                              }))
                            }
                          />
                          {filter.search && (
                            <button
                              onClick={() => setFilter((prev) => ({ ...prev, search: "" }))}
                              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Status */}
                      <div>
                        <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-200 mb-2">
                          Status
                        </label>
                        <Select
                          isMulti
                          options={StatusList}
                          onChange={onChangeStatusFilter}
                          value={filter.status}
                          // placeholder="Select Status..."
                          closeMenuOnSelect={true}
                          isClearable
                          isSearchable={false}
                          className="w-full"
                          menuPortalTarget={document.body}
                          styles={{
                            control: (base: any) => ({
                              ...base,
                              minHeight: "2.5rem",
                              borderRadius: "0.5rem",
                              borderColor: theme === "dark" ? "#555" : "#ccc",
                              backgroundColor:
                                theme === "dark" ? "#2d3748" : "#fff",
                              color: theme === "dark" ? "#fff" : "#000",
                            }),
                            multiValue: (base: any, state: any) => {
                              const index = state.index;
                              return {
                                ...base,
                                display: index === 0 ? "flex" : "none", // show only the first selected
                              };
                            },
                            multiValueLabel: (base: any, state: any) => {
                              const index = state.index;
                              return {
                                ...base,
                                display: index === 0 ? "block" : "none",
                              };
                            },
                            multiValueRemove: (base: any, state: any) => {
                              const index = state.index;
                              return {
                                ...base,
                                display: index === 0 ? "block" : "none",
                              };
                            },
                            valueContainer: (base: any, state: any) => {
                              const total = state.getValue().length;
                              return {
                                ...base,
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem",
                                paddingLeft: "0.75rem",
                                "&::after": {
                                  content:
                                    total > 1 ? `" +${total - 1}"` : '""', // show +N-1
                                  color: theme === "dark" ? "#fff" : "#000",
                                  marginLeft: "0.25rem",
                                },
                              };
                            },
                            menu: (base: any) => ({
                              ...base,
                              borderRadius: "0.5rem",
                              backgroundColor:
                                theme === "dark" ? "#2d3748" : "#fff",
                            }),
                            option: (base: any) => ({
                              ...base,
                              backgroundColor:
                                theme === "dark" ? "#444" : "#fff",
                              color: theme === "dark" ? "#fff" : "#000",
                              "&:hover": {
                                backgroundColor:
                                  theme === "dark" ? "#555" : "#f0f0f0",
                              },
                            }),
                          }}
                        />
                      </div>

                      {/* Priority */}
                      <div>
                        <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-200 mb-2">
                          Assignee
                        </label>
                        <Select
                          isMulti
                          options={OwnerList}
                          onChange={onChangeUserFilter}
                          value={filter.owners}
                          // placeholder="Select assignee..."
                          closeMenuOnSelect={false}
                          isClearable
                          isSearchable={true}
                          className="w-full"
                          menuPortalTarget={document.body}
                          styles={{
                            control: (base: any) => ({
                              ...base,
                              minHeight: "2.5rem",
                              borderRadius: "0.5rem",
                              borderColor: theme === "dark" ? "#555" : "#ccc",
                              backgroundColor:
                                theme === "dark" ? "#2d3748" : "#fff",
                              color: theme === "dark" ? "#fff" : "#000",
                            }),
                            multiValue: (base: any, state: any) => {
                              const index = state.index;
                              return {
                                ...base,
                                display: index === 0 ? "flex" : "none", // show only first selected
                              };
                            },
                            multiValueLabel: (base: any, state: any) => {
                              const index = state.index;
                              return {
                                ...base,
                                display: index === 0 ? "block" : "none",
                              };
                            },
                            multiValueRemove: (base: any, state: any) => {
                              const index = state.index;
                              return {
                                ...base,
                                display: index === 0 ? "block" : "none",
                              };
                            },
                            valueContainer: (base: any, state: any) => {
                              const total = state.getValue().length;
                              return {
                                ...base,
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem",
                                paddingLeft: "0.75rem",
                                "&::after": {
                                  content:
                                    total > 1 ? `" +${total - 1}"` : '""',
                                  color: theme === "dark" ? "#fff" : "#000",
                                  marginLeft: "0.25rem",
                                },
                              };
                            },
                            menu: (base: any) => ({
                              ...base,
                              borderRadius: "0.5rem",
                              backgroundColor:
                                theme === "dark" ? "#2d3748" : "#fff",
                            }),
                            option: (base: any) => ({
                              ...base,
                              backgroundColor:
                                theme === "dark" ? "#444" : "#fff",
                              color: theme === "dark" ? "#fff" : "#000",
                              "&:hover": {
                                backgroundColor:
                                  theme === "dark" ? "#555" : "#f0f0f0",
                              },
                            }),
                          }}
                        />
                      </div>

                      {/* Branch */}
                      <div>
                        <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-200 mb-2">
                          Branch
                        </label>
                        <Select
                          isMulti
                          options={BranchList} // your array: [{ value: 'Atrium', label: 'Atrium' }, ...]
                          onChange={onChangeBranchFilter}
                          value={filter.branches}
                          // placeholder="Select branch..."
                          closeMenuOnSelect={true}
                          isClearable
                          isSearchable={false}
                          className="w-full"
                          menuPortalTarget={document.body} // ensures dropdown is not cut off
                          styles={{
                            control: (base: any) => ({
                              ...base,
                              minHeight: "2.5rem", // keeps compact height
                              borderRadius: "0.5rem",
                              borderColor: theme === "dark" ? "#555" : "#ccc",
                              backgroundColor:
                                theme === "dark" ? "#2d3748" : "#fff",
                              color: theme === "dark" ? "#fff" : "#000",
                            }),
                            multiValue: (base: any, state: any) => {
                              const index = state.index;
                              return {
                                ...base,
                                display: index === 0 ? "flex" : "none", // show only first selected
                              };
                            },
                            multiValueLabel: (base: any, state: any) => {
                              const index = state.index;
                              return {
                                ...base,
                                display: index === 0 ? "block" : "none",
                              };
                            },
                            multiValueRemove: (base: any, state: any) => {
                              const index = state.index;
                              return {
                                ...base,
                                display: index === 0 ? "block" : "none",
                              };
                            },
                            valueContainer: (base: any, state: any) => {
                              const total = state.getValue().length;
                              return {
                                ...base,
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem",
                                paddingLeft: "0.75rem",
                                "&::after": {
                                  content:
                                    total > 1 ? `" +${total - 1}"` : '""',
                                  color: theme === "dark" ? "#fff" : "#000",
                                  marginLeft: "0.25rem",
                                },
                              };
                            },
                            menu: (base: any) => ({
                              ...base,
                              borderRadius: "0.5rem",
                              backgroundColor:
                                theme === "dark" ? "#2d3748" : "#fff",
                            }),
                            option: (base: any) => ({
                              ...base,
                              backgroundColor:
                                theme === "dark" ? "#444" : "#fff",
                              color: theme === "dark" ? "#fff" : "#000",
                              "&:hover": {
                                backgroundColor:
                                  theme === "dark" ? "#555" : "#f0f0f0",
                              },
                            }),
                          }}
                        />
                      </div>

                      {/* Priority*/}
                      <div>
                        <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-200 mb-2">
                          Priority
                        </label>
                        <Select
                          isMulti
                          options={PriorityList} // if it’s actually a Priority dropdown, replace with PriorityList
                          onChange={onChangePriorityFilter}
                          value={filter.priority}
                          // placeholder="Select priority..."
                          closeMenuOnSelect={true}
                          isClearable
                          isSearchable={false}
                          className="w-full"
                          menuPortalTarget={document.body}
                          styles={{
                            control: (base: any) => ({
                              ...base,
                              minHeight: "2.5rem",
                              borderRadius: "0.5rem",
                              borderColor: theme === "dark" ? "#555" : "#ccc",
                              backgroundColor:
                                theme === "dark" ? "#2d3748" : "#fff",
                              color: theme === "dark" ? "#fff" : "#000",
                            }),
                            multiValue: (base: any, state: any) => ({
                              ...base,
                              display: state.index === 0 ? "flex" : "none",
                            }),
                            multiValueLabel: (base: any, state: any) => ({
                              ...base,
                              display: state.index === 0 ? "block" : "none",
                            }),
                            multiValueRemove: (base: any, state: any) => ({
                              ...base,
                              display: state.index === 0 ? "block" : "none",
                            }),
                            valueContainer: (base: any, state: any) => {
                              const total = state.getValue().length;
                              return {
                                ...base,
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem",
                                paddingLeft: "0.75rem",
                                "&::after": {
                                  content:
                                    total > 1 ? `" +${total - 1}"` : '""',
                                  color: theme === "dark" ? "#fff" : "#000",
                                  marginLeft: "0.25rem",
                                },
                              };
                            },
                            menu: (base: any) => ({
                              ...base,
                              borderRadius: "0.5rem",
                              backgroundColor:
                                theme === "dark" ? "#2d3748" : "#fff",
                            }),
                            option: (base: any) => ({
                              ...base,
                              backgroundColor:
                                theme === "dark" ? "#444" : "#fff",
                              color: theme === "dark" ? "#fff" : "#000",
                              "&:hover": {
                                backgroundColor:
                                  theme === "dark" ? "#555" : "#f0f0f0",
                              },
                            }),
                          }}
                        />
                      </div>

                      <div className="col-span-1 sm:col-span-2 lg:col-span-3 xl:col-span-6 hidden lg:block">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                            Column Visibility
                          </h3>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Customize table view
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-2 pb-4 rounded-2xl dark:border-gray-700 ">
                          {Object.keys(defaultColumns).map((key) => {
                            const active = visibleColumns[key];

                            return (
                              <label
                                key={key}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm border cursor-pointer transition  ${
                                  active
                                    ? "bg-blue-50 border-blue-300 text-blue-700 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-300"
                                    : "bg-white border-gray-300 text-gray-600 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  className="hidden"
                                  checked={active}
                                  onChange={(e) =>
                                    setVisibleColumns((prev: any) => ({
                                      ...prev,
                                      [key]: e.target.checked,
                                    }))
                                  }
                                />
                                <span className="capitalize">{key}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Statistics Cards */}
              <div className="hidden sm:grid grid-cols-2 lg:grid-cols-6 gap-4 lg:gap-5 mb-8">
                {/* Total Workstreams - Gradient Blue */}
                <div className="group relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/50 dark:to-blue-800/50 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className="relative z-10 p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2.5 bg-white/80 dark:bg-blue-700/50 rounded-xl shadow-sm backdrop-blur-sm">
                        <svg className="w-5 h-5 text-blue-600 dark:text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                    </div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Total</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{data.total}</p>
                  </div>
                  <div className="absolute top-0 right-0 w-24 h-24 bg-blue-200 dark:bg-blue-700/30 rounded-full -mr-12 -mt-12 opacity-30"></div>
                </div>

                {/* Planning - Gradient Yellow */}
                <div
                  onClick={() => {
                    const statusObj = StatusList.find((s) => s.value === 0);
                    if (!statusObj) return;
                    setFilter((prev) => {
                      const exists = prev.status.some((s) => s.value === statusObj.value);
                      return {
                        ...prev,
                        status: exists ? prev.status.filter((s) => s.value !== statusObj.value) : [...prev.status, statusObj],
                        pageNumber: 1,
                      };
                    });
                  }}
                  className={`group relative overflow-hidden cursor-pointer rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${
                    filter.status.some((s) => s.value === 0)
                      ? "bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-600/50 dark:to-yellow-700/50 ring-2 ring-yellow-400"
                      : "bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/30 dark:to-yellow-800/30"
                  }`}
                >
                  <div className="relative z-10 p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2.5 bg-white/80 dark:bg-yellow-700/50 rounded-xl shadow-sm backdrop-blur-sm">
                        <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                      </div>
                    </div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Planning</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{data.totalPlanning}</p>
                  </div>
                  <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-200 dark:bg-yellow-700/30 rounded-full -mr-12 -mt-12 opacity-30"></div>
                </div>

                {/* Active - Gradient Blue/Purple */}
                <div
                  onClick={() => {
                    const statusObj = StatusList.find((s) => s.value === 1);
                    if (!statusObj) return;
                    setFilter((prev) => {
                      const exists = prev.status.some((s) => s.value === statusObj.value);
                      return {
                        ...prev,
                        status: exists ? prev.status.filter((s) => s.value !== statusObj.value) : [...prev.status, statusObj],
                        pageNumber: 1,
                      };
                    });
                  }}
                  className={`group relative overflow-hidden cursor-pointer rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${
                    filter.status.some((s) => s.value === 1)
                      ? "bg-gradient-to-br from-blue-100 to-indigo-200 dark:from-blue-600/50 dark:to-indigo-700/50 ring-2 ring-blue-400"
                      : "bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-800/30"
                  }`}
                >
                  <div className="relative z-10 p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2.5 bg-white/80 dark:bg-blue-700/50 rounded-xl shadow-sm backdrop-blur-sm">
                        <svg className="w-5 h-5 text-blue-600 dark:text-blue-200 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                    </div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Active</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{data.totalActive}</p>
                  </div>
                  <div className="absolute top-0 right-0 w-24 h-24 bg-blue-200 dark:bg-blue-700/30 rounded-full -mr-12 -mt-12 opacity-30"></div>
                </div>

                {/* On Hold - Gradient Red */}
                <div
                  onClick={() => {
                    const statusObj = StatusList.find((s) => s.value === 2);
                    if (!statusObj) return;
                    setFilter((prev) => {
                      const exists = prev.status.some((s) => s.value === statusObj.value);
                      return {
                        ...prev,
                        status: exists ? prev.status.filter((s) => s.value !== statusObj.value) : [...prev.status, statusObj],
                        pageNumber: 1,
                      };
                    });
                  }}
                  className={`group relative overflow-hidden cursor-pointer rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${
                    filter.status.some((s) => s.value === 2)
                      ? "bg-gradient-to-br from-red-100 to-red-200 dark:from-red-600/50 dark:to-red-700/50 ring-2 ring-red-400"
                      : "bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30"
                  }`}
                >
                  <div className="relative z-10 p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2.5 bg-white/80 dark:bg-red-700/50 rounded-xl shadow-sm backdrop-blur-sm">
                        <svg className="w-5 h-5 text-red-600 dark:text-red-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">On Hold</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{data.totalOnHold}</p>
                  </div>
                  <div className="absolute top-0 right-0 w-24 h-24 bg-red-200 dark:bg-red-700/30 rounded-full -mr-12 -mt-12 opacity-30"></div>
                </div>

                {/* Completed - Gradient Green */}
                <div
                  onClick={() => {
                    const statusObj = StatusList.find((s) => s.value === 3);
                    if (!statusObj) return;
                    setFilter((prev) => {
                      const exists = prev.status.some((s) => s.value === statusObj.value);
                      return {
                        ...prev,
                        status: exists ? prev.status.filter((s) => s.value !== statusObj.value) : [...prev.status, statusObj],
                        pageNumber: 1,
                      };
                    });
                  }}
                  className={`group relative overflow-hidden cursor-pointer rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${
                    filter.status.some((s) => s.value === 3)
                      ? "bg-gradient-to-br from-green-100 to-green-200 dark:from-green-600/50 dark:to-green-700/50 ring-2 ring-green-400"
                      : "bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30"
                  }`}
                >
                  <div className="relative z-10 p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2.5 bg-white/80 dark:bg-green-700/50 rounded-xl shadow-sm backdrop-blur-sm">
                        <svg className="w-5 h-5 text-green-600 dark:text-green-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Completed</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{data.totalCompleted}</p>
                  </div>
                  <div className="absolute top-0 right-0 w-24 h-24 bg-green-200 dark:bg-green-700/30 rounded-full -mr-12 -mt-12 opacity-30"></div>
                </div>

                {/* Cancelled - Gradient Gray */}
                <div
                  onClick={() => {
                    const statusObj = StatusList.find((s) => s.value === 4);
                    if (!statusObj) return;
                    setFilter((prev) => {
                      const exists = prev.status.some((s) => s.value === statusObj.value);
                      return {
                        ...prev,
                        status: exists ? prev.status.filter((s) => s.value !== statusObj.value) : [...prev.status, statusObj],
                        pageNumber: 1,
                      };
                    });
                  }}
                  className={`group relative overflow-hidden cursor-pointer rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${
                    filter.status.some((s) => s.value === 4)
                      ? "bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600/50 dark:to-gray-700/50 ring-2 ring-gray-400"
                      : "bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800/30 dark:to-gray-700/30"
                  }`}
                >
                  <div className="relative z-10 p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2.5 bg-white/80 dark:bg-gray-600/50 rounded-xl shadow-sm backdrop-blur-sm">
                        <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                    </div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Cancelled</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{data.totalCancelled}</p>
                  </div>
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gray-300 dark:bg-gray-600/30 rounded-full -mr-12 -mt-12 opacity-30"></div>
                </div>
              </div>

              {/* Mobile Statistics Cards */}
              <div className="grid grid-cols-3 sm:hidden gap-2 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/50 dark:to-blue-800/50 rounded-xl shadow-sm p-3 text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.total}</p>
                  <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase">Total</p>
                </div>
                <div
                  onClick={() => {
                    const statusObj = StatusList.find((s) => s.value === 1);
                    if (statusObj) setFilter((prev) => ({ ...prev, status: [statusObj], pageNumber: 1 }));
                  }}
                  className={`rounded-xl shadow-sm p-3 text-center cursor-pointer transition-all duration-200 active:scale-95 ${
                    filter.status.some((s) => s.value === 1)
                      ? "bg-gradient-to-br from-blue-100 to-indigo-200 ring-2 ring-blue-400"
                      : "bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-800/30"
                  }`}
                >
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.totalActive}</p>
                  <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase">Active</p>
                </div>
                <div
                  onClick={() => {
                    const statusObj = StatusList.find((s) => s.value === 3);
                    if (statusObj) setFilter((prev) => ({ ...prev, status: [statusObj], pageNumber: 1 }));
                  }}
                  className={`rounded-xl shadow-sm p-3 text-center cursor-pointer transition-all duration-200 active:scale-95 ${
                    filter.status.some((s) => s.value === 3)
                      ? "bg-gradient-to-br from-green-100 to-green-200 ring-2 ring-green-400"
                      : "bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30"
                  }`}
                >
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.totalCompleted}</p>
                  <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase">Done</p>
                </div>
              </div>
            </>

            {/* Table */}
            <>
              {/* Skeleton Loader */}
              {isLoading && data.workstreams.length === 0 && (
                <div className="space-y-6 animate-pulse">
                  {/* Skeleton Statistics Cards */}
                  <div className="hidden sm:grid grid-cols-2 lg:grid-cols-6 gap-4 lg:gap-5">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded-2xl h-32"></div>
                    ))}
                  </div>
                  {/* Skeleton Table */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="space-y-4">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center space-x-4">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Workstreams List */}
              <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-2 border-gray-200 dark:border-gray-700 overflow-hidden ${isLoading && data.workstreams.length === 0 ? 'hidden' : ''}`}>
                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-750">
                      <tr>
                        {columns.map((key) => (
                          <th
                            key={key}
                            className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider cursor-move hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
                            draggable
                            onDragStart={() => handleDragStart(key)}
                            onDragOver={handleDragOver}
                            onDrop={() => handleDrop(key)}
                          >
                            {key.charAt(0).toUpperCase() + key.slice(1)}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {data.workstreams.map((item, index) => (
                        <tr
                          onClick={() => handleRowClick(item)}
                          key={item.workStreamNumber}
                          className="group hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-gray-700 dark:hover:to-gray-600 cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] active:bg-blue-100 dark:active:bg-gray-600 border-l-4 border-transparent hover:border-blue-500"
                        >
                          {columns.map((key) => {
                            if (!visibleColumns[key]) return null; // <-- hide column if not visible

                            switch (key) {
                              case "workstream":
                                return (
                                  <td
                                    key={key}
                                    className="px-6 py-4 whitespace-nowrap"
                                  >
                                    <div className="flex items-center">
                                      <div className="text-sm font-bold text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-200">
                                        {item.workStreamNumber}
                                      </div>
                                    </div>
                                  </td>
                                );
                              case "title":
                                return (
                                  <td key={key} className="px-6 py-4 max-w-xs">
                                    <div className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-200 truncate">
                                      {item.title}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                      {item.duration}
                                    </div>
                                  </td>
                                );
                              case "duration":
                                return (
                                  <td
                                    key={key}
                                    className="px-6 py-4 whitespace-nowrap"
                                  >
                                    <div className="flex items-center">
                                      <div
                                        className={`w-3 h-3 ${getAppSettingsColor(
                                          item.createdAt,
                                          item.status
                                        )} rounded-full mr-2 ring-2 ring-white dark:ring-gray-800 shadow-sm`}
                                      ></div>
                                      <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                                        {item.duration}
                                      </span>
                                    </div>
                                  </td>
                                );

                              case "branch":
                                return (
                                  <td
                                    key={key}
                                    className="px-6 py-4 whitespace-nowrap"
                                  >
                                    <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                                      {getBranch(item.branchId)}
                                    </span>
                                  </td>
                                );
                              case "owner":
                                return (
                                  <td
                                    key={key}
                                    className="px-6 py-4 whitespace-nowrap"
                                  >
                                    <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                                      {getUser(item.ownerId)}
                                    </span>
                                  </td>
                                );
                              case "priority":
                                return (
                                  <td
                                    key={key}
                                    className="px-6 py-4 whitespace-nowrap"
                                  >
                                    <span
                                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(
                                        item.priorityName
                                      )}`}
                                    >
                                      {item.priorityName}
                                    </span>
                                  </td>
                                );
                              case "status":
                                return (
                                  <td
                                    key={key}
                                    className="px-6 py-4 whitespace-nowrap"
                                  >
                                    <span
                                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                                        item.statusName
                                      )}`}
                                    >
                                      {item.statusName}
                                    </span>
                                  </td>
                                );
                              default:
                                return null;
                            }
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Enhanced Mobile Card View */}
                <div className="lg:hidden space-y-4 p-4">
                  {data.workstreams.map((item) => (
                    <div
                      key={item.workStreamNumber}
                      className="group bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-5 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 cursor-pointer active:scale-[0.97] hover:scale-[1.01] hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-gray-750 dark:hover:to-gray-700"
                      onClick={() => handleRowClick(item)}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="text-lg font-bold text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-200 mb-2">
                            {item.workStreamNumber}
                          </div>
                          <div className="text-base font-semibold text-gray-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-200 line-clamp-2">
                            {item.title}
                          </div>
                        </div>
                        <span
                          className={`ml-3 inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold shadow-sm ${getStatusColor(
                            item.statusName
                          )}`}
                        >
                          {item.statusName}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm pt-3 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center text-gray-600 dark:text-gray-300">
                          <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="font-medium">{item.duration}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-sm text-gray-600">
                            <i className="fas fa-user w-4 mr-2 text-gray-400"></i>
                            <span>{getUser(item.ownerId)}</span>
                          </div>

                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getPriorityColor(
                              item.priorityName
                            )}`}
                          >
                            {item.priorityName}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {/* Enhanced Pagination */}
                <div className="bg-white dark:bg-gray-800 px-4 py-5 flex flex-col sm:flex-row items-center justify-between border-t-2 border-gray-200 dark:border-gray-700 sm:px-6 gap-4 rounded-b-xl">
                  {/* Mobile: Prev / Next only */}
                  <div className="flex-1 flex justify-between sm:hidden w-full">
                    <button
                      onClick={() =>
                        setFilter((prev) => ({
                          ...prev,
                          pageNumber: Math.max(prev.pageNumber - 1, 1),
                        }))
                      }
                      disabled={filter.pageNumber === 1}
                      className="relative inline-flex items-center px-5 py-2.5 border-2 border-gray-300 dark:border-gray-600 text-sm font-semibold rounded-xl text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      Previous
                    </button>
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
                      className="ml-3 relative inline-flex items-center px-5 py-2.5 border-2 border-gray-300 dark:border-gray-600 text-sm font-semibold rounded-xl text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      Next
                    </button>
                  </div>

                  {/* Desktop: Windowed pagination */}
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Showing{" "}
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {(filter.pageNumber - 1) * filter.pageSize + 1}
                        </span>
                        {" to "}
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {Math.min(
                            filter.pageNumber * filter.pageSize,
                            data.totalRecords
                          )}
                        </span>
                        {" of "}
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {data.totalRecords}
                        </span>
                        {" results"}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <nav className="relative z-0 inline-flex items-center gap-2">
                        {/* Previous Button */}
                        <button
                          onClick={() =>
                            setFilter((prev) => ({
                              ...prev,
                              pageNumber: Math.max(prev.pageNumber - 1, 1),
                            }))
                          }
                          disabled={filter.pageNumber === 1}
                          className="relative inline-flex items-center px-4 py-2 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>

                        {/* Page Buttons with window & ellipsis */}
                        {(() => {
                          const totalPages = Math.ceil(
                            data.totalRecords / filter.pageSize
                          );
                          const current = filter.pageNumber;
                          const delta = 2; // pages around current
                          const range: (number | "...")[] = [];

                          for (let i = 1; i <= totalPages; i++) {
                            if (
                              i === 1 ||
                              i === totalPages ||
                              (i >= current - delta && i <= current + delta)
                            ) {
                              range.push(i);
                            } else if (
                              (i === current - delta - 1 && i > 2) ||
                              (i === current + delta + 1 && i < totalPages - 1)
                            ) {
                              range.push("...");
                            }
                          }

                          // Remove duplicate ellipsis
                          const filteredRange = range.filter(
                            (item, idx) =>
                              item !== "..." || range[idx - 1] !== "..."
                          );

                          return filteredRange.map((page, idx) =>
                            page === "..." ? (
                              <span
                                key={`ellipsis-${idx}`}
                                className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400"
                              >
                                ...
                              </span>
                            ) : (
                              <button
                                key={page}
                                onClick={() =>
                                  setFilter((prev) => ({
                                    ...prev,
                                    pageNumber: Number(page),
                                  }))
                                }
                                className={`relative inline-flex items-center px-4 py-2 rounded-xl border-2 text-sm font-semibold transition-all duration-200 ${
                                  page === filter.pageNumber
                                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 border-blue-600 text-white shadow-lg"
                                    : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                                }`}
                              >
                                {page}
                              </button>
                            )
                          );
                        })()}

                        {/* Next Button */}
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
                          className="relative inline-flex items-center px-4 py-2 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              </div>
            </>
          </div>
        </div>
      </div>
      <Link
        to="/workstreamentry"
        className="
    fixed bottom-16 right-6 z-50
    bg-blue-600 text-white
    rounded-full sm:rounded-lg
    shadow-lg hover:bg-blue-700
    transition-all duration-300
    p-4 sm:px-4 sm:py-2
    flex items-center justify-center
  "
      >
        <FontAwesomeIcon
          icon={faPlusCircle}
          className="text-2xl sm:text-lg sm:mr-2"
        />

        {/* Text hidden on mobile, visible on desktop */}
        <span className="hidden sm:inline">New Workstream</span>
      </Link>

      <WorkstreamViewPopup
        selected={selectedWorkstream}
        setSelected={setSelectedWorkstream}
        handleSave={handleSave}
        handleClose={handleClose}
        isView={false}
        users={users}
        branches={branches}
      />
      <LoadComponent loading={isLoading} />
    </>
  );
};

export default Workstreams;
