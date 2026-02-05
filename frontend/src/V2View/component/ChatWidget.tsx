import React, { useState } from 'react';
import axios from 'axios';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage = { sender: 'user', text: input };
    setMessages([...messages, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'You are a helpful assistant.' },
            { role: 'user', content: input },
          ],
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
          },
        }
      );

      const reply = response.data.choices[0].message.content;
      setMessages((prev) => [...prev, { sender: 'bot', text: reply }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: 'Error communicating with AI.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
     <div
  className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full cursor-pointer shadow-lg z-50 mb-4 animate-bounce"
  onClick={() => setIsOpen(!isOpen)}
>
  💬 Need help? 
</div>

      {isOpen && (
        <div className="fixed bottom-20 right-6 w-80 h-96 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl flex flex-col z-50 mb-6">
          <div className="p-3 bg-blue-600 text-white font-bold rounded-t-xl">
            Tabang Chat Bot
          </div>
          <div className="flex-1 p-3 overflow-y-auto space-y-2 bg-gray-50 dark:bg-gray-800">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`text-sm p-2 rounded-lg ${
                  msg.sender === 'user'
                    ? 'bg-blue-100 text-right ml-10 dark:bg-blue-600 dark:text-white'
                    : 'bg-gray-100 text-left mr-10 dark:bg-gray-700 dark:text-gray-100'
                }`}
              >
                {msg.text}
              </div>
            ))}
            {isLoading && <div className="text-gray-500 dark:text-gray-400 text-sm">Typing...</div>}
          </div>
          <div className="p-2 border-t border-gray-200 dark:border-gray-700 flex bg-white dark:bg-gray-900">
            <input
              type="text"
              className="flex-1 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              value={input}
              placeholder="Ask something..."
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            />
            <button
              onClick={sendMessage}
              className="ml-2 bg-blue-500 text-white px-3 py-1 rounded text-sm"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWidget;
