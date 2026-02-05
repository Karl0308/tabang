import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import TicketDetail from "./TicketDetail";
import LoadComponent from "../../component/LoadComponent";
import { Link } from "react-router-dom";
import { Ticket } from "../../objects/Ticket";
import TicketViewPopup from "./TicketViewPopup";
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
interface FilterAssignee {
  value: string | number | null;
  label: string;
}
interface FilterBranch {
  value: string | number;
  label: string;
}
interface FilterWorkstream {
  value: string;
  label: string;
}
interface TicketQueryResult {
  tickets: Ticket[];
  pageNumber: number;
  pageSize: number;
  totalRecords: number;
  totalTicket: number;
  totalOpen: number;
  totalOnHold: number;
  totalInProgress: number;
  totalDone: number;
}

type FilterState = {
  search: string;
  status: MultiValue<FilterStatus>;
  userOption: MultiValue<FilterAssignee>;
  branches: MultiValue<FilterBranch>;
  priority: MultiValue<FilterPriority>;
  departmentBase: MultiValue<FilterPriority>;
  workstreamFilter: FilterWorkstream | null;
  userId: number;
  timeStamp: Date | null;
  pageNumber: number;
  pageSize: number;
  fromDate: Date | null; // start of date range
  toDate: Date | null; // end of date range
  sort: "asc" | "desc";
  orderBy: string;
};

