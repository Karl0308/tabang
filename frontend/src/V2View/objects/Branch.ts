import { DepartmentBase } from "./enum";

export interface Branch {
    id: number;
    name: string;
    isDeleted:boolean;
    branchMember:BranchMember[];
    departmentBase : DepartmentBase;
}
export interface BranchMember {
    id: number;
    memberName: string;
    branchId: number;
    isDeleted:boolean;
    branchName: string;
}