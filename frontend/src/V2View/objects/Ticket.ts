import { DepartmentBase } from "./enum";

export interface Ticket {
    id: number;
    ticketNumber: string;
    calledIn: Date;
    dueDate: Date | null;
    timeStamp: Date;
    title: string;
    description: string;
    branchName: string;
    // reporterName: string;
    assigneeText: string;
    priorityName: string;
    priority: number;
    status: number;
    ticketLink: string;
    starRate: number;
    documentTypeId: number;
    branchId: number;
    reporterId: number;
    assigneeId: number;
    branchMemberAssigneeName: string;
    statusName: string;
    oldStatus: number;
    resolution: string;
    currentUserId: number;
    branchMemberAssigneeId: number;
    reporterText: string;
    timestamp: Date | null;
    ticketAssetsString: string;
    departmentBase : DepartmentBase;
    // Additional Fields
    reporterName : string;
    ipAddress : string;
    location : string;
    assetTag : string;
    ticketAttachmentCount : number;
    ticketDepartmentText : string;
    workstreamCount: number;
    departmentIds: number[];
    quality : number;
    timeliness : number;
    communication : number;
    adherence : number;
    overall : number;
    feedback : string;
}


export interface Attachment {
    id: number;
    ticketId: number;
    ticketCommentId: number | null;
    fileName: string;
    contentType: string;
    content: Uint8Array;
    isDeleted: boolean;
}
export interface Comment {
    id: number;
    comment: string;
    created: Date;
    createdText: string;
    userFullName: string;
    ticketAttachments : Attachment[];
}
export interface History {
    id: number;
    propName: string;
    oldData: string;
    newData: string;
    fromStatusText: string;
    toStatusText: string;
    createdText: string;
    userFullName: string;
    userId: number;
    ticketId: number;
}
export interface RelatedIssues {
    ticketId: number;
    linkTicketNumber: string;
}

export interface TicketEntryProps {
    isTicketEntryOpen: boolean;
    setIsTicketEntryOpen: React.Dispatch<React.SetStateAction<boolean>>;
    // handleSaveTicket: (ticket: Ticket) => void;
}
export interface Notification {
    id: number;
    propName: string;
    message: string;
    fromUserId: number;
    toUserId: number;
    ticketId: number;
    isRead: boolean;
    date: Date;
    fromUserFullName: string;
    toUserFullName: string;
    ticketNumber : string;
    dateText: string;
}

export interface TicketCatchup{
    id: number;
    userId: number;
    userFullName: string;
    ticketId: number | null;
    date: Date;
    dateText: string;
}