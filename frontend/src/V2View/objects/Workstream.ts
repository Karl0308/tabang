// Enums
export enum Priority {
  Low = 0,
  Medium = 1,
  High = 2
}

export enum WorkstreamStatus {
  Planning = 0,
  InProgress = 1,
  Completed = 2,
  OnHold = 3,
  AtRisk = 4
}

export enum WorkstreamHealth {
  Green = 0,
  Yellow = 1,
  Red = 2
}

export enum SubtaskStatus {
  NotStarted = 0,
  InProgress = 1,
  Completed = 2,
  Blocked = 3
}

// User & Branch Interfaces
export interface User {
  id: number;
  name: string;
  // add other fields as needed
}

export interface Branch {
  id: number;
  name: string;
  // add other fields as needed
}

// WorkstreamSubtask Interface
export interface WorkstreamSubtask {
  id: number;
  workstreamId: number;
  workstream?: Workstream; // optional navigation

  title: string;
  description?: string;

  assigneeId?: number;
  status: SubtaskStatus;

  startDate?: Date;   // ISO string
  dueDate?: Date;
  completedAt?: Date;

  estimatedEffortHours?: number;
  isBlocking: boolean;

  createdAt: Date;   // ISO string
  branchId?: number;
}

// Workstream Interface
export interface Workstream {
  id: number;
  workStreamNumber: string;
  title: string;
  objective: string;
  duration: string;

  ownerId?: number;
  owner?: User;
  branchId?: number;
  branch?: Branch;

  priority: Priority;
  priorityName: string;
  status: WorkstreamStatus;
  statusName: string;

  startDate?: Date;
  createdAt: Date;
  completedAt?: Date;

  dueDate?: Date;
  health?: WorkstreamHealth;
  healthName?: string;
  progressPercentage?: number;

  subtasks: WorkstreamSubtask[];

  // Computed fields (frontend can compute)
  workstreamId?: string; // e.g., '000001'
}
export interface WorkstreamHistory {
    id: number;
    propName: string;
    oldData: string;
    newData: string;
    fromStatusText: string;
    toStatusText: string;
    createdText: string;
    userFullName: string;
    userId: number;
    workstreamId: number;
}