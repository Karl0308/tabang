import { DepartmentBase } from "./enum";

export interface User {
    id: number;
    fullName: string;
    userName: string;
    password: string;
    repassword: string;
    email: string;
    branchId: number;
    branchName: string;
    active: boolean;
    activeText: string;
    role: number;
    roleText: string;
    departmentBase: DepartmentBase;
    departmentIds: number[];
}