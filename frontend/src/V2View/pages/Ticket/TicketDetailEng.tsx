
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Ticket, Comment, RelatedIssues, Attachment, History, TicketCatchup } from '../../objects/Ticket';
import StarRating from '../../component/StarRating';
import fileIcon from '../../../img/file.png';
import videoIcon from '../../../img/video.png';
import QRCode from 'react-qr-code';
import { DocumentType } from '../../objects/DocumentType';
import Datetime from 'react-datetime';
import { User } from '../../objects/User';
import { Branch, BranchMember } from '../../objects/Branch';
import userLogo from '../../../img/user.png';
import axios from 'axios';
import { APIURLS } from '../../../APIURLS';
import ReactImageGallery from 'react-image-gallery';
import 'react-image-gallery/styles/css/image-gallery.css';
import ImageGalleryComponent from './ImageGalleryComponent';
import { number } from 'yup';
import { ToastContainer, toast } from 'react-toastify';
import { Asset } from '../../objects/Asset';
import CopyButton from '../../../components/CopyButton';
import MentionInput from '../../../components/MentionInput';
import AltchaCaptcha from '../../../AltchaCaptcha';

interface ModalProps {
    selected: Ticket | null;
    setSelected: React.Dispatch<React.SetStateAction<Ticket | null>>;
    handleSave: () => void;
    handleClose: () => void;
    isTicketView: boolean | true;
    documentTypes: DocumentType[];
    users: User[];
    branches: Branch[];
}
const TicketDetail = ({ selected, setSelected, handleClose, handleSave, isTicketView, documentTypes, users, branches }: ModalProps) => {
    let userRole = localStorage.getItem("role")
    const [activeView, setActiveView] = useState<string>('Comments');
    const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [attachments, setAttachments] = useState<Attachment[]>([]); // Track attachments
    const [loadedAttachments, setLoadedAttachments] = useState<Record<number, string>>({}); // Track loaded images by ID
    const [branchMembers, setBranchMembers] = useState<BranchMember[]>([]);

    const [ShowResolution, setShowResolution] = useState(false);
    const [statusColor, setStatusColor] = useState({
        backgroundColor: "",
        color: ""
    });

    const dropdownRef = useRef<HTMLDivElement>(null);
    const popupRef = useRef<HTMLDivElement>(null);

    const axiosInstance = axios.create({
        headers: {
            'Authorization': `Bearer ${localStorage.getItem("token")}`
        }
    });

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node) &&
                popupRef.current &&
                !popupRef.current.contains(event.target as Node)
            ) {
                setSelected(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const FetchBranchMembers = (id: number) => {
        // setIsLoading(true);
        // axiosInstance.get(APIURLS.branch.getBranchMemberByBranchId + id)
        //     .then(res => res.data)
        //     .then(
        //         (result) => {
        //             setBranchMembers(result);
        //             setIsLoading(false);
        //         },
        //         (error) => {
        //             console.log(error);
        //         }
        //     )
    }

    useEffect(() => {
        if (selected !== null)
            FetchBranchMembers(selected?.branchId);
    }, [selected?.branchId]);


    const handleViewChange = (view: string) => {
        setActiveView(view);
    };


    const handleAttachmentsChange = (updatedAttachments: Attachment[]) => {
        // setAttachments(updatedAttachments);
    };

    const handleLoadedAttachmentsChange = (updatedLoadedAttachments: Record<number, string>) => {
        // setLoadedAttachments(updatedLoadedAttachments);
    };

    const handleCaptchaComplete = (data: any) => {

        const notify = () => {
            toast.success("Successfully Catchup!", {
                position: "top-center", // Centered toast
                autoClose: 5000, // Close after 5 seconds
            });
        };

        axiosInstance.post(APIURLS.ticketEng.catchup() + "ticketId=" + data.ticketId + "&userId=" + localStorage.getItem("id"))
            .then(
                (result) => {
                    // notify();
                },
                (error) => {
                }
            );

    };

    const CommentsView = ({
        _attachments,
        _loadedAttachments,
        onAttachmentsChange,
        onLoadedAttachmentsChange,
        _users
    }: {
        _attachments: Attachment[];
        _loadedAttachments: Record<number, string>;
        onAttachmentsChange: (updatedAttachments: Attachment[]) => void;
        onLoadedAttachmentsChange: (updatedLoadedAttachments: Record<number, string>) => void;
        _users: User[];
    }) => {
        const [attachments, setAttachments] = useState<Attachment[]>(_attachments);
        const [users, setUsers] = useState<User[]>(_users);
        const [loadedAttachments, setLoadedAttachments] = useState<Record<number, string>>(_loadedAttachments);
        const [isLoading, setIsLoading] = useState(false);
        const [commentList, setCommentList] = useState<Comment[]>();
        const commentInitial = {
            id: 0,
            comment: '',
            created: new Date(),
            createdText: '',
            userFullName: localStorage.getItem('fullName') ?? '',
            ticketAttachments: []
        };
        const [comment, setComment] = useState<Comment>(commentInitial);
        const [selectedFilesComment, setSelectedFilesComment] = useState<FileList | null>(null);

        const FetchComments = () => {
            if (selected?.id !== undefined) {
                setIsLoading(true);
                axiosInstance.get(APIURLS.ticketEng.getTicketCommentsById() + selected?.id)
                    .then((res) => {
                        setCommentList(res.data);
                        setIsLoading(false);
                    })
                    .catch((error) => {
                        setIsLoading(false);
                    });
            }
        };


        useEffect(() => {
            FetchComments();
        }, []);

        // useEffect(() => {
        //     onAttachmentsChange(attachments); // Update parent with new attachments
        // }, [attachments, onAttachmentsChange]);

        // useEffect(() => {
        //     onLoadedAttachmentsChange(loadedAttachments); // Update parent with new loadedAttachments
        // }, [loadedAttachments, onLoadedAttachmentsChange]);

        const WriteComment = (e: any) => {
            setComment((prevComment) => ({
                ...prevComment,
                comment: e.target.value
            }));
        };

        const handleFileChangeComment = (event: React.ChangeEvent<HTMLInputElement>) => {
            const files = event.target.files;
            if (files && files.length > 0) {
                if (selectedFilesComment) {
                    const newFiles: File[] = Array.from(files).filter(file => {
                        for (let i = 0; i < selectedFilesComment.length; i++) {
                            if (file.name === selectedFilesComment[i].name) {
                                return false;
                            }
                        }
                        return true;
                    });
                    const newFileList = new DataTransfer();
                    Array.from(selectedFilesComment).forEach(file => newFileList.items.add(file));
                    newFiles.forEach(file => newFileList.items.add(file));
                    setSelectedFilesComment(newFileList.files);
                } else {
                    setSelectedFilesComment(files);
                }

            }
        };

        const handleDeleteFileComment = (index: number) => {
            if (selectedFilesComment) {
                const filesArray = Array.from(selectedFilesComment);
                filesArray.splice(index, 1);
                const newFileList = new DataTransfer();
                filesArray.forEach(file => newFileList.items.add(file));
                setSelectedFilesComment(newFileList.files);
            }
        };

        const addTicketComment = () => {
            if (isLoading) {
                return;
            }
            if (!comment.comment) {
                return;
            }

            const formData = new FormData();


            if (selectedFilesComment) {
                Array.from(selectedFilesComment).forEach((file) => {
                    formData.append('files', file);
                });
            }


            // Append other form data to formData
            formData.append('comment', comment.comment);
            formData.append('created', comment.created.toDateString());
            formData.append('ticketId', selected?.id.toString() ?? '');
            formData.append('userId', localStorage.getItem('id') ?? '');
            // ... append other fields as needed ...


            setIsLoading(true);
            axiosInstance.post(APIURLS.ticketEng.saveTicketComment(), formData)
                .then(
                    (result) => {

                        const newComment: Comment = result.data;
                        const newAttachment: Attachment[] = newComment.ticketAttachments;

                        setAttachments((prev) => [
                            ...(prev ?? []),
                            ...newAttachment,
                        ]);

                        newAttachment.forEach((attachment) => {
                            if (attachment.contentType.startsWith('video/')) {
                                const videoUrl = `data:${attachment.contentType};base64,${attachment.content}`;

                                setLoadedAttachments((prev) => ({
                                    ...prev,
                                    [attachment.id]: videoUrl
                                }));
                            }
                            else
                                if (attachment.contentType.startsWith('image/')) {
                                    const imageUrl = `data:${attachment.contentType};base64,${attachment.content}`;

                                    setLoadedAttachments((prev) => ({
                                        ...prev,
                                        [attachment.id]: imageUrl
                                    }));
                                } else {
                                    const fileUrl = URL.createObjectURL(new Blob([new Uint8Array(attachment.content)], { type: attachment.contentType }));
                                    setLoadedAttachments((prev) => ({
                                        ...prev,
                                        [attachment.id]: fileUrl
                                    }));
                                }
                        });


                        setCommentList((prevComments) => [...(prevComments ?? []), newComment]);


                        setComment(commentInitial);
                        setSelectedFilesComment(null);

                        setIsLoading(false);
                    },
                    (error) => {
                        setIsLoading(false);
                    }
                );
        }

        const handleChangeMentionComment = (value: any) => {
            // console.log("Input value:", value);
            setComment({
                ...comment,
                comment: value
            });

            // console.log(ticketComment.comment);
        };

        const renderMentions = (comment: string) => {
            const mentionRegex = /@\[([^[\]]+)\]\((\d+)\)/g;
            let lastIndex = 0;
            const parts = [];

            let match;
            while ((match = mentionRegex.exec(comment)) !== null) {
                const username = match[1];
                const userId = match[2];
                const mentionText = match[0];
                const mentionIndex = match.index;

                // Push the text before the mention
                if (mentionIndex > lastIndex) {
                    parts.push(comment.substring(lastIndex, mentionIndex));
                }

                // Push the mention with blue color
                parts.push(
                    <span key={mentionIndex} style={{ color: 'blue' }}>
                        {username}
                    </span>
                );

                // Update lastIndex
                lastIndex = mentionIndex + mentionText.length;
            }

            // Push the remaining text after the last mention
            if (lastIndex < comment.length) {
                parts.push(comment.substring(lastIndex));
            }

            return parts;
        };

        const handleImagePaste = (file: File) => {
            if (!file) return;
          
            const dataTransfer = new DataTransfer();
            const existingNames = new Set<string>();
          
            // Add existing files to the new list
            if (selectedFilesComment) {
              for (let i = 0; i < selectedFilesComment.length; i++) {
                const existingFile = selectedFilesComment.item(i);
                if (existingFile) {
                  dataTransfer.items.add(existingFile);
                  existingNames.add(existingFile.name);
                }
              }
            }
          
            let newFileName = file.name;
            const fileExt = file.name.substring(file.name.lastIndexOf('.'));
            const fileBase = file.name.substring(0, file.name.lastIndexOf('.'));
          
            let counter = 2;
            while (existingNames.has(newFileName)) {
              newFileName = `${fileBase}${counter}${fileExt}`;
              counter++;
            }
          
            const renamedFile = new File([file], newFileName, {
              type: file.type,
              lastModified: file.lastModified
            });
          
            dataTransfer.items.add(renamedFile);
            setSelectedFilesComment(dataTransfer.files);
          };
          

        return (
            <div className="bg-gray-200 dark:bg-gray-800 p-4 rounded-md">
                <h3 className="text-lg font-semibold mb-4 text-left text-gray-900 dark:text-white">Comments</h3>

                {isLoading ? (
                    <div className="text-center">
                        <p className="text-gray-600">Loading comments...</p>
                    </div>
                ) : (
                    <>
                        <div className="flex flex-col gap-4 mb-4 p-4 bg-white rounded-md shadow-md">
                            <div className="flex items-center gap-4">
                                <img
                                    src={userLogo}
                                    alt="User Avatar"
                                    className="w-12 h-12 rounded-full"
                                />
                                {/* <input
                                    type="text"
                                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                /> */}
                                <MentionInput userList={users} value={comment?.comment} onChange={handleChangeMentionComment} onImagePaste={handleImagePaste} />

                                <label className="cursor-pointer flex items-center gap-2 text-blue-500 hover:text-blue-600">
                                    <input
                                        type="file"
                                        className="hidden"
                                        onChange={handleFileChangeComment}
                                        multiple
                                    />
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M12 4v16m8-8H4"
                                        />
                                    </svg>
                                    Upload
                                </label>
                                <button
                                    onClick={addTicketComment}
                                    className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                disabled={true}
                                >
                                    Submit
                                </button>
                            </div>
                            {selectedFilesComment && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-4">
                                    {Array.from(selectedFilesComment).map((file, index) => (
                                        <div
                                            key={index}
                                            className="bg-gray-100 p-4 rounded-md text-center relative"
                                        >
                                            {file.type.startsWith('video/') ? (
                                                <img
                                                    src={videoIcon}
                                                    alt="File Icon"
                                                    className="w-10 h-10 mx-auto mb-2"
                                                />
                                            ) : file.type.startsWith('image/') ? (
                                                <img
                                                    src={URL.createObjectURL(file)}
                                                    alt="Image"
                                                    className="w-full h-20 object-cover rounded-md mb-2"
                                                />
                                            ) : (
                                                <img
                                                    src={fileIcon}
                                                    alt="File Icon"
                                                    className="w-10 h-10 mx-auto mb-2"
                                                />
                                            )}
                                            <p className="text-sm overflow-hidden text-ellipsis max-w-full break-words line-clamp-2 m-0">
                                                {file.name}
                                            </p>
                                            <button
                                                className="absolute top-1 right-1 text-gray-500 hover:text-gray-600"
                                                onClick={() => handleDeleteFileComment(index)}
                                            >
                                                ✖
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                        </div>

                        <ul className="p-0">
                            {commentList && commentList.length > 0 ? (
                                commentList.map((comment) => (
                                    <li key={comment.id} className="mb-4">
                                        <div className="flex items-start">
                                            <div className="flex-shrink-0 mr-4">
                                                <img
                                                    src={userLogo}
                                                    alt="User"
                                                    className="w-12 h-12 rounded-full"
                                                />
                                            </div>
                                            <div className="flex flex-col w-full">
                                                <div className="flex items-center mb-1">
                                                    <p className="text-gray-800 font-bold mr-4 mb-0">{comment.userFullName}</p>
                                                    <p className="text-gray-600 text-sm mb-0">{comment.createdText}</p>
                                                </div>
                                                <p className="text-gray-700 text-left break-words whitespace-pre-wrap">
                                                    {renderMentions(comment.comment)}
                                                </p>



                                                {comment.ticketAttachments && comment.ticketAttachments.length > 0 && (
                                                    <div className="mt-3 bg-gray-50 p-3 rounded-md border border-gray-200">
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
                                                            {comment.ticketAttachments.map((attachments, index) => (

                                                                <div
                                                                    key={attachments.id}
                                                                    className="p-2 rounded-md text-center relative p-6 cursor-pointer"
                                                                    onClick={() => handleImageClick(index)} // Open modal on image click
                                                                >
                                                                    {/* Check for image content type */}
                                                                    {attachments.contentType.startsWith("video/") ? (
                                                                        <img
                                                                            src={videoIcon} // Update with actual file icon path
                                                                            alt="File Icon"
                                                                            className="w-24 h-24 mx-auto mb-2"
                                                                        />
                                                                    ) :
                                                                        attachments.contentType.startsWith("image/") ? (
                                                                            <img
                                                                                src={loadedAttachments[attachments.id] || "/path-to-placeholder.png"}
                                                                                alt="Image"
                                                                                className="w-24 h-24 mx-auto object-cover rounded-md"
                                                                                style={{ maxWidth: "100%", maxHeight: "100%" }}
                                                                            />
                                                                        ) : (
                                                                            <img
                                                                                src={fileIcon} // Update with actual file icon path
                                                                                alt="File Icon"
                                                                                className="w-24 h-24 mx-auto mb-2"
                                                                            />
                                                                        )}
                                                                    <p className="text-sm overflow-hidden text-ellipsis max-w-full break-words line-clamp-2 m-0">
                                                                        {attachments.fileName ?? "Unknown File"}
                                                                    </p>
                                                                </div>

                                                                // <li key={attachments.id} className="flex items-center">
                                                                //     <svg
                                                                //         xmlns="http://www.w3.org/2000/svg"
                                                                //         className="h-5 w-5 text-blue-500 mr-2"
                                                                //         viewBox="0 0 20 20"
                                                                //         fill="currentColor"
                                                                //     >
                                                                //         <path d="M8 3a5 5 0 00-5 5v6a5 5 0 0010 0V8a3 3 0 10-6 0v6a1 1 0 102 0V8a1 1 0 112 0v6a3 3 0 01-6 0V8a5 5 0 015-5z" />
                                                                //     </svg>
                                                                //     <a
                                                                //         // href={attachments.url}
                                                                //         target="_blank"
                                                                //         rel="noopener noreferrer"
                                                                //         className="text-blue-600 hover:underline truncate"
                                                                //     >
                                                                //         {attachments.fileName}
                                                                //     </a>
                                                                // </li>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                            </div>
                                        </div>
                                    </li>
                                ))
                            ) : (
                                <p className="text-gray-600">No comments available.</p>
                            )}
                        </ul>

                        {/* <ul className="p-0">
                            {commentList && commentList.length > 0 ? (
                                commentList.map((comment) => (
                                    <li key={comment.id} className="mb-2">
                                        <div className="flex items-start">
                                            <div className="flex-shrink-0 mr-4">
                                                <img
                                                    src={userLogo}
                                                    alt="Random"
                                                    className="w-12 h-12 rounded-full"
                                                />
                                            </div>
                                            <div className="flex flex-col">
                                                <div className="flex items-center mb-1">
                                                    <p className="text-gray-800 font-bold mr-4 mb-0">{comment.userFullName}</p>
                                                    <p className="text-gray-600 text-sm mb-0">{comment.createdText}</p>
                                                </div>
                                                <p className="text-gray-700 text-left break-words whitespace-pre-wrap">
                                                    {comment.comment}
                                                </p>
                                            </div>
                                        </div>
                                    </li>
                                ))
                            ) : (
                                <p className="text-gray-600">No comments available.</p>
                            )}
                        </ul> */}

                    </>
                )}
            </div>
        );
    };
    const AssetsView = () => {
        const [isLoading, setIsLoading] = useState(false);
        const [assetList, setAssetList] = useState<Asset[]>([]);
        const [selectedAssetList, setSelectedAssetList] = useState<Asset[]>([]);
        const assetInitial = {
            id: 0,
            code: '',
            name: '',
            branch: '',
            equipment: '',
        };
        const [asset, setAsset] = useState<Asset>(assetInitial);
        const [filteredAssets, setFilteredAssets] = useState<Asset[]>([]);
        const [inputValue, setInputValue] = useState<string>('');

        // Ref for maintaining focus on the input
        const inputRef = useRef<HTMLTextAreaElement | null>(null);
        const FetchAssets = () => {
            setIsLoading(true);
            axiosInstance.get(APIURLS.asset.getAssetTagByTicketId() + selected?.id)
                .then((res) => {
                    setSelectedAssetList(res.data);
                    setIsLoading(false);
                })
                .catch((error) => {
                    setIsLoading(false);
                });

        };

        useEffect(() => {
            FetchAssets();
        }, []);

        const fetchOptionAssets = async (query: string) => {
            setIsLoading(true);
            try {
                const searchTermParam = query != null ? query : ""; // Use query directly

                // // Make the API call
                const response = await axiosInstance.get(`${APIURLS.ticketEng.ticketBase()}GetAssets?searchTerm=${searchTermParam}`);

                // Filter assets based on the search term if necessary
                // const assets: Asset[] = response.data.filter((asset: Asset) =>
                //     asset.name.toLowerCase().includes(query.toLowerCase())
                // );
                const assets: Asset[] = response.data;
                setAssetList(assets);
                setFilteredAssets(assets);

                // Stop loading
                setIsLoading(false);
            } catch (error) {
                setIsLoading(false);
            }
        };

        const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            const value = e.target.value;
            setInputValue(value);

            if (value.trim() !== '') {
                fetchOptionAssets(value); // Fetch assets dynamically based on input
            } else {
                setFilteredAssets([]);
            }
        };

        const handleAssetClick = (selectedAsset: Asset) => {
            setAsset(selectedAsset);
            setInputValue(selectedAsset.code + ' - ' + selectedAsset.name);
            setFilteredAssets([]);
            inputRef.current?.focus();
        };

        const submitInput = () => {
            const isAlreadyAdded = selectedAssetList.some((curasset) => curasset.id === asset.id);
            if (isAlreadyAdded) {
                return;
            }
            setIsLoading(true);
            axiosInstance.post(APIURLS.ticketEng.saveTicketProp() + "userId= " + localStorage.getItem('id') + "&ticketId= " + selected?.id + "&name=ticketAssets&value=" + asset.id)
                .then(
                    (result) => {
                        setSelectedAssetList((prevList) => {
                            const isAlreadyAdded = prevList.some((curasset) => curasset.id === asset.id);
                            if (!isAlreadyAdded) {
                                return [...prevList, asset];
                            }
                            return prevList;
                        });
                        // Reset input and asset
                        setInputValue('');
                        setAsset(assetInitial);
                        setFilteredAssets([]);
                        setIsLoading(false);
                    },
                    (error) => {
                        setIsLoading(false);
                    }
                );

        };

        const handleDeleteAsset = (id: number) => {
            setIsLoading(true);
            axiosInstance.delete(APIURLS.ticketEng.deleteTicketAsset() + id + '/' + selected?.id)
                .then(
                    (result) => {

                        setSelectedAssetList((prevList) => prevList.filter((asset) => asset.id !== id));
                        setIsLoading(false);
                    },
                    (error) => {
                        setIsLoading(false);
                    }
                );
        };

        return (
            <div className="flex flex-col gap-4 mb-4 p-4 bg-white rounded-md shadow-md">
                <div className="flex items-center gap-4">
                    <div className="relative flex-1">
                        <textarea
                            ref={inputRef} // Bind the ref to the input
                            placeholder="Search and select an asset..."
                            className="w-full bg-gray-100 border border-gray-300 rounded-md py-2 px-4 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
                            rows={1}
                            value={inputValue}
                            onChange={handleInputChange}
                        ></textarea>
                        {isLoading && <div className="text-gray-500 text-sm mt-1">Loading assets...</div>}
                        {filteredAssets.length > 0 && (
                            <ul className="absolute top-full left-0 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 z-10 max-h-60 overflow-y-auto">
                                {filteredAssets.map((asset) => (
                                    <li
                                        key={asset.id}
                                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                        onClick={() => handleAssetClick(asset)}
                                    >
                                        {asset.code} - {asset.name}
                                    </li>
                                ))}
                            </ul>
                        )}

                    </div>
                    <button
                        className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        onClick={submitInput}
                        disabled={true}
                    >
                        Submit
                    </button>
                </div>
                <ul className="p-0">
                    {selectedAssetList && selectedAssetList.length > 0 ? (
                        selectedAssetList.map((asset) => (
                            <li key={asset.id} className="mb-2">
                                <div className="flex items-start">
                                    <div className="flex flex-col">
                                        <p className="text-gray-700 text-left break-words whitespace-pre-wrap">
                                            {asset.code} - {asset.name}
                                        </p>
                                    </div>
                                    <button
                                        className="ml-auto bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
                                        onClick={() => handleDeleteAsset(asset.id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </li>
                        ))
                    ) : (
                        <p className="text-gray-600">No assets available.</p>
                    )}
                </ul>

            </div>
        );
    };
    const CatchupView = ({ ticketId }: { ticketId: number }) => {
        const [isLoading, setIsLoading] = useState(false);
        const [catchupList, setCatchupList] = useState<TicketCatchup[]>([]);
        const catchUpInitial = {
            id: 0,
            userId: 0,
            userFullName: '',
            ticketId: ticketId,
            date: new Date(),
            dateText: '',
        };
        const [catchup, setCatchup] = useState<TicketCatchup>(catchUpInitial);

        const FetchAssets = () => {
            setIsLoading(true);
            axiosInstance.get(APIURLS.ticketEng.getTicketCatchup() + selected?.id)
                .then((res) => {
                    setCatchupList(res.data);
                    setIsLoading(false);
                })
                .catch((error) => {
                    setIsLoading(false);
                });
        };

        useEffect(() => {
            FetchAssets();
        }, []);




        return (
            <div className="flex flex-col gap-4 mb-4 p-4 bg-white rounded-md shadow-md">
                <ul className="p-0">
                    {catchupList && catchupList.length > 0 ? (
                        catchupList.map((catchup, index) => (
                            <li key={index} className="mb-4">
                                <div className="flex items-start">
                                    <div className="flex-shrink-0 mr-4">
                                        <img
                                            src={userLogo}
                                            alt="Random"
                                            className="w-12 h-12 rounded-full"
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <div className="flex items-center mb-1">
                                            {/* <p className="text-gray-800 font-bold mr-4 mb-0">
                                                        {history.userFullName}
                                                    </p> */}
                                            <p className="text-gray-600 text-sm mb-0">
                                                {new Date(catchup.dateText).toLocaleString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                    hour: 'numeric',
                                                    minute: 'numeric',
                                                    hour12: true,
                                                })}
                                            </p>
                                        </div>
                                        <p className="text-gray-700 text-left break-words whitespace-pre-wrap">
                                            <b>{catchup.userFullName} </b>
                                        </p>
                                    </div>
                                </div>

                            </li>
                        ))
                    ) : (
                        <p className="text-gray-600">No catchup available.</p>
                    )}
                </ul>


            </div>
        );
    };

    const HistoryView = () => {
        const [isLoading, setIsLoading] = useState(false);
        const [historyList, setHistoryList] = useState<History[]>();

        const FetchHistory = () => {
            setIsLoading(true);
            axiosInstance.get(APIURLS.ticketEng.getTicketHistoriesById() + selected?.id)
                .then((res) => {
                    setHistoryList(res.data);
                    setIsLoading(false);
                })
                .catch((error) => {
                    setIsLoading(false);
                });
        };

        useEffect(() => {
            FetchHistory();
        }, []);

        return (
            <div className="bg-gray-200 p-4 rounded-md">
                <h3 className="text-lg font-semibold mb-4 text-left">History</h3>

                {isLoading ? (
                    <div className="text-center">
                        <p className="text-gray-600">Loading history...</p>
                    </div>
                ) : (
                    <ul className="p-0">
                        {historyList && historyList.length > 0 ? (
                            historyList.map((history, index) => (
                                <li key={index} className="mb-4">
                                    {index === 0 ? (
                                        <div className="flex items-start">
                                            <div className="flex-shrink-0 mr-4">
                                                <img
                                                    src={userLogo}
                                                    alt="Random"
                                                    className="w-12 h-12 rounded-full"
                                                />
                                            </div>
                                            <div className="flex flex-col">
                                                <div className="flex items-center mb-1">
                                                    {/* <p className="text-gray-800 font-bold mr-4 mb-0">
                                                        {history.userFullName}
                                                    </p> */}
                                                    <p className="text-gray-600 text-sm mb-0">
                                                        {new Date(history.createdText).toLocaleString('en-US', {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric',
                                                            hour: 'numeric',
                                                            minute: 'numeric',
                                                            hour12: true,
                                                        })}
                                                    </p>
                                                </div>
                                                <p className="text-gray-700 text-left break-words whitespace-pre-wrap">
                                                    <b>{history.userFullName} </b> created this ticket.
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        // <div style={{ marginBottom: '6px', fontSize: '3vw', fontWeight: "bold" }}>  {getUser(item.userId)} <span style={{ fontWeight: "normal" }}>changed the</span> {item.propName} </div>

                                        <div className="flex items-start">
                                            <div className="flex-shrink-0 mr-4">
                                                <img
                                                    src={userLogo}
                                                    alt="Random"
                                                    className="w-12 h-12 rounded-full"
                                                />
                                            </div>
                                            <div className="flex flex-col">
                                                <div className="flex items-center mb-1">
                                                    {/* <p className="text-gray-800 font-bold mr-4 mb-0">
                                                        {history.userFullName}
                                                    </p> */}
                                                    <p className="text-gray-600 text-sm mb-0">
                                                        {new Date(history.createdText).toLocaleString('en-US', {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric',
                                                            hour: 'numeric',
                                                            minute: 'numeric',
                                                            hour12: true,
                                                        })}
                                                    </p>
                                                </div>

                                                <p className="text-gray-700 text-left break-words whitespace-pre-wrap">
                                                    <b>{history.userFullName} </b> changed the <b>{history.propName} </b>
                                                </p>

                                                <p className="text-gray-700 text-left break-words m-0">
                                                    {history.oldData}
                                                </p>
                                                <p className="text-gray-700 text-left break-words m-0">
                                                    <b>&rarr;</b>
                                                </p>
                                                <p className="text-gray-700 text-left break-words m-0">
                                                    {history.newData}
                                                </p>

                                            </div>
                                        </div>
                                    )}
                                </li>
                            ))
                        ) : (
                            <p className="text-gray-600">No history available.</p>
                        )}
                    </ul>

                )}
            </div>
        );

    };

    const RelatedIssuesView = ({ ticketId }: { ticketId: number }) => {
        const [isLoading, setIsLoading] = useState(false);
        const [relatedList, setRelatedList] = useState<RelatedIssues[]>();
        const relatedInitial = {
            ticketId: ticketId,
            linkTicketNumber: '',
        };
        const [related, setRelated] = useState<RelatedIssues>(relatedInitial);

        const FetchRelatedIssues = () => {
            setIsLoading(true);
            axiosInstance
                .get(APIURLS.ticketEng.getTicketRelatedIssuesById()+ selected?.id)
                .then((res) => {
                    const rawData = res.data;
                    if (rawData.length > 0) {
                        if (typeof rawData === 'string') {
                            // Split the string by ".,."
                            const links = rawData.split(".,.");

                            const processedList: RelatedIssues[] = links.map((link, index) => {
                                const lastSevenChars = link.slice(-7); // Get last 7 characters
                                return {
                                    ticketId: ticketId,
                                    linkTicketNumber: window.location.origin + "/ticketview/" + lastSevenChars,
                                };
                            });

                            setRelatedList(processedList);
                        } else {
                        }
                    }
                    setIsLoading(false);
                })
                .catch((error) => {
                    setIsLoading(false);
                });
        };
        useEffect(() => {
            FetchRelatedIssues();
        }, []);

        const WriteComment = (e: any) => {
            setRelated((related) => ({
                ...related,
                linkTicketNumber: e.target.value
            }));
        };

        const handleSubmit = () => {
            if (isLoading) {
                return;
            }
            setIsLoading(true);

            const AddPromise = axiosInstance.post(APIURLS.ticketEng.saveTicketLink(), related)
                .then(res => {
                    const cleanedLink = related.linkTicketNumber.trim().replace(/\s+/g, '').toUpperCase();

                    // Remove window.location.origin if it exists
                    const sanitizedLink = cleanedLink.replace(new RegExp(`^${window.location.origin}`, 'i'), '').replace(/^\/+/, ''); // Remove leading slashes

                    const linkTicketNumber = `${window.location.origin}/${sanitizedLink}`;

                    const relatedData = {
                        ticketId: ticketId,
                        linkTicketNumber: linkTicketNumber
                    };

                    setRelatedList(prevList => [...(prevList ?? []), relatedData]);
                    setRelated(relatedInitial);
                    return res;
                })
                .catch(error => {
                    throw error; // Re-throw the error so `toast.promise` can handle it
                })
                .finally(() => {
                    setIsLoading(false);
                });


            toast.promise(
                AddPromise,
                {
                    pending: "Adding Related Issues...",
                    success: "Related Issues Added!",
                    error: "Error Saving Related Issues!"
                },
                {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    theme: "light"
                }
            );
        };


        return (
            <div className="bg-gray-200 p-4 rounded-md">
                <h3 className="text-lg font-semibold mb-4 text-left">Related Issues</h3>

                {isLoading ? (
                    <div className="text-center">
                        <p className="text-gray-600">Loading related issues...</p>
                    </div>
                ) : (
                    <>
                        <div className="flex flex-col gap-4 mb-4 p-4 bg-white rounded-md shadow-md">
                            <div className="flex items-center gap-4">
                                <img
                                    src={userLogo}
                                    alt="User Avatar"
                                    className="w-12 h-12 rounded-full"
                                />
                                <textarea
                                    placeholder="Add a related issue..."
                                    className="flex-1 bg-gray-100 border border-gray-300 rounded-md py-2 px-4 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    rows={1}
                                    value={related?.linkTicketNumber}
                                    onChange={(e) => WriteComment(e)}
                                ></textarea>
                                <button
                                    onClick={handleSubmit}
                                    className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                disabled={true}
                                >
                                    Submit
                                </button>
                            </div>

                        </div>


                        <ul className="p-0">
                            {relatedList && relatedList.length > 0 ? (
                                relatedList.map((related) => (
                                    <li className="mb-2">
                                        <div className="flex items-start">
                                            <div className="flex-shrink-0 mr-4">
                                                {/* <img
                                                    src={userLogo}
                                                    alt="Random"
                                                    className="w-12 h-12 rounded-full"
                                                /> */}
                                            </div>
                                            <div className="flex flex-col">
                                                <div className="flex items-center mb-1">
                                                    <a href={related.linkTicketNumber} target="_blank">{related.linkTicketNumber}</a>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                ))
                            ) : (
                                <p className="text-gray-600">No related issues available.</p>
                            )}
                        </ul>
                    </>
                )}

                <ToastContainer
                    position="top-right"
                    autoClose={5000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="light"
                />
            </div>
        );
    };


    const getStatusColor = (status: number) => {
        switch (status) {
            case 1:
                return 'bg-yellow-400 text-yellow-900 font-bold';
            case 2:
                return 'bg-red-400 text-red-900 font-bold';
            case 3:
                return 'bg-blue-400 text-blue-900 font-bold';
            case 0:
                return 'bg-green-400 text-green-900 font-bold';
            default:
                return 'bg-yellow-400 text-yellow-900 font-bold';
        }
        // switch (status) {
        //     case 1:
        //         return 'bg-yellow-400 text-yellow-900 font-bold';
        //     case 3:
        //         return 'bg-blue-400 text-blue-900 font-bold';
        //     case 0:
        //         return 'bg-green-400 text-green-900 font-bold';
        //     default:
        //         return 'bg-yellow-400 text-yellow-900 font-bold';
        // }
    };

    const [selectBgColor, setSelectBgColor] = useState('bg-yellow-400');

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {

        if (e.target.value === '0') {
            setResolution('');
            setShowResolution(true);
            return;
        }
        if (selected) {
            setSelected({ ...selected, status: Number(e.target.value) });
            setSelectBgColor(getStatusColor(Number(e.target.value)));
            saveTicketProp('status', e.target.value);
        }
    };

    const [resolution, setResolution] = useState('');

    const UpdateTicket = () => {
        if (!selected) return; // Ensure `selected` is not null or undefined

        // Safely parse `localStorage` value
        const currentUserId = parseInt(localStorage.getItem("id") || '0', 10);
        if (isNaN(currentUserId)) {
            return;
        }


        const ticketToSave = selected;
        ticketToSave.currentUserId = currentUserId;
        ticketToSave.oldStatus = selected.status;
        ticketToSave.status = 0;
        ticketToSave.resolution = resolution;
        ticketToSave.ticketAssetsString = '';

        setIsLoading(true);

        axiosInstance.post(APIURLS.ticketEng.updateTicket(), ticketToSave)
            .then(
                (result) => {

                    setSelected((prevSelected) => {
                        if (!prevSelected) return null;

                        return {
                            ...prevSelected,
                            currentUserId: currentUserId,
                            status: 0,
                        };
                    });

                    setSelectBgColor(getStatusColor(0)); // Update background color
                    setShowResolution(false); // Hide resolution modal
                    setIsLoading(false); // Stop loading
                },
                (error) => {
                    // Handle error
                    setIsLoading(false);
                }
            );
    };

    const formatTimeDifference = (from: string, to: string) => {
        const currentDate = new Date(from);
        const creationDate = new Date(to);


        const timeDifference = currentDate.getTime() - creationDate.getTime();

        const seconds = Math.floor(timeDifference / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) {
            return `${days}d ${hours % 24}h ${minutes % 60}m ago`;
        } else if (hours > 0) {
            return `${hours}h ${minutes % 60}m ago`;
        } else {
            return `${minutes}m ago`;
        }
    };


    const fetchAttachmentContent = async (id: number) => {
        try {
            const res = await axiosInstance.get(APIURLS.ticketEng.getAttachmentById() + id);
            return res.data; // Assuming content is in base64 format
        } catch (error) {
            return null;
        }
    };

    const handleLazyLoad = async (attachment: Attachment) => {
        // Check if the attachment is already loaded
        if (loadedAttachments[attachment.id]) return;

        try {
            // Fetch content of the attachment
            const fileData = await fetchAttachmentContent(attachment.id);
            if (fileData) {
                if (attachment.contentType.startsWith('video/')) {
                    const videoUrl = `data:${fileData.contentType};base64,${fileData.content}`;

                    setLoadedAttachments((prev) => ({
                        ...prev,
                        [attachment.id]: videoUrl
                    }));
                }
                else if (attachment.contentType.startsWith('image/')) {
                    const imageUrl = `data:${fileData.contentType};base64,${fileData.content}`;

                    // Set the image URL in the state (for the img tag)
                    setLoadedAttachments((prev) => ({
                        ...prev,
                        [attachment.id]: imageUrl
                    }));
                } else {
                    // Handle other content types (e.g., video, file) if needed
                    // You can use a similar approach to handle videos or other files if necessary
                    // const fileUrl = URL.createObjectURL(new Blob([new Uint8Array(fileData.content)], { type: fileData.contentType }));

                    const blob = new Blob([Uint8Array.from(atob(fileData.content), c => c.charCodeAt(0))], { type: fileData.contentType });
                    const fileUrl = URL.createObjectURL(blob);

                    setLoadedAttachments((prev) => ({
                        ...prev,
                        [attachment.id]: fileUrl
                    }));
                }
            }
        } catch (error) {
        }

    };

    // useEffect hook to load attachments when selected changes
    useEffect(() => {
        setIsLoading(true);

        if (selected) {
            setSelectBgColor(getStatusColor(selected.status));
            axiosInstance
                .get(APIURLS.ticketEng.getTicketAttachmentById() + selected.id)
                .then((res) => res.data)
                .then(
                    async (result: Attachment[]) => {
                        setAttachments(result);

                        // Process each attachment lazily - Gather promises first
                        const promises = result
                            .filter((attachment) => !loadedAttachments[attachment.id]) // Only process if not loaded
                            .map(async (attachment: Attachment) => {
                                await handleLazyLoad(attachment);
                            });

                        // Await all promises
                        await Promise.all(promises);

                        // Once all are loaded, set loading to false
                        setIsLoading(false);
                    },
                    (error) => {
                        setIsLoading(false);
                    }
                );
        }
    }, [selected]);


    const [isGalleryOpen, setIsGalleryOpen] = useState(false);
    const [currentIndex, setCurrentIndex] = useState<number>(0);

    const handleImageClick = (index: number) => {
        setCurrentIndex(index);
        setIsGalleryOpen(true);
    };

    const handleCloseModal = () => {
        setIsGalleryOpen(false);
    };

    const handlePrev = () => {
        setCurrentIndex((prevIndex) => (prevIndex - 1 + attachments.length) % attachments.length);
    };

    const handleNext = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % attachments.length);
    };

    const handleSelectImage = (index: number) => {
        setCurrentIndex(index);
    };


    const saveTicketProp = (name: string, value: string) => {

        setIsLoading(true);
        axiosInstance.post(APIURLS.ticketEng.saveTicketProp() + "userId= " + localStorage.getItem('id') + "&ticketId= " + selected?.id + "&name=" + name + "&value=" + encodeURIComponent(value))
            .then(
                (result) => {
                    setIsLoading(false);
                },
                (error) => {
                    setIsLoading(false);
                }
            );
    };

    const onChangeDueDate = (e: string | Date) => {
        if (isLoading) {
            return;
        }

        const newDate = typeof e === "string" ? new Date(e) : e;

        if (isNaN(newDate.getTime())) {
            return;
        }

        setSelected((prevSelected) => {
            if (!prevSelected) {
                return prevSelected;
            }

            return {
                ...prevSelected,
                dueDate: newDate,
            };
        });

        saveTicketProp("dueDate", newDate.toString()); // Pass the Date object directly
    };

    const onChangePriority = (e: any) => {
        if (isLoading) {
            return;
        }
        setSelected((prevSelected) => {
            if (!prevSelected) {
                return prevSelected;
            }

            return {
                ...prevSelected,
                priority: Number(e.target.value),
            };
        });

        saveTicketProp('priority', e.target.value);

    };

    const onChangeDepartmentBase = (e: any) => {
        if (isLoading) {
            return;
        }
        setSelected((prevSelected) => {
            if (!prevSelected) {
                return prevSelected;
            }

            return {
                ...prevSelected,
                departmentBase: Number(e.target.value),
            };
        });

        saveTicketProp('departmentBase', e.target.value);
    };
    const onChangeBranch = (e: any) => {
        if (isLoading) {
            return;
        }
        setSelected((prevSelected) => {
            if (!prevSelected) {
                return prevSelected;
            }

            return {
                ...prevSelected,
                branchId: Number(e.target.value),
            };
        });

        saveTicketProp('branchId', e.target.value);

    };
    const onChangeAssignee = (e: any) => {
        if (isLoading) {
            return;
        }
        setSelected((prevSelected) => {
            if (!prevSelected) {
                return prevSelected;
            }

            return {
                ...prevSelected,
                assigneeId: Number(e.target.value),
            };
        });

        saveTicketProp('assigneeId', e.target.value);

    };
    const onChangeTitle = (e: any) => {
        if (isLoading) {
            return;
        }

        setSelected((prevSelected) => {
            if (!prevSelected) {
                return prevSelected;
            }

            return {
                ...prevSelected,
                documentTypeId: Number(e.target.value),
            };
        });


        saveTicketProp('documentTypeId', e.target.value);

    };
    const onBlurDescription = (e: any) => {
        if (selected !== null)
            saveTicketProp('description', selected.description);
    };
    const onBlurTitle = (e: any) => {
        if (selected !== null)
            saveTicketProp('title', selected.title);
    };
    const onChangeStatus = (e: any) => {
        if (isLoading) {
            return;
        }

        setSelected((prevSelected) => {
            if (!prevSelected) {
                return prevSelected;
            }

            return {
                ...prevSelected,
                status: Number(e.target.value),
            };
        });


        saveTicketProp('status', e.target.value);

    };


    return (
        // <div className={`fixed top-0 left-0 h-full w-full md:w-[80%] bg-white border border-gray-300 shadow-lg z-50 transform transition-transform duration-1000 ${selectedTicket ? 'translate-x-0' : '-translate-x-full'} p-4`}>
        <div ref={dropdownRef} className="h-full w-full flex flex-col">

            {/* 10% Height */}
            <div className="h-[10%] bg-slate-300">
                <div className="flex items-center justify-between p-4 h-full">
                    <div className="flex items-center">
                        <h2 className="text-3xl font-bold">
                            Ticket No. <span className="text-blue-500">{selected?.ticketNumber}</span>
                            {/* <CopyButton text={selected?.ticketNumber} /> */}
                        </h2>

                        <div className="ml-4">
                            {/* <StarRating
                                    value={selectedTicket ? selectedTicket.starRate : 0}
                                    onChange={handleRatingChange}
                                    ticketuserId={selectedTicket ? selectedTicket.id : 0}
                                /> */}
                        </div>
                    </div>
                    {!isTicketView ?
                        <button onClick={() => handleClose()} className="text-gray-600 hover:text-gray-800 bg-transparent">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button> : null}

                </div>
            </div>

            {/* 90% Height */}
            <div className="h-[90%] flex flex-row">

                {/* 70% Width */}
                <div className="w-3/4 p-4 overflow-y-auto">

                    <div className="mb-4">
                        <p className="text-gray-700 font-semibold text-left">Title:</p>
                        <input type="text"
                            className="w-full bg-gray-100 border border-gray-300 rounded-md py-1 px-3"
                            value={selected ? selected.title : ''}
                            onChange={(e) => {
                                if (selected) {
                                    setSelected({ ...selected, title: e.target.value });
                                }
                            }}
                            onBlur={onBlurTitle}
                            disabled={true}
                        />
                    </div>

                    <div className="mb-4">
                        <p className="text-gray-700 font-semibold text-left">Description:</p>
                        <textarea
                            className="w-full bg-gray-100 border border-gray-300 rounded-md py-2 px-3 resize-none focus:outline-none focus:bg-white"
                            placeholder="Description"
                            value={selected ? selected.description : ''}
                            onChange={(e) => {
                                if (selected) {
                                    setSelected({ ...selected, description: e.target.value });
                                }
                            }}

                            onBlur={onBlurDescription}
                            rows={Math.max(6, selected ? selected.description.split('\n').length + 1 : 3)}
                            disabled={true}
                        />
                    </div>

                    <div>
                        {/* Grid for thumbnails */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
                            {attachments.length > 0 ? (
                                attachments
                                    .filter((attachment) => !attachment.isDeleted)
                                    .map((attachment, index) => (
                                        <div
                                            key={attachment.id}
                                            className="p-2 rounded-md text-center relative p-6 cursor-pointer"
                                            onClick={() => handleImageClick(index)} // Open modal on image click
                                        >
                                            {/* Check for video content type */}
                                            {attachment.contentType.startsWith("video/") ? (
                                                <img
                                                    src={videoIcon}
                                                    alt="File Icon"
                                                    className="w-24 h-24 mx-auto mb-2"
                                                />
                                            ) : attachment.contentType.startsWith("image/") ? (
                                                // Check for image content type
                                                loadedAttachments[attachment.id] ? (
                                                    <img
                                                        src={loadedAttachments[attachment.id]}
                                                        alt="Image"
                                                        className="w-24 h-24 mx-auto object-cover rounded-md"
                                                        style={{ maxWidth: "100%", maxHeight: "100%" }}
                                                    />
                                                ) : (
                                                    <img
                                                        src={fileIcon} // Show file icon if image is not loaded
                                                        alt="File Icon"
                                                        className="w-24 h-24 mx-auto mb-2"
                                                    />
                                                )
                                            ) : (
                                                // Fallback for other file types
                                                <img
                                                    src={fileIcon} // Update with actual file icon path
                                                    alt="File Icon"
                                                    className="w-24 h-24 mx-auto mb-2"
                                                />
                                            )}
                                            <p className="text-sm overflow-hidden text-ellipsis max-w-full break-words line-clamp-2 m-0">
                                                {attachment.fileName ?? "Unknown File"}
                                            </p>
                                        </div>
                                    ))
                            ) : (
                                <p>No attachments found.</p>
                            )}
                        </div>



                        {/* <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
                            {attachments.length > 0 ? (
                                attachments
                                    .filter((attachment) => !attachment.isDeleted)
                                    .map((attachment, index) => (
                                        <div
                                            key={attachment.id}
                                            className="p-2 rounded-md text-center relative p-6 cursor-pointer"
                                            onClick={() => handleImageClick(index)} 
                                        >
                                            {attachment.contentType.startsWith("image/") ? (
                                                <img
                                                    src={loadedAttachments[attachment.id] || "/path-to-placeholder.png"}
                                                    alt="Image"
                                                    className="w-24 h-24 mx-auto object-cover rounded-md"
                                                    style={{ maxWidth: "100%", maxHeight: "100%" }}
                                                />
                                            ) : (
                                                <img
                                                    src={fileIcon} 
                                                    alt="File Icon"
                                                    className="w-24 h-24 mx-auto mb-2"
                                                />
                                            )}
                                            <p className="text-sm overflow-hidden text-ellipsis max-w-full break-words line-clamp-2 m-0">
                                                {attachment.fileName ?? "Unknown File"}
                                            </p>
                                        </div>
                                    ))
                            ) : (
                                <p>No attachments found.</p>
                            )}
                        </div> */}

                        {/* Carousel Modal */}
                        {isGalleryOpen && (
                            <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
                                <div className="relative bg-white p-6 rounded-lg shadow-lg max-w-4xl w-full">
                                    {/* Close Button */}
                                    <button
                                        className="absolute top-4 right-4 text-black text-3xl"
                                        onClick={handleCloseModal}
                                    >
                                        &times;
                                    </button>

                                    {/* Image/ File Content */}
                                    <div className="flex flex-col items-center">
                                        {/* Carousel Navigation */}


                                        {/* Image or file content */}
                                        {attachments[currentIndex].contentType.startsWith("video/") ? (
                                            <div className="text-center">
                                                <video
                                                    controls
                                                    className="w-full h-[400px] object-contain max-h-screen"
                                                >
                                                    <source
                                                        src={`${loadedAttachments[attachments[currentIndex].id]}`}
                                                        type={attachments[currentIndex].contentType}
                                                    />
                                                    Your browser does not support the video tag.
                                                </video>
                                                <p className="text-sm text-gray-600">
                                                    {attachments[currentIndex].fileName}
                                                </p>

                                                <a
                                                    href={loadedAttachments[attachments[currentIndex].id]}
                                                    download={attachments[currentIndex].fileName}
                                                    className="text-blue-500 mt-4 inline-block"
                                                >
                                                    Download
                                                </a>
                                            </div>
                                        ) :
                                            attachments[currentIndex].contentType.startsWith("image/") ? (
                                                <div className="text-center">
                                                    <img
                                                        src={loadedAttachments[attachments[currentIndex].id] || "/path-to-placeholder.png"}
                                                        alt="Fullscreen Image"
                                                        className="w-full h-[400px] object-contain max-h-screen"
                                                    />
                                                    <p className="text-sm text-gray-600">
                                                        {attachments[currentIndex].fileName}
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="text-center">
                                                    <img
                                                        src={fileIcon} // Your file icon for non-image files
                                                        alt="File Icon"
                                                        className="w-20 h-20 mx-auto mb-4 w-full h-[400px]"
                                                    />
                                                    <p className="text-sm text-gray-600">
                                                        {attachments[currentIndex].fileName}
                                                    </p>

                                                    <a
                                                        href={loadedAttachments[attachments[currentIndex].id]}
                                                        download={attachments[currentIndex].fileName}
                                                        className="text-blue-500 mt-4 inline-block"
                                                    >
                                                        Download
                                                    </a>
                                                </div>
                                            )}
                                        <div className="flex justify-between items-center w-full mb-4">
                                            <button
                                                className="text-black text-2xl"
                                                onClick={handlePrev}
                                                disabled={attachments.length <= 1}
                                            >
                                                &lt; Prev
                                            </button>
                                            <span className="text-black">
                                                {currentIndex + 1} / {attachments.length}
                                            </span>
                                            <button
                                                className="text-black text-2xl"
                                                onClick={handleNext}
                                                disabled={attachments.length <= 1}
                                            >
                                                Next &gt;
                                            </button>
                                        </div>
                                    </div>

                                    {/* Thumbnails for image selection */}
                                    <div className="mt-4 flex justify-center space-x-2 overflow-x-auto">
                                        {attachments.map((attachment, index) => (
                                            <div
                                                key={attachment.id}
                                                className={`cursor-pointer ${index === currentIndex ? "border-2 border-blue-500" : ""
                                                    }`}
                                                onClick={() => handleSelectImage(index)}
                                            >
                                                {attachment.contentType.startsWith("image/") ? (
                                                    loadedAttachments[attachment.id] ? (
                                                        <img
                                                            src={loadedAttachments[attachment.id]}
                                                            alt="Image"
                                                            className="w-24 h-24 mx-auto object-cover rounded-md"
                                                            style={{ maxWidth: "100%", maxHeight: "100%" }}
                                                        />
                                                    ) : (
                                                        <img
                                                            src={fileIcon} // Show file icon if image is not loaded
                                                            alt="File Icon"
                                                            className="w-24 h-24 mx-auto mb-2"
                                                        />
                                                    )
                                                ) : (
                                                    <img
                                                        src={fileIcon}
                                                        alt="File Icon"
                                                        className="w-16 h-16 object-cover rounded-md"
                                                    />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>


                    <nav className="mb-4 flex bg-gray-200 rounded-md">
                        <button
                            className={`mr-4 px-3 py-1 rounded-md ${activeView === 'Comments' ? 'bg-blue-500 text-white' : 'hover:bg-blue-300'}`}
                            onClick={() => handleViewChange('Comments')}
                        >
                            Comments
                        </button>
                        <button
                            className={`mr-4 px-3 py-1 rounded-md ${activeView === 'History' ? 'bg-blue-500 text-white' : 'hover:bg-blue-300'}`}
                            onClick={() => handleViewChange('History')}
                        >
                            History
                        </button>
                        <button
                            className={`mr-4 px-3 py-1 rounded-md ${activeView === 'Related Issues' ? 'bg-blue-500 text-white' : 'hover:bg-blue-300'}`}
                            onClick={() => handleViewChange('Related Issues')}
                        >
                            Related Issues
                        </button>
                        <button
                            className={`mr-4 px-3 py-1 rounded-md ${activeView === ' Assets' ? 'bg-blue-500 text-white' : 'hover:bg-blue-300'}`}
                            onClick={() => handleViewChange('Assets')}
                        >
                            Assets
                        </button>
                        <button
                            className={`mr-4 px-3 py-1 rounded-md ${activeView === ' Catch Up' ? 'bg-blue-500 text-white' : 'hover:bg-blue-300'}`}
                            onClick={() => handleViewChange('Catch Up')}
                        >
                            Catch Up's
                        </button>
                    </nav>
                    <div>{activeView === 'Comments' && <CommentsView
                        _attachments={attachments}
                        _loadedAttachments={loadedAttachments}
                        onAttachmentsChange={handleAttachmentsChange}
                        onLoadedAttachmentsChange={handleLoadedAttachmentsChange}
                        _users={users}
                    />}
                        {activeView === 'History' && <HistoryView />}
                        {activeView === 'Related Issues' && <RelatedIssuesView ticketId={selected?.id ?? 0} />}
                        {activeView === 'Assets' && <AssetsView />}
                        {activeView === 'Catch Up' && <CatchupView ticketId={selected?.id ?? 0} />}
                    </div>
                    {/* {renderPlaceholder()} */}
                </div>


                {/* 30% Width */}
                <div className="w-1/4 p-2 flex flex flex-col">

                    <div className="pt-2 mb-2">
                        <select
                            className={`w-full rounded-md py-3 px-3 text-center appearance-none text-white text-xl font-extrabold ${selectBgColor}`}
                            value={selected ? selected.status : ''}
                            onChange={handleSelectChange}
                            disabled={true}
                        >
                            <option value={1} className={getStatusColor(1)}>OPEN</option>
                            <option value={2} className={getStatusColor(2)}>ON HOLD</option>
                            <option value={3} className={getStatusColor(3)}>IN PROGRESS</option>
                            <option value={0} className={getStatusColor(0)}>DONE</option>
                        </select>
                    </div>

                    {/* <div className="border-2 border-gray-400">
                        <div className="p-2">
                            <p className="text-gray-600 font-extrabold text-left">Details:</p>
                        </div>
                    </div> */}

                    <div className="border-gray-400 overflow-y-auto p-2">

                        <div className="mt-4">
                            <p className="text-gray-700 font-bold text-left mb-0">Date Filed:</p>
                            <p className="text-gray-700 font-semibold">
                                {selected?.calledIn
                                    ? new Intl.DateTimeFormat('en-US', {
                                        year: 'numeric',
                                        month: '2-digit',
                                        day: '2-digit',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        hour12: true,
                                    }).format(new Date(selected.calledIn))
                                    : ''}
                            </p>
                        </div>

                        <div className="mt-4">
                            <p className="text-gray-700 font-bold text-left mb-0">Duration:</p>
                            <p className="text-gray-700 font-semibold">
                                {selected?.calledIn && selected?.timeStamp
                                    ? selected?.status === 0
                                        ? formatTimeDifference(selected.timeStamp.toString(), selected.calledIn.toString())
                                        : formatTimeDifference(new Date().toString(), selected.calledIn.toString())
                                    : 'N/A'}
                            </p>

                        </div>

                        <div className="mt-4">
                            <p className="text-gray-700 font-bold text-left mb-0">Due Date:</p>
                            <Datetime
                                className="w-full bg-gray-200 font-semibold border border-gray-300 rounded-md appearance-none text-center"
                                value={
                                    selected?.dueDate
                                        ? new Date(selected.dueDate) // Ensure `dueDate` is handled as a Date object
                                        : ''
                                }
                                onChange={(date: any) => {
                                    if (date && date._isValid !== false) {
                                        onChangeDueDate(date.toDate ? date.toDate() : date);
                                    }
                                }}
                                closeOnSelect={true}
                                dateFormat="MM/DD/YYYY"
                                timeFormat={false}
                                inputProps={{
                                    placeholder: selected?.dueDate ? '' : 'Please select due date...',
                                    className:
                                        'text-gray-700 font-semibold bg-transparent border-none text-center w-100 py-1 px-3 rounded-md',
                                    style: {
                                        boxShadow: 'none',
                                    },
                                    disabled: !(userRole === '0' || userRole === '50'),
                                }}
                            />
                        </div>

                        <div className="mt-4">
                            <p className="text-gray-700 font-bold text-left mb-0">Priority:</p>
                            <select
                                className="w-full bg-gray-200 font-semibold border border-gray-300 rounded-md py-1 px-3 appearance-none text-center"
                                value={selected ? selected.priority : ''}
                                // onChange={(e) => {
                                //     if (selected) {
                                //         setSelected({ ...selected, priority: Number(e.target.value) });
                                //     }
                                // }}
                                onChange={onChangePriority}
                                disabled={true}
                            >
                                <option value={1}>Low</option>
                                <option value={2}>Medium</option>
                                <option value={3}>High</option>
                                <option value={4}>Critical</option>
                            </select>
                        </div>

                        <div className="mt-4">
                            <p className="text-gray-700 font-bold text-left mb-0">Branch:</p>
                            <select
                                className="w-full bg-gray-200 font-semibold border border-gray-300 rounded-md py-1 px-3 appearance-none text-center"
                                value={0}
                                // onChange={(e) => {
                                //     if (selected) {
                                //         setSelected({ ...selected, status: Number(e.target.value) });
                                //     }
                                // }}
                                onChange={onChangeBranch}
                                disabled={true}
                            >

                                <option key={0} value={0}>{selected?.branchName}</option>
                            

                            </select>
                        </div>

                        <div className="mt-4">
                            <p className="text-gray-700 font-bold text-left mb-0">Department:</p>
                            <select
                                className="w-full bg-gray-200 font-semibold border border-gray-300 rounded-md py-1 px-3 appearance-none text-center"
                                value={2}
                                // onChange={(e) => {
                                //     if (selected) {
                                //         setSelected({ ...selected, priority: Number(e.target.value) });
                                //     }
                                // }}
                                onChange={onChangeDepartmentBase}
                                disabled={true}
                            >
                                <option value={0}>ALL</option>
                                <option value={1}>IS</option>
                                <option value={2}>ENGINEERING</option>
                                <option value={3}>CCTV</option>
                            </select>
                        </div>


                        <div className="mt-4">
                            <p className="text-gray-700 font-bold text-left mb-0">Assignee:</p>
                            <select
                                className="w-full bg-gray-200 font-semibold border border-gray-300 rounded-md py-1 px-3 appearance-none text-center"
                                value={0}

                                disabled={true}
                            >
                                <option key={0} value={0}>{selected?.assigneeText}</option>
                                
                            </select>
                        </div>

                        <div className="mt-4">
                            <p className="text-gray-700 font-bold text-left mb-0">Reporter:</p>
                            <select
                                disabled
                                className="w-full bg-gray-200 font-semibold border border-gray-300 rounded-md py-1 px-3 appearance-none text-center"
                                value={0}
                                  >
                                <option key={0} value={0}>{selected?.reporterText}</option>
                            
                            </select>
                        </div>
                        <div className="mt-4">
                            {<AltchaCaptcha onCaptchaComplete={handleCaptchaComplete} ticketId={selected?.id} />}
                        </div>

                        {/* <div className="mt-12">
                            <button className="w-full bg-blue-300 font-bold text-xl border border-blue-300 rounded-md py-4 px-4 appearance-none text-center">Catch Up</button>
                        </div> */}

                        {/* <div className="flex justify-center mt-2">
                            <StarRating
                                value={selected ? selected.starRate : 0}
                                onChange={handleRatingChange}
                                ticketuserId={selected ? selected.id : 0}
                            />
                        </div>
                        <div className="flex justify-center mt-2">
                            <QRCode
                                value={window.location.origin + "/ticketview/" + selected?.ticketNumber}
                                size={160}
                                bgColor="#ffffff"
                                fgColor="#000000"
                                level="Q"
                            />
                        </div> */}


                    </div>


                </div>
                {ShowResolution && (
                    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
                        <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                            <h2 className="text-xl font-bold mb-4">Add Resolution</h2>
                            <textarea
                                className="w-full p-2 border rounded mb-4"
                                rows={6}
                                value={resolution || ''}
                                onChange={(e) => setResolution(e.target.value)}
                                placeholder="Enter your resolution here..."
                            />
                            <div className="flex justify-end gap-2">
                                <button
                                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                                    onClick={() => setShowResolution(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                                    onClick={UpdateTicket}
                                    disabled={true}
                                >
                                    Submit
                                </button>
                            </div>
                        </div>
                    </div>
                )}


            </div>

            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />
        </div>
        // </div>
    );
};

export default TicketDetail;
