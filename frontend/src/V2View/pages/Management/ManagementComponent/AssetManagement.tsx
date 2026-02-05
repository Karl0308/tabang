import { useEffect, useState } from "react";
import axios from "axios";
import { Asset } from "../../../objects/Asset";
import { APIURLS } from "../../../../APIURLS";
import { useToast } from "../../../component/ToastContext";

type AssetApiResponse = {
  assets: Asset[];
  pageNumber: number;
  pageSize: number;
  totalRecords: number;
};


export default function AssetManagement() {
  const { showToast } = useToast();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [deleteAsset, setDeleteAsset] = useState<Asset | null>(null);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Asset>({
    id: 0,
    code: "",
    name: "",
    branch: "",
    equipment: "",
  });



  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number | string>(5);
  const [totalCount, setTotalCount] = useState(0);

  const axiosInstance = axios.create({
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  const fetchAssets = async () => {
    try {
      setLoading(true);

      const res = await axiosInstance.post<AssetApiResponse>(
        APIURLS.asset.getAssetTags(),
        {
          search,
          pageNumber: page,
          pageSize,
        }
      );

      setAssets(res.data.assets);
      setTotalCount(res.data.totalRecords);

    } catch (error) {
      setAssets([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchAssets();
  }, [page, search, pageSize]);

  const openAddModal = () => {
    setEditingAsset(null);
    setFormData({
      id: 0,
      code: "",
      name: "",
      branch: "",
      equipment: "",
    });
    setShowModal(true);
  };

  const openEditModal = (asset: Asset) => {
    setEditingAsset(asset);
    setFormData(asset);
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (saving) return;

    const isUpdate = formData.id > 0;

    try {
      setSaving(true);

      await axiosInstance.post(
        APIURLS.asset.addAsset(),
        formData
      );

      setShowModal(false);
      fetchAssets();

      showToast(
        isUpdate ? "Successfully updated!" : "Successfully added!",
        "success"
      );

    } catch (err) {
      showToast("Save failed", "error");
    } finally {
      setSaving(false);
    }
  };


  const confirmDelete = () => {
    if (!deleteAsset) return;
    setAssets((prev) => prev.filter((a) => a.id !== deleteAsset.id));
    setDeleteAsset(null);
  };

  const totalPages = Math.ceil(totalCount / Number(pageSize || 1));

  const fieldLabels: Record<string, string> = {
  code: "Tag",
  name: "Name",
  branch: "Branch",
  equipment: "Category",
};

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-2 border-gray-200 dark:border-gray-700">
      {/* Enhanced Header */}
      <div className="p-6 border-b-2 border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
          </div>
          <p className="text-xl font-bold text-gray-900 dark:text-white">Asset Management</p>
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
              placeholder="Search assets..."
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
              {["Asset Tag", "Asset Name", "Branch", "Category", "Actions"].map(
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
                <td colSpan={5} className="text-center py-12">
                  <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="text-gray-500 dark:text-gray-400">Loading assets...</span>
                  </div>
                </td>
              </tr>
            )}

            {!loading && assets.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-12">
                  <div className="flex flex-col items-center gap-3">
                    <svg className="w-16 h-16 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                    </svg>
                    <span className="text-gray-500 dark:text-gray-400 font-medium">No assets found</span>
                  </div>
                </td>
              </tr>
            )}

            {assets.map((asset) => (
              <tr key={asset.id} className="group hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-gray-700 dark:hover:to-gray-600 transition-all duration-200 hover:shadow-md hover:scale-[1.01] active:scale-[0.99] border-l-4 border-transparent hover:border-blue-500">
                <td className="px-6 py-4 text-blue-600 dark:text-blue-400 font-semibold">{asset.code}</td>
                <td className="px-6 py-4 text-gray-900 dark:text-gray-100 font-medium group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">{asset.name}</td>
                <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{asset.branch}</td>
                <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{asset.equipment}</td>
                <td className="px-6 py-4 flex gap-3">
                  <button
                    onClick={() => openEditModal(asset)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-800/50 rounded-lg font-medium transition-all duration-200 hover:shadow-md active:scale-95"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteAsset(asset)}
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
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300 animate-fadeIn">
            {/* Modal Header */}
            <div className="p-6 border-b-2 border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {editingAsset ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                    )}
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-white">
                  {editingAsset ? "Edit Asset" : "Add New Asset"}
                </h2>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {(["code", "name", "branch", "equipment"] as (keyof Asset)[]).map((key) => (
                <div key={key}>
                  <label
                    className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
                    htmlFor={key}
                  >
                    {fieldLabels[key]}
                  </label>
                  <input
                    id={key}
                    value={formData[key]}
                    onChange={(e) =>
                      setFormData({ ...formData, [key]: e.target.value })
                    }
                    placeholder={`Enter ${fieldLabels[key].toLowerCase()}...`}
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-200"
                  />
                </div>
              ))}
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
                ) : "Save Asset"}
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Enhanced Delete Modal */}
      {deleteAsset && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-sm w-full transform transition-all duration-300 animate-fadeIn">
            {/* Warning Icon */}
            <div className="p-6 text-center">
              <div className="mx-auto w-16 h-16 mb-4 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center shadow-lg shadow-red-500/30">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Delete Asset?</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Are you sure you want to delete <span className="font-semibold text-red-600 dark:text-red-400">{deleteAsset.name}</span>? This action cannot be undone.
              </p>
            </div>

            {/* Actions */}
            <div className="p-6 border-t-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-b-2xl flex gap-3">
              <button
                onClick={() => setDeleteAsset(null)}
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
