import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from "react-router-dom";
import TicketDetail from '../Ticket/TicketDetail';
import LoadComponent from '../../component/LoadComponent';
import { Link } from 'react-router-dom';
import { Ticket } from '../../objects/Ticket';
import TicketViewPopup from '../Ticket/TicketViewPopup';
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
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const ITEMS_PER_PAGE = 10;

interface FilterStatus {
    value: number;
    label: string;
}
interface FilterDepartmentBase {
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
interface ReportQueryResult {
    tickets: Ticket[];
    pageNumber: number;
    pageSize: number;
    totalRecords: number;
}

type FilterState = {
    dateFrom: Date;
    dateTo: Date;
    status: MultiValue<FilterStatus>;
    userOption: MultiValue<FilterAssignee>;
    branches: MultiValue<FilterBranch>;
    departmentBase: MultiValue<FilterDepartmentBase>;
    userId: number;
};


const TicketReport = () => {

    const { ticketNum } = useParams();

    const [data, setData] = useState<ReportQueryResult>({
        tickets: [],
        pageNumber: 1,
        pageSize: 10,
        totalRecords: 0
    });

    const [orderBy, setOrderBy] = useState('');
    const [orderDesc, setOrderDesc] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [documentType, setDocumentTypes] = useState<DocumentType[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [appSetting, setAppSetting] = useState<AppSetting | null>(null);


    const filterStatusInitialState: FilterStatus = { value: 4, label: 'ALL' };
    const filterUserInitialState: FilterAssignee = { value: 0, label: 'ALL' };
    const filterDepartmentInitialState: FilterDepartmentBase = { value: 0, label: 'ALL' };
    const filterBranchInitialState: FilterBranch = { value: 0, label: 'ALL' };


    const [filter, setFilter] = useState<FilterState>(() => {
        const today = new Date();
        const fiveDaysAgo = new Date();
        fiveDaysAgo.setDate(today.getDate() - 5);

        return {
            dateFrom: fiveDaysAgo,
            dateTo: today,
            status: [filterStatusInitialState],
            userOption: [],
            branches: [],
            departmentBase: [filterDepartmentInitialState],
            userId: localStorage.getItem('id') ? parseInt(localStorage.getItem('id') as string) : 0,
        };
    });

    const StatusList = [
        { value: 4, label: 'ALL' },
        { value: 1, label: 'OPEN' },
        { value: 2, label: 'ON HOLD' },
        { value: 3, label: 'IN PROGRESS' },
        { value: 0, label: 'DONE' }
    ];
    const DepartmentList = [
        { value: 0, label: 'ALL' },
        { value: 1, label: 'IS' },
        { value: 2, label: 'ENGINEERING' },
        { value: 3, label: 'CCTV' },
    ];


    const AssigneeList = [
        { value: 0, label: 'ALL' },
        ...users.filter(x => x.role !== 2)
            .sort((a, b) => a.fullName.localeCompare(b.fullName))
            .map((user) => ({ value: user.id, label: user.fullName }))
    ];
    const BranchList = [
        { value: 0, label: 'ALL' },
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

    const FetchUsers = () => {
        setIsLoading(true);
        axiosInstance.get(APIURLS.user.getUsers())
            .then(res => {
                const result = res.data;
                setUsers(result);
                setFilter(prev => ({
                    ...prev,
                    userOption: [filterUserInitialState],
                }));
            })
            .catch(error => {
                // handle error here if needed
            })
            .finally(() => {
                setIsLoading(false);
            });
    };



    const FetchBranches = () => {
        setIsLoading(true);
        axiosInstance.get(APIURLS.branch.getBranches())
            .then(res => res.data)
            .then(
                (result) => {
                    setBranches(result);
                    setIsLoading(false);

                    setFilter(prev => ({
                        ...prev,
                        userOption: [filterBranchInitialState],
                    }));
                },
                (error) => {
                }
            )
    }



    const fetchData = () => {

        const transformedFilter = {
            ...filter,
            dateFrom: filter.dateFrom.toISOString(),
            dateTo: filter.dateTo.toISOString(),
            status: filter.status.map(s => s.value),
            userOption: filter.userOption.map(u => u.value),
            branches: filter.branches.map(b => b.value),
            departmentBase: filter.departmentBase.map(p => p.value)
        };

        setIsLoading(true);
        axiosInstance.post(APIURLS.report.getReports(), transformedFilter)
            .then((res) => {
                const result = res.data as ReportQueryResult;
                setData(result);
            })
            .catch((error) => {
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    // const formatDate = (date: Date): string =>
    //     date.toISOString().split("T")[0];

    const formatDate = (date: Date): string => {
        const pad = (n: number) => n.toString().padStart(2, "0");

        const year = date.getFullYear();
        const month = pad(date.getMonth() + 1); // Months are zero-indexed
        const day = pad(date.getDate());
        const hours = pad(date.getHours());
        const minutes = pad(date.getMinutes());

        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };


    useEffect(() => {
        FetchUsers();
        FetchBranches();
        // fetchData();

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

    const onChangeDepartmentbaseFilter = (newValue: MultiValue<FilterDepartmentBase>, actionMeta: ActionMeta<FilterDepartmentBase>) => {
        setFilter(filter => ({
            ...filter,
            departmentBase: newValue
        }));
        if (newValue.length === 0) {
            setFilter((prevFilter) => ({
                ...prevFilter,
                departmentBase: [filterDepartmentInitialState], // Reset to default status if no selection
            }));
        }
    };

    const onChangeUserFilter = (newValue: MultiValue<FilterAssignee>, actionMeta: ActionMeta<FilterAssignee>) => {
        setFilter(filter => ({
            ...filter,
            userOption: newValue
        }));
        if (newValue.length === 0) {
            setFilter((prevFilter) => ({
                ...prevFilter,
                userOption: [filterUserInitialState], // Reset to default status if no selection
            }));
        }
    };

    const onChangeBranchFilter = (newValue: MultiValue<FilterBranch>, actionMeta: ActionMeta<FilterBranch>) => {
        setFilter(filter => ({
            ...filter,
            branches: newValue
        }));

        if (newValue.length === 0) {
            setFilter((prevFilter) => ({
                ...prevFilter,
                branches: [filterBranchInitialState], // Reset to default status if no selection
            }));
        }
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


    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            (e.target as HTMLInputElement).blur();
        }
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

    // const exportTableAsPDF = () => {
    //     setIsLoading(true);
    //     const input = document.getElementById("table-to-export");

    //     if (!input) return;

    //     html2canvas(input).then((canvas) => {
    //         const imgData = canvas.toDataURL("image/png");
    //         const pdf = new jsPDF();
    //         const imgProps = pdf.getImageProperties(imgData);
    //         const pdfWidth = pdf.internal.pageSize.getWidth();
    //         const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    //         pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    //         const now = new Date();
    //         const formattedDate = now.toLocaleString('en-GB', {
    //             year: 'numeric',
    //             month: '2-digit',
    //             day: '2-digit',
    //             hour: '2-digit',
    //             minute: '2-digit',
    //             second: '2-digit'
    //         }).replace(/[\/:, ]+/g, '-');

    //         const filename = `tabang-pdf-reports-${formattedDate}.pdf`;
    //         pdf.save(filename);
    //         setIsLoading(false);
    //     });
    // };

    const exportTableAsPDF = () => {
        const doc = new jsPDF();
        const table = document.getElementById("table-to-export");

        if (!table) return;

        const rows = Array.from(table.querySelectorAll("tr"));
        const rowsPerPage = 30; // Increased rows per page
        const rowHeight = 8; // Reduced row height for better readability
        let y = 20; // Starting y position for the first page
        let rowCount = 0;

        // Define custom column widths for each header
        const columnWidths = [18, 20, 20, 32, 45, 42, 25]; // Custom widths for each column
        const totalWidth = columnWidths.reduce((a, b) => a + b, 0); // Calculate total width

        // Define starting x positions for each column based on custom widths
        let xPositions = [10]; // Start at 10 for the first column
        for (let i = 0; i < columnWidths.length - 1; i++) {
            xPositions.push(xPositions[i] + columnWidths[i]); // Increment x position by column width
        }

        // Set font and size
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8); // Reduced font size for rows

        // Header details (this will only appear on the first page)
        const formatDate = (date: Date): string => {
            const day = date.toLocaleDateString("en-GB"); // Get the date part in dd/mm/yyyy format
            const time = date.toLocaleTimeString("en-GB", { hour: '2-digit', minute: '2-digit', second: '2-digit' }); // Get the time part in hh:mm:ss format
            return `${day} ${time}`; // Combine both date and time
        };

        const dateFromFormatted = formatDate(filter.dateFrom);
        const dateToFormatted = formatDate(filter.dateTo);

        const headerDateFrom = `Date From: ${dateFromFormatted.toLocaleString()}`;
        doc.text(headerDateFrom, 10, 10); // Add header at the top of the first page
        const headerDateTo = `Date To: ${dateToFormatted.toLocaleString()}`;
        doc.text(headerDateTo, 55, 10); // Add header at the top of the first page
        
        const totalRows = rows.length - 1; // Subtract 1 if you want to exclude the header row
        const total = `Total: ${totalRows}`;
        doc.text(total, 10, 15); // Add header at the top of the first page



        // Header details (this will only appear on the first page)

        // Draw table headers
        const headers = rows[0]?.querySelectorAll("th");
        const headerText = Array.from(headers || []).map((cell) => (cell as HTMLElement).innerText);

        // Draw header at the top of the first page
        let x = 10;
        headerText.forEach((text, index) => {
            doc.setFont("helvetica", "bold"); // Make header text bold
            doc.text(text, xPositions[index], y);
            x = xPositions[index] + columnWidths[index];
        });

        y += rowHeight; // Move down after the header


        y += 2; // Add some space between header and rows

        // Loop through each row (excluding the header)
        rows.forEach((row, index) => {
            if (index === 0) return; // Skip the header row

            const cells = Array.from(row.querySelectorAll("td, th"));
            let x = 10;

            // Loop through each cell in the row
            cells.forEach((cell, colIndex) => {
                const cellText = (cell as HTMLElement).innerText;
                doc.setFont("helvetica", "normal"); // Regular font for data
                doc.text(cellText, xPositions[colIndex], y);
                x = xPositions[colIndex] + columnWidths[colIndex]; // Move to the next column
            });

            y += rowHeight; // Increase vertical spacing between rows
            rowCount++;

            // If 40 rows are reached, add a new page with the header
            if (rowCount >= rowsPerPage && index !== rows.length - 1) {
                doc.addPage();
                y = 20; // Reset y position
                rowCount = 0; // Reset row count

                // Draw the header again on the new page
                x = 10;
                headerText.forEach((text, index) => {
                    doc.setFont("helvetica", "bold");
                    doc.text(text, xPositions[index], y);
                    x = xPositions[index] + columnWidths[index];
                });

                y += rowHeight; // Move down after the header

                // Draw underline for the header
                // doc.setLineWidth(0.1);
                // doc.line(xPositions[0], y, xPositions[xPositions.length - 1] + columnWidths[columnWidths.length - 1], y);

                y += 2; // Add space before rows
            }
        });

        // Add the final page's border for all rows
        doc.setLineWidth(0.1);
        doc.line(xPositions[0], y, xPositions[xPositions.length - 1] + columnWidths[columnWidths.length - 1], y); // Draw border at the bottom of the last row

        // Get the current date and format it
        const now = new Date();
        const formattedDate = now.toLocaleString('en-GB', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        }).replace(/[\/:, ]+/g, '-'); // Remove invalid characters for filenames

        // Generate the filename with the formatted date
        const filename = `tabang-pdf-reports-${formattedDate}.pdf`;

        // Save the generated PDF
        doc.save(filename);
    };

    const exportTableAsCSV = () => {

        setIsLoading(true);
        const rows = Array.from(document.querySelectorAll("table tr"));
        const csv = rows.map((row) =>
            Array.from(row.querySelectorAll("th, td"))
                .map((cell) => `"${cell.textContent}"`)
                .join(",")
        ).join("\n");

        const blob = new Blob([csv], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        const now = new Date();
        const formattedDate = now.toLocaleString('en-GB', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        }).replace(/[\/:, ]+/g, '-');

        const filename = `tabang-csv-reports-${formattedDate}.csv`;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
        setIsLoading(false);
    };
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

                    <div className="flex flex-col items-start">
                        <label
                            htmlFor="date-from"
                            className="text-gray-700 dark:text-gray-200 font-medium mb-2"
                        >
                            Date From
                        </label>

                        <input
                            id="date-from"
                            type="datetime-local"
                            className="w-full max-w-xs border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white rounded-md p-2"
                            value={formatDate(filter.dateFrom)}
                            onChange={(e) =>
                                setFilter((prev) => ({
                                    ...prev,
                                    dateFrom: new Date(e.target.value),
                                }))
                            }
                            max={formatDate(filter.dateTo)}
                        />

                    </div>

                    <div className="flex flex-col items-start">
                        <label
                            htmlFor="date-to"
                            className="text-gray-700 dark:text-gray-200 font-medium mb-2"
                        >
                            Date To
                        </label>

                        <input
                            id="date-from"
                            type="datetime-local"
                            className="w-full max-w-xs border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white rounded-md p-2"
                            value={formatDate(filter.dateTo)}
                            onChange={(e) =>
                                setFilter((prev) => ({
                                    ...prev,
                                    dateTo: new Date(e.target.value),
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

                    <div className="flex flex-col items-start">
                        <label
                            htmlFor="priority-input"
                            className="text-gray-700 dark:text-gray-200 font-medium mb-2"
                        >
                            Department
                        </label>

                        <Select isMulti
                            options={DepartmentList}
                            onChange={onChangeDepartmentbaseFilter}
                            value={filter.departmentBase}
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
                            className={filter.departmentBase.length > 1 ? '' : 'w-52'}
                        />
                    </div>

                    <div className="flex flex-col items-start">
                        <label
                            htmlFor="priority-input"
                            className="text-gray-700 dark:text-gray-200 font-medium mb-2"
                        >
                        </label>

                        <button
                            type="button"
                            className="mt-4 px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition"
                            onClick={fetchData}
                        >
                            Generate
                        </button>
                    </div>

                    <div className="flex flex-col items-start">
                        <label
                            htmlFor="priority-input"
                            className="text-gray-700 dark:text-gray-200 font-medium mb-2"
                        >
                        </label>

                        <button
                            type="button"
                            className="mt-4 px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition"
                            onClick={exportTableAsPDF}
                            disabled={data.tickets.length === 0 ? true : false}
                        >
                            PDF
                        </button>
                    </div>

                    <div className="flex flex-col items-start">
                        <label
                            htmlFor="priority-input"
                            className="text-gray-700 dark:text-gray-200 font-medium mb-2"
                        >
                        </label>

                        <button
                            type="button"
                            className="mt-4 px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition"
                            onClick={exportTableAsCSV}
                            disabled={data.tickets.length === 0 ? true : false}
                        >
                            CSV
                        </button>
                    </div>

                </div>

            </div>





            <div className="overflow-x-auto mt-4">
                <table id='table-to-export' className="w-full border-collapse">
                    <thead>
                        <tr>
                            <th className="px-6 py-3 bg-gray-100 text-left text-xs font-bold text-gray-600 uppercase tracking-wider cursor-pointer dark:bg-gray-800 dark:text-white dark:border-gray-700" onClick={() => handleOrder('calledIn')}>
                                Date {orderBy === 'calledIn' && (orderDesc ? '↓' : '↑')}
                            </th>
                            <th className="px-6 py-3 bg-gray-100 text-left text-xs font-bold text-gray-600 uppercase tracking-wider cursor-pointer dark:bg-gray-800 dark:text-white dark:border-gray-700" onClick={() => handleOrder('ticketNumber')}>
                                Ticket # {orderBy === 'ticketNumber' && (orderDesc ? '↓' : '↑')}
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
                            <th className="px-6 py-3 bg-gray-100 text-left text-xs font-bold text-gray-600 uppercase tracking-wider cursor-pointer dark:bg-gray-800 dark:text-white dark:border-gray-700" onClick={() => handleOrder('status')}>
                                Status {orderBy === 'status' && (orderDesc ? '↓' : '↑')}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.tickets.map((item, index) => (
                            <tr onClick={() => handleRowClick(item)} key={item.ticketNumber} className={`hover:bg-gray-200 dark:hover:bg-gray-700 ${index !== data.tickets.length - 1 ? 'border-b border-gray-300 dark:border-gray-700' : ''}`}>

                                <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 text-left "> {item.calledIn
                                    ? new Intl.DateTimeFormat('en-US', {
                                        year: 'numeric',
                                        month: '2-digit',
                                        day: '2-digit',
                                    }).format(new Date(item.calledIn))
                                    : ''}</td>

                                <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 h-12 text-left ">
                                    {item.ticketNumber}
                                </td>

                                <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 text-left ">
                                    {item.departmentBase === DepartmentBase.Default ? "ALL" : DepartmentBase[item.departmentBase]}
                                </td>

                                <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 text-left ">{getBranch(item.branchId)}</td>
                                <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 text-left ">{getUser(item.reporterId)}</td>
                                <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 text-left ">{item.assigneeText}</td>
                                <td className="px-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 text-left ">
                                    <span className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${getStatusColor(item.statusName.toString())}`}>
                                        {item.statusName}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="flex justify-between items-center mt-2 text-xs sm:text-sm mb-4">
                <p className="text-gray-600 dark:text-gray-300">
                    Showing <span className="font-semibold">{data.tickets.length}</span>
                    &nbsp; results
                </p>



                {/* <div className="flex items-center space-x-1 bg-white p-1 sm:p-2 rounded-md shadow-sm border border-gray-300">

                    <button
                        onClick={() =>
                            setFilter((prev) => ({
                                ...prev,
                                pageNumber: prev.pageNumber - 1
                            }))
                        }

                        disabled={filter.pageNumber === 1}
                        className="px-3 py-1 sm:px-4 sm:py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
                        className="w-12 sm:w-14 text-center border border-gray-300 rounded-md px-2 py-1 text-gray-700 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />

                    <span className="text-gray-600 font-semibold w-16 block text-center">
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
                        className="px-3 py-1 sm:px-4 sm:py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {">"}
                    </button>

                </div> */}
            </div>

            <TicketViewPopup selectedTicket={selectedTicket} setSelectedTicket={setSelectedTicket} handleSave={handleSave} handleClose={handleClose} isTicketView={false} users={users} branches={branches} departments={[]} />
            <LoadComponent loading={isLoading} />
        </div>
    );
};

export default TicketReport;