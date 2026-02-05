import React, { useState } from "react";
import ReactImageGallery from "react-image-gallery";
import "react-image-gallery/styles/css/image-gallery.css";

const files = [
  ...Array.from({ length: 10 }, (_, i) => ({
    original: `https://via.placeholder.com/800x600?text=Image+${i + 1}`,
    thumbnail: `https://via.placeholder.com/150x100?text=Image+${i + 1}`,
    description: `Image ${i + 1} - A beautiful placeholder.`,
    type: "image",
  })),
  ...Array.from({ length: 10 }, (_, i) => {
    const fileTypes = ["pdf", "word", "excel"];
    const type = fileTypes[i % 3];
    return {
      original: `https://example.com/sample-${type}-${i + 1}.${type === "pdf" ? "pdf" : type === "word" ? "docx" : "xlsx"}`,
      thumbnail: `/icons/${type}-icon.png`,
      description: `${type.toUpperCase()} File ${i + 1}`,
      type,
    };
  }),
];

const FileGalleryComponent = () => {
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  const openGallery = () => setIsGalleryOpen(true);
  const closeGallery = () => setIsGalleryOpen(false);

  const onDownload = async (fileUrl: string, fileName: string) => {
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
    }
  };

  const renderFile = (item: any) => {
    if (item.type === "image") {
      return <img src={item.original} alt="Gallery Image" className="w-full h-auto" />;
    }

    return (
      <div className="flex flex-col items-center justify-center w-full h-64 bg-gray-100 dark:bg-gray-800 text-center">
        <img src={item.thumbnail} alt={`${item.type} Icon`} className="w-16 h-16 mb-2" />
        <p className="text-gray-700 dark:text-gray-300">{item.description}</p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col justify-center items-center">
      <button
        onClick={openGallery}
        className="px-6 py-2 bg-blue-600 text-white rounded-md shadow-md hover:bg-blue-700"
      >
        Open File Gallery
      </button>

      {isGalleryOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex justify-center items-center">
          {/* Close Button */}
          <div className="absolute top-4 right-4 flex gap-2 z-50">
            <button
              className="text-white text-xl bg-gray-800 bg-opacity-75 p-2 rounded-full hover:bg-opacity-100"
              onClick={closeGallery}
            >
              ✖
            </button>
          </div>

          {/* File Gallery */}
          <ReactImageGallery
            items={files.map((file) => ({
              original: file.original,
              thumbnail: file.thumbnail,
              description: file.description,
              renderItem: () => (
                <div className="relative">
                  {renderFile(file)}
                  <button
                    onClick={() => onDownload(file.original, file.original.split("/").pop() || "file")}
                    className="absolute bottom-2 right-2 px-4 py-2 bg-green-600 text-white rounded-md text-sm shadow-md hover:bg-green-700"
                  >
                    Download
                  </button>
                </div>
              ),
              originalClass: "h-full flex items-center justify-center",
            }))}
            showPlayButton={false}
            showThumbnails={true}
            showFullscreenButton={false}
            useBrowserFullscreen={true}
            showIndex={true}
            lazyLoad={true}
          />
        </div>
      )}
    </div>
  );
};

export default FileGalleryComponent;
