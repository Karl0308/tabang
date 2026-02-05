import { useEffect, useState } from "react";
import axios from "axios";
import { useToast } from "../../../component/ToastContext";
import { User } from "../../../objects/User";
import { Branch, DepartmentBase } from "./BranchManagement";
import { APIURLS } from "../../../../APIURLS";
import { Department } from "../../../objects/Department";

const roles = [
  { value: 0, label: "Admin" },
  { value: 1, label: "Assignee" },
  { value: 2, label: "Reporter" },
  { value: 50, label: "SysAdmin" },
];

type UserApiResponse = {
  users: User[];
  pageNumber: number;
  pageSize: number;
  totalRecords: number;
};

type BranchApiResponse = Branch[];
type DepartmentApiResponse = Department[];

export default function UserManagement() {
  const { showToast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<User>({
    id: 0,
    fullName: "",
    userName: "",
    password: "",
    repassword: "",
    email: "",
    branchId: 0,
    branchName: "",
    active: true,
    activeText: "Active",
    role: 0,
    roleText: "Admin",
    departmentBase: DepartmentBase.Default,
    departmentIds: []
  });

  const [saving, setSaving] = useState(false);

  // Delete
  const [deleteUser, setDeleteUser] = useState<User | null>(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number | string>(5);
  const [totalCount, setTotalCount] = useState(0);

  const axiosInstance = axios.create({
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.post<UserApiResponse>(
        APIURLS.user.getUsers(),
        { search, pageNumber: page, pageSize }
      );
      setUsers(res.data.users ?? []);
      setTotalCount(res.data.totalRecords ?? 0);
    } catch (err) {
      setUsers([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  // Fetch branches
  const fetchBranches = async () => {
    try {
      const res = await axiosInstance.get<BranchApiResponse>(APIURLS.branch.getBranches());
      setBranches(res.data ?? []);
    } catch (err) {
      setBranches([]);
    }
  };

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get<DepartmentApiResponse>(APIURLS.departments.getDepartments());
      setDepartments(res.data ?? []);
    } catch (err) {
      setDepartments([]);
    }
  };


  useEffect(() => {
    fetchBranches();
    fetchDepartments()
    fetchUsers();
  }, [page, search, pageSize]);

  // Open add modal
  const openAddModal = () => {
    const defaultBranch = branches[0];
    setEditingUser(null);
    setFormData({
      id: 0,
      fullName: "",
      userName: "",
      password: "",
      repassword: "",
      email: "",
      branchId: defaultBranch?.id ?? 0,
      branchName: defaultBranch?.name ?? "",
      active: true,
      activeText: "Active",
      role: 0,
      roleText: "Admin",
      departmentBase: defaultBranch?.departmentBase ?? DepartmentBase.Default,
      departmentIds: []

    });
    setShowModal(true);
  };

  // Open edit modal
  const openEditModal = (user: User) => {
    setEditingUser(user);
    setFormData(user);
    setShowModal(true);
  };

  // Submit form (create/update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;

    // Password confirmation validation for new user
    if (formData.id === 0 && formData.password !== formData.repassword) {
      showToast("Passwords do not match!", "error");
      return;
    }

    setSaving(true);
    try {
      // Map frontend User -> backend UserModel
      const payload = {
        id: formData.id,
        fullName: formData.fullName,
        userName: formData.userName,
        password: formData.password,
        repassword: formData.repassword,
        email: formData.email,
        branchId: formData.branchId,
        role: formData.role,
        active: formData.active,
        departmentBase: formData.departmentBase,
        departmentIds: formData.departmentIds
      };

      await axiosInstance.post(APIURLS.user.saveUsers(), payload, {
        headers: { "Content-Type": "application/json" },
      });

      setShowModal(false);
      fetchUsers();
      showToast(
        formData.id === 0 ? "User successfully created!" : "User successfully updated!",
        "success"
      );
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.[""]?.[0] ||
        error?.response?.data?.title ||
        "Save failed";
      showToast(errorMessage, "error");
    } finally {
      setSaving(false);
    }
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!deleteUser) return;
    try {
      await axiosInstance.delete(`/api/users/${deleteUser.id}`);
      setUsers((prev) => prev.filter((u) => u.id !== deleteUser.id));
      setDeleteUser(null);
      showToast("User deleted successfully", "success");
    } catch (err) {
      showToast("Delete failed", "error");
    }
  };

  const totalPages = Math.ceil(totalCount / Number(pageSize || 1));

  const toggleDepartment = (deptId: number) => {
    setFormData(prev => ({
      ...prev,
      departmentIds: prev.departmentIds.includes(deptId)
        ? prev.departmentIds.filter(id => id !== deptId)
        : [...prev.departmentIds, deptId]
    }));
  };


  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-2 border-gray-200 dark:border-gray-700">
      {/* Enhanced Header */}
      <div className="p-6 border-b-2 border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-lg">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <p className="text-xl font-bold text-gray-900 dark:text-white">User Management</p>
        </div>

        <div className="flex gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users..."
              className="pl-10 pr-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-xl text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
            />
          </div>
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 whitespace-nowrap"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add
          </button>
        </div>
      </div>

      {/* Enhanced Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y-2 divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
            <tr>
              {["Full Name", "Username", "Email", "Branch", "Position", "Status", "Actions"].map(
                (col) => (
                  <th key={col} className="px-6 py-4 text-xs font-bold text-gray-700 dark:text-gray-300 text-left uppercase tracking-wider">
                    {col}
                  </th>
                )
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {loading && (
              <tr>
                <td colSpan={7} className="text-center py-12">
                  <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="text-gray-500 dark:text-gray-400">Loading users...</span>
                  </div>
                </td>
              </tr>
            )}

            {!loading && users.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-12">
                  <div className="flex flex-col items-center gap-3">
                    <svg className="w-16 h-16 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <span className="text-gray-500 dark:text-gray-400 font-medium">No users found</span>
                  </div>
                </td>
              </tr>
            )}

            {users.map((user) => (
              <tr key={user.id} className="group hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-gray-700 dark:hover:to-gray-600 transition-all duration-200 hover:shadow-md hover:scale-[1.01] active:scale-[0.99] border-l-4 border-transparent hover:border-blue-500">
                <td className="px-6 py-4 text-gray-900 dark:text-gray-100 font-medium group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">{user.fullName}</td>
                <td className="px-6 py-4 text-blue-600 dark:text-blue-400 font-semibold">{user.userName}</td>
                <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{user.email}</td>
                <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{user.branchName}</td>
                <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{roles.find(r => r.value === user.role)?.label}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${
                    user.active
                      ? 'bg-gradient-to-r from-green-400 to-green-500 text-white shadow-green-500/30'
                      : 'bg-gradient-to-r from-red-400 to-red-500 text-white shadow-red-500/30'
                  }`}>
                    {user.active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-6 py-4 flex gap-3">
                  <button
                    onClick={() => openEditModal(user)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-800/50 rounded-lg font-medium transition-all duration-200 hover:shadow-md active:scale-95"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteUser(user)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800/50 rounded-lg font-medium transition-all duration-200 hover:shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Enhanced Pagination */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-6 border-t-2 border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
          <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium">Showing</span>
            <input
              type="number"
              min={1}
              value={pageSize}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "") {
                  setPageSize("");
                } else {
                  const numberValue = Number(value);
                  if (numberValue >= 1) {
                    setPageSize(numberValue);
                  }
                }
              }}
              className="w-16 px-3 py-2 text-center bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-200"
            />
            <span className="font-medium">rows</span>
            <span className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg font-semibold">
              Page {page} of {totalPages}
            </span>
          </div>

          <div className="flex gap-3">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="inline-flex items-center gap-2 px-5 py-2.5 border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-600 hover:border-gray-400 dark:hover:border-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 active:scale-95"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>
            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 active:scale-95"
            >
              Next
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto transform transition-all duration-300 animate-fadeIn">
            {/* Modal Header */}
            <div className="p-6 border-b-2 border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {editingUser ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    )}
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-white">
                  {editingUser ? "Edit User" : "Add New User"}
                </h2>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
                <input
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Enter full name"
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-200 disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
                  disabled={!!editingUser}
                />
              </div>

              {/* Username */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Username</label>
                <input
                  value={formData.userName}
                  onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                  placeholder="Enter username"
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-200 disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
                  disabled={!!editingUser}
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Email</label>
                <input
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter email address"
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-200"
                />
              </div>

              {formData.id === 0 && (
                <>
                  {/* Password */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Password</label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Enter password"
                      className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-200"
                    />
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Confirm Password</label>
                    <input
                      type="password"
                      value={formData.repassword}
                      onChange={(e) => setFormData({ ...formData, repassword: e.target.value })}
                      placeholder="Confirm password"
                      className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-200"
                    />
                  </div>
                </>
              )}

              {/* Branch */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Branch</label>
                <select
                  value={formData.branchId}
                  onChange={(e) => setFormData({ ...formData, branchId: Number(e.target.value) })}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-200"
                >
                  {branches.map(branch => (
                    <option key={branch.id} value={branch.id}>{branch.name}</option>
                  ))}
                </select>
              </div>

              {/* Departments */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Department Access
                </label>
                <div className="grid grid-cols-2 gap-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl p-4 bg-gray-50 dark:bg-gray-700/50">
                  {departments.map(dep => (
                    <label
                      key={dep.id}
                      className="flex items-center gap-2 text-sm cursor-pointer hover:bg-white dark:hover:bg-gray-700 p-2 rounded-lg transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={formData.departmentIds?.includes(dep.id) ?? false}
                        onChange={() => toggleDepartment(dep.id)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-gray-700 dark:text-gray-300">{dep.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: Number(e.target.value) })}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-200"
                >
                  {roles.map(role => (
                    <option key={role.value} value={role.value}>{role.label}</option>
                  ))}
                </select>
              </div>

              {/* Active Status */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Status</label>
                <select
                  value={formData.active ? 1 : 0}
                  onChange={(e) => setFormData({ ...formData, active: e.target.value === "1" })}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-200"
                >
                  <option value={1}>Active</option>
                  <option value={0}>Inactive</option>
                </select>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-b-2xl flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-xl font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 active:scale-95"
              >
                Cancel
              </button>
              <button
                disabled={saving}
                onClick={handleSubmit}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 active:scale-95"
              >
                {saving ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </span>
                ) : "Save User"}
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Enhanced Delete Modal */}
      {deleteUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-sm w-full transform transition-all duration-300 animate-fadeIn">
            {/* Warning Icon */}
            <div className="p-6 text-center">
              <div className="mx-auto w-16 h-16 mb-4 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center shadow-lg shadow-red-500/30">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Delete User?</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Are you sure you want to delete <span className="font-semibold text-red-600 dark:text-red-400">{deleteUser.fullName}</span>? This action cannot be undone.
              </p>
            </div>

            {/* Actions */}
            <div className="p-6 border-t-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-b-2xl flex gap-3">
              <button
                onClick={() => setDeleteUser(null)}
                className="flex-1 px-4 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-xl font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
