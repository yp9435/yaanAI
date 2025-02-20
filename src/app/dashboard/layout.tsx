'use client';

import React, { useState } from 'react';
import { LetterText, PersonStandingIcon, Video as LucideVideo, CreditCard, Brain } from 'lucide-react';
import VideoComponent from '../components/Video';
import HangmanPopup from '../components/Hangman';
import FileUpload from '../components/FileUpload';
import CrosswordPopup from '../components/CrosswordPopup';
import FlashCard from '../components/FlashCard';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isVideoPopupOpen, setIsVideoPopupOpen] = useState(false);
  const [isHangmanPopupOpen, setIsHangmanPopupOpen] = useState(false);
  const [isCrosswordPopupOpen, setIsCrosswordPopupOpen] = useState(false);
  const [isFlashCardPopupOpen, setIsFlashCardPopupOpen] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [topic, setTopic] = useState<string>('');

  const handleVideoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsVideoPopupOpen(true);
  };

  const handleHangmanClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (pdfFile) {
      setIsHangmanPopupOpen(true);
    } else {
      alert('Please upload a PDF file first');
    }
  };

  const handleCrosswordClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (pdfFile) {
      setIsCrosswordPopupOpen(true);
    } else {
      alert('Please upload a PDF file first');
    }
  };

  const handleFlashCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (pdfFile) {
      setIsFlashCardPopupOpen(true);
    } else {
      alert('Please upload a PDF file first.');
    }
  };

  const handleTopicDetected = (detectedTopic: string) => {
    setTopic(detectedTopic);
  };

  const handleFileUploaded = (file: File) => {
    setPdfFile(file);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <main className="flex flex-1 overflow-hidden">
        <aside className="w-64 bg-white shadow-md border-r">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-black mb-6">Menu</h2>
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Upload PDF</h3>
              <FileUpload 
                onTopicDetected={handleTopicDetected}
                onFileUploaded={handleFileUploaded}
              />
            </div>
            <ul className="space-y-4">
              <li>
                <a 
                  href="#" 
                  onClick={handleHangmanClick}
                  className="flex items-center p-3 text-black rounded-lg hover:bg-[#96E8E5] hover:text-black transition duration-300"
                >
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
                <a
                  href="#"
                  onClick={handleCrosswordClick}
                  className="flex items-center p-3 text-black rounded-lg hover:bg-[#96E8E5] hover:text-black transition duration-300"
                >
                  <LetterText className="w-5 h-5 mr-3" />
                  Crossword
                </a>
              </li>
              <li>
                <a
                  href="#"
                  onClick={handleFlashCardClick}
                  className="flex items-center p-3 text-black rounded-lg hover:bg-[#96E8E5] hover:text-black transition duration-300"
                >
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
      {isHangmanPopupOpen && <HangmanPopup pdfFile={pdfFile} onClose={() => setIsHangmanPopupOpen(false)} />}
      {isCrosswordPopupOpen && <CrosswordPopup pdfFile={pdfFile} onClose={() => setIsCrosswordPopupOpen(false)} />}
      {isFlashCardPopupOpen && <FlashCard pdfFile={pdfFile} onClose={() => setIsFlashCardPopupOpen(false)} />}
    </div>
  );
}
