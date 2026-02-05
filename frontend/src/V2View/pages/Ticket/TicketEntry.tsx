import React, { useState, useEffect } from 'react';
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

const TicketEntry = () => {

    const history = useNavigate();
    const initialTicketState: Ticket = {
        id: 0,
        ticketNumber: "",
        calledIn: new Date(),
        dueDate: null,
        timeStamp: new Date(),
        title: "",
        description: "Reporter: \nIP Address: \nLocation: \nAsset tag: \nProblem Concern Details: ",
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
    const [branches, setBranches] = useState<Branch[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [ticketAssets, setTicketAssets] = useState([]);

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


    useEffect(() => {
        // FetchBranches();
        // FetchUsers();
    }, []);


    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            if (selectedFiles) {
                const newFiles: File[] = Array.from(files).filter(file => {
                    for (let i = 0; i < selectedFiles.length; i++) {
                        if (file.name === selectedFiles[i].name) {
                            return false;
                        }
                    }
                    return true;
                });
                const newFileList = new DataTransfer();
                Array.from(selectedFiles).forEach(file => newFileList.items.add(file));
                newFiles.forEach(file => newFileList.items.add(file));
                setSelectedFiles(newFileList.files);
            } else {
                setSelectedFiles(files);
            }
        }
    };

    const handleOpenCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
        } catch (error) {
        }
    };


    // const handleSave = () => {
    //     const filesDescription = selectedFiles ? Array.from(selectedFiles).map(file => `Unknown image file: ${file.name}`).join('\n') : '';
    //     const finalDescription = description ? `${description}\n${filesDescription}` : filesDescription;
    //     console.log('Ticket saved:', { title, description: finalDescription });
    //     // history.push('/tickets'); // Navigate to the tickets page after saving
    // };
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
        <div className="flex flex-col h-full mx-auto w-full max-w-5xl">
            <div className="container mx-auto flex-grow overflow-auto">
                <div className="p-4 sm:p-6">

                    {/* Enhanced Header */}
                    <div className="mb-8 p-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl shadow-xl">
                        <div className="flex items-center justify-center gap-3">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                            </svg>
                            <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">Submit a Ticket</h1>
                        </div>
                        <p className="text-center text-white/90 mt-2 text-sm sm:text-base">Fill out the form below to create a new support ticket</p>
                    </div>
                    {/* <div className="mb-4">
                        <p className="text-gray-700 font-bold text-left mb-0">Title:</p>
                        <input
                            type="text"
                            className="w-full bg-gray-100 border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:bg-white"
                            placeholder="Enter Title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div> */}

                    {/* Enhanced Title Input */}
                    <div className="mb-6 bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 border border-gray-200 dark:border-gray-700">
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-3 uppercase tracking-wide flex items-center gap-2">
                            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                            Ticket Title
                        </label>
                        <input
                            type="text"
                            className="w-full bg-gray-50 dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-xl py-3 px-4 text-base focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-200 placeholder-gray-400"
                            placeholder="Enter a descriptive title for your ticket..."
                            value={ticket?.title}
                            onChange={(e) => {
                                if (ticket) {
                                    setTicket({ ...ticket, title: e.target.value });
                                }
                            }}
                        />
                    </div>

                    {/* Enhanced Description Textarea */}
                    <div className="mb-6 bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 border border-gray-200 dark:border-gray-700">
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-3 uppercase tracking-wide flex items-center gap-2">
                            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Description
                        </label>
                        <div className="relative">
                            <textarea
                                className="w-full bg-gray-50 dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-xl py-3 px-4 text-base focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-200 placeholder-gray-400 resize-none"
                                placeholder="Provide detailed information about your issue..."
                                value={ticket?.description}
                                onChange={(e) => {
                                    if (ticket) {
                                        setTicket({ ...ticket, description: e.target.value })
                                    }
                                }}
                                onPaste={handlePaste}
                                rows={Math.max(8, description.split('\n').length + 1)}
                            />
                            <div className="absolute bottom-3 right-3 text-xs text-gray-400 dark:text-gray-500 bg-white dark:bg-gray-900 px-2 py-1 rounded-md">
                                💡 Tip: You can paste images directly here
                            </div>
                        </div>
                    </div>

                    {/* <div className="mb-4">
                        <p className="text-gray-700 font-bold text-left mb-0">Assets:</p>
                        <AsyncSelect
                            isMulti
                            value={ticketAssets}
                            placeholder="Assign assets...."
                            defaultOptions
                            onChange={handleAssetOnChange}
                            loadOptions={filterAssetsOptions}

                        />
                    </div> */}
                    {/* <div className="mb-4">
                        <p className="text-gray-700 font-bold text-left mb-0">Branch:</p>
                        <select
                            className="w-full bg-gray-200 font-semibold border border-gray-300 rounded-md py-1 px-3 appearance-none text-center"
                            value={ticket ? ticket.branchId : ''}
                            onChange={(e) => {
                                if (ticket) {
                                    setTicket({ ...ticket, branchId: Number(e.target.value) });
                                }
                            }}
                        >

                            <option key={0} value={0}>Unassigned</option>
                            {branches.map((obj) => (
                                <option key={obj.id} value={obj.id}>
                                    {obj.name}
                                </option>
                            ))}

                        </select>
                    </div> */}
                    {/* <div className="mb-4">
                        <p className="text-gray-700 font-bold text-left mb-0">Assignee:</p>
                        <select
                            className="w-full bg-gray-200 font-semibold border border-gray-300 rounded-md py-1 px-3 appearance-none text-center"
                            value={ticket ? ticket.assigneeId : ''}
                            onChange={(e) => {
                                if (ticket) {
                                    setTicket({ ...ticket, assigneeId: Number(e.target.value) });
                                }
                            }}
                        >

                            <option key={0} value={0}>Unassigned</option>
                            {users.map((obj) => (
                                <option key={obj.id} value={obj.id}>
                                    {obj.fullName}
                                </option>
                            ))}z

                        </select>
                    </div> */}
                    {/* Enhanced Attachment Section */}
                    <div className="mb-6 bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 border border-gray-200 dark:border-gray-700">
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-3 uppercase tracking-wide flex items-center gap-2">
                            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                            </svg>
                            Attachments
                            {selectedFiles && selectedFiles.length > 0 && (
                                <span className="ml-2 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-semibold rounded-full">
                                    {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''}
                                </span>
                            )}
                        </label>
                        <label
                            htmlFor="file-upload"
                            className="block w-full cursor-pointer border-2 border-dashed border-blue-300 dark:border-blue-600 rounded-xl p-8 flex flex-col items-center justify-center hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 group"
                        >
                            <svg
                                className="w-12 h-12 mb-3 text-blue-500 dark:text-blue-400 group-hover:scale-110 transition-transform duration-200"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                />
                            </svg>
                            <span className="text-base font-semibold text-gray-700 dark:text-gray-200 mb-1">
                                Click to upload or drag and drop
                            </span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                PNG, JPG, PDF or any document (Max 10MB each)
                            </span>
                            <input
                                id="file-upload"
                                type="file"
                                className="hidden"
                                onChange={handleFileChange}
                                multiple
                            />
                        </label>
                    </div>

                    {/* Enhanced File Display Cards */}
                    {selectedFiles && selectedFiles.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-4 uppercase tracking-wide flex items-center gap-2">
                                <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Uploaded Files ({selectedFiles.length})
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {Array.from(selectedFiles).map((file, index) => (
                                    <div
                                        key={index}
                                        className="group relative bg-white dark:bg-gray-800 p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-center hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-lg transition-all duration-200"
                                    >
                                        {/* Delete Button */}
                                        <button
                                            className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
                                            onClick={() => handleDeleteFile(index)}
                                            title="Remove file"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>

                                        {/* File Preview */}
                                        <div className="mb-3">
                                            {file.type.startsWith("image/") ? (
                                                <div className="relative w-full h-24 bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden">
                                                    <img
                                                        src={URL.createObjectURL(file)}
                                                        alt="Preview"
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-center h-24 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg">
                                                    <svg className="w-12 h-12 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>

                                        {/* File Name */}
                                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300 break-all line-clamp-2" title={file.name}>
                                            {file.name}
                                        </p>

                                        {/* File Size */}
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            {(file.size / 1024).toFixed(1)} KB
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                </div>


            </div>
            <button
                onClick={handleSave}
                className="mx-auto w-2/5 bg-blue-500 text-white rounded-md py-2 mb-4 hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-400"
            >
                Submit
            </button>
            <LoadComponent loading={isLoading} />
            {isModalOpen && (
                <TicketModal
                    isOpen={isModalOpen}
                    ticketNumber={saveTicket}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
        </div>
    );
};

export default TicketEntry;
