/**
 * Department Base Types
 */
export enum DepartmentBase {
  Default = 0,
  IS = 1,
  Engineering = 2,
  CCTV = 3,
}

/**
 * Ticket Status Enum
 */
export enum TicketStatus {
  Done = 0,
  Open = 1,
  OnHold = 2,
  InProgress = 3,
  All = 4,
}

/**
 * Ticket Priority Enum
 */
export enum TicketPriority {
  Low = 1,
  Medium = 2,
  High = 3,
  Critical = 4,
}

/**
 * User Role Enum
 * Note: These are stored as strings in localStorage but represent numeric roles
 */
export enum UserRole {
  Admin = 1,
  User = 2,
  Reporter = 3,
  // Add more roles as needed based on the backend
}

/**
 * Theme Enum
 */
export enum Theme {
  Light = "light",
  Dark = "dark",
}

/**
 * Pagination Constants
 */
export const PAGINATION_CONSTANTS = {
  ITEMS_PER_PAGE: 10,
  DEFAULT_PAGE: 1,
} as const;

/**
 * Application Constants
 */
export const APP_CONSTANTS = {
  DEFAULT_COMPANY: "ticketapp1",
  API_TIMEOUT: 30000, // 30 seconds
  TOAST_DURATION: 3000, // 3 seconds
  TOKEN_KEY: "token",
  USER_ID_KEY: "id",
  FULLNAME_KEY: "fullname",
  EMAIL_KEY: "email",
  ROLE_KEY: "role",
  ROLETEXT_KEY: "roletext",
  DEPARTMENT_BASE_KEY: "departmentbase",
  COMPANY_KEY: "company",
  THEME_KEY: "theme",
} as const;

/**
 * Status Label Helper
 */
export const getStatusLabel = (status: TicketStatus): string => {
  switch (status) {
    case TicketStatus.Done:
      return "DONE";
    case TicketStatus.Open:
      return "OPEN";
    case TicketStatus.OnHold:
      return "ON HOLD";
    case TicketStatus.InProgress:
      return "IN PROGRESS";
    case TicketStatus.All:
      return "ALL";
    default:
      return "UNKNOWN";
  }
};

/**
 * Priority Label Helper
 */
export const getPriorityLabel = (priority: TicketPriority): string => {
  switch (priority) {
    case TicketPriority.Low:
      return "Low";
    case TicketPriority.Medium:
      return "Medium";
    case TicketPriority.High:
      return "High";
    case TicketPriority.Critical:
      return "Critical";
    default:
      return "Unknown";
  }
};

/**
 * Department Base Label Helper
 */
export const getDepartmentBaseLabel = (dept: DepartmentBase): string => {
  switch (dept) {
    case DepartmentBase.Default:
      return "All";
    case DepartmentBase.IS:
      return "IS";
    case DepartmentBase.Engineering:
      return "ENGINEERING";
    case DepartmentBase.CCTV:
      return "CCTV";
    default:
      return "Unknown";
  }
};