const Tickets = () => {
  const { ticketNum } = useParams();

  const [data, setData] = useState<TicketQueryResult>({
    tickets: [],
    pageNumber: 1,
    pageSize: 10,
    totalRecords: 0,
    totalTicket: 0,
    totalOpen: 0,
    totalOnHold: 0,
    totalInProgress: 0,
    totalDone: 0,
  });

  let userRole = localStorage.getItem("role");

  const [openFilter, setOpenFilter] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [orderBy, setOrderBy] = useState("");
  const [orderDesc, setOrderDesc] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [timeStamp, setTimeStamp] = useState<Date | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [documentType, setDocumentTypes] = useState<DocumentType[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [appSetting, setAppSetting] = useState<AppSetting | null>(null);

  const filterStatusInitialState: FilterStatus = { value: 1, label: "Open" };

  const [filter, setFilter] = useState<FilterState>({
    search: "",
    status: [filterStatusInitialState],
    userOption: [],
    branches: [],
    priority: [],
    departmentBase: [],
    workstreamFilter: null,
    userId: localStorage.getItem("id")
      ? parseInt(localStorage.getItem("id") as string)
      : 0,
    timeStamp: null,
    pageNumber: 1,
    pageSize: 10,
    fromDate: null, // initialize fromDate
    toDate: null, // initialize toDate
    sort: "asc",
    orderBy: "",
  });

  const WorkstreamFilterList: FilterWorkstream[] = [
    { value: "all", label: "All Tickets" },
    { value: "with", label: "With Workstream" },
    { value: "without", label: "Without Workstream" },
  ];

  const StatusList = [
    { value: 4, label: "ALL" },
    { value: 1, label: "OPEN" },
    { value: 2, label: "ON HOLD" },
    { value: 3, label: "IN PROGRESS" },
    { value: 0, label: "DONE" },
  ];
  const PriorityList = [
    { value: 1, label: "Low" },
    { value: 2, label: "Medium" },
    { value: 3, label: "High" },
    { value: 4, label: "Critical" },
  ];
  // const DepartmentList = [
  //     { value: 0, label: "All" },
  //     { value: 1, label: "IS" },
  //     { value: 2, label: "ENGINEERING" },
  //     { value: 3, label: "CCTV" },
  // ];

  // const filteredDepartments = DepartmentList.filter((dept) => {
  //     const role = localStorage.getItem("role");
  //     const departmentBase = localStorage.getItem("departmentbase");

  //     if (role !== "2") {
  //         return true;
  //     } else {
  //         return String(dept.value) === departmentBase;
  //     }
  // });

  // const AssigneeList = [
  //     { value: localStorage.getItem('id'), label: 'Current User' }, // Default to '0' if 'id' is null
  //     { value: 'Unassigned', label: 'Unassigned' },
  //     ...users.filter(x => x.role !== 2)
  //         .sort((a, b) => a.fullName.localeCompare(b.fullName))
  //         .map((user) => ({ value: user.id, label: user.fullName }))
  // ];

  const AssigneeList =
    localStorage.getItem("role") === "1"
      ? [{ value: localStorage.getItem("id") ?? "0", label: "Current User" }]
      : [
        { value: localStorage.getItem("id") ?? "0", label: "Current User" },
        { value: null, label: "Unassigned" },
        ...users
          .filter((x) => x.role !== 2)
          .sort((a, b) => (a.fullName ?? "").localeCompare(b.fullName ?? ""))
          .map((user) => ({ value: user.id, label: user.fullName })),
      ];

  const BranchList = [
    { value: 0, label: "Unassigned" },
    ...branches
      .sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""))
      .map((branch) => ({ value: branch.id, label: branch.name })),
  ];

  const DepartmentList = [
    ...departments
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((dep) => ({ value: dep.id, label: dep.name })),
  ];

  const axiosInstance = axios.create({
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  const getUser = (id: number) => {
    const reporter = users.find((x) => x.id == id);
    if (reporter == undefined) {
      return "Unassigned";
    } else {
      return reporter.fullName;
    }
  };
  const getBranch = (id: number) => {
    const branch = branches.find((x) => x.id == id);
    if (branch == undefined) {
      return "Unassigned";
    } else {
      return branch.name;
    }
  };
  const getDocumentType = (id: number) => {
    const document = documentType.find((x) => x.id == id);
    if (document == undefined) {
      return "Unassigned";
    } else {
      return document.name;
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
        (error) => { }
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
  const FetchDepartments = () => {
    setIsLoading(true);
    axiosInstance
      .get(APIURLS.departments.getDepartments())
      .then((res) => {
        setDepartments(res.data);
      })
      .catch((error) => {
      });
  };
  const [counter, setCounter] = useState(0);

  const fetchDataTimer = useCallback(() => {
    const transformedFilter = {
      ...filter,
      status: filter.status.map((s) => s.value),
      userOption: filter.userOption.map((u) => u.value),
      branches: filter.branches.map((b) => b.value),
      departmentBase: filter.departmentBase.map((p) => p.value),
      priority: filter.priority.map((p) => p.value),
    };

    setIsLoading(true);
    axiosInstance
      .post(APIURLS.ticket.getTickets2(), transformedFilter)
      .then((res) => {
        const result = res.data as TicketQueryResult;
        setData(result);

        if (ticketNum !== undefined) {
          fetchDataFromTicketNum();
        }
      })
      .catch((error) => {
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [filter]); // Ensure fetchData updates when filter changes

  useEffect(() => {
    if (selectedTicket === null) {
      const timeout = setTimeout(() => {
        setCounter(counter + 1);
        fetchData();
      }, 180000);

      return () => {
        clearTimeout(timeout);
      };
    }
  }, [counter, selectedTicket, fetchDataTimer]); // Include `fetchData` as a dependency

  const isFirstRender = useRef(true);




  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      if (Number(userRole) === 1 || Number(userRole) === 2) {
        setFilter((prevFilter) => ({
          ...prevFilter,
          status: [
            ...prevFilter.status,
            { value: 3, label: "IN PROGRESS" },
          ],
        }));
      }
      return;
    }
    fetchData();
  }, [
    filter.status,
    filter.userOption,
    filter.departmentBase,
    filter.branches,
    filter.priority,
    filter.userId,
    filter.pageNumber,
    filter.pageSize,
    filter.fromDate,
    filter.toDate,
    filter.sort,
    filter.orderBy,
  ]);

  useEffect(() => {
    if (!filter.search) return;
    const delayDebounce = setTimeout(() => {
      fetchData();
    }, 1000);

    return () => clearTimeout(delayDebounce);
  }, [filter.search]);

  useEffect(() => {
    fetchDataFromTicketNum();
  }, [ticketNum]);

  const fetchData = () => {
    const transformedFilter = {
      ...filter,
      status: filter.status.map((s) => s.value),
      userOption: filter.userOption.map((u) => u.value),
      branches: filter.branches.map((b) => b.value),
      departmentBase: filter.departmentBase.map((p) => p.value),
      priority: filter.priority.map((p) => p.value),
    };

    setIsLoading(true);
    axiosInstance
      .post(APIURLS.ticket.getTickets2(), transformedFilter)
      .then((res) => {
        const result = res.data as TicketQueryResult;
        setData(result);
      })
      .catch((error) => {
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const fetchDataFromTicketNum = () => {
    if (selectedTicket !== null) {
      return;
    }

    setIsLoading(true);
    axiosInstance
      .get(APIURLS.ticket.getTicketNum() + ticketNum)
      .then((res) => {
        const selectedTicket = res.data as Ticket;
        if (selectedTicket) {
          setSelectedTicket(selectedTicket);
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
    FetchDepartments();
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

  const onChangeDepartmentbaseFilter = (
    newValue: MultiValue<FilterDepartmentBase>,
    actionMeta: ActionMeta<FilterDepartmentBase>
  ) => {
    setFilter((filter) => ({
      ...filter,
      departmentBase: newValue,
    }));
  };

  const onChangeUserFilter = (
    newValue: MultiValue<FilterAssignee>,
    actionMeta: ActionMeta<FilterAssignee>
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

  const handleRowClick = (ticket: Ticket) => {
    setSelectedTicket(ticket);
  };

  const handleSave = () => {
    setSelectedTicket(null);
  };
  const handleClose = () => {
    setSelectedTicket(null);
    fetchData();
  };
  // Priority color mapping
  const getPriorityColor = (priority: string) => {
    switch (priority.toUpperCase()) {
      case "CRITICAL":
        return "bg-red-600 text-white dark:text-gray-700";
      case "HIGH":
        return "bg-red-400 text-white dark:text-gray-700";
      case "MEDIUM":
        return "bg-yellow-400 text-white dark:text-gray-700";
      case "LOW":
        return "bg-green-400 text-white dark:text-gray-700";
      default:
        return "bg-gray-300 text-white dark:text-gray-700";
    }
  };

  // Status color mapping (you already had this)
  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "OPEN":
        return "bg-yellow-400 text-white dark:text-gray-700";
      case "ON HOLD":
        return "bg-red-400 text-white dark:text-gray-700";
      case "IN PROGRESS":
        return "bg-blue-400 text-white dark:text-gray-700";
      case "DONE":
        return "bg-green-400 text-white dark:text-gray-700";
      default:
        return "bg-gray-300 text-white dark:text-gray-700";
    }
  };

  // Check if ticket is overdue
  const isOverdue = (dueDate: Date | null, status: number): boolean => {
    if (!dueDate || status === 0) return false; // No due date or already done
    return new Date(dueDate) < new Date();
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
    data.tickets.sort((a, b) => {
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
    ticket: true,
    title: true,
    duration: true,
    department: true,
    branch: true,
    reporter: true,
    assignee: true,
    priority: true,
    status: true,
    workstream: true,
  };

  const [visibleColumns, setVisibleColumns] = useState(() => {
    const stored = localStorage.getItem("ticket_columns");
    return stored ? JSON.parse(stored) : defaultColumns;
  });

  useEffect(() => {
    localStorage.setItem("ticket_columns", JSON.stringify(visibleColumns));
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
      <div className="flex flex-col h-full mx-auto w-2/2">
        <div className="container mx-auto flex-grow overflow-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-3 leading-tight">
                  Support Tickets
                </h2>
                <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 font-medium">
                  Manage and track all support requests
                </p>
              </div>
              {/* <Link
                                to="/ticketentry"
                                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex justify-center sm:justify-start items-center font-semibold"
                            >
                                <FontAwesomeIcon
                                    icon={faPlusCircle}
                                    className="text-lg sm:mr-2"
                                />
                                <span className="hidden sm:inline">New Ticket</span>
                            </Link> */}
            </div>

            <>
              <button
                onClick={() => setOpenFilter(!openFilter)}
                className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 mb-6 rounded-lg font-medium transition-all duration-200 ${
                  openFilter
                    ? 'bg-blue-600 text-white shadow-md hover:bg-blue-700'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 shadow-sm hover:shadow-md'
                }`}
              >
                <FontAwesomeIcon icon={faFilter} className="text-sm" />
                <span className="text-sm">Filters</span>
                <FontAwesomeIcon
                  icon={faChevronDown}
                  className={`text-xs transition-transform duration-300 ${openFilter ? 'rotate-180' : ''}`}
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
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6 mb-6">
                    <div className="col-span-1 sm:col-span-2 lg:col-span-6">
                      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-2 lg:mb-0">
                          Date Range
                        </h3>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Select start and end dates
                        </span>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3 pb-4 rounded-2xl bg-white dark:bg-gray-900 dark:border-gray-700 items-center">
                        {/* From Date */}
                        <input
                          type="date"
                          className="px-4 py-2.5 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
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
                          className="px-4 py-2.5 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
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
                          className="px-5 py-2.5 mt-2 sm:mt-0 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                        >
                          Clear
                        </button>
                      </div>
                    </div>

                    {/* Content */}

                    <div
                      className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 transition-all duration-300 overflow-hidden ${openFilter
                        ? "max-h-[1000px] opacity-100"
                        : "max-h-0 opacity-0"
                        }`}
                    >
                      {/* Search */}
                      <div>
                        <label className="block text-sm sm:text-base font-semibold text-gray-700 dark:text-gray-200 mb-2">
                          Search
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                          </div>
                          <input
                            type="text"
                            placeholder="Search by ticket number, title..."
                            className="w-full pl-10 pr-10 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-200"
                            value={filter.search}
                            onChange={(e) =>
                              setFilter((prev) => ({
                                ...prev,
                                search: e.target.value,
                                pageNumber: 1,
                              }))
                            }
                          />
                          {filter.search && (
                            <button
                              onClick={() => setFilter((prev) => ({ ...prev, search: "", pageNumber: 1 }))}
                              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                            >
                              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Status */}
                      <div>
                        <label className="block text-sm sm:text-base font-semibold text-gray-700 dark:text-gray-200 mb-2">
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
                            control: (base: any, state: any) => ({
                              ...base,
                              minHeight: "2.75rem",
                              borderRadius: "0.75rem",
                              borderWidth: "2px",
                              borderColor: state.isFocused
                                ? "#3b82f6"
                                : theme === "dark" ? "#4b5563" : "#d1d5db",
                              backgroundColor:
                                theme === "dark" ? "#1f2937" : "#fff",
                              color: theme === "dark" ? "#fff" : "#000",
                              boxShadow: state.isFocused
                                ? "0 0 0 3px rgba(59, 130, 246, 0.1)"
                                : "none",
                              transition: "all 0.2s",
                              "&:hover": {
                                borderColor: state.isFocused
                                  ? "#3b82f6"
                                  : theme === "dark" ? "#6b7280" : "#9ca3af",
                              },
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
                              borderRadius: "0.75rem",
                              backgroundColor:
                                theme === "dark" ? "#1f2937" : "#fff",
                              boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)",
                              overflow: "hidden",
                            }),
                            option: (base: any, state: any) => ({
                              ...base,
                              backgroundColor: state.isSelected
                                ? "#3b82f6"
                                : state.isFocused
                                ? theme === "dark" ? "#374151" : "#e5e7eb"
                                : theme === "dark" ? "#1f2937" : "#fff",
                              color: state.isSelected
                                ? "#fff"
                                : theme === "dark" ? "#f3f4f6" : "#111827",
                              padding: "0.625rem 0.875rem",
                              cursor: "pointer",
                              transition: "all 0.15s",
                              fontWeight: state.isSelected ? "600" : "500",
                              "&:active": {
                                backgroundColor: "#2563eb",
                              },
                            }),
                          }}
                        />
                      </div>

                      {/* Priority */}
                      <div>
                        <label className="block text-sm sm:text-base font-semibold text-gray-700 dark:text-gray-200 mb-2">
                          Assignee
                        </label>
                        <Select
                          isMulti
                          options={AssigneeList}
                          onChange={onChangeUserFilter}
                          value={filter.userOption}
                          // placeholder="Select assignee..."
                          closeMenuOnSelect={false}
                          isClearable
                          isSearchable={true}
                          className="w-full"
                          menuPortalTarget={document.body}
                          styles={{
                            control: (base: any, state: any) => ({
                              ...base,
                              minHeight: "2.75rem",
                              borderRadius: "0.75rem",
                              borderWidth: "2px",
                              borderColor: state.isFocused
                                ? "#3b82f6"
                                : theme === "dark" ? "#4b5563" : "#d1d5db",
                              backgroundColor:
                                theme === "dark" ? "#1f2937" : "#fff",
                              color: theme === "dark" ? "#fff" : "#000",
                              boxShadow: state.isFocused
                                ? "0 0 0 3px rgba(59, 130, 246, 0.1)"
                                : "none",
                              transition: "all 0.2s",
                              "&:hover": {
                                borderColor: state.isFocused
                                  ? "#3b82f6"
                                  : theme === "dark" ? "#6b7280" : "#9ca3af",
                              },
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
                              borderRadius: "0.75rem",
                              backgroundColor:
                                theme === "dark" ? "#1f2937" : "#fff",
                              boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)",
                              overflow: "hidden",
                            }),
                            option: (base: any, state: any) => ({
                              ...base,
                              backgroundColor: state.isSelected
                                ? "#3b82f6"
                                : state.isFocused
                                ? theme === "dark" ? "#374151" : "#e5e7eb"
                                : theme === "dark" ? "#1f2937" : "#fff",
                              color: state.isSelected
                                ? "#fff"
                                : theme === "dark" ? "#f3f4f6" : "#111827",
                              padding: "0.625rem 0.875rem",
                              cursor: "pointer",
                              transition: "all 0.15s",
                              fontWeight: state.isSelected ? "600" : "500",
                              "&:active": {
                                backgroundColor: "#2563eb",
                              },
                            }),
                          }}
                        />
                      </div>

                      {/* Branch */}
                      <div>
                        <label className="block text-sm sm:text-base font-semibold text-gray-700 dark:text-gray-200 mb-2">
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
                            control: (base: any, state: any) => ({
                              ...base,
                              minHeight: "2.75rem",
                              borderRadius: "0.75rem",
                              borderWidth: "2px",
                              borderColor: state.isFocused
                                ? "#3b82f6"
                                : theme === "dark" ? "#4b5563" : "#d1d5db",
                              backgroundColor:
                                theme === "dark" ? "#1f2937" : "#fff",
                              color: theme === "dark" ? "#fff" : "#000",
                              boxShadow: state.isFocused
                                ? "0 0 0 3px rgba(59, 130, 246, 0.1)"
                                : "none",
                              transition: "all 0.2s",
                              "&:hover": {
                                borderColor: state.isFocused
                                  ? "#3b82f6"
                                  : theme === "dark" ? "#6b7280" : "#9ca3af",
                              },
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
                              borderRadius: "0.75rem",
                              backgroundColor:
                                theme === "dark" ? "#1f2937" : "#fff",
                              boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)",
                              overflow: "hidden",
                            }),
                            option: (base: any, state: any) => ({
                              ...base,
                              backgroundColor: state.isSelected
                                ? "#3b82f6"
                                : state.isFocused
                                ? theme === "dark" ? "#374151" : "#e5e7eb"
                                : theme === "dark" ? "#1f2937" : "#fff",
                              color: state.isSelected
                                ? "#fff"
                                : theme === "dark" ? "#f3f4f6" : "#111827",
                              padding: "0.625rem 0.875rem",
                              cursor: "pointer",
                              transition: "all 0.15s",
                              fontWeight: state.isSelected ? "600" : "500",
                              "&:active": {
                                backgroundColor: "#2563eb",
                              },
                            }),
                          }}
                        />
                      </div>
                      {/* Department */}
                      <div>
                        <label className="block text-sm sm:text-base font-semibold text-gray-700 dark:text-gray-200 mb-2">
                          Department
                        </label>
                        <Select
                          isMulti
                          options={DepartmentList} // your array: [{ value: 'CCTV', label: 'CCTV' }, ...]
                          onChange={onChangeDepartmentbaseFilter}
                          value={filter.departmentBase}
                          // placeholder="Select department..."
                          closeMenuOnSelect={true}
                          isClearable
                          isSearchable={false}
                          className="w-full"
                          menuPortalTarget={document.body}
                          styles={{
                            control: (base: any, state: any) => ({
                              ...base,
                              minHeight: "2.75rem",
                              borderRadius: "0.75rem",
                              borderWidth: "2px",
                              borderColor: state.isFocused
                                ? "#3b82f6"
                                : theme === "dark" ? "#4b5563" : "#d1d5db",
                              backgroundColor:
                                theme === "dark" ? "#1f2937" : "#fff",
                              color: theme === "dark" ? "#fff" : "#000",
                              boxShadow: state.isFocused
                                ? "0 0 0 3px rgba(59, 130, 246, 0.1)"
                                : "none",
                              transition: "all 0.2s",
                              "&:hover": {
                                borderColor: state.isFocused
                                  ? "#3b82f6"
                                  : theme === "dark" ? "#6b7280" : "#9ca3af",
                              },
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
                              borderRadius: "0.75rem",
                              backgroundColor:
                                theme === "dark" ? "#1f2937" : "#fff",
                              boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)",
                              overflow: "hidden",
                            }),
                            option: (base: any, state: any) => ({
                              ...base,
                              backgroundColor: state.isSelected
                                ? "#3b82f6"
                                : state.isFocused
                                ? theme === "dark" ? "#374151" : "#e5e7eb"
                                : theme === "dark" ? "#1f2937" : "#fff",
                              color: state.isSelected
                                ? "#fff"
                                : theme === "dark" ? "#f3f4f6" : "#111827",
                              padding: "0.625rem 0.875rem",
                              cursor: "pointer",
                              transition: "all 0.15s",
                              fontWeight: state.isSelected ? "600" : "500",
                              "&:active": {
                                backgroundColor: "#2563eb",
                              },
                            }),
                          }}
                        />
                      </div>

                      {/* Priority*/}
                      <div>
                        <label className="block text-sm sm:text-base font-semibold text-gray-700 dark:text-gray-200 mb-2">
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
                            control: (base: any, state: any) => ({
                              ...base,
                              minHeight: "2.75rem",
                              borderRadius: "0.75rem",
                              borderWidth: "2px",
                              borderColor: state.isFocused
                                ? "#3b82f6"
                                : theme === "dark" ? "#4b5563" : "#d1d5db",
                              backgroundColor:
                                theme === "dark" ? "#1f2937" : "#fff",
                              color: theme === "dark" ? "#fff" : "#000",
                              boxShadow: state.isFocused
                                ? "0 0 0 3px rgba(59, 130, 246, 0.1)"
                                : "none",
                              transition: "all 0.2s",
                              "&:hover": {
                                borderColor: state.isFocused
                                  ? "#3b82f6"
                                  : theme === "dark" ? "#6b7280" : "#9ca3af",
                              },
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
                              borderRadius: "0.75rem",
                              backgroundColor:
                                theme === "dark" ? "#1f2937" : "#fff",
                              boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)",
                              overflow: "hidden",
                            }),
                            option: (base: any, state: any) => ({
                              ...base,
                              backgroundColor: state.isSelected
                                ? "#3b82f6"
                                : state.isFocused
                                ? theme === "dark" ? "#374151" : "#e5e7eb"
                                : theme === "dark" ? "#1f2937" : "#fff",
                              color: state.isSelected
                                ? "#fff"
                                : theme === "dark" ? "#f3f4f6" : "#111827",
                              padding: "0.625rem 0.875rem",
                              cursor: "pointer",
                              transition: "all 0.15s",
                              fontWeight: state.isSelected ? "600" : "500",
                              "&:active": {
                                backgroundColor: "#2563eb",
                              },
                            }),
                          }}
                        />
                      </div>

                      {/* Workstream Filter */}
                      <div>
                        <label className="block text-sm sm:text-base font-semibold text-gray-700 dark:text-gray-200 mb-2">
                          Workstream
                        </label>
                        <div className="flex gap-1">
                          {WorkstreamFilterList.map((option) => (
                            <button
                              key={option.value}
                              onClick={() =>
                                setFilter((prev) => ({
                                  ...prev,
                                  workstreamFilter: option.value === "all" ? null : option,
                                  pageNumber: 1,
                                }))
                              }
                              className={`flex-1 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border-2 transition-all duration-200 ${
                                (filter.workstreamFilter === null && option.value === "all") ||
                                filter.workstreamFilter?.value === option.value
                                  ? option.value === "with"
                                    ? "bg-gradient-to-r from-emerald-500 to-teal-500 border-emerald-500 text-white shadow-md"
                                    : option.value === "without"
                                    ? "bg-gradient-to-r from-orange-500 to-amber-500 border-orange-500 text-white shadow-md"
                                    : "bg-gradient-to-r from-blue-500 to-indigo-500 border-blue-500 text-white shadow-md"
                                  : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-blue-400 dark:hover:border-blue-500"
                              }`}
                            >
                              {option.value === "with" && (
                                <span className="mr-1">🔗</span>
                              )}
                              {option.value === "without" && (
                                <span className="mr-1">📋</span>
                              )}
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="col-span-full mt-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-base font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Column Visibility
                          </h3>
                          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                            Customize table columns
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {Object.keys(defaultColumns).map((key) => {
                            const active = visibleColumns[key];

                            return (
                              <label
                                key={key}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${active
                                  ? "bg-blue-600 border-blue-600 text-white shadow-sm hover:bg-blue-700 hover:border-blue-700"
                                  : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-blue-400 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400"
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
              {/* Stats Cards - Enhanced with Gradients */}
              {/* Desktop View */}
              {userRole === "0" || userRole === "50" ? (
                <>
                  <div className="hidden sm:grid sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
                    {/* Total Tickets - Gradient Blue */}
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
                      className={`group relative overflow-hidden cursor-pointer rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 ${
                        filter.status.some((s) => s.value === 4)
                          ? "bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 ring-2 ring-blue-400 scale-105"
                          : "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-700"
                      }`}
                    >
                      <div className="relative z-10 p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="p-2 bg-white dark:bg-gray-700 rounded-lg shadow-sm">
                            <FontAwesomeIcon icon={faTicketAlt} className="text-blue-600 dark:text-blue-400 text-lg" />
                          </div>
                        </div>
                        <p className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Total Tickets</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.totalTicket}</p>
                      </div>
                      <div className="absolute top-0 right-0 w-24 h-24 bg-blue-200 dark:bg-blue-700 rounded-full -mr-12 -mt-12 opacity-20"></div>
                    </div>

                    {/* Open Tickets - Gradient Yellow */}
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
                      className={`group relative overflow-hidden cursor-pointer rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 ${
                        filter.status.some((s) => s.value === 1)
                          ? "bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-900 dark:to-yellow-800 ring-2 ring-yellow-400 scale-105"
                          : "bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-gray-800 dark:to-gray-700"
                      }`}
                    >
                      <div className="relative z-10 p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="p-2 bg-white dark:bg-gray-700 rounded-lg shadow-sm">
                            <FontAwesomeIcon icon={faClock} className="text-yellow-600 dark:text-yellow-400 text-lg" />
                          </div>
                        </div>
                        <p className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Open</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.totalOpen}</p>
                      </div>
                      <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-200 dark:bg-yellow-700 rounded-full -mr-12 -mt-12 opacity-20"></div>
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
                      className={`group relative overflow-hidden cursor-pointer rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 ${
                        filter.status.some((s) => s.value === 2)
                          ? "bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900 dark:to-red-800 ring-2 ring-red-400 scale-105"
                          : "bg-gradient-to-br from-red-50 to-red-100 dark:from-gray-800 dark:to-gray-700"
                      }`}
                    >
                      <div className="relative z-10 p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="p-2 bg-white dark:bg-gray-700 rounded-lg shadow-sm">
                            <FontAwesomeIcon icon={faPauseCircle} className="text-red-600 dark:text-red-400 text-lg" />
                          </div>
                        </div>
                        <p className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">On Hold</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.totalOnHold}</p>
                      </div>
                      <div className="absolute top-0 right-0 w-24 h-24 bg-red-200 dark:bg-red-700 rounded-full -mr-12 -mt-12 opacity-20"></div>
                    </div>

                    {/* In Progress - Gradient Purple/Blue */}
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
                      className={`group relative overflow-hidden cursor-pointer rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 ${
                        filter.status.some((s) => s.value === 3)
                          ? "bg-gradient-to-br from-blue-100 to-purple-200 dark:from-blue-900 dark:to-purple-800 ring-2 ring-blue-400 scale-105"
                          : "bg-gradient-to-br from-blue-50 to-purple-100 dark:from-gray-800 dark:to-gray-700"
                      }`}
                    >
                      <div className="relative z-10 p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="p-2 bg-white dark:bg-gray-700 rounded-lg shadow-sm">
                            <FontAwesomeIcon icon={faSpinner} className="text-blue-600 dark:text-blue-400 text-lg" />
                          </div>
                        </div>
                        <p className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">In Progress</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.totalInProgress}</p>
                      </div>
                      <div className="absolute top-0 right-0 w-24 h-24 bg-blue-200 dark:bg-blue-700 rounded-full -mr-12 -mt-12 opacity-20"></div>
                    </div>

                    {/* Done - Gradient Green */}
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
                      className={`group relative overflow-hidden cursor-pointer rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 ${
                        filter.status.some((s) => s.value === 0)
                          ? "bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900 dark:to-green-800 ring-2 ring-green-400 scale-105"
                          : "bg-gradient-to-br from-green-50 to-green-100 dark:from-gray-800 dark:to-gray-700"
                      }`}
                    >
                      <div className="relative z-10 p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="p-2 bg-white dark:bg-gray-700 rounded-lg shadow-sm">
                            <FontAwesomeIcon icon={faCheckCircle} className="text-green-600 dark:text-green-400 text-lg" />
                          </div>
                        </div>
                        <p className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Done</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.totalDone}</p>
                      </div>
                      <div className="absolute top-0 right-0 w-24 h-24 bg-green-200 dark:bg-green-700 rounded-full -mr-12 -mt-12 opacity-20"></div>
                    </div>
                  </div>
                  {/* Mobile Compact View */}
                  <div className="grid grid-cols-5 sm:hidden gap-2 mb-6">
                    {/* Total Tickets */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-2 flex flex-col items-center justify-center">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-1">
                        <FontAwesomeIcon
                          icon={faTicketAlt}
                          className="text-blue-600 dark:text-blue-400 text-lg"
                        />
                      </div>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {data.totalTicket}
                      </p>
                    </div>

                    {/* Open */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-2 flex flex-col items-center justify-center">
                      <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center mb-1">
                        <FontAwesomeIcon
                          icon={faClock}
                          className="text-yellow-600 dark:text-yellow-400 text-lg"
                        />
                      </div>
                      <p className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                        {data.totalOpen}
                      </p>
                    </div>

                    {/* On Hold */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-2 flex flex-col items-center justify-center">
                      <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center mb-1">
                        <FontAwesomeIcon
                          icon={faPauseCircle}
                          className="text-red-600 dark:text-red-400 text-lg"
                        />
                      </div>
                      <p className="text-lg font-bold text-red-600 dark:text-red-400">
                        {data.totalOnHold}
                      </p>
                    </div>

                    {/* In Progress */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-2 flex flex-col items-center justify-center">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-1">
                        <FontAwesomeIcon
                          icon={faSpinner}
                          className="text-blue-600 dark:text-blue-400 text-lg"
                        />
                      </div>
                      <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        {data.totalInProgress}
                      </p>
                    </div>

                    {/* Done */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-2 flex flex-col items-center justify-center">
                      <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-1">
                        <FontAwesomeIcon
                          icon={faCheckCircle}
                          className="text-green-600 dark:text-green-400 text-lg"
                        />
                      </div>
                      <p className="text-lg font-bold text-green-600 dark:text-green-400">
                        {data.totalDone}
                      </p>
                    </div>
                  </div>
                </>
              ) : null}
            </>

            {/* Table */}
            <>
              {/* Tickets List */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
                      <tr>
                        {columns.map((key) => (
                          <th
                            key={key}
                            className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-move hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
                            draggable
                            onDragStart={() => handleDragStart(key)}
                            onDragOver={handleDragOver}
                            onDrop={() => handleDrop(key)}
                            onClick={(e) => {
                              e.preventDefault();
                              setFilter((prev) => ({
                                ...prev,
                                orderBy: key,
                                sort:
                                  prev.orderBy === key
                                    ? prev.sort === "asc"
                                      ? "desc"
                                      : "asc"
                                    : "asc",
                              }));
                            }}
                          >
                            {key.charAt(0).toUpperCase() + key.slice(1)}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {data.tickets.map((item, index) => (
                        <tr
                          onClick={() => handleRowClick(item)}
                          key={item.ticketNumber}
                          className={`cursor-pointer transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-gray-700 dark:hover:to-gray-600 hover:shadow-md transform hover:scale-[1.01] ${index !== data.tickets.length - 1
                            ? "border-b border-gray-200 dark:border-gray-700"
                            : ""
                            }`}
                        >
                          {columns.map((key) => {
                            if (!visibleColumns[key]) return null; // <-- hide column if not visible

                            switch (key) {
                              case "ticket":
                                return (
                                  <td
                                    key={key}
                                    className="px-6 py-4 whitespace-nowrap"
                                  >
                                    <div className="flex items-center">
                                      <div className="text-sm font-bold text-blue-600 dark:text-blue-400">
                                        {item.ticketNumber}
                                      </div>
                                    </div>
                                  </td>
                                );
                              case "title":
                                return (
                                  <td key={key} className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                        {item.title}
                                      </span>
                                      {isOverdue(item.dueDate, item.status) && (
                                        <span className="flex-shrink-0 px-1.5 py-0.5 text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded">
                                          OVERDUE
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                      {item.calledIn
                                        ? new Intl.DateTimeFormat("en-US", {
                                          year: "numeric",
                                          month: "2-digit",
                                          day: "2-digit",
                                        }).format(new Date(item.calledIn))
                                        : ""}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                      </svg>
                                      {item.ticketAttachmentCount}
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
                                        className={`w-4 h-4 ${getAppSettingsColor(
                                          item.calledIn,
                                          item.status
                                        )} rounded-full mr-2 shadow-sm`}
                                      ></div>
                                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {formatTimeDifference(
                                          item.status === 0
                                            ? item.timeStamp.toString()
                                            : new Date().toString(),
                                          item.calledIn.toString()
                                        )}
                                      </span>
                                    </div>
                                  </td>
                                );
                              case "department":
                                return (
                                  <td
                                    key={key}
                                    className="px-6 py-4 whitespace-nowrap"
                                  >
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                      {/* {item.departmentBase === DepartmentBase.Default
                                                                                ? "All"
                                                                                : DepartmentBase[item.departmentBase]} */}
                                      {item.ticketDepartmentText}
                                    </span>
                                  </td>
                                );
                              case "branch":
                                return (
                                  <td
                                    key={key}
                                    className="px-6 py-4 whitespace-nowrap"
                                  >
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                      {getBranch(item.branchId)}
                                    </span>
                                  </td>
                                );
                              case "reporter":
                                return (
                                  <td
                                    key={key}
                                    className="px-6 py-4 whitespace-nowrap"
                                  >
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                      {getUser(item.reporterId)}
                                    </span>
                                  </td>
                                );
                              case "assignee":
                                return (
                                  <td
                                    key={key}
                                    className="px-6 py-4 whitespace-nowrap"
                                  >
                                    <div className="flex items-center">
                                      <img
                                        className="h-8 w-8 rounded-full ring-2 ring-gray-200 dark:ring-gray-600"
                                        src={userLogo}
                                        alt="Assignee"
                                      />
                                      <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {item.assigneeText}
                                      </span>
                                    </div>
                                  </td>
                                );
                              case "priority":
                                return (
                                  <td
                                    key={key}
                                    className="px-6 py-4 whitespace-nowrap"
                                  >
                                    <span
                                      className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm ${getPriorityColor(
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
                                      className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm ${getStatusColor(
                                        item.statusName
                                      )}`}
                                    >
                                      {item.statusName}
                                    </span>
                                  </td>
                                );
                              case "workstream":
                                return (
                                  <td
                                    key={key}
                                    className="px-6 py-4 whitespace-nowrap"
                                  >
                                    {item.workstreamCount > 0 ? (
                                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 shadow-sm">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                        </svg>
                                        {item.workstreamCount}
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                                        —
                                      </span>
                                    )}
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

                {/* Mobile Card View */}
                <div className="lg:hidden space-y-3">
                  {data.tickets.map((item) => (
                    <div
                      key={item.ticketNumber}
                      className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl border border-gray-200 dark:border-gray-700 p-5 cursor-pointer transition-all duration-200 transform hover:scale-[1.02] hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 dark:hover:from-gray-700 dark:hover:to-gray-600"
                      onClick={() => handleRowClick(item)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                              {item.ticketNumber}
                            </span>
                            {isOverdue(item.dueDate, item.status) && (
                              <span className="px-1.5 py-0.5 text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded">
                                OVERDUE
                              </span>
                            )}
                          </div>
                          <div className="text-base font-semibold text-gray-900 dark:text-white line-clamp-2">
                            {item.title}
                          </div>
                        </div>
                        <span
                          className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm ml-3 ${getStatusColor(
                            item.statusName
                          )}`}
                        >
                          {item.statusName}
                        </span>
                      </div>

                      <div className="space-y-3 mt-4 pt-3 border-t border-gray-200 dark:border-gray-600">
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900 mr-3">
                            <i className="fas fa-clock text-blue-600 dark:text-blue-400"></i>
                          </div>
                          <span className="font-medium">
                            {formatTimeDifference(
                              item.status === 0
                                ? item.timeStamp.toString()
                                : new Date().toString(),
                              item.calledIn?.toString() || ""
                            )}
                          </span>
                        </div>

                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900 mr-3">
                            <i className="fas fa-building text-purple-600 dark:text-purple-400"></i>
                          </div>
                          <span className="font-medium">
                            {item.departmentBase === DepartmentBase.Default
                              ? "All"
                              : DepartmentBase[item.departmentBase]}{" "}
                            • {getBranch(item.branchId)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900 mr-3">
                              <i className="fas fa-user text-green-600 dark:text-green-400"></i>
                            </div>
                            <span className="font-medium">{getUser(item.reporterId)}</span>
                          </div>

                          <span
                            className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm ${getPriorityColor(
                              item.priorityName
                            )}`}
                          >
                            {item.priorityName}
                          </span>
                        </div>

                        {/* Workstream Count */}
                        {item.workstreamCount > 0 && (
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900 mr-3">
                              <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                              </svg>
                            </div>
                            <span className="font-medium">
                              {item.workstreamCount} Workstream{item.workstreamCount > 1 ? "s" : ""}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 px-4 py-4 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6 rounded-b-xl">
                  {/* Mobile: Prev / Next only */}
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() =>
                        setFilter((prev) => ({
                          ...prev,
                          pageNumber: Math.max(prev.pageNumber - 1, 1),
                        }))
                      }
                      disabled={filter.pageNumber === 1}
                      className="relative inline-flex items-center px-5 py-2.5 border-2 border-gray-300 dark:border-gray-600 text-sm font-semibold rounded-xl text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-gray-700 dark:hover:to-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
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
                      className="ml-3 relative inline-flex items-center px-5 py-2.5 border-2 border-gray-300 dark:border-gray-600 text-sm font-semibold rounded-xl text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-gray-700 dark:hover:to-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      Next
                    </button>
                  </div>

                  {/* Desktop: Windowed pagination */}
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div className="flex items-center">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        Showing{" "}
                        <span className="font-bold text-blue-600 dark:text-blue-400">
                          {(filter.pageNumber - 1) * filter.pageSize + 1}
                        </span>
                        {" "}to{" "}
                        <span className="font-bold text-blue-600 dark:text-blue-400">
                          {Math.min(
                            filter.pageNumber * filter.pageSize,
                            data.totalRecords
                          )}
                        </span>
                        {" "}of{" "}
                        <span className="font-bold text-blue-600 dark:text-blue-400">
                          {data.totalRecords}
                        </span>
                        {" "}results
                      </p>
                    </div>

                    <div className="flex justify-center mt-4">
                      <nav className="relative z-0 inline-flex rounded-xl shadow-lg gap-1">
                        {/* Previous Button */}
                        <button
                          onClick={() =>
                            setFilter((prev) => ({
                              ...prev,
                              pageNumber: Math.max(prev.pageNumber - 1, 1),
                            }))
                          }
                          disabled={filter.pageNumber === 1}
                          className="relative inline-flex items-center px-4 py-2 rounded-l-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-gray-700 dark:hover:to-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                        >
                          <i className="fas fa-chevron-left"></i>
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
                                className="relative inline-flex items-center px-4 py-2 border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-semibold text-gray-500 dark:text-gray-400"
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
                                className={`relative inline-flex items-center px-4 py-2 border-2 text-sm font-semibold transition-all duration-200 ${page === filter.pageNumber
                                  ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-blue-600 shadow-md scale-110 z-10"
                                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-gray-700 dark:hover:to-gray-600"
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
                          className="relative inline-flex items-center px-4 py-2 rounded-r-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-gray-700 dark:hover:to-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                        >
                          <i className="fas fa-chevron-right"></i>
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
        to="/ticketentry"
        className="fixed bottom-16 right-6 z-50 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full sm:rounded-xl shadow-xl hover:shadow-2xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-110 hover:-translate-y-1 p-4 sm:px-6 sm:py-3 flex items-center justify-center group"
      >
        <FontAwesomeIcon
          icon={faPlusCircle}
          className="text-2xl sm:text-lg sm:mr-2 animate-pulse group-hover:animate-none"
        />

        {/* Text hidden on mobile, visible on desktop */}
        <span className="hidden sm:inline font-semibold">New Ticket</span>
      </Link>

      <TicketViewPopup
        selectedTicket={selectedTicket}
        setSelectedTicket={setSelectedTicket}
        handleSave={handleSave}
        handleClose={handleClose}
        isTicketView={false}
        users={users}
        branches={branches}
        departments={departments}
      />
      {/* <LoadComponent loading={isLoading} /> */}
    </>
  );
};

export default Tickets;
