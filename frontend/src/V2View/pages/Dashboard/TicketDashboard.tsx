import { useEffect, useState, useCallback } from "react";
import { Pie, Bar, Line, Doughnut } from "react-chartjs-2";
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    Filler,
} from 'chart.js';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faTicketAlt,
    faClock,
    faSpinner,
    faCheckCircle,
    faPauseCircle,
    faExclamationTriangle,
    faSync,
    faArrowUp,
    faArrowDown,
    faCalendarAlt,
    faUserClock,
    faChartLine,
    faBuilding,
    faLayerGroup,
    faFire,
    faHourglassHalf,
    faCheckDouble,
    faBolt,
} from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";

ChartJS.register(
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    Filler
);

// ============================================
// TypeScript Interfaces for API Integration
// ============================================

export interface DepartmentBase {
    id: number;
    name: string;
}

export interface Branch {
    id: number;
    name: string;
    code: string;
}

export interface Category {
    id: number;
    name: string;
    description?: string;
}

export interface User {
    id: number;
    fullName: string;
    email: string;
    role: number;
    departmentId?: number;
}

export interface Ticket {
    id: number;
    ticketNumber: string;
    title: string;
    description?: string;
    branchId: number;
    branchName: string;
    categoryId?: number;
    categoryName?: string;
    assigneeId?: number;
    assigneeText: string;
    requesterId?: number;
    requesterName?: string;
    priorityId: number;
    priorityName: string;
    statusId: number;
    statusName: string;
    dueDate: Date | null;
    createdAt: Date;
    updatedAt?: Date;
    resolvedAt?: Date;
    firstResponseAt?: Date;
    departmentBase: DepartmentBase;
}

export interface DashboardStats {
    totalTickets: number;
    openTickets: number;
    inProgressTickets: number;
    onHoldTickets: number;
    resolvedTickets: number;
    closedTickets: number;
    overdueTickets: number;
    criticalTickets: number;
    avgResponseTimeHours: number;
    avgResolutionTimeHours: number;
    ticketsCreatedToday: number;
    ticketsResolvedToday: number;
    ticketsTrend: number; // percentage change from last period
}

export interface TicketsByBranch {
    branchId: number;
    branchName: string;
    count: number;
}

export interface TicketsByCategory {
    categoryId: number;
    categoryName: string;
    count: number;
}

export interface TicketsByDepartment {
    departmentId: number;
    departmentName: string;
    count: number;
}

export interface TicketTrend {
    date: string;
    created: number;
    resolved: number;
}

export interface DashboardData {
    stats: DashboardStats;
    recentTickets: Ticket[];
    urgentTickets: Ticket[];
    ticketsByBranch: TicketsByBranch[];
    ticketsByCategory: TicketsByCategory[];
    ticketsByDepartment: TicketsByDepartment[];
    ticketTrends: TicketTrend[];
}

// ============================================
// Mock Data Generator
// ============================================

