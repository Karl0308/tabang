import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from "react-router-dom";
import TicketDetail from './TicketDetailEng';
import LoadComponent from '../../component/LoadComponent';
import { Link } from 'react-router-dom';
import { Ticket } from '../../objects/Ticket';
import TicketViewPopup from './TicketViewPopupEng';
import axios from "axios";
import { APIURLS } from '../../../APIURLS';
import { Branch } from '../../objects/Branch';
import { DocumentType } from '../../objects/DocumentType';
import { User } from '../../objects/User';
import CopyButton from '../../component/CopyButton';
import Select, { MultiValue, ActionMeta } from 'react-select';
import { AppSetting } from '../../objects/AppSetting';
import { SelectContainer } from 'react-select/dist/declarations/src/components/containers';
import { DepartmentBase } from '../../objects/enum';

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
interface TicketQueryResult {
    tickets: Ticket[];
    pageNumber: number;
    pageSize: number;
    totalRecords: number;
}


type FilterState = {
    search: string;
    status: MultiValue<FilterStatus>;
    userOption: MultiValue<FilterAssignee>;
    branches: MultiValue<FilterBranch>;
    priority: MultiValue<FilterPriority>;
    departmentBase: MultiValue<FilterPriority>;
    userId: number;
    timeStamp: Date | null;
    pageNumber: number;
    pageSize: number;
};


