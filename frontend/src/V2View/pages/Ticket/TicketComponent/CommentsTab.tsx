import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import MentionInput from "../../../../components/MentionInput";
import userLogo from "../../../../img/user.png";
import videoIcon from "../../../../img/video.png";
import fileIcon from "../../../../img/file.png";
import { APIURLS } from "../../../../APIURLS";

interface Attachment {
  id: number;
  fileName: string;
  contentType: string;
  content: any;
}

interface Comment {
  id: number;
  comment: string;
  created: Date;
  createdText: string;
  userFullName: string;
  ticketAttachments: Attachment[];
}

interface User {
  id: number;
  fullName: string;
}

interface CommentsViewProps {
  ticketId: number | undefined;
  _attachments: Attachment[];
  _loadedAttachments: Record<number, string>;
  onAttachmentsChange?: (attachments: Attachment[]) => void;
  onLoadedAttachmentsChange?: (
    loadedAttachments: Record<number, string>
  ) => void;
  _users: User[];
  onOpenAttachment?: (index: number) => void;
  onImageOpen?: (index: number) => void;
  setLoadedAttachments?: React.Dispatch<React.SetStateAction<Record<number, string>>>;
}

const CommentsTab: React.FC<CommentsViewProps> = ({
  ticketId,
  _attachments,
  _loadedAttachments,
  onAttachmentsChange,
  onLoadedAttachmentsChange,
  _users,
  onOpenAttachment,
  onImageOpen,
  setLoadedAttachments
}) => {
  const [attachments, setAttachments] = useState<Attachment[]>(_attachments);
  // const [loadedAttachments, setLoadedAttachments] =
  //   useState<Record<number, string>>(_loadedAttachments);
  const [commentList, setCommentList] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState<string>("");
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const axiosInstance = axios.create({
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  // Fetch comments
  const fetchComments = async () => {
    setIsLoading(true);
    try {
      const res = await axiosInstance.get(
        APIURLS.ticket.getTicketCommentsById() + ticketId
      );
      setCommentList(res.data);
    } catch (err) {
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [ticketId]);

  // Handle comment input change
  const handleCommentChange = (value: string) => {
    setCommentText(value);
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    if (selectedFiles) {
      const dataTransfer = new DataTransfer();
      Array.from(selectedFiles).forEach((file) => dataTransfer.items.add(file));
      Array.from(e.target.files).forEach((file) =>
        dataTransfer.items.add(file)
      );
      setSelectedFiles(dataTransfer.files);
    } else {
      setSelectedFiles(e.target.files);
    }
  };

  // Remove selected file
  const handleRemoveFile = (index: number) => {
    if (!selectedFiles) return;
    const filesArray = Array.from(selectedFiles);
    filesArray.splice(index, 1);
    const dataTransfer = new DataTransfer();
    filesArray.forEach((file) => dataTransfer.items.add(file));
    setSelectedFiles(dataTransfer.files);
  };

  const handleAddComment = async () => {
  if (!commentText.trim() || isLoading) return;

  const formData = new FormData();
  formData.append("comment", commentText);
  formData.append("ticketId", ticketId?.toString() ?? "");
  formData.append("userId", localStorage.getItem("id") ?? "");

  if (selectedFiles) {
    Array.from(selectedFiles).forEach((file) => formData.append("files", file));
  }

  setIsLoading(true);
  try {
    const res = await axiosInstance.post(
      APIURLS.ticket.saveTicketComment(),
      formData
    );
    const newComment: Comment = res.data;

    // Merge new attachments from server
    const serverAttachments = newComment.ticketAttachments || [];
    setAttachments((prev) => [...prev, ...serverAttachments]);

    // Generate preview URLs for uploaded files
    if (selectedFiles) {
      Array.from(selectedFiles).forEach((file, idx) => {
        // Use server ID if available, otherwise create temporary ID
        const tempId = serverAttachments[idx]?.id || `temp-${Date.now()}-${idx}`;
        const url = URL.createObjectURL(file);

        // Update loadedAttachments for instant preview
        setLoadedAttachments?.((prev) => ({ ...prev, [tempId]: url }));

        // Add to attachments if server did not return it
        if (!serverAttachments[idx]) {
          setAttachments((prev) => [
            ...prev,
            {
              id: tempId as any,
              fileName: file.name,
              contentType: file.type,
            } as Attachment,
          ]);
        }
      });
    }

    // Add new comment to comment list
    setCommentList((prev) => [...prev, newComment]);
    setCommentText("");
    setSelectedFiles(null);
  } catch (err) {
  } finally {
    setIsLoading(false);
  }
};


  // Render mentions
  const renderMentions = (comment: string) => {
    const mentionRegex = /@\[([^[\]]+)\]\((\d+)\)/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    while ((match = mentionRegex.exec(comment)) !== null) {
      const [fullMatch, username] = match;
      const index = match.index;

      if (index > lastIndex) parts.push(comment.slice(lastIndex, index));
      parts.push(
        <span key={index} className="text-blue-500">
          {username}
        </span>
      );
      lastIndex = index + fullMatch.length;
    }

    if (lastIndex < comment.length) parts.push(comment.slice(lastIndex));

    return parts;
  };

  const handleImagePaste = (file: File) => {
    if (!file) return;

    const dataTransfer = new DataTransfer();
    const existingNames = new Set<string>();

    // Add existing files to the new list
    if (selectedFiles) {
      for (let i = 0; i < selectedFiles.length; i++) {
        const existingFile = selectedFiles.item(i);
        if (existingFile) {
          dataTransfer.items.add(existingFile);
          existingNames.add(existingFile.name);
        }
      }
    }

    let newFileName = file.name;
    const fileExt = file.name.substring(file.name.lastIndexOf("."));
    const fileBase = file.name.substring(0, file.name.lastIndexOf("."));

    let counter = 2;
    while (existingNames.has(newFileName)) {
      newFileName = `${fileBase}${counter}${fileExt}`;
      counter++;
    }

    const renamedFile = new File([file], newFileName, {
      type: file.type,
      lastModified: file.lastModified,
    });

    dataTransfer.items.add(renamedFile);
    setSelectedFiles(dataTransfer.files);
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

const handleCommentAttachmentClick = (attachmentId: number) => {
  const masterIndex = _attachments.findIndex(
    (a) => a.id === attachmentId
  );

  if (masterIndex !== -1 && typeof onImageOpen === "function") {
    onImageOpen(masterIndex);
  }
};


  return (
    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-md">
      {/* Add Comment */}
      <div className="bg-white dark:bg-gray-700 p-4 rounded-md mb-6 shadow-sm flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <img
            src={userLogo}
            alt="User"
            className="w-10 h-10 rounded-full flex-shrink-0"
          />
          <div className="flex-1 flex flex-col gap-2">
          
            {/* ATTACHMENT UPLOAD AREA */}
            <div className="flex-1 flex flex-col gap-2">
              <MentionInput
                value={commentText}
                userList={_users}
                onChange={handleCommentChange}
                onImagePaste={handleImagePaste}
              />

              {/* --- Upload Area (Drag, File, Camera) --- */}
              <div className="w-full mt-2">
                <div
                  className={`border-2 border-dashed rounded-md p-4 transition
      ${isDragging ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30" : "border-gray-300 dark:border-gray-600"}`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                >
                  <div className="text-center">
                    <i className="fas fa-cloud-upload-alt text-gray-400 dark:text-gray-500 text-3xl"></i>

                    <p className="text-gray-500 dark:text-gray-400 mt-2">
                      Drag & drop files here, or choose an option below
                    </p>

                    <div className="flex justify-center gap-4 mt-3">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1 bg-blue-600 text-white rounded-md shadow 
                       hover:bg-blue-700 text-sm"
                      >
                        Choose Files
                      </button>

                      <button
                        type="button"
                        onClick={() => cameraInputRef.current?.click()}
                        className="px-3 py-1 bg-green-600 text-white rounded-md shadow 
                       hover:bg-green-700 text-sm"
                      >
                        Camera
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
              </div>

              {/* --- Submit Button (You lost this before) --- */}
              <div className="flex justify-end mt-3">
                <button
                  className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-4 rounded-md text-sm"
                  onClick={handleAddComment}
                  disabled={isLoading}
                >
                  {isLoading ? "Submitting..." : "Submit"}
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Selected Files Preview */}
        {selectedFiles && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-2">
            {Array.from(selectedFiles).map((file, idx) => (
              <div
                key={idx}
                className="relative p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 flex flex-col items-center"
              >
                {file.type.startsWith("image/") ? (
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="w-full h-20 object-cover rounded-md mb-1"
                  />
                ) : file.type.startsWith("video/") ? (
                  <img src={videoIcon} alt="video" className="w-10 h-10 mb-1" />
                ) : (
                  <img src={fileIcon} alt="file" className="w-10 h-10 mb-1" />
                )}
                <p className="text-xs text-gray-700 dark:text-gray-200 text-center line-clamp-2">
                  {file.name}
                </p>
                <button
                  className="absolute top-1 right-1 text-red-500 hover:text-red-700 text-sm"
                  onClick={() => handleRemoveFile(idx)}
                >
                  ✖
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Comments List */}
      {isLoading && commentList.length === 0 ? (
        <p className="text-center text-gray-600 dark:text-gray-300 py-6">
          Loading comments...
        </p>
      ) : commentList.length > 0 ? (
        <ul className="flex flex-col gap-4">
          {commentList.map((c) => (
            <li
              key={c.id}
              className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200 hover:shadow-md"
            >
              {/* User Info */}
              <div className="flex items-start gap-3 sm:gap-4">
                <img
                  src={userLogo}
                  alt={c.userFullName}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-blue-400 flex-shrink-0"
                />
                <div className="flex-1 flex flex-col items-start">
                  {/* Timestamp */}
                  <span className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mb-1">
                    {c.createdText}
                  </span>

                  {/* Username */}
                  <p className="text-gray-900 dark:text-white font-semibold text-sm sm:text-base">
                    {c.userFullName}
                  </p>

                  {/* Comment Text */}
                  <p className="mt-1 text-gray-700 dark:text-gray-200 text-sm sm:text-base break-words whitespace-pre-wrap text-left">
                    {renderMentions(c.comment)}
                  </p>

                  {/* Attachments */}
                  {c.ticketAttachments.length > 0 && (
                    <div className="mt-3 w-full">
                      <div className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-sm text-gray-500">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                          {c.ticketAttachments.map((att : any, index) => (
                            <div
                              key={att.id}
                              className="relative cursor-pointer rounded-md overflow-hidden border border-gray-200 dark:border-gray-600 hover:shadow-lg transition-all duration-200 p-1 flex flex-col items-center"
                              onClick={() => handleCommentAttachmentClick(att.id)}
                            >
                              {/* Thumbnail */}
                              {att.contentType.startsWith("video/") ? (
                                <img
                                  src={videoIcon}
                                  alt="Video Icon"
                                  className="w-full sm:w-24 h-20 sm:h-24 object-contain rounded-md mb-1"
                                />
                              ) : att.contentType.startsWith("image/") ? (
                                _loadedAttachments[att.id] ? (
                                  <img
                                    src={_loadedAttachments[att.id]}
                                    alt="Attachment"
                                    className="w-full sm:w-24 h-20 sm:h-24 object-cover rounded-md mb-1"
                                  />
                                ) : (
                                  <img
                                    src={fileIcon}
                                    alt="File Icon"
                                    className="w-full sm:w-24 h-20 sm:h-24 object-contain rounded-md mb-1"
                                  />
                                )
                              ) : (
                                <img
                                  src={fileIcon}
                                  alt="File Icon"
                                  className="w-full sm:w-24 h-20 sm:h-24 object-contain rounded-md mb-1"
                                />
                              )}

                              {/* Filename */}
                              <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-200 truncate text-center w-full">
                                {att.fileName}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="py-6 text-gray-600 dark:text-gray-300 text-center min-h-[120px] flex flex-col items-center justify-center gap-2">
          <span className="text-lg">💬</span>
          <span>No comments available.</span>
        </div>
      )}
    </div>
  );
};

export default CommentsTab;
