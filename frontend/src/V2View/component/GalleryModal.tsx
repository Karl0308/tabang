import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faChevronLeft,
  faChevronRight,
  faDownload,
  faFilePdf,
  faFileWord,
  faFileExcel,
  faFileAlt,
  faFileVideo,
  faFileZipper,
  faPlayCircle,
} from "@fortawesome/free-solid-svg-icons";
import { APIURLS } from "../../APIURLS";
import axios from "axios";

interface Attachment {
  id: number;
  fileName: string;
  contentType: string;
  isDeleted?: boolean;
}

interface GalleryModalProps {
  attachments: Attachment[];
  loadedAttachments: Record<number, string>;
  initialIndex: number;
  onClose: () => void;
}

export const GalleryModal: React.FC<GalleryModalProps> = ({
  attachments,
  loadedAttachments,
  initialIndex,
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const total = attachments.length;

  const handleNext = () => setCurrentIndex((prev) => (prev + 1) % total);
  const handlePrev = () =>
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  const [downloading, setDownloading] = useState<{ [id: number]: boolean }>({});
  const handleSelect = (index: number) => setCurrentIndex(index);
  const axiosInstance = axios.create({
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose, total]);

  const attachment = attachments[currentIndex];
  const src = loadedAttachments[attachment.id] || "";

  const handleDownload = async (attachment: Attachment) => {
    try {
      // mark as downloading
      setDownloading((prev) => ({ ...prev, [attachment.id]: true }));
      const res = await axiosInstance.get(
        APIURLS.ticket.getAttachmentById() + attachment.id
      );

      const base64 = res.data.content;
      const mime = res.data.contentType;
      const fileName = res.data.fileName;

      const byteCharacters = atob(base64);
      const byteNumbers = new Array(byteCharacters.length)
        .fill(0)
        .map((_, i) => byteCharacters.charCodeAt(i));

      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: mime });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.click();

      URL.revokeObjectURL(url);
    } catch (error) {
    } finally {
      // re-enable button after download completes
      setDownloading((prev) => ({ ...prev, [attachment.id]: false }));
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-95 flex flex-col justify-center items-center px-4 sm:px-8"
      style={{ zIndex: 99999 }} // Use a very high z-index here
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white text-3xl hover:text-gray-300 transition z-50"
      >
        <FontAwesomeIcon icon={faTimes} />
      </button>

      {/* Carousel Content */}
      <div className="flex justify-center items-center w-full max-w-6xl flex-1 relative">
        {attachment.contentType.startsWith("video/") ? (
          <div className="flex flex-col items-center justify-center h-[80vh] w-full bg-white dark:bg-gray-800 rounded-md shadow-lg">
            {/* Video thumbnail */}
            <FontAwesomeIcon
              icon={faFileVideo} // video icon
              size="6x"
              className="text-gray-700 dark:text-gray-300 mb-4"
            />
            <p className="text-gray-800 dark:text-gray-100 font-semibold truncate max-w-xs sm:max-w-md">
              {attachment.fileName}
            </p>
          </div>
        ) : attachment.contentType.startsWith("image/") ? (
          <img
            src={src || "/placeholder.png"}
            alt={attachment.fileName}
            className="max-h-[80vh] max-w-full object-contain rounded-md shadow-lg bg-white dark:bg-gray-800"
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-[80vh] w-full bg-white dark:bg-gray-800 rounded-md shadow-lg">
            <FontAwesomeIcon
              icon={
                attachment.contentType.includes("pdf")
                  ? faFilePdf
                  : attachment.contentType.includes("word")
                  ? faFileWord
                  : attachment.contentType.includes("excel")
                  ? faFileExcel
                  : faFileAlt
              }
              size="6x"
              className="text-gray-700 dark:text-gray-300 mb-4"
            />
            <p className="text-gray-800 dark:text-gray-100 font-semibold">{attachment.fileName}</p>
          </div>
        )}

        {/* Prev / Next Buttons */}
        {total > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-0 top-1/2 -translate-y-1/2 text-white text-5xl px-3 py-2 bg-black bg-opacity-30 hover:bg-opacity-50 rounded-r-md transition"
            >
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 text-white text-5xl px-3 py-2 bg-black bg-opacity-30 hover:bg-opacity-50 rounded-l-md transition"
            >
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </>
        )}
      </div>

      {/* File Info + Download */}
      <button
        onClick={() => handleDownload(attachment)}
        disabled={downloading[attachment.id]}
        className={`inline-flex items-center mt-2 
        ${
          downloading[attachment.id]
            ? "text-gray-400 cursor-not-allowed"
            : "text-blue-400 hover:text-blue-200"
        }`}
      >
        <FontAwesomeIcon icon={faDownload} className="mr-2" />
        {downloading[attachment.id] ? "Downloading..." : "Download"}
      </button>

      {/* Thumbnails */}
      {total > 1 && (
        <div className="flex space-x-2 overflow-x-auto mt-4 pb-4 w-full max-w-6xl">
          {attachments.map((att, idx) => (
            <div
              key={att.id}
              onClick={() => handleSelect(idx)}
              className={`cursor-pointer border-2 rounded-md transition-all duration-200 ${
                idx === currentIndex
                  ? "border-blue-500 scale-105"
                  : "border-transparent"
              }`}
            >
              {att.contentType.startsWith("image/") ? (
                <img
                  src={loadedAttachments[att.id] || "/placeholder.png"}
                  alt={att.fileName}
                  className="h-20 w-20 sm:h-24 sm:w-24 object-cover rounded-md"
                />
              ) : // --- VIDEO ---
              att.contentType.startsWith("video/") ? (
                <div className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-md overflow-hidden bg-white dark:bg-gray-700 flex items-center justify-center">
                  {/* Video preview */}
                  <video
                    src={loadedAttachments[att.id]}
                    className="h-full w-full object-cover opacity-70"
                    muted
                  />

                  {/* Play icon overlay */}
                  <FontAwesomeIcon
                    icon={faFileVideo}
                    className="absolute text-gray-700 dark:text-gray-300 text-2xl"
                  />

                  {/* Hover overlay for download */}
                  <div className="absolute inset-0 bg-black bg-opacity-30 opacity-0 hover:opacity-100 flex items-center justify-center transition">
                    <FontAwesomeIcon
                      icon={faDownload}
                      className="text-white text-xl"
                    />
                  </div>
                </div>
              ) : (
                // --- PDF / WORD / EXCEL / ZIP / DEFAULT ---
                <div className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-md overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <FontAwesomeIcon
                    icon={
                      att.contentType.includes("pdf")
                        ? faFilePdf
                        : att.contentType.includes("word")
                        ? faFileWord
                        : att.contentType.includes("excel")
                        ? faFileExcel
                        : att.contentType.includes("zip") ||
                          att.fileName.endsWith(".zip")
                        ? faFileZipper
                        : faFileAlt
                    }
                    className="text-gray-700 dark:text-gray-300 text-3xl"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-30 opacity-0 hover:opacity-100 flex items-center justify-center transition">
                    <FontAwesomeIcon
                      icon={faDownload}
                      className="text-white text-xl"
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