const generateMockData = (): DashboardData => {
    const now = new Date();

    const mockTickets: Ticket[] = [
        {
            id: 1,
            ticketNumber: "TKT-2024-001",
            title: "Server connectivity issues in Main Office",
            branchId: 1,
            branchName: "Main Office",
            categoryName: "Network",
            assigneeText: "John Smith",
            priorityId: 4,
            priorityName: "Critical",
            statusId: 1,
            statusName: "Open",
            dueDate: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago (overdue)
            createdAt: new Date(now.getTime() - 4 * 60 * 60 * 1000),
            departmentBase: { id: 1, name: "IT" }
        },
        {
            id: 2,
            ticketNumber: "TKT-2024-002",
            title: "Printer malfunction - Finance Dept",
            branchId: 2,
            branchName: "North Branch",
            categoryName: "Hardware",
            assigneeText: "Alice Johnson",
            priorityId: 2,
            priorityName: "Medium",
            statusId: 2,
            statusName: "In Progress",
            dueDate: new Date(now.getTime() + 24 * 60 * 60 * 1000),
            createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
            departmentBase: { id: 2, name: "Finance" }
        },
        {
            id: 3,
            ticketNumber: "TKT-2024-003",
            title: "Email not syncing on mobile devices",
            branchId: 3,
            branchName: "South Branch",
            categoryName: "Software",
            assigneeText: "Bob Lee",
            priorityId: 3,
            priorityName: "High",
            statusId: 1,
            statusName: "Open",
            dueDate: new Date(now.getTime() + 8 * 60 * 60 * 1000),
            createdAt: new Date(now.getTime() - 1 * 60 * 60 * 1000),
            departmentBase: { id: 3, name: "Operations" }
        },
        {
            id: 4,
            ticketNumber: "TKT-2024-004",
            title: "VPN connection timeout errors",
            branchId: 1,
            branchName: "Main Office",
            categoryName: "Network",
            assigneeText: "John Smith",
            priorityId: 3,
            priorityName: "High",
            statusId: 3,
            statusName: "On Hold",
            dueDate: new Date(now.getTime() + 48 * 60 * 60 * 1000),
            createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000),
            departmentBase: { id: 1, name: "IT" }
        },
        {
            id: 5,
            ticketNumber: "TKT-2024-005",
            title: "New employee workstation setup",
            branchId: 4,
            branchName: "East Branch",
            categoryName: "Hardware",
            assigneeText: "Carol White",
            priorityId: 1,
            priorityName: "Low",
            statusId: 2,
            statusName: "In Progress",
            dueDate: new Date(now.getTime() + 72 * 60 * 60 * 1000),
            createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
            departmentBase: { id: 4, name: "HR" }
        },
        {
            id: 6,
            ticketNumber: "TKT-2024-006",
            title: "Database backup failure alert",
            branchId: 1,
            branchName: "Main Office",
            categoryName: "Database",
            assigneeText: "David Chen",
            priorityId: 4,
            priorityName: "Critical",
            statusId: 2,
            statusName: "In Progress",
            dueDate: new Date(now.getTime() + 2 * 60 * 60 * 1000),
            createdAt: new Date(now.getTime() - 30 * 60 * 1000),
            departmentBase: { id: 1, name: "IT" }
        },
        {
            id: 7,
            ticketNumber: "TKT-2024-007",
            title: "Software license renewal request",
            branchId: 2,
            branchName: "North Branch",
            categoryName: "Software",
            assigneeText: "Unassigned",
            priorityId: 2,
            priorityName: "Medium",
            statusId: 1,
            statusName: "Open",
            dueDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
            createdAt: new Date(now.getTime() - 6 * 60 * 60 * 1000),
            departmentBase: { id: 2, name: "Finance" }
        },
        {
            id: 8,
            ticketNumber: "TKT-2024-008",
            title: "Security camera offline - Warehouse",
            branchId: 5,
            branchName: "West Branch",
            categoryName: "Security",
            assigneeText: "Emma Wilson",
            priorityId: 3,
            priorityName: "High",
            statusId: 1,
            statusName: "Open",
            dueDate: new Date(now.getTime() - 1 * 60 * 60 * 1000), // overdue
            createdAt: new Date(now.getTime() - 5 * 60 * 60 * 1000),
            departmentBase: { id: 5, name: "Security" }
        },
    ];

    const stats: DashboardStats = {
        totalTickets: 156,
        openTickets: 42,
        inProgressTickets: 28,
        onHoldTickets: 12,
        resolvedTickets: 58,
        closedTickets: 16,
        overdueTickets: 8,
        criticalTickets: 5,
        avgResponseTimeHours: 2.4,
        avgResolutionTimeHours: 18.6,
        ticketsCreatedToday: 12,
        ticketsResolvedToday: 8,
        ticketsTrend: 12.5,
    };

    const ticketsByBranch: TicketsByBranch[] = [
        { branchId: 1, branchName: "Main Office", count: 45 },
        { branchId: 2, branchName: "North Branch", count: 32 },
        { branchId: 3, branchName: "South Branch", count: 28 },
        { branchId: 4, branchName: "East Branch", count: 25 },
        { branchId: 5, branchName: "West Branch", count: 26 },
    ];

    const ticketsByCategory: TicketsByCategory[] = [
        { categoryId: 1, categoryName: "Network", count: 38 },
        { categoryId: 2, categoryName: "Hardware", count: 42 },
        { categoryId: 3, categoryName: "Software", count: 35 },
        { categoryId: 4, categoryName: "Database", count: 18 },
        { categoryId: 5, categoryName: "Security", count: 23 },
    ];

    const ticketsByDepartment: TicketsByDepartment[] = [
        { departmentId: 1, departmentName: "IT", count: 52 },
        { departmentId: 2, departmentName: "Finance", count: 28 },
        { departmentId: 3, departmentName: "Operations", count: 34 },
        { departmentId: 4, departmentName: "HR", count: 22 },
        { departmentId: 5, departmentName: "Security", count: 20 },
    ];

    const ticketTrends: TicketTrend[] = [
        { date: "Mon", created: 18, resolved: 15 },
        { date: "Tue", created: 22, resolved: 20 },
        { date: "Wed", created: 15, resolved: 18 },
        { date: "Thu", created: 28, resolved: 22 },
        { date: "Fri", created: 20, resolved: 25 },
        { date: "Sat", created: 8, resolved: 10 },
        { date: "Sun", created: 5, resolved: 6 },
    ];

    const urgentTickets = mockTickets.filter(
        t => t.priorityName === "Critical" || t.priorityName === "High" || (t.dueDate && t.dueDate < now)
    );

    return {
        stats,
        recentTickets: mockTickets.slice(0, 5),
        urgentTickets,
        ticketsByBranch,
        ticketsByCategory,
        ticketsByDepartment,
        ticketTrends,
    };
};

