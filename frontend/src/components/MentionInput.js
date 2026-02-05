import React from "react";
import { MentionsInput, Mention } from "react-mentions";
const isDarkMode = localStorage.getItem("theme") === "dark";

const style = {
  control: {
    fontSize: 15,
    backgroundColor: isDarkMode ? '#374151' : 'white', // dark:bg-gray-700
    color: isDarkMode ? 'white' : 'black',
  },
  "&multiLine": {
    control: {
      minHeight: 63,
    },
    highlighter: {
      padding: 10,
      border: "2px solid transparent",
    },
    input: {
      padding: 10,
      border: "2px solid",
      borderColor: isDarkMode ? '#4B5563' : 'silver', // dark:border-gray-600
      backgroundColor: isDarkMode ? '#374151' : 'white',
      color: isDarkMode ? 'white' : 'black',
    },
  },
  "&singleLine": {
    display: "inline-block",
    width: 180,
    highlighter: {
      padding: 1,
      border: "2px inset transparent",
    },
    input: {
      padding: 1,
      border: "2px inset",
      backgroundColor: isDarkMode ? '#374151' : 'white',
      color: isDarkMode ? 'white' : 'black',
    },
  },
  suggestions: {
    list: {
      backgroundColor: isDarkMode ? '#1F2937' : 'white', // dark:bg-gray-800
      border: "1px solid",
      borderColor: isDarkMode ? '#6B7280' : '#333', // dark:border-gray-500
      fontSize: 18,
      color: isDarkMode ? 'white' : 'black',
    },
    item: {
      padding: "10px 20px",
      borderBottom: "1px solid",
      borderColor: isDarkMode ? '#4B5563' : '#333',
      "&focused": {
        color: "white",
        backgroundColor: "#0d6efd",
      },
    },
  },
};


function MentionInput({ userList, value, onChange, onImagePaste }) {
  const [textAreaVal, setTextAreaVal] = React.useState("");
  const [imageUrl, setImageUrl] = React.useState("");

  const handleInputChange = (e) => {
    setTextAreaVal(e.target.value);
    // Call the onChange function if provided
    if (onChange) {
      onChange(e.target.value);
    }
  };

  const users = userList.map((user) => ({
    id: user.id,
    display: user.fullName,
  }));

  const handlePaste = async (event) => {
    const clipboardData = event.clipboardData;
    const items = clipboardData.items;

    let imageFound = false;

    // Check if there is an image in the clipboard
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.includes("image")) {
        imageFound = true;
        const file = item.getAsFile(); // Directly get the image file

        // You can immediately pass the file to the parent without base64 conversion
        if (onImagePaste) {
          onImagePaste(file); // Pass the file directly
        }
        event.preventDefault(); // Prevent default paste action for image handling
        break;
      }
    }

    // If no image is found, prevent any paste action (including text)
    if (!imageFound) {
      event.preventDefault();
    }
  };


  return (
    <>
      <MentionsInput
        className="flex-1 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white dark:bg-gray-700 dark:text-white"
        style={style}
        value={value}
        onChange={handleInputChange}
        onPaste={handlePaste}
      >
        <Mention
          style={{
            backgroundColor: "rgba(59, 130, 246, 0.3)", // blue-500 light bg for mentions
            color: "#000", // default text color
          }}
          className="dark:bg-blue-800 dark:text-white"
          data={users}
        />
      </MentionsInput>

      {imageUrl && (
        <div className="mt-2">
          <img
            src={imageUrl}
            alt="Pasted Image"
            className="max-w-[100px] max-h-[100px] rounded-md border border-gray-300 dark:border-gray-600"
          />
        </div>
      )}

    </>
  );
}

export default MentionInput;
