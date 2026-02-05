import React, { useState } from "react";
import axios from "axios";
import { FaRobot, FaUser, FaPaperPlane } from "react-icons/fa";

const ChatModule = () => {
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>(
    []
  );
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage = { sender: "user", text: input };
    setMessages([...messages, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await axios.post(
       
      );

      const reply = response.data.choices[0].message.content;
      setMessages((prev) => [...prev, { sender: "bot", text: reply }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "⚠️ Error communicating with AI." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto mt-10 border border-gray-300 dark:border-gray-700 rounded-xl shadow-xl bg-white dark:bg-gray-900 flex flex-col h-[600px]">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 text-lg font-semibold rounded-t-xl tracking-wide">
        Tabang Chat Bot
      </div>

      {/* Chat Messages */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50 dark:bg-gray-800 space-y-4 transition-colors duration-300">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.sender === "user" ? "justify-end" : "justify-start"
            } items-start gap-2`}
          >
            {msg.sender === "bot" && (
              <FaRobot className="text-blue-500 dark:text-blue-400 text-lg mt-1" />
            )}
            <div
              className={`px-4 py-2 rounded-xl text-sm max-w-[70%] shadow-sm transition-all duration-200 ${
                msg.sender === "user"
                  ? "bg-blue-600 text-white rounded-br-none"
                  : "bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-white rounded-bl-none"
              }`}
            >
              {msg.text}
            </div>
            {msg.sender === "user" && (
              <FaUser className="text-blue-500 dark:text-blue-400 text-lg mt-1" />
            )}
          </div>
        ))}
        {isLoading && (
          <div className="text-sm text-gray-500 dark:text-gray-300 italic">
            Tabang BOT is typing...
          </div>
        )}
      </div>

      {/* Input Field */}
      <div className="p-4 border-t border-gray-300 dark:border-gray-700 flex items-center gap-2 bg-white dark:bg-gray-900">
        <input
          type="text"
          className="flex-1 border border-gray-300 dark:border-gray-600 px-4 py-2 rounded text-sm dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          onClick={sendMessage}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow transition"
        >
          <FaPaperPlane />
        </button>
      </div>
    </div>
  );
};

export default ChatModule;
