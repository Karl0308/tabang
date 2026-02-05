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


export interface AverageResponseTimeDetailDTO {
    ticketNumber: string;
    title: string;
    assigneeName: string;
    responseTime: string;
}

export interface AverageResponseTimeHeaderDTO {
    dtoList: AverageResponseTimeDetailDTO[];
    averageResponseTime: string;
}


type FilterState = {
    dateFrom: Date;
    dateTo: Date;
    assigneeId: number;
};


const AverageResolutionTimeReport = () => {

    const { ticketNum } = useParams();

    const [data, setData] = useState<AverageResponseTimeHeaderDTO>();

    const [orderBy, setOrderBy] = useState('');
    const [orderDesc, setOrderDesc] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [documentType, setDocumentTypes] = useState<DocumentType[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [appSetting, setAppSetting] = useState<AppSetting | null>(null);



    const [filter, setFilter] = useState<FilterState>(() => {
        const today = new Date();
        const fiveDaysAgo = new Date();
        fiveDaysAgo.setDate(today.getDate() - 5);

        return {
            dateFrom: fiveDaysAgo,
            dateTo: today,
            assigneeId: 0,
        };
    });

    const AssigneeList = [
        { value: 0, label: 'ALL' },
        ...users
            .sort((a, b) => a.fullName.localeCompare(b.fullName))
            .map((user) => ({ value: user.id, label: user.fullName }))
    ];

    const axiosInstance = axios.create({
        headers: {
            'Authorization': `Bearer ${localStorage.getItem("token")}`,
        }
    });

    const FetchUsers = () => {
        setIsLoading(true);
        axiosInstance.get(APIURLS.user.getUsers())
            .then(res => {
                const result = res.data;
                setUsers(result);
            })
            .catch(error => {
                // handle error here if needed
            })
            .finally(() => {
                setIsLoading(false);
            });
    };





    const fetchData = () => {

        const transformedFilter = {
            ...filter,
            dateFrom: filter.dateFrom.toISOString(),
            dateTo: filter.dateTo.toISOString(),
            assigneeId: filter.assigneeId
        };

        setIsLoading(true);
        axiosInstance.post(APIURLS.report.getAverageResolutionReports(), transformedFilter)
            .then((res) => {
                const result = res.data as AverageResponseTimeHeaderDTO;
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

    }, []);

    const onChangeUserFilter = (newValue: number) => {
        setFilter(filter => ({
            ...filter,
            assigneeId: newValue
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


    if (orderBy) {
        data?.dtoList.sort((a, b) => {
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
        let y = 40; // Starting y position for the first page
        let rowCount = 0;

        // Define custom column widths for each header
        const columnWidths = [30, 80, 50, 40]; // Adjust based on the number of columns
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
            const month = date.toLocaleString('en-US', { month: 'long' }); // e.g., "May"
            const day = date.getDate(); // e.g., 5
            const year = date.getFullYear(); // e.g., 2025
        
            const time = date.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true, // Use 24-hour format. Set to true for 12-hour with AM/PM.
            });
        
            return `${month} ${day} ${year} ${time}`;
        };
        

        const dateFromFormatted = formatDate(filter.dateFrom);
        const dateToFormatted = formatDate(filter.dateTo);
        const title = `Average Resolution Time Report`;
        doc.setFontSize(24); // Set font size for the title
        doc.setFont("helvetica", "bold"); // Set font to bold for the title
        doc.text(title, 40, 10); // Add header at the top of the first page

        doc.setFontSize(8); // Reduced font size for rows

        const dategenerate = `Date Generated: ${formatDate(new Date())}`;
        doc.text(dategenerate, 10, 15); // Add header at the top of the first page




        const averageResponseTime = `Average Resolution Time`;

        // Set font and size for the title
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text(averageResponseTime, 130, 18); // Add header at the top of the first page

        // Calculate text width and height for the border
        const averageResponseTimeWidth = doc.getTextWidth(averageResponseTime);
        const averageResponseTimeHeight = 10; // Adjust as needed


        // Set font size for the average response time text
        const averageResponseTimeText = data?.averageResponseTime.toString() || "N/A"; // Get the average response time from the data
        doc.setFontSize(24); // Set font size for the average response time text
        doc.text(averageResponseTimeText, 120, 25); // Add header at the top of the first page

        // Calculate the text width for the average response time
        const averageResponseTimeTextWidth = doc.getTextWidth(averageResponseTimeText);
        const averageResponseTimeTextHeight = 14; // Adjust as needed

        // Draw the square border around the average response time text
        doc.rect(120 - 2, 20 - 8, averageResponseTimeTextWidth + 4, averageResponseTimeTextHeight + 4); // Draw border with padding






        doc.setFont("helvetica", "bold");
        doc.setFontSize(8); // Reduced font size for rows

        const headerDateFrom = `Date Between: ${dateFromFormatted.toLocaleString()} and ${dateToFormatted.toLocaleString()}`;
        doc.text(headerDateFrom, 10, 20); 

        const assigneeName = filter.assigneeId === 0 ? "All" : users.find(user => user.id === filter.assigneeId)?.fullName || "Unknown";
        const assignee = `Assignee: ${assigneeName}`;
        doc.text(assignee, 10, 25);

        const totalRows = rows.length - 1; // Subtract 1 if you want to exclude the header row
        const total = `Total Tickets: ${totalRows}`;
        doc.text(total, 10, 30); // Add header at the top of the first page

        doc.setLineWidth(0.5); // Optional: set the line thickness
        doc.line(10, 32, 200, 32); // Draw a horizontal line from x=10 to x=200 at y=32


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

            // If rowsPerPage is reached, add a new page with the header
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
        const filename = `tabang-resolution-pdf-reports-${formattedDate}.pdf`;

        // Save the generated PDF
        doc.save(filename);
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
                            htmlFor="assignee-input"
                            className="text-gray-700 dark:text-gray-200 font-medium mb-2"
                        >
                            Assignee
                        </label>
                        <select
                            id="assignee-input"
                            className="w-full max-w-xs border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white rounded-md p-2.5"
                            value={filter.assigneeId || ""}
                            onChange={e => onChangeUserFilter(Number(e.target.value))}
                        >
                            <option value={0}>All</option>
                            {users.map(user => (
                                <option key={user.id} value={user.id}>
                                    {user.fullName}
                                </option>
                            ))}
                        </select>
                    </div>


                    <div className="flex flex-col items-start mt-2">
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

                    <div className="flex flex-col items-start mt-2">
                        <label
                            htmlFor="priority-input"
                            className="text-gray-700 dark:text-gray-200 font-medium mb-2"
                        >
                        </label>

                        <button
                            type="button"
                            className="mt-4 px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition"
                            onClick={exportTableAsPDF}
                            disabled={data?.dtoList.length === 0 ? true : false}
                        >
                            Print  PDF
                        </button>
                    </div>

                </div>

            </div>





            <div className="overflow-x-auto mt-4">
                <table id='table-to-export' className="w-full border-collapse">
                    <thead>
                        <tr>
                            <th className="px-6 py-3 bg-gray-100 text-left text-xs font-bold text-gray-600 uppercase tracking-wider cursor-pointer dark:bg-gray-800 dark:text-white dark:border-gray-700" onClick={() => handleOrder('ticketNumber')}>
                                Ticket # {orderBy === 'ticketNumber' && (orderDesc ? '↓' : '↑')}
                            </th>
                            <th className="px-6 py-3 bg-gray-100 text-left text-xs font-bold text-gray-600 uppercase tracking-wider cursor-pointer dark:bg-gray-800 dark:text-white dark:border-gray-700" onClick={() => handleOrder('title')}>
                                Title {orderBy === 'title' && (orderDesc ? '↓' : '↑')}
                            </th>
                            <th className="px-6 py-3 bg-gray-100 text-left text-xs font-bold text-gray-600 uppercase tracking-wider cursor-pointer dark:bg-gray-800 dark:text-white dark:border-gray-700" onClick={() => handleOrder('assignee')}>
                                Assignee {orderBy === 'assignee' && (orderDesc ? '↓' : '↑')}
                            </th>
                            <th className="px-6 py-3 bg-gray-100 text-left text-xs font-bold text-gray-600 uppercase tracking-wider cursor-pointer dark:bg-gray-800 dark:text-white dark:border-gray-700" onClick={() => handleOrder('responseTime')}>
                                Resolution Time {orderBy === 'responseTime' && (orderDesc ? '↓' : '↑')}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {data?.dtoList.map((item, index) => (
                            <tr className={`hover:bg-gray-200 dark:hover:bg-gray-700 ${index !== data.dtoList.length - 1 ? 'border-b border-gray-300 dark:border-gray-700' : ''}`}>

                                <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 h-12 text-left ">
                                    {item.ticketNumber}
                                </td>
                                <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 h-12 text-left ">
                                    {item.title.length > 40 ? item.title.substring(0, 40) + '...' : item.title}
                                </td>
                                <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 text-left ">{item.assigneeName}</td>
                                <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 text-left ">{item.responseTime}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="flex justify-between items-center mt-2 text-xs sm:text-sm mb-6">
                <p className="text-gray-600 dark:text-gray-300">
                    Showing <span className="font-semibold">{data?.dtoList.length}</span>
                    &nbsp; results
                </p>
            </div>

            <TicketViewPopup selectedTicket={selectedTicket} setSelectedTicket={setSelectedTicket} handleSave={handleSave} handleClose={handleClose} isTicketView={false} users={users} branches={branches} departments={[]} />
            <LoadComponent loading={isLoading} />
        </div>
    );
};

export default AverageResolutionTimeReport;