'use client'

import React, { useState } from 'react';
import { LetterText, PersonStandingIcon, Video as LucideVideo, CreditCard, Brain } from 'lucide-react';
import VideoComponent from '../components/Video';
import FileUpload from '../components/FileUpload';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isVideoPopupOpen, setIsVideoPopupOpen] = useState(false);
  const [topic, setTopic] = useState<string>('');

  const handleVideoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsVideoPopupOpen(true);
  };

  const handleTopicDetected = (detectedTopic: string) => {
    setTopic(detectedTopic);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <main className="flex flex-1 overflow-hidden">
        <aside className="w-64 bg-white shadow-md border-r">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-black mb-6">Menu</h2>
            {/* File upload section */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Upload PDF</h3>
              <FileUpload onTopicDetected={handleTopicDetected} />
            </div>
            <ul className="space-y-4">
              <li>
                <a href="#" className="flex items-center p-3 text-black rounded-lg hover:bg-[#96E8E5] hover:text-black transition duration-300">
                  <LetterText className="w-5 h-5 mr-3" />
                  Crossword
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center p-3 text-black rounded-lg hover:bg-[#96E8E5] hover:text-black transition duration-300">
                  <PersonStandingIcon className="w-5 h-5 mr-3" />
                  Hangman
                </a>
              </li>
              <li>
                <a
                  href="#"
                  onClick={handleVideoClick}
                  className="flex items-center p-3 text-black rounded-lg hover:bg-[#96E8E5] hover:text-black transition duration-300"
                >
                  <LucideVideo className="w-5 h-5 mr-3" />
                  Video
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center p-3 text-black rounded-lg hover:bg-[#96E8E5] hover:text-black transition duration-300">
                  <CreditCard className="w-5 h-5 mr-3" />
                  Flashcards
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center p-3 text-black rounded-lg hover:bg-[#96E8E5] hover:text-black transition duration-300">
                  <Brain className="w-5 h-5 mr-3" />
                  Mindmaps
                </a>
              </li>
            </ul>
          </div>
        </aside>

        <div className="flex-1 p-4 overflow-y-auto">
          {children}
        </div>
      </main>

      {isVideoPopupOpen && <VideoComponent topic={topic} onClose={() => setIsVideoPopupOpen(false)} />}
    </div>
  );
}