// ============================================
// Helper Components
// ============================================

interface StatCardProps {
    title: string;
    value: number | string;
    icon: typeof faTicketAlt;
    trend?: number;
    colorClass: string;
    bgColorClass: string;
    subtitle?: string;
}

const StatCard = ({ title, value, icon, trend, colorClass, bgColorClass, subtitle }: StatCardProps) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow duration-200">
        <div className="flex items-start justify-between">
            <div className="flex-1">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{title}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
                {subtitle && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{subtitle}</p>
                )}
                {trend !== undefined && (
                    <div className={`flex items-center mt-2 text-xs font-medium ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        <FontAwesomeIcon icon={trend >= 0 ? faArrowUp : faArrowDown} className="mr-1" />
                        <span>{Math.abs(trend)}% from last week</span>
                    </div>
                )}
            </div>
            <div className={`w-12 h-12 ${bgColorClass} rounded-xl flex items-center justify-center flex-shrink-0`}>
                <FontAwesomeIcon icon={icon} className={`text-xl ${colorClass}`} />
            </div>
        </div>
    </div>
);

const getPriorityColor = (priority: string): string => {
    switch (priority) {
        case "Critical": return "bg-red-600 text-white";
        case "High": return "bg-orange-500 text-white";
        case "Medium": return "bg-yellow-500 text-white";
        case "Low": return "bg-green-500 text-white";
        default: return "bg-gray-400 text-white";
    }
};

const getStatusColor = (status: string): string => {
    switch (status) {
        case "Open": return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
        case "In Progress": return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
        case "On Hold": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
        case "Resolved": return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
        case "Closed": return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
        default: return "bg-gray-100 text-gray-800";
    }
};

const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
};

const isOverdue = (dueDate: Date | null): boolean => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
};

// ============================================
// Main Dashboard Component
// ============================================

export default function TicketDashboard() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchDashboardData = useCallback(async () => {
        // TODO: Replace with actual API call
        // const response = await apiService.get('/dashboard/stats');
        // setData(response.data);

        // Simulating API call with mock data
        await new Promise(resolve => setTimeout(resolve, 800));
        const mockData = generateMockData();
        setData(mockData);
        setLastUpdated(new Date());
    }, []);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await fetchDashboardData();
        setIsRefreshing(false);
    };

    useEffect(() => {
        fetchDashboardData().then(() => setLoading(false));

        // Auto-refresh every 5 minutes
        const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, [fetchDashboardData]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <FontAwesomeIcon icon={faSpinner} className="text-4xl text-blue-600 animate-spin mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    if (!data) return null;

    const { stats, recentTickets, urgentTickets, ticketsByBranch, ticketTrends } = data;

    // Chart configurations
    const statusChartData = {
        labels: ['Open', 'In Progress', 'On Hold', 'Resolved'],
        datasets: [{
            data: [stats.openTickets, stats.inProgressTickets, stats.onHoldTickets, stats.resolvedTickets],
            backgroundColor: ['#3b82f6', '#8b5cf6', '#f59e0b', '#22c55e'],
            borderWidth: 0,
            hoverOffset: 4,
        }]
    };

    const priorityChartData = {
        labels: ['Low', 'Medium', 'High', 'Critical'],
        datasets: [{
            label: 'Tickets',
            data: [25, 45, 35, stats.criticalTickets],
            backgroundColor: ['#22c55e', '#eab308', '#f97316', '#ef4444'],
            borderRadius: 6,
            borderSkipped: false,
        }]
    };

    const trendChartData = {
        labels: ticketTrends.map(t => t.date),
        datasets: [
            {
                label: 'Created',
                data: ticketTrends.map(t => t.created),
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointHoverRadius: 6,
            },
            {
                label: 'Resolved',
                data: ticketTrends.map(t => t.resolved),
                borderColor: '#22c55e',
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointHoverRadius: 6,
            }
        ]
    };

    const branchChartData = {
        labels: ticketsByBranch.map(b => b.branchName),
        datasets: [{
            data: ticketsByBranch.map(b => b.count),
            backgroundColor: ['#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#22c55e'],
            borderWidth: 0,
        }]
    };

    return (
        <div className="flex flex-col w-full h-full mx-auto p-4 sm:p-6 max-w-7xl">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                        Dashboard
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Real-time ticket monitoring and analytics
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                        Last updated: {lastUpdated.toLocaleTimeString()}
                    </span>
                    <button
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                    >
                        <FontAwesomeIcon icon={faSync} className={isRefreshing ? 'animate-spin' : ''} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Urgent Tickets Alert */}
            {urgentTickets.length > 0 && (
                <div className="mb-6 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                            <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-red-800 dark:text-red-300">Attention Required</h3>
                            <p className="text-sm text-red-600 dark:text-red-400">{urgentTickets.length} urgent or overdue tickets need immediate attention</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {urgentTickets.slice(0, 4).map(ticket => (
                            <Link
                                key={ticket.id}
                                to={`/ticketview/${ticket.ticketNumber}`}
                                className="inline-flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-800 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border border-red-200 dark:border-red-800"
                            >
                                <span className={`w-2 h-2 rounded-full ${ticket.priorityName === 'Critical' ? 'bg-red-500' : 'bg-orange-500'}`}></span>
                                {ticket.ticketNumber}
                                {isOverdue(ticket.dueDate) && (
                                    <span className="text-xs text-red-500 font-medium">OVERDUE</span>
                                )}
                            </Link>
                        ))}
                        {urgentTickets.length > 4 && (
                            <Link
                                to="/"
                                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 hover:underline"
                            >
                                +{urgentTickets.length - 4} more
                            </Link>
                        )}
                    </div>
                </div>
            )}

            {/* Main Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                <StatCard
                    title="Total Tickets"
                    value={stats.totalTickets}
                    icon={faTicketAlt}
                    trend={stats.ticketsTrend}
                    colorClass="text-blue-600"
                    bgColorClass="bg-blue-100 dark:bg-blue-900/30"
                />
                <StatCard
                    title="Open"
                    value={stats.openTickets}
                    icon={faClock}
                    colorClass="text-yellow-600"
                    bgColorClass="bg-yellow-100 dark:bg-yellow-900/30"
                />
                <StatCard
                    title="In Progress"
                    value={stats.inProgressTickets}
                    icon={faSpinner}
                    colorClass="text-purple-600"
                    bgColorClass="bg-purple-100 dark:bg-purple-900/30"
                />
                <StatCard
                    title="On Hold"
                    value={stats.onHoldTickets}
                    icon={faPauseCircle}
                    colorClass="text-orange-600"
                    bgColorClass="bg-orange-100 dark:bg-orange-900/30"
                />
                <StatCard
                    title="Resolved"
                    value={stats.resolvedTickets}
                    icon={faCheckCircle}
                    colorClass="text-green-600"
                    bgColorClass="bg-green-100 dark:bg-green-900/30"
                />
                <StatCard
                    title="Critical"
                    value={stats.criticalTickets}
                    icon={faFire}
                    colorClass="text-red-600"
                    bgColorClass="bg-red-100 dark:bg-red-900/30"
                />
            </div>

            {/* Recent Tickets Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <FontAwesomeIcon icon={faUserClock} className="text-blue-500" />
                        Recent Tickets
                    </h2>
                    <Link
                        to="/"
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium"
                    >
                        View All
                    </Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ticket</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Title</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Branch</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Assignee</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Priority</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Created</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {recentTickets.map(ticket => (
                                <tr key={ticket.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                    <td className="px-4 py-3">
                                        <Link
                                            to={`/ticketview/${ticket.ticketNumber}`}
                                            className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
                                        >
                                            {ticket.ticketNumber}
                                        </Link>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-900 dark:text-white text-sm font-medium truncate max-w-[200px]">
                                                {ticket.title}
                                            </span>
                                            {isOverdue(ticket.dueDate) && (
                                                <span className="flex-shrink-0 px-1.5 py-0.5 text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded">
                                                    OVERDUE
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{ticket.branchName}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{ticket.assigneeText}</td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(ticket.priorityName)}`}>
                                            {ticket.priorityName}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(ticket.statusName)}`}>
                                            {ticket.statusName}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                                        {formatTimeAgo(ticket.createdAt)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-100 text-xs font-medium uppercase tracking-wider">Avg Response Time</p>
                            <p className="text-3xl font-bold mt-1">{stats.avgResponseTimeHours}h</p>
                            <p className="text-blue-200 text-xs mt-1">Target: 4h</p>
                        </div>
                        <FontAwesomeIcon icon={faBolt} className="text-3xl text-blue-200" />
                    </div>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-purple-100 text-xs font-medium uppercase tracking-wider">Avg Resolution Time</p>
                            <p className="text-3xl font-bold mt-1">{stats.avgResolutionTimeHours}h</p>
                            <p className="text-purple-200 text-xs mt-1">Target: 24h</p>
                        </div>
                        <FontAwesomeIcon icon={faHourglassHalf} className="text-3xl text-purple-200" />
                    </div>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-green-100 text-xs font-medium uppercase tracking-wider">Resolved Today</p>
                            <p className="text-3xl font-bold mt-1">{stats.ticketsResolvedToday}</p>
                            <p className="text-green-200 text-xs mt-1">+3 from yesterday</p>
                        </div>
                        <FontAwesomeIcon icon={faCheckDouble} className="text-3xl text-green-200" />
                    </div>
                </div>
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-orange-100 text-xs font-medium uppercase tracking-wider">Created Today</p>
                            <p className="text-3xl font-bold mt-1">{stats.ticketsCreatedToday}</p>
                            <p className="text-orange-200 text-xs mt-1">-2 from yesterday</p>
                        </div>
                        <FontAwesomeIcon icon={faCalendarAlt} className="text-3xl text-orange-200" />
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Ticket Trends */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <FontAwesomeIcon icon={faChartLine} className="text-blue-500" />
                            Ticket Trends (Last 7 Days)
                        </h2>
                    </div>
                    <div className="h-64">
                        <Line
                            data={trendChartData}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: {
                                        position: 'top',
                                        labels: {
                                            usePointStyle: true,
                                            padding: 20,
                                        }
                                    }
                                },
                                scales: {
                                    y: {
                                        beginAtZero: true,
                                        grid: { color: 'rgba(0,0,0,0.05)' }
                                    },
                                    x: {
                                        grid: { display: false }
                                    }
                                }
                            }}
                        />
                    </div>
                </div>

                {/* Status Distribution */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <FontAwesomeIcon icon={faLayerGroup} className="text-purple-500" />
                        Status Distribution
                    </h2>
                    <div className="h-64 flex items-center justify-center">
                        <Doughnut
                            data={statusChartData}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                cutout: '60%',
                                plugins: {
                                    legend: {
                                        position: 'bottom',
                                        labels: {
                                            usePointStyle: true,
                                            pointStyle: 'circle',
                                            padding: 15,
                                        }
                                    }
                                }
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Second Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Priority Distribution */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Tickets by Priority
                    </h2>
                    <div className="h-64">
                        <Bar
                            data={priorityChartData}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: { legend: { display: false } },
                                scales: {
                                    y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
                                    x: { grid: { display: false } }
                                }
                            }}
                        />
                    </div>
                </div>

                {/* Tickets by Branch */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <FontAwesomeIcon icon={faBuilding} className="text-orange-500" />
                        Tickets by Branch
                    </h2>
                    <div className="h-64 flex items-center justify-center">
                        <Pie
                            data={branchChartData}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: {
                                        position: 'right',
                                        labels: {
                                            usePointStyle: true,
                                            pointStyle: 'circle',
                                            padding: 12,
                                        }
                                    }
                                }
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
