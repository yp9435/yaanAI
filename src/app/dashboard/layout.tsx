import React from 'react';
import { LetterText, PersonStandingIcon, Video, CreditCard, Brain } from 'lucide-react';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen bg-gray-100">

      {/* Main Content */}
      <main className="flex flex-1 overflow-hidden">

        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-md border-r">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-black mb-6">Menu</h2>
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
                <a href="#" className="flex items-center p-3 text-black rounded-lg hover:bg-[#96E8E5] hover:text-black transition duration-300">
                  <Video className="w-5 h-5 mr-3" />
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

        {/* Main Content Area */}
        <div className="flex-1 p-4 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