const Tickets = () => {

    const { ticketNum } = useParams();

    const [data, setData] = useState<TicketQueryResult>({
        tickets: [],
        pageNumber: 1,
        pageSize: 10,
        totalRecords: 0
    });

    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [orderBy, setOrderBy] = useState('');
    const [orderDesc, setOrderDesc] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [timeStamp, setTimeStamp] = useState<Date | null>(null);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [documentType, setDocumentTypes] = useState<DocumentType[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [appSetting, setAppSetting] = useState<AppSetting | null>(null);


    const filterStatusInitialState: FilterStatus = { value: 4, label: 'ALL' };
    const [filter, setFilter] = useState<FilterState>({
        search: '',
        status: [filterStatusInitialState],
        userOption: [],
        branches: [],
        priority: [],
        departmentBase: [],
        userId: localStorage.getItem('id') ? parseInt(localStorage.getItem('id') as string) : 0,
        timeStamp: null,
        pageNumber: 1,
        pageSize: 10,
    });
    const StatusList = [
        { value: 4, label: 'ALL' },
        { value: 1, label: 'OPEN' },
        { value: 2, label: 'ON HOLD' },
        { value: 3, label: 'IN PROGRESS' },
        { value: 0, label: 'DONE' }
    ];
    const PriorityList = [
        { value: 1, label: 'Low' },
        { value: 2, label: 'Medium' },
        { value: 3, label: 'High' },
        { value: 4, label: 'Critical' },
    ];
    const DepartmentList = [
        { value: 0, label: 'All' },
        { value: 1, label: 'IS' },
        { value: 2, label: 'ENGINEERING' },
        { value: 3, label: 'CCTV' },
    ];

    const filteredDepartments = DepartmentList.filter((dept) => {
        const role = localStorage.getItem("role");
        const departmentBase = localStorage.getItem("departmentbase");

        if (role === "50") {
            return true;
        } else {
            return String(dept.value) === departmentBase;
        }
    });


    const AssigneeList = [
        { value: localStorage.getItem('id'), label: 'Current User' }, // Default to '0' if 'id' is null
        { value: 'Unassigned', label: 'Unassigned' },
        ...users.filter(x => x.role !== 2)
            .sort((a, b) => a.fullName.localeCompare(b.fullName))
            .map((user) => ({ value: user.id, label: user.fullName }))
    ];
    const BranchList = [
        { value: 0, label: 'Unassigned' },
        ...branches.sort((a, b) => a.name.localeCompare(b.name))
            .map((branch) => ({ value: branch.id, label: branch.name }))

    ];

    const axiosInstance = axios.create({
        headers: {
            'Authorization': `Bearer ${localStorage.getItem("token")}`,
        }
    });

    const getUser = (id: number) => {
        const reporter = users.find(x => x.id == id);
        if (reporter == undefined) { return "Unassigned"; }
        else { return reporter.fullName; }

    };
    const getBranch = (id: number) => {
        const branch = branches.find(x => x.id == id);
        if (branch == undefined) { return "Unassigned"; }
        else { return branch.name; }

    };
    const getDocumentType = (id: number) => {
        const document = documentType.find(x => x.id == id);
        if (document == undefined) { return "Unassigned"; }
        else { return document.name; }

    };

    const FetchUsers = () => {

        setIsLoading(true);
        axiosInstance.get(APIURLS.user.getUserEng())
            .then(res => res.data)
            .then(
                (result) => {
                    setUsers(result);
                    setIsLoading(false);
                },
                (error) => {

                }
            )
    }

    const FetchBranches = () => {
        setIsLoading(true);
        axiosInstance.get(APIURLS.branch.getBranchesEng())
            .then(res => res.data)
            .then(
                (result) => {
                    setBranches(result);
                    setIsLoading(false);
                },
                (error) => {
                }
            )
    }

   

    const fetchData = () => {

        const transformedFilter = {
            ...filter,
            status: filter.status.map(s => s.value),
            userOption: filter.userOption.map(u => u.value),
            branches: filter.branches.map(b => b.value),
            departmentBase: filter.departmentBase.map(p => p.value),
            priority: filter.priority.map(p => p.value),
        };

        setIsLoading(true);
        axiosInstance.post(APIURLS.ticketEng.getTickets(), transformedFilter)
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
    };


    const fetchDataFromTicketNum = () => {
        if (selectedTicket !== null) { return; };

        setIsLoading(true);
        axiosInstance
            .get(APIURLS.ticketEng.getTicketNum() + ticketNum)
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
        FetchUsers();
        FetchBranches();
        fetchData();

    }, []);





    const onChangeStatusFilter = (newValue: MultiValue<FilterStatus>, actionMeta: ActionMeta<FilterStatus>) => {

        setFilter((prevFilter) => ({
            ...prevFilter,
            status: newValue // newValue is the selected options array
        }));

        if (newValue.length === 0) {
            setFilter((prevFilter) => ({
                ...prevFilter,
                status: [filterStatusInitialState], // Reset to default status if no selection
            }));
        }
    };

    const onChangePriorityFilter = (newValue: MultiValue<FilterPriority>, actionMeta: ActionMeta<FilterPriority>) => {
        setFilter(filter => ({
            ...filter,
            priority: newValue
        }));
    };

    const onChangeDepartmentbaseFilter = (newValue: MultiValue<FilterDepartmentBase>, actionMeta: ActionMeta<FilterDepartmentBase>) => {
        setFilter(filter => ({
            ...filter,
            departmentBase: newValue
        }));
    };

    const onChangeUserFilter = (newValue: MultiValue<FilterAssignee>, actionMeta: ActionMeta<FilterAssignee>) => {
        setFilter(filter => ({
            ...filter,
            userOption: newValue
        }));
    };

    const onChangeBranchFilter = (newValue: MultiValue<FilterBranch>, actionMeta: ActionMeta<FilterBranch>) => {
        setFilter(filter => ({
            ...filter,
            branches: newValue
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

    const getStatusColor = (status: string) => {
        switch (status.toUpperCase()) {
            case 'OPEN':
                return 'bg-yellow-400 text-white dark:text-gray-700';
            case 'ON HOLD':
                return 'bg-red-400 text-white dark:text-gray-700';
            case 'IN PROGRESS':
                return 'bg-blue-400 text-white dark:text-gray-700';
            case 'DONE':
                return 'bg-green-400 text-white dark:text-gray-700';
            default:
                return 'bg-gray-300 text-white dark:text-gray-700';
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
            return "bg-green-200";
        }

        if (appSetting) {
            const colorMap: Record<string, string> = {
                red: "bg-red-200",
                blue: "bg-blue-200",
                yellow: "bg-yellow-200",
                green: "bg-green-200",
                gray: "bg-gray-200",
                orange: "bg-orange-200",
            };

            const newColor = colorMap[appSetting.newColor] || "bg-gray-200";
            const warningColor = colorMap[appSetting.warningColor] || "bg-gray-200";
            const severeColor = colorMap[appSetting.severeColor] || "bg-gray-200";

            const newFrom = parseInt(appSetting.newFrom, 10); // already in minutes
            const newTo = parseInt(appSetting.newTo, 10); // already in minutes
            const warningFrom = parseInt(appSetting.warningFrom, 10); // already in minutes
            const warningTo = parseInt(appSetting.warningTo, 10); // already in minutes
            const severeFrom = parseInt(appSetting.severeFrom, 10); // already in minutes
            const severeTo = parseInt(appSetting.severeTo, 10); // already in minutes

            const entryDate = new Date(dateEntry);
            const currentDate = new Date();

            // Calculate the time difference in minutes
            const timeDifference = (currentDate.getTime() - entryDate.getTime()) / (1000 * 60); // Convert to minutes
            const minutes = Math.floor(timeDifference);

            let selectedColor = "bg-gray-200"; // Default color

            // Color logic based on minutes
            if (minutes >= newFrom && minutes < newTo) {
                selectedColor = newColor;  // New Color (in minutes)
            }
            if (minutes >= warningFrom && minutes < warningTo) {
                selectedColor = warningColor; // Warning Color (in minutes)
            }
            if (minutes >= severeFrom) {
                selectedColor = severeColor; // Severe Color (in minutes)
            }

            return selectedColor;
        }

        return "bg-gray-200"; // Default color if no settings match
    };



    if (orderBy) {
        data.tickets.sort((a, b) => {
            const aValue = typeof a[orderBy as keyof typeof a] === 'string' ? (a[orderBy as keyof typeof a] as string).toLowerCase() : String(a[orderBy as keyof typeof a]);
            const bValue = typeof b[orderBy as keyof typeof b] === 'string' ? (b[orderBy as keyof typeof b] as string).toLowerCase() : String(b[orderBy as keyof typeof b]);

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

    const filteredTickets = data.tickets.filter((ticket) => {
        const matchesSearch =
            ticket.title.toLowerCase().includes(filter.search.toLowerCase()) ||
            ticket.description.toLowerCase().includes(filter.search.toLowerCase());

            const matchesStatus =
            filter.status.length === 0 || 
            filter.status.some(status => status.value === 4 || status.value === ticket.status);

        const matchesAssignee =
            filter.userOption.length === 0 || filter.userOption.some(user => user.value === ticket.assigneeId);

        const matchesBranch =
            filter.branches.length === 0 || filter.branches.some(branch => branch.value === ticket.branchId);


        return (
            matchesSearch &&
            matchesStatus &&
            matchesAssignee &&
            matchesBranch
        );
    });
    
    const [theme, setTheme] = useState<string>(() => {
        return localStorage.getItem('theme') || 'light';
    });

    useEffect(() => {
        localStorage.setItem('theme', theme);
    }, [theme]);


    return (
        // <div className="container mx-auto mt-4">
        <div className="w-full mx-auto mt-4 px-16">
            <div className="flex justify-between mt-4">
                <div className="flex space-x-4">
                    {/* Search Field */}
                    <div className="flex flex-col items-start">
                        <label
                            htmlFor="search-input"
                            className="text-gray-700 dark:text-gray-200 font-medium mb-2"
                        >
                            Search
                        </label>
                        <input
                            id="search-input"
                            type="text"
                            className="w-full max-w-xs border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white rounded-md p-2"
                            placeholder="Search..."
                            value={filter.search}
                            onChange={(e) =>
                                setFilter((prev) => ({
                                    ...prev,
                                    search: e.target.value
                                }))
                            }
                        />
                    </div>

                    <div className="flex flex-col items-start">
                        <label
                            htmlFor="status-input"
                            className="text-gray-700 dark:text-gray-200 font-medium mb-2"
                        >
                            Status
                        </label>
                        <Select
                            isMulti
                            options={StatusList}
                            onChange={onChangeStatusFilter}
                            value={filter.status}
                            styles={{
                                control: (base: any) => ({
                                    ...base,
                                    backgroundColor: theme === 'dark' ? '#2d3748' : '#fff',
                                    color: theme === 'dark' ? '#fff' : '#000',
                                    borderColor: theme === 'dark' ? '#555' : '#ccc',
                                }),
                                multiValue: (base: any) => ({
                                    ...base,
                                    backgroundColor: theme === 'dark' ? '#4a5568' : '#f0f0f0',
                                    color: theme === 'dark' ? '#fff' : '#000',
                                    borderColor: theme === 'dark' ? '#555' : '#ccc',
                                }),
                                multiValueLabel: (base: any) => ({
                                    ...base,
                                    color: theme === 'dark' ? '#fff' : '#000',
                                    borderColor: theme === 'dark' ? '#555' : '#ccc',
                                    backgroundColor: theme === 'dark' ? '#4a5568' : '#f0f0f0',
                                  }),
                                  multiValueRemove: (base: any) => ({
                                    ...base,
                                    color: theme === 'dark' ? '#fff' : '#000',
                                    ':hover': {
                                      backgroundColor: theme === 'dark' ? 'red' : '#e0e0e0',
                                    },
                                  }),
                                    menu: (base: any) => ({
                                    ...base,
                                    backgroundColor: theme === 'dark' ? '#2d3748' : '#fff',
                                  }),
                                option: (base: any) => ({
                                    ...base,
                                    backgroundColor: theme === 'dark' ? '#444' : '#fff',
                                    color: theme === 'dark' ? '#fff' : '#000',
                                    '&:hover': {
                                        backgroundColor: theme === 'dark' ? '#555' : '#f0f0f0',
                                        color: theme === 'dark' ? '#fff' : '#000',
                                    },
                                }),
                            }}
                            className={filter.status.length > 1 ? '' : 'w-52'}
                        />
                    </div>

                    <div className="flex flex-col items-start">
                        <label
                            htmlFor="assignee-input"
                            className="text-gray-700 dark:text-gray-200 font-medium mb-2"
                        >
                            Assignee
                        </label>
                        <Select
                            isMulti
                            options={AssigneeList}
                            onChange={onChangeUserFilter}
                            styles={{
                                control: (base: any) => ({
                                    ...base,
                                    backgroundColor: theme === 'dark' ? '#2d3748' : '#fff',
                                    color: theme === 'dark' ? '#fff' : '#000',
                                    borderColor: theme === 'dark' ? '#555' : '#ccc',
                                }),
                                multiValue: (base: any) => ({
                                    ...base,
                                    backgroundColor: theme === 'dark' ? '#4a5568' : '#f0f0f0',
                                    color: theme === 'dark' ? '#fff' : '#000',
                                    borderColor: theme === 'dark' ? '#555' : '#ccc',
                                }),
                                multiValueLabel: (base: any) => ({
                                    ...base,
                                    color: theme === 'dark' ? '#fff' : '#000',
                                    borderColor: theme === 'dark' ? '#555' : '#ccc',
                                    backgroundColor: theme === 'dark' ? '#4a5568' : '#f0f0f0',
                                  }),
                                  multiValueRemove: (base: any) => ({
                                    ...base,
                                    color: theme === 'dark' ? '#fff' : '#000',
                                    ':hover': {
                                      backgroundColor: theme === 'dark' ? 'red' : '#e0e0e0',
                                    },
                                  }),
                                    menu: (base: any) => ({
                                    ...base,
                                    backgroundColor: theme === 'dark' ? '#2d3748' : '#fff',
                                  }),
                                option: (base: any) => ({
                                    ...base,
                                    backgroundColor: theme === 'dark' ? '#444' : '#fff',
                                    color: theme === 'dark' ? '#fff' : '#000',
                                    '&:hover': {
                                        backgroundColor: theme === 'dark' ? '#555' : '#f0f0f0',
                                        color: theme === 'dark' ? '#fff' : '#000',
                                    },
                                }),
                            }}
                            className={filter.userOption.length > 1 ? '' : 'w-52'}
                        />
                    </div>
                    <div className="flex flex-col items-start">
                        <label
                            htmlFor="assignee-input"
                            className="text-gray-700 dark:text-gray-200 font-medium mb-2"
                        >
                            Branch
                        </label>
                        <Select
                            isMulti
                            options={BranchList}
                            onChange={onChangeBranchFilter}
                            styles={{
                                control: (base: any) => ({
                                    ...base,
                                    backgroundColor: theme === 'dark' ? '#2d3748' : '#fff',
                                    color: theme === 'dark' ? '#fff' : '#000',
                                    borderColor: theme === 'dark' ? '#555' : '#ccc',
                                }),
                                multiValue: (base: any) => ({
                                    ...base,
                                    backgroundColor: theme === 'dark' ? '#4a5568' : '#f0f0f0',
                                    color: theme === 'dark' ? '#fff' : '#000',
                                    borderColor: theme === 'dark' ? '#555' : '#ccc',
                                }),
                                multiValueLabel: (base: any) => ({
                                    ...base,
                                    color: theme === 'dark' ? '#fff' : '#000',
                                    borderColor: theme === 'dark' ? '#555' : '#ccc',
                                    backgroundColor: theme === 'dark' ? '#4a5568' : '#f0f0f0',
                                  }),
                                  multiValueRemove: (base: any) => ({
                                    ...base,
                                    color: theme === 'dark' ? '#fff' : '#000',
                                    ':hover': {
                                      backgroundColor: theme === 'dark' ? 'red' : '#e0e0e0',
                                    },
                                  }),
                                    menu: (base: any) => ({
                                    ...base,
                                    backgroundColor: theme === 'dark' ? '#2d3748' : '#fff',
                                  }),
                                option: (base: any) => ({
                                    ...base,
                                    backgroundColor: theme === 'dark' ? '#444' : '#fff',
                                    color: theme === 'dark' ? '#fff' : '#000',
                                    '&:hover': {
                                        backgroundColor: theme === 'dark' ? '#555' : '#f0f0f0',
                                        color: theme === 'dark' ? '#fff' : '#000',
                                    },
                                }),
                            }}
                            className={filter.branches.length > 1 ? '' : 'w-52'}
                        />
                    </div>

                    {/* <div className="flex flex-col items-start">
                        <label
                            htmlFor="priority-input"
                            className="text-gray-700 font-medium mb-2"
                        >
                            Department
                        </label>

                        <Select isMulti
                            options={filteredDepartments}
                            onChange={onChangeDepartmentbaseFilter}
                            value={filter.departmentBase}
                            className={filter.priority.length > 1 ? '' : 'w-52'}
                        />
                    </div> */}

                    {/* <div className="flex flex-col items-start">
                        <label
                            htmlFor="priority-input"
                            className="text-gray-700 font-medium mb-2"
                        >
                            Priority
                        </label>

                        <Select isMulti
                            options={PriorityList}
                            onChange={onChangePriorityFilter}
                            value={filter.priority}
                            className={filter.priority.length > 1 ? '' : 'w-52'}
                        />
                    </div> */}





                </div>

            </div>





            <div className="overflow-x-auto mt-4">
                <table className="w-full border-collapse">
                    <thead>
                        <tr>

                            <th className="px-6 py-3 bg-gray-100 text-left text-xs font-bold text-gray-600 uppercase tracking-wider cursor-pointer dark:bg-gray-800 dark:text-white dark:border-gray-700" onClick={() => handleOrder('ticketNumber')}>
                                Ticket Number {orderBy === 'ticketNumber' && (orderDesc ? '↓' : '↑')}
                            </th>
                            <th className="px-6 py-3 bg-gray-100 text-left text-xs font-bold text-gray-600 uppercase tracking-wider cursor-pointer dark:bg-gray-800 dark:text-white dark:border-gray-700" onClick={() => handleOrder('calledIn')}>
                                Called In {orderBy === 'calledIn' && (orderDesc ? '↓' : '↑')}
                            </th>
                            <th className="px-6 py-3 bg-gray-100 text-left text-xs font-bold text-gray-600 uppercase tracking-wider cursor-pointer dark:bg-gray-800 dark:text-white dark:border-gray-700" onClick={() => handleOrder('elapsed')}>
                                Duration {orderBy === 'elapsed' && (orderDesc ? '↓' : '↑')}
                            </th>
                            <th className="px-6 py-3 bg-gray-100 text-left text-xs font-bold text-gray-600 uppercase tracking-wider cursor-pointer dark:bg-gray-800 dark:text-white dark:border-gray-700" onClick={() => handleOrder('title')}>
                                Title {orderBy === 'title' && (orderDesc ? '↓' : '↑')}
                            </th>
                            <th className="px-6 py-3 bg-gray-100 text-left text-xs font-bold text-gray-600 uppercase tracking-wider cursor-pointer dark:bg-gray-800 dark:text-white dark:border-gray-700" onClick={() => handleOrder('departmentBase')}>
                                Department {orderBy === 'departmentBase' && (orderDesc ? '↓' : '↑')}
                            </th>
                            <th className="px-6 py-3 bg-gray-100 text-left text-xs font-bold text-gray-600 uppercase tracking-wider cursor-pointer dark:bg-gray-800 dark:text-white dark:border-gray-700" onClick={() => handleOrder('branch')}>
                                Branch {orderBy === 'branch' && (orderDesc ? '↓' : '↑')}
                            </th>
                            <th className="px-6 py-3 bg-gray-100 text-left text-xs font-bold text-gray-600 uppercase tracking-wider cursor-pointer dark:bg-gray-800 dark:text-white dark:border-gray-700" onClick={() => handleOrder('reporter')}>
                                Reporter {orderBy === 'reporter' && (orderDesc ? '↓' : '↑')}
                            </th>
                            <th className="px-6 py-3 bg-gray-100 text-left text-xs font-bold text-gray-600 uppercase tracking-wider cursor-pointer dark:bg-gray-800 dark:text-white dark:border-gray-700" onClick={() => handleOrder('assignee')}>
                                Assignee {orderBy === 'assignee' && (orderDesc ? '↓' : '↑')}
                            </th>
                            {/* <th className="px-6 py-3 bg-gray-100 text-left text-xs font-bold text-gray-600 uppercase tracking-wider cursor-pointer" onClick={() => handleOrder('priorityName')}>
                                Priority {orderBy === 'priorityName' && (orderDesc ? '↓' : '↑')}
                            </th> */}

                            <th className="px-6 py-3 bg-gray-100 text-left text-xs font-bold text-gray-600 uppercase tracking-wider cursor-pointer dark:bg-gray-800 dark:text-white dark:border-gray-700" onClick={() => handleOrder('status')}>
                                Status {orderBy === 'status' && (orderDesc ? '↓' : '↑')}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTickets.map((item, index) => (
                            <tr className={`hover:bg-gray-200 dark:hover:bg-gray-700 ${index !== filteredTickets.length - 1 ? 'border-b border-gray-300 dark:border-gray-700' : ''}`}>

                                <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 h-12">
                                    {/* <div className="flex items-center space-x-2">
                                        <CopyButton text={item.ticketNumber} />
                                        <span>{item.ticketNumber}</span>
                                    </div> */}

                                    {item.ticketNumber}
                                </td>
                                <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300"> {item.calledIn
                                    ? new Intl.DateTimeFormat('en-US', {
                                        year: 'numeric',
                                        month: '2-digit',
                                        day: '2-digit',
                                    }).format(new Date(item.calledIn))
                                    : ''}</td>

                                <td
                                    className={`px-2 py-1 whitespace-nowrap text-sm text-gray-700 text-center rounded-full ${getAppSettingsColor(item.calledIn, item.status)}`}
                                >
                                    {formatTimeDifference(
                                        item.status === 0 ? item.timeStamp.toString() : new Date().toString(),
                                        item.calledIn.toString()
                                    )}
                                </td>



                                <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">  {item.title.length > 40 ? item.title.slice(0, 40) + '......' : item.title}</td>
                                <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                    Engineering
                                </td>
                                <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{item.branchName}</td>
                                <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{item.reporterText}</td>
                                <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{item.assigneeText}</td>
                                {/* <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">{item.priorityName}</td> */}
                                <td className="px-3 whitespace-nowrap text-sm text-gray-500">
                                    <span className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${getStatusColor(item.statusName.toString())}`}>
                                        {item.statusName}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="flex justify-between items-center mt-2 text-xs sm:text-sm">
                <p className="text-gray-600 dark:text-gray-300">
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
                        className="w-12 sm:w-14 text-center border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
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

            <TicketViewPopup selectedTicket={selectedTicket} setSelectedTicket={setSelectedTicket} handleSave={handleSave} handleClose={handleClose} isTicketView={false} documentTypes={documentType} users={users} branches={branches} />
            <LoadComponent loading={isLoading} />
        </div>
    );
};

export default Tickets;