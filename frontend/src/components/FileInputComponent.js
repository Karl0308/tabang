import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Input, Button } from 'reactstrap';

const FileInputComponent = ({ selectedFiles, onFileChange }) => {
  const [files, setFiles] = useState([]);
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 600);

  useEffect(() => {
    setFiles(selectedFiles);
  }, [selectedFiles]);

  // const handleFileChange = (event) => {
  //   const newFiles = Array.from(event.target.files);
  //   setFiles(newFiles);
  //   onFileChange(newFiles); 
  // };

  const handleFileChange = (event) => {
    const newFiles = Array.from(event.target.files);
    setFiles((prevFiles) => [...prevFiles, ...newFiles]);
    onFileChange([...files, ...newFiles]);
  
    const fileInput = document.getElementById('attachment');
  
    if (fileInput) {
      const fileList = new DataTransfer();
      files.forEach((file) => fileList.items.add(file));
  
      newFiles.forEach((file) => fileList.items.add(file));
  
      fileInput.files = fileList.files;
    }
  };


  const handleFileOpen = (file) => {
    const fileUrl = URL.createObjectURL(file);
    window.open(fileUrl, '_blank');
  };

  const handleResize = () => {
    setIsSmallScreen(window.innerWidth < 600);
};

useEffect(() => {
    window.addEventListener('resize', handleResize);

    return () => {
        window.removeEventListener('resize', handleResize);
    };
}, []);

  return (
    <div>
      <Input
        type="file"
        color="black"
        className="description-attachment"
        name="attachment"
        id="attachment"
        // required
        multiple
        onChange={handleFileChange}
        style={{fontSize:isSmallScreen ? "2.5vw" : "1rem"}}
      />
      {/* <div style={{ marginTop: '10px' }}>
        {files.length > 0 && (
          <div>
            {files.map((file, index) => (
              <div key={index + 1} style={{ textAlign: 'left', fontSize: '18px' }}>
                <a href="#" onClick={() => handleFileOpen(file)}>
                  {file.name}
                </a>
              </div>
            ))}
          </div>
        )}
      </div> */}
      {/* <Button color="primary" onClick={handleFileUpload}>
        Upload Files
      </Button> */}
    </div>
  );
};

export default FileInputComponent;




