"use client";

import { useState, useEffect } from "react";
import { extractTextFromPDF } from "@/utils/pdf-utils";
import { analyzeContent, getGeminiResponse, setPDFContent, extractMainIdeasForVideo } from "@/utils/gemini-utils";
import VideoComponent from '../components/Video';

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

interface Message {
  role: "agent" | "user";
  content: string;
  timestamp: string;
}

export default function ChatInterface() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfText, setPdfText] = useState<string>("");
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isVideoPopupOpen, setIsVideoPopupOpen] = useState(false);
  const [videoTopic, setVideoTopic] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "agent",
      content: "Hello! I can help you analyze PDFs, find relevant videos, or just chat about any topic. How may I assist you today?",
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || file.type !== 'application/pdf') {
      setMessages(prev => [...prev, {
        role: "agent",
        content: "Please upload a valid PDF file.",
        timestamp: new Date().toLocaleTimeString(),
      }]);
      return;
    }

    setIsProcessing(true);
    setPdfFile(file);

    try {
      // Extract and store PDF text
      const text = await extractTextFromPDF(file);
      setPdfText(text);
      setPDFContent(text); // Store in gemini-utils
      
      // Analyze main topic
      const topic = await analyzeContent(text);

      setMessages(prev => [...prev, {
        role: "user",
        content: `Uploaded: ${file.name}`,
        timestamp: new Date().toLocaleTimeString(),
      }, {
        role: "agent",
        content: `I've analyzed your PDF. The main topic appears to be: "${topic}". You can ask me questions about its content or click the video button to find relevant educational videos. What would you like to know?`,
        timestamp: new Date().toLocaleTimeString(),
      }]);

      // Store in localStorage
      const reader = new FileReader();
      reader.onload = () => {
        localStorage.setItem("uploadedPdf", reader.result as string);
      };
      reader.readAsDataURL(file);

    } catch (error) {
      setMessages(prev => [...prev, {
        role: "agent",
        content: "I encountered an error while processing the PDF. Please try again or upload a different file.",
        timestamp: new Date().toLocaleTimeString(),
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle message sending
  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsProcessing(true);

    try {
      const response = await getGeminiResponse(input, !!pdfFile);
      
      setMessages(prev => [...prev, {
        role: "agent",
        content: response,
        timestamp: new Date().toLocaleTimeString(),
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: "agent",
        content: "I apologize, but I encountered an error while processing your request. Please try again.",
        timestamp: new Date().toLocaleTimeString(),
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle video button click
  const handleVideoClick = async () => {
    if (!pdfText) {
      setMessages(prev => [...prev, {
        role: "agent",
        content: "Please upload a PDF first to find relevant videos.",
        timestamp: new Date().toLocaleTimeString(),
      }]);
      return;
    }

    setIsProcessing(true);
    try {
      const videoSearchTopic = await extractMainIdeasForVideo(pdfText);
      setVideoTopic(videoSearchTopic);
      setIsVideoPopupOpen(true);
      
      setMessages(prev => [...prev, {
        role: "agent",
        content: `I've found some relevant videos about: ${videoSearchTopic}`,
        timestamp: new Date().toLocaleTimeString(),
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: "agent",
        content: "I encountered an error while finding relevant videos. Please try again.",
        timestamp: new Date().toLocaleTimeString(),
      }]);
    } finally {
      setIsProcessing(false);
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
              message.role === "user" ? "justify-end" : "justify-start"
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
                  {message.role === "agent" ? "YaanAI" : "You"}
                </span>
                <span className="text-xs text-gray-500">{message.timestamp}</span>
              </div>
              <p className="text-sm text-gray-700">{message.content}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t bg-gray-50 flex gap-2 items-center">
        <textarea
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          disabled={isProcessing}
          className="min-h-[44px] max-h-32 p-3 border rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#96E8E5] flex-1 resize-none"
        />
        
        <button
          onClick={sendMessage}
          disabled={isProcessing}
          className="bg-gradient-to-r from-[#96E8E5] to-[#C4F2F0] text-black px-5 py-2 rounded-full font-semibold text-lg hover:opacity-80 transition-opacity disabled:opacity-50"
        >
          Send
        </button>

        <button
          onClick={handleVideoClick}
          disabled={isProcessing || !pdfFile}
          className="bg-gradient-to-r from-[#96E8E5] to-[#C4F2F0] text-black px-5 py-2 rounded-full font-semibold text-lg hover:opacity-80 transition-opacity disabled:opacity-50"
        >
          Find Videos
        </button>

        <input
          type="file"
          accept=".pdf"
          onChange={handleFileUpload}
          className="hidden"
          id="pdf-upload"
          disabled={isProcessing}
        />
        <label
          htmlFor="pdf-upload"
          className={cn(
            "bg-gradient-to-r from-[#96E8E5] to-[#C4F2F0] text-black px-5 py-2 rounded-full font-semibold text-lg hover:opacity-80 transition-opacity cursor-pointer",
            isProcessing ? "opacity-50 cursor-not-allowed" : ""
          )}
        >
          {isProcessing ? "Processing..." : "Upload PDF"}
        </label>
      </div>

      {isVideoPopupOpen && (
        <VideoComponent 
          topic={videoTopic} 
          onClose={() => setIsVideoPopupOpen(false)} 
        />
      )}
    </div>
  );
}