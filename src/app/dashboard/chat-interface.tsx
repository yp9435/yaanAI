"use client";

import { useState } from "react";
import { ThumbsUp, ThumbsDown, Copy, Download } from "lucide-react";

// Utility function to combine class names
function cn(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

interface Message {
  role: "agent" | "user";
  content: string;
  timestamp: string;
}

export default function ChatInterface() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "agent",
      content:
        "Hello, I am a generative AI agent. How may I assist you today?",
      timestamp: "4:08:28 PM",
    },
  ]);

  const sendMessage = () => {
    if (input.trim()) {
      const newMessage: Message = {
        role: "user",
        content: input,
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      setInput("");

      // Simulating agent's response for demo purposes
      setTimeout(() => {
        const agentReply: Message = {
          role: "agent",
          content: "I'm here to help with that!",
          timestamp: new Date().toLocaleTimeString(),
        };
        setMessages((prevMessages) => [...prevMessages, agentReply]);
      }, 1000);
    }
  };

  return (
    <div className="flex flex-col h-full w-full max-w-5xl mx-auto bg-white shadow-xl rounded-2xl overflow-hidden">
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={cn(
              "flex gap-3 transition-all duration-300",
              message.role === "user"
                ? "justify-end"
                : "justify-start"
            )}
          >
            {message.role === "agent" && (
              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-[#96E8E5] to-[#C4F2F0] flex-shrink-0 shadow-md" />
            )}
            <div
              className={cn(
                "p-4 rounded-2xl shadow-lg max-w-[75%] break-words",
                message.role === "user"
                  ? "bg-gradient-to-r from-[#E5FAF9] to-[#C4F2F0] text-right"
                  : "bg-gray-100 text-left"
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold text-gray-800">
                  {message.role === "agent"
                    ? "GenerativeAgent"
                    : "You"}
                </span>
                <span className="text-xs text-gray-500">
                  {message.timestamp}
                </span>
              </div>
              <p className="text-sm text-gray-700">{message.content}</p>
            </div>
            {message.role === "user" && (
              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-[#96E8E5] to-[#C4F2F0] flex-shrink-0 hidden" />
            )}
          </div>
        ))}
      </div>

      <div className="p-4 border-t bg-gray-50 flex gap-2 items-center">
        <textarea
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="min-h-[44px] max-h-32 p-3 border rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#96E8E5] flex-1 resize-none"
        />
        <button onClick={sendMessage} className="bg-gradient-to-r from-[#96E8E5] to-[#C4F2F0] text-black px-5 py-2 rounded-full font-semibold text-lg hover:opacity-80 transition-opacity">Send</button>
<button className="bg-gradient-to-r from-[#96E8E5] to-[#C4F2F0] text-black px-5 py-2 rounded-full font-semibold text-lg hover:opacity-80 transition-opacity">Upload PDF</button>
      </div>
    </div>
  );
}
