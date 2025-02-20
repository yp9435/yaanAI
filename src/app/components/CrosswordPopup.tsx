"use client";

import React, { useState, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { TextItem } from 'pdfjs-dist/types/src/display/api';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

interface CrosswordProps {
  pdfFile: File | null;
  onClose: () => void;
}

interface WordPosition {
  word: string;
  x: number;
  y: number;
  direction: 'across' | 'down';
  number: number;
}

const CrosswordPopup: React.FC<CrosswordProps> = ({ pdfFile, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [words, setWords] = useState<string[]>([]);
  const [clues, setClues] = useState<string[]>([]);
  const [grid, setGrid] = useState<string[][]>([]);
  const [wordPositions, setWordPositions] = useState<WordPosition[]>([]);
  const [userInputs, setUserInputs] = useState<{ [key: string]: string }>({});
  const [hideWords, setHideWords] = useState(true);

  useEffect(() => {
    if (pdfFile) {
      extractTextFromPDF();
    }
  }, [pdfFile]);

  const extractTextFromPDF = async () => {
    try {
      const arrayBuffer = await pdfFile!.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => (item as TextItem).str)
          .join(' ');
        fullText += pageText + ' ';
      }

      await generateCrosswordFromText(fullText);
    } catch (err) {
      setError('Error processing PDF: ' + (err as Error).message);
      setLoading(false);
    }
  };

  const generateCrosswordFromText = async (text: string) => {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const prompt = `Extract 10 key terms and their definitions from this text: "${text.substring(0, 1000)}".
        Format as JSON with 'words' and 'clues' arrays. Words should be 3-10 letters long, unique, and well-spaced. dont repeat words. be sensible when choosing the words.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      let responseText = response.text();

      console.log("Gemini Response:", responseText);

      responseText = responseText.replace(/```json|```/g, '').trim();
      responseText = responseText.replace(/^[^{[]*/, '').replace(/[^}\]]*$/, '');

      const wordsAndClues = JSON.parse(responseText);

      if (!wordsAndClues.words || !wordsAndClues.clues) {
        throw new Error("Invalid response format (Missing 'words' or 'clues').");
      }

      setWords(wordsAndClues.words);
      setClues(wordsAndClues.clues);
      generateCrosswordGrid(wordsAndClues.words);
      setLoading(false);
    } catch (err) {
      console.error("Failed to parse Gemini response:", err);
      setError("Error generating crossword: Invalid response format.");
      setLoading(false);
    }
  };

  const generateCrosswordGrid = (words: string[]) => {
    const size = Math.max(10, Math.ceil(Math.sqrt(words.join('').length)) + 2);
    const newGrid: string[][] = Array(size).fill(null).map(() => Array(size).fill(""));
    let wordPositions: WordPosition[] = [];

    let row = 0, number = 1;
    words.forEach((word, index) => {
      if (index % 2 === 0) {
        if (row < size) {
          wordPositions.push({ word, x: 0, y: row, direction: 'across', number });
          for (let i = 0; i < word.length; i++) {
            newGrid[row][i] = word[i];
          }
          row += 2;
        }
      } else {
        let col = words[index - 1]?.length || 0;
        if (row + word.length < size) {
          wordPositions.push({ word, x: col, y: row, direction: 'down', number });
          for (let i = 0; i < word.length; i++) {
            newGrid[row + i][col] = word[i];
          }
        }
      }
      number++;
    });

    setGrid(newGrid);
    setWordPositions(wordPositions);
  };

  const handleCellInput = (y: number, x: number, value: string) => {
    setUserInputs(prev => ({
      ...prev,
      [`${y}-${x}`]: value.toUpperCase()
    }));
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg w-11/12 max-w-5xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">Crossword Puzzle</h2>

          {loading && (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          )}

          {error && (
            <div className="text-red-500 p-4 rounded-lg bg-red-50">
              {error}
            </div>
          )}

          {!loading && !error && (
            <>
              <button
                onClick={() => setHideWords(!hideWords)}
                className="mb-4 px-4 py-2 bg-blue-500 text-white rounded"
              >
                {hideWords ? "Show Words" : "Hide Words"}
              </button>

              {!hideWords && (
                <div>
                  <h3 className="text-xl font-bold">Words</h3>
                  <ul className="list-disc pl-5">
                    {words.map((word, index) => (
                      <li key={index}>{index + 1}. {word}</li>
                    ))}
                  </ul>
                </div>
              )}

              <h3 className="text-xl font-bold mt-4">Clues</h3>
              <ul className="list-disc pl-5">
                {clues.map((clue, index) => (
                  <li key={index}>{index + 1}. {clue}</li>
                ))}
              </ul>

              <div className="grid gap-px bg-gray-300 mt-6"
                   style={{ gridTemplateColumns: `repeat(${grid.length}, minmax(0, 1fr))`, width: 'fit-content' }}>
                {grid.map((row, y) => row.map((cell, x) => (
                  <div key={`${y}-${x}`} className={`relative w-8 h-8 border border-gray-500 flex items-center justify-center 
                     ${cell ? "bg-white" : "bg-gray-300"}`}>
                    {cell && <span className="absolute top-0 left-0 text-xs font-bold">{wordPositions.find(wp => wp.x === x && wp.y === y)?.number || ""}</span>}
                  </div>
                )))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CrosswordPopup;
