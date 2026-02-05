import React, { useState, useRef } from "react";
import axios from "axios";
import LoadComponent from "../../component/LoadComponent";
import { APIURLS } from "../../../APIURLS";
import AsyncSelect from "react-select/async";
import WorkstreamModal from "./WorkstreamModal";

const WorkstreamEntry = () => {
  const initialWorkstream = {
    title: "",
    objective: "",
    ownerId: Number(localStorage.getItem("id")),
    priority: 1,
    startDate: new Date().toISOString().substring(0, 10),
    status: 0, // Planned
  };

  const [workstream, setWorkstream] = useState(initialWorkstream);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saveWorkstream, setSaveWorkstream] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const dropped = e.dataTransfer.files;

    if (dropped && dropped.length > 0) {
      const merged = new DataTransfer();

      if (selectedFiles) {
        Array.from(selectedFiles).forEach((f) => merged.items.add(f));
      }

      Array.from(dropped).forEach((f) => merged.items.add(f));

      setSelectedFiles(merged.files);
    }
  };

  const handleDeleteFile = (index: number) => {
    if (selectedFiles) {
      const filesArray = Array.from(selectedFiles);
      filesArray.splice(index, 1);
      const newFileList = new DataTransfer();
      filesArray.forEach((file) => newFileList.items.add(file));
      setSelectedFiles(newFileList.files);
    }
  };
  const axiosInstance = axios.create({
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setSelectedFiles(e.target.files);
  };

  const loadOwners = async (inputValue: string) => {
    const res = await axiosInstance.get(
      `${APIURLS.user.getUsers()}?search=${inputValue}`
    );

    return res.data.map((u: any) => ({
      label: u.fullName,
      value: u.id,
    }));
  };

  const handleSave = () => {
    if (!workstream.title) return;

    setIsLoading(true);

    const formData = new FormData();
    formData.append("title", workstream.title);
    formData.append("objective", workstream.objective);
    formData.append("ownerId", workstream.ownerId.toString());

    axiosInstance
      .post(APIURLS.workstream.saveWorkstream(), formData)
      .then((res) => {
        setSaveWorkstream(res.data.workStreamNumber);
        setWorkstream(initialWorkstream);
        setIsModalOpen(true);
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <div className="flex flex-col h-full mx-auto bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto p-4 sm:p-6 space-y-6 max-w-3xl">
        {/* Enhanced Header */}
        <div className="text-center sm:text-left">
          <h2 className="text-3xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 mb-2">
            Create Workstream
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Define a new outcome-focused workstream
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-2 border-gray-200 dark:border-gray-700 p-6 sm:p-8 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              Workstream Title
            </label>
            <input
              className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm hover:shadow-md transition-all duration-200 placeholder-gray-400"
              value={workstream.title}
              onChange={(e) =>
                setWorkstream({ ...workstream, title: e.target.value })
              }
              placeholder="Enter a descriptive title..."
            />
          </div>

          {/* Objective */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Objective / Outcome
            </label>
            <textarea
              rows={5}
              className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none shadow-sm hover:shadow-md transition-all duration-200 placeholder-gray-400"
              value={workstream.objective}
              onChange={(e) =>
                setWorkstream({ ...workstream, objective: e.target.value })
              }
              placeholder="Describe the goals and expected outcomes..."
            />
          </div>

          {/* Save */}
          <div className="flex justify-end pt-4 border-t-2 border-gray-200 dark:border-gray-700">
            <button
              onClick={handleSave}
              disabled={!workstream.title.trim()}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700
                         text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95
                         disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Workstream
            </button>
          </div>
        </div>
      </div>

      <LoadComponent loading={isLoading} />
      {isModalOpen && (
        <WorkstreamModal
          isOpen={isModalOpen}
          ticketNumber={saveWorkstream}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default WorkstreamEntry;
