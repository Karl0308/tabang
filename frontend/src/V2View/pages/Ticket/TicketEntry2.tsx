import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import fileIcon from '../../../img/file.png';
import LoadComponent from '../../component/LoadComponent';
import { Branch, BranchMember } from '../../objects/Branch';
import { DocumentType } from '../../objects/DocumentType';
import axios from 'axios';
import { APIURLS } from '../../../APIURLS';
import { Ticket } from '../../objects/Ticket';
import TicketModal from '../Ticket/TicketModal'
import { User } from '../../objects/User';
import { useAccordionButton } from 'react-bootstrap';
import AsyncSelect from 'react-select/async';
import { DepartmentBase } from '../../objects/enum';

const TicketEntry2 = () => {

    const history = useNavigate();
    const initialTicketState: Ticket = {
        id: 0,
        ticketNumber: "",
        calledIn: new Date(),
        dueDate: null,
        timeStamp: new Date(),
        title: "",
        description: "",
        branchName: "",
        // reporterName: "",
        assigneeText: "",
        priorityName: "",
        priority: 0,
        status: 0,
        ticketLink: "",
        starRate: 0,
        documentTypeId: 0,
        branchId: 0,
        reporterId: Number(localStorage.getItem("id")),
        assigneeId: 0,
        branchMemberAssigneeName: "",
        statusName: "",
        oldStatus: 0,
        resolution: "",
        currentUserId: 0,
        branchMemberAssigneeId: 0,
        reporterText: '',
        timestamp: new Date(),
        ticketAssetsString: "",
        departmentBase: DepartmentBase.Default,

        // // Additional Fields
        reporterName: "",
        ipAddress: "",
        location: "",
        assetTag: "",
        ticketAttachmentCount : 0,
        ticketDepartmentText : "",
        workstreamCount : 0,
        departmentIds: [],
        quality : 0,
        timeliness : 0,
        communication : 0,
        adherence : 0,
        overall : 0,
        feedback : "",
    };
    const [title, setTitle] = useState<string>('');
    const [ticket, setTicket] = useState<Ticket | null>(initialTicketState);

    const [saveTicket, setSaveTicket] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [errorModalOpen, setErrorModalOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [branches, setBranches] = useState<Branch[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [ticketAssets, setTicketAssets] = useState([]);

    const [isDragging, setIsDragging] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);

    const axiosInstance = axios.create({
        headers: {
            'Authorization': `Bearer ${localStorage.getItem("token")}`
        }
    });

    const FetchBranches = () => {
        setIsLoading(true);
        axiosInstance.get(APIURLS.branch.getBranches())
            .then(res => res.data)
            .then(
                (result) => {
                    setBranches(result);
                    setIsLoading(false);
                },
                (error) => {
                }
            )
    }
    const FetchUsers = () => {
        setIsLoading(true);
        axiosInstance.get(APIURLS.user.getUsers())
            .then(res => res.data)
            .then(
                (result) => {
                    setUsers(result);
                    setIsLoading(false);
                },
                (error) => {
                }
            )
    }

    // const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    //     const files = event.target.files;
    //     if (files && files.length > 0) {
    //         if (selectedFiles) {
    //             const newFiles: File[] = Array.from(files).filter(file => {
    //                 for (let i = 0; i < selectedFiles.length; i++) {
    //                     if (file.name === selectedFiles[i].name) {
    //                         return false;
    //                     }
    //                 }
    //                 return true;
    //             });
    //             const newFileList = new DataTransfer();
    //             Array.from(selectedFiles).forEach(file => newFileList.items.add(file));
    //             newFiles.forEach(file => newFileList.items.add(file));
    //             setSelectedFiles(newFileList.files);
    //         } else {
    //             setSelectedFiles(files);
    //         }
    //     }
    // };




    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files) return;

        if (selectedFiles) {
            const newFiles: File[] = Array.from(files).filter(file => {
                return !Array.from(selectedFiles).some(f => f.name === file.name);
            });

            const merged = new DataTransfer();
            Array.from(selectedFiles).forEach(f => merged.items.add(f));
            newFiles.forEach(f => merged.items.add(f));

            setSelectedFiles(merged.files);
        } else {
            setSelectedFiles(files);
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);

        const dropped = e.dataTransfer.files;

        if (dropped && dropped.length > 0) {
            const merged = new DataTransfer();

            if (selectedFiles) {
                Array.from(selectedFiles).forEach(f => merged.items.add(f));
            }

            Array.from(dropped).forEach(f => merged.items.add(f));

            setSelectedFiles(merged.files);
        }
    };


    const handleOpenCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
        } catch (error) {
        }
    };


    const handleSave = () => {
        if (isLoading) {
            return;
        }

        if (!ticket) {
            return;
        }

        if (!ticket.title) {
            return;
        }

        // e.preventDefault();
        setIsLoading(true);

        const formData = new FormData();

        if (selectedFiles !== null) {
            if (selectedFiles.length > 0) {
                Array.from(selectedFiles).forEach((file) => {
                    formData.append("files", file);
                });
            }

        }

        // Append other form data to formData
        formData.append('title', ticket.title);
        formData.append('description', ticket.description);
        formData.append('status', ticket.status.toString());
        formData.append('oldStatus', ticket.oldStatus.toString());
        formData.append('resolution', ticket.resolution);
        formData.append('branchId', ticket.branchId.toString());
        formData.append('documentTypeId', ticket.documentTypeId.toString());
        formData.append('assigneeId', ticket.assigneeId.toString());
        formData.append('currentUserId', ticket.currentUserId.toString());
        formData.append('reporterId', ticket.reporterId.toString());
        formData.append('branchMemberAssigneeId', ticket.branchMemberAssigneeId.toString());
        formData.append('ticketAssetsString', JSON.stringify(ticketAssets));

        //Additional Fields
        formData.append('reporterName', ticket.reporterName);
        formData.append('ipAddress', ticket.ipAddress);
        formData.append('location', ticket.location);
        formData.append('assetTag', ticket.assetTag);

        // ... append other fields as needed ...

        axiosInstance.post(APIURLS.ticket.saveTicket(), formData)
            .then(res => res.data)
            .then((res) => {
                setSaveTicket(res.ticketNumber);
                setTicket(initialTicketState);
                setSelectedFiles(null);

                setTicketAssets([]);
                setIsLoading(false);
                setIsModalOpen(true);
            })
            .catch((error) => {
                setIsLoading(false);
                const message = error.response?.data || error.message || 'An unexpected error occurred';
                setErrorMessage(message);
                setErrorModalOpen(true);
            });
    };

    const handleDeleteFile = (index: number) => {
        if (selectedFiles) {
            const filesArray = Array.from(selectedFiles);
            filesArray.splice(index, 1);
            const newFileList = new DataTransfer();
            filesArray.forEach(file => newFileList.items.add(file));
            setSelectedFiles(newFileList.files);
        }
    };


    const handleAssetOnChange = (selectedOption: any) => {
        setTicketAssets(selectedOption);

    };
    const filterAssetsOptions = (inputValue: any, callback: any) => {
        const searchTermParam = inputValue != null ? inputValue : "";
        axiosInstance.get(`${APIURLS.ticket.ticketBase()}GetAssets?searchTerm=${searchTermParam}`)
            .then((response) => {
                const options: any[] = [];
                response.data.forEach((asset: any) => {
                    options.push({
                        label: `${asset.code} - ${asset.name}`,
                        value: asset.id,
                    });
                });
                callback(options);
            })
    }

    const handlePaste = (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
        const clipboardData = event.clipboardData;
        const items = clipboardData.items;

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (item.type.includes("image")) {
                const file = item.getAsFile();
                if (file) {
                    const dataTransfer = new DataTransfer();

                    if (selectedFiles) {
                        const existingNames = new Set<string>();
                        for (let j = 0; j < selectedFiles.length; j++) {
                            const existingFile = selectedFiles.item(j);
                            if (existingFile) {
                                existingNames.add(existingFile.name);
                                dataTransfer.items.add(existingFile);
                            }
                        }

                        let newFileName = file.name;
                        let count = 2;
                        while (existingNames.has(newFileName)) {
                            const ext = file.name.substring(file.name.lastIndexOf('.'));
                            const base = file.name.substring(0, file.name.lastIndexOf('.'));
                            newFileName = `${base}${count}${ext}`;
                            count++;
                        }

                        const renamedFile = new File([file], newFileName, { type: file.type });
                        dataTransfer.items.add(renamedFile);
                    } else {
                        dataTransfer.items.add(file);
                    }

                    setSelectedFiles(dataTransfer.files);
                }

                event.preventDefault();
                break;
            }
        }
    };


    return (
        <div className="flex flex-col h-full mx-auto w-full max-w-6xl">
            <div className="container mx-auto flex-grow overflow-auto">
                <div className="p-4 sm:p-6 space-y-6">

                    {/* Enhanced Header */}
                    <div className="mb-8 p-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl shadow-xl">
                        <div className="flex items-center justify-center gap-3">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                            </svg>
                            <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">Create Support Ticket</h1>
                        </div>
                        <p className="text-center text-white/90 mt-2 text-sm sm:text-base">Fill out the form below to create a new support request</p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 sm:p-8 space-y-6">

                        {/* Enhanced Title Input */}
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wide flex items-center gap-2">
                                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                </svg>
                                Ticket Title
                            </label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-gray-400"
                                placeholder="Enter a descriptive title for your ticket..."
                                value={ticket?.title}
                                onChange={(e) => {
                                    if (ticket) {
                                        setTicket({ ...ticket, title: e.target.value });
                                    }
                                }}
                            />
                        </div>

                        {/* Enhanced Reporter & IP Address */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wide flex items-center gap-2">
                                    <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    Reporter
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-gray-400"
                                    placeholder="Enter reporter name..."
                                    value={ticket?.reporterName}
                                    onChange={(e) => {
                                        if (ticket) {
                                            setTicket({ ...ticket, reporterName: e.target.value });
                                        }
                                    }}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wide flex items-center gap-2">
                                    <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                    </svg>
                                    IP Address
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-gray-400"
                                    placeholder="Enter IP address..."
                                    value={ticket?.ipAddress}
                                    onChange={(e) => {
                                        if (ticket) {
                                            setTicket({ ...ticket, ipAddress: e.target.value });
                                        }
                                    }}
                                />
                            </div>
                        </div>

                        {/* Enhanced Location & Asset Tag */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wide flex items-center gap-2">
                                    <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    Location
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-gray-400"
                                    placeholder="Enter location..."
                                    value={ticket?.location}
                                    onChange={(e) => {
                                        if (ticket) {
                                            setTicket({ ...ticket, location: e.target.value });
                                        }
                                    }}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wide flex items-center gap-2">
                                    <svg className="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                                    </svg>
                                    Asset Tag
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-gray-400"
                                    placeholder="Enter asset tag..."
                                    value={ticket?.assetTag}
                                    onChange={(e) => {
                                        if (ticket) {
                                            setTicket({ ...ticket, assetTag: e.target.value });
                                        }
                                    }}
                                />
                            </div>
                        </div>

                        {/* Enhanced Description */}
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wide flex items-center gap-2">
                                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Problem Concern Details
                            </label>
                            <textarea
                                rows={8}
                                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-gray-400 resize-none"
                                placeholder="Please provide detailed information about the issue, including steps to reproduce if applicable..."
                                value={ticket?.description}
                                onChange={(e) => {
                                    if (ticket) {
                                        setTicket({ ...ticket, description: e.target.value });
                                    }
                                }}
                            />
                        </div>


                        {/* Enhanced Attachments Section */}
                        <div className="space-y-3">
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wide flex items-center gap-2">
                                <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                </svg>
                                Attachments
                                {selectedFiles && selectedFiles.length > 0 && (
                                    <span className="ml-2 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-semibold rounded-full">
                                        {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''}
                                    </span>
                                )}
                            </label>

                            {/* Drag & Drop Area */}
                            <div
                                className={`border-2 border-dashed rounded-xl p-8 transition-all duration-200 ${
                                    isDragging
                                        ? "border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 scale-[1.02]"
                                        : "border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500"
                                }`}
                                onDragOver={(e) => {
                                    e.preventDefault();
                                    setIsDragging(true);
                                }}
                                onDragLeave={() => setIsDragging(false)}
                                onDrop={handleDrop}
                            >
                                <div className="text-center">
                                    <svg className="w-16 h-16 mx-auto mb-4 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>

                                    <p className="text-gray-700 dark:text-gray-300 font-semibold text-lg mb-2">
                                        Drag & drop files here
                                    </p>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                                        or choose an option below
                                    </p>

                                    <div className="flex flex-col sm:flex-row justify-center gap-3">
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl shadow-lg hover:shadow-xl active:scale-95 transition-all duration-200 font-semibold"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            Choose Files
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => cameraInputRef.current?.click()}
                                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl shadow-lg hover:shadow-xl active:scale-95 transition-all duration-200 font-semibold"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            Open Camera
                                        </button>
                                    </div>
                                </div>

                                {/* Hidden Inputs */}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    multiple
                                    className="hidden"
                                    onChange={handleFileChange}
                                />

                                <input
                                    ref={cameraInputRef}
                                    type="file"
                                    accept="image/*"
                                    capture="environment"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                            </div>

                            {/* Enhanced File Preview List */}
                            {selectedFiles && selectedFiles.length > 0 && (
                                <div className="mt-6 space-y-3">
                                    <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wide flex items-center gap-2">
                                        <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Selected Files ({selectedFiles.length})
                                    </h3>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                        {Array.from(selectedFiles).map((file, index) => (
                                            <div
                                                key={index}
                                                className="group relative bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 p-3 flex flex-col items-center gap-2 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-lg transition-all duration-200"
                                            >
                                                {/* Delete Button */}
                                                <button
                                                    className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
                                                    onClick={() => handleDeleteFile(index)}
                                                    type="button"
                                                    title="Remove file"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>

                                                {/* File Preview */}
                                                {file.type.startsWith("image/") ? (
                                                    <div className="relative w-full h-24 bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden">
                                                        <img
                                                            src={URL.createObjectURL(file)}
                                                            alt="preview"
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="w-full h-24 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg">
                                                        <svg className="w-12 h-12 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                        </svg>
                                                    </div>
                                                )}

                                                {/* File Name */}
                                                <p className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center truncate w-full" title={file.name}>
                                                    {file.name}
                                                </p>

                                                {/* File Size */}
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {(file.size / 1024).toFixed(1)} KB
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>


                        {/* Enhanced Submit Button */}
                        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <button
                                type="submit"
                                onClick={handleSave}
                                disabled={isLoading || !ticket?.title}
                                className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-xl shadow-lg hover:shadow-xl disabled:shadow-none active:scale-95 transition-all duration-200 font-bold text-lg disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin w-6 h-6" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Creating Ticket...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Create Ticket
                                    </>
                                )}
                            </button>
                        </div>



                        {/* <div className="mb-4">
                            <p className="text-gray-700 dark:text-gray-200 font-bold text-left mb-0">Title:</p>


                            <input
                                type="text"
                                className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-black dark:text-white rounded-md py-2 px-3 focus:outline-none focus:bg-white dark:focus:bg-gray-700"
                                placeholder="Enter Title"
                                value={ticket?.title}
                                onChange={(e) => {
                                    if (ticket) {
                                        setTicket({ ...ticket, title: e.target.value });
                                    }
                                }}
                            />

                        </div>

                        <div className="mb-4">
                            <p className="text-gray-700 dark:text-gray-200 font-bold text-left mb-0">Description:</p>
                            <textarea
                                className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-black dark:text-white rounded-md py-2 px-3 focus:outline-none focus:bg-white dark:focus:bg-gray-700"
                                placeholder="Enter Description"
                                value={ticket?.description}
                                // onChange={(e) => setDescription(e.target.value)}
                                onChange={(e) => {
                                    if (ticket) {
                                        setTicket({ ...ticket, description: e.target.value })
                                    }
                                }}
                                onPaste={handlePaste}
                                rows={Math.max(6, description.split('\n').length + 1)}
                            />
                        </div>

                        <div className="mb-4">
                            <p className="text-gray-700 dark:text-gray-200 font-bold text-left mb-0">Attachment:</p>
                            <label
                                htmlFor="file-upload"
                                className="flex-1 block text-sm font-semibold text-gray-700 dark:text-white cursor-pointer border border-gray-300 dark:border-gray-600 rounded-md p-2 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 mr-2"
                            >
                                <svg
                                    className="w-6 h-6 mr-2"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                    />
                                </svg>
                                Choose Files
                                <input
                                    id="file-upload"
                                    type="file"
                                    className="hidden"
                                    onChange={handleFileChange}
                                    multiple
                                />
                            </label>

                        </div>

                        {selectedFiles && (
                            <div className="mb-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                                    {Array.from(selectedFiles).map((file, index) => (
                                        <div
                                            key={index}
                                            className="bg-gray-100 dark:bg-gray-800 p-2 rounded-md text-center relative pt-10"
                                        >
                                            {file.type.startsWith("image/") ? (
                                                <img
                                                    src={URL.createObjectURL(file)}
                                                    alt="Image"
                                                    className="w-20 h-20 mx-auto mb-2 object-cover rounded-md"
                                                    style={{ maxWidth: "100%", maxHeight: "100%" }}
                                                />
                                            ) : (
                                                <img
                                                    src={fileIcon}
                                                    alt="File Icon"
                                                    className="w-10 h-10 mx-auto mb-2"
                                                />
                                            )}
                                            <p className="text-sm break-all text-gray-700 dark:text-gray-300">
                                                {file.name}
                                            </p>
                                            <button
                                                className="absolute top-0 right-0 m-1 p-1 text-gray-500 dark:text-gray-300 rounded-full hover:text-gray-600 dark:hover:text-white"
                                                onClick={() => handleDeleteFile(index)}
                                            >
                                                X
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )} */}

                    </div>
                </div>


            </div>
            {/* <button
                onClick={handleSave}
                className="mx-auto w-2/5 bg-blue-500 text-white rounded-md py-2 mb-4 hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-400"
            >
                Submit
            </button>*/}
            <LoadComponent loading={isLoading} />
            {isModalOpen && (
                <TicketModal
                    isOpen={isModalOpen}
                    ticketNumber={saveTicket}
                    onClose={() => setIsModalOpen(false)}
                />
            )}

            {/* Error Modal */}
            {errorModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-slate-300 dark:bg-slate-800 rounded-lg shadow-lg max-w-md w-full mx-4 overflow-hidden">
                        {/* Header */}
                        <div className="bg-red-600 dark:bg-red-700 px-4 py-3">
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <h3 className="text-lg font-bold text-white">Error</h3>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="px-4 py-4">
                            <p className="text-black dark:text-white text-sm">
                                {errorMessage}
                            </p>
                        </div>

                        {/* Footer */}
                        <div className="px-4 py-3 bg-slate-400 dark:bg-slate-900 flex justify-end">
                            <button
                                onClick={() => setErrorModalOpen(false)}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md text-sm"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default TicketEntry2;
