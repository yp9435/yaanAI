"use client";

import { useState, useEffect, useMemo } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { TextItem } from 'pdfjs-dist/types/src/display/api';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;


const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

interface CrosswordProps {
  pdfFile: File;
}

interface Position {
  x: number;
  y: number;
  direction: 'across' | 'down';
}

interface CrosswordPuzzle {
  words: string[];
  clues: string[];
  positions?: Position[];
  grid: string[][];
  size: number;
}

interface PlacedWord {
  word: string;
  clue: string;
  position: Position;
  number: number;
}

function generateCrosswordGrid(words: string[], clues: string[]): CrosswordPuzzle {
  // Sort words by length (descending)
  const sortedEntries = words
    .map((word, i) => ({ word: word.toUpperCase(), clue: clues[i] }))
    .sort((a, b) => b.word.length - a.word.length);

  const size = Math.max(
    20,
    Math.ceil(Math.sqrt(sortedEntries.reduce((sum, { word }) => sum + word.length, 0)))
  );
  
  const grid: string[][] = Array(size).fill(null).map(() => Array(size).fill(''));
  const placedWords: PlacedWord[] = [];
  const positions: Position[] = [];

  // Place first word horizontally in the middle
  const firstWord = sortedEntries[0].word;
  const startX = Math.floor((size - firstWord.length) / 2);
  const startY = Math.floor(size / 2);
  
  for (let i = 0; i < firstWord.length; i++) {
    grid[startY][startX + i] = firstWord[i];
  }

  placedWords.push({
    word: firstWord,
    clue: sortedEntries[0].clue,
    position: { x: startX, y: startY, direction: 'across' },
    number: 1
  });
  positions.push({ x: startX, y: startY, direction: 'across' });

  // Try to place remaining words
  for (let i = 1; i < sortedEntries.length; i++) {
    const { word, clue } = sortedEntries[i];
    let placed = false;

    // Try to intersect with existing words
    for (let y = 0; y < size && !placed; y++) {
      for (let x = 0; x < size && !placed; x++) {
        if (grid[y][x] !== '') {
          // Try placing vertically
          if (canPlaceWordVertically(grid, word, x, y)) {
            placeWordVertically(grid, word, x, y);
            placedWords.push({
              word,
              clue,
              position: { x, y: y - word.indexOf(grid[y][x]), direction: 'down' },
              number: placedWords.length + 1
            });
            positions.push({ x, y: y - word.indexOf(grid[y][x]), direction: 'down' });
            placed = true;
            break;
          }
          // Try placing horizontally
          if (canPlaceWordHorizontally(grid, word, x, y)) {
            placeWordHorizontally(grid, word, x, y);
            placedWords.push({
              word,
              clue,
              position: { x: x - word.indexOf(grid[y][x]), y, direction: 'across' },
              number: placedWords.length + 1
            });
            positions.push({ x: x - word.indexOf(grid[y][x]), y, direction: 'across' });
            placed = true;
            break;
          }
        }
      }
    }
  }

  return {
    words: placedWords.map(pw => pw.word),
    clues: placedWords.map(pw => pw.clue),
    positions,
    grid,
    size
  };
}

function canPlaceWordVertically(grid: string[][], word: string, x: number, y: number): boolean {
  const size = grid.length;
  const letterAtIntersection = grid[y][x];
  const intersectionIndex = word.indexOf(letterAtIntersection);
  
  if (intersectionIndex === -1) return false;
  
  const startY = y - intersectionIndex;
  if (startY < 0 || startY + word.length > size) return false;
  
  // Check if placement is valid
  for (let i = 0; i < word.length; i++) {
    const currentY = startY + i;
    if (grid[currentY][x] !== '' && grid[currentY][x] !== word[i]) return false;
    // Check adjacent cells
    if (x > 0 && grid[currentY][x-1] !== '' && i !== intersectionIndex) return false;
    if (x < size-1 && grid[currentY][x+1] !== '' && i !== intersectionIndex) return false;
  }
  
  return true;
}

function canPlaceWordHorizontally(grid: string[][], word: string, x: number, y: number): boolean {
  const size = grid.length;
  const letterAtIntersection = grid[y][x];
  const intersectionIndex = word.indexOf(letterAtIntersection);
  
  if (intersectionIndex === -1) return false;
  
  const startX = x - intersectionIndex;
  if (startX < 0 || startX + word.length > size) return false;
  
  // Check if placement is valid
  for (let i = 0; i < word.length; i++) {
    const currentX = startX + i;
    if (grid[y][currentX] !== '' && grid[y][currentX] !== word[i]) return false;
    // Check adjacent cells
    if (y > 0 && grid[y-1][currentX] !== '' && i !== intersectionIndex) return false;
    if (y < size-1 && grid[y+1][currentX] !== '' && i !== intersectionIndex) return false;
  }
  
  return true;
}

function placeWordVertically(grid: string[][], word: string, x: number, y: number) {
  const letterAtIntersection = grid[y][x];
  const intersectionIndex = word.indexOf(letterAtIntersection);
  const startY = y - intersectionIndex;
  
  for (let i = 0; i < word.length; i++) {
    grid[startY + i][x] = word[i];
  }
}

function placeWordHorizontally(grid: string[][], word: string, x: number, y: number) {
  const letterAtIntersection = grid[y][x];
  const intersectionIndex = word.indexOf(letterAtIntersection);
  const startX = x - intersectionIndex;
  
  for (let i = 0; i < word.length; i++) {
    grid[y][startX + i] = word[i];
  }
}

export default function Crossword({ pdfFile }: CrosswordProps) {
  const [puzzle, setPuzzle] = useState<CrosswordPuzzle | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userInputs, setUserInputs] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const generateCrossword = async () => {
      try {
        setLoading(true);
        setError(null);

        // Extract text from PDF
        const data = await pdfFile.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data }).promise;
        let text = '';
        
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          text += content.items
            .filter((item): item is TextItem => 'str' in item)
            .map(item => item.str)
            .join(' ');
        }

        if (!text.trim()) {
          setError('Could not extract text from PDF. Please try a different file.');
          return;
        }

        // Clean and prepare text
        const cleanText = text
          .replace(/\s+/g, ' ')
          .trim()
          .slice(0, 1000);

        const prompt = `Create a crossword puzzle using important keywords from this text. Focus on nouns, key terms, and significant words. Format your response EXACTLY like this:
        {
          "words": ["keyword1", "keyword2", "keyword3"],
          "clues": ["Description for keyword1", "Description for keyword2", "Description for keyword3"]
        }
        If you can't find enough keywords, use at least 3-4 important words from the text. Maximum 10 words.
        Text: ${cleanText}`;

        // Generate crossword using Gemini
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const responseText = response.text();
        
        try {
          // Clean the response by removing markdown code blocks
          const cleanResponse = responseText
            .replace(/```json\n?/g, '')
            .replace(/```\n?/g, '')
            .trim();
            
          const puzzleData = JSON.parse(cleanResponse);
          if (!puzzleData.words || !puzzleData.clues) {
            throw new Error('Invalid puzzle data format');
          }
          const gridData = generateCrosswordGrid(puzzleData.words, puzzleData.clues);
          setPuzzle(gridData);
        } catch (err) {
          console.error('Response:', responseText);
          setError('Failed to parse puzzle data. Please try again.');
        }
      } catch (err) {
        setError('Failed to generate crossword puzzle. Please try again.');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (pdfFile) {
      generateCrossword();
    }
  }, [pdfFile]);

  const handleCellInput = (y: number, x: number, value: string) => {
    setUserInputs(prev => ({
      ...prev,
      [`${y}-${x}`]: value.toUpperCase()
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-700"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-4">
        {error}
      </div>
    );
  }

  return (
    <div className="p-4">
      {puzzle && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-bold mb-4">Crossword Grid</h2>
            <div className="grid gap-px bg-gray-300" 
                 style={{ 
                   gridTemplateColumns: `repeat(${puzzle.size}, minmax(0, 1fr))`,
                   width: 'fit-content' 
                 }}>
              {puzzle.grid.map((row, y) => 
                row.map((cell, x) => (
                  <div key={`${y}-${x}`} 
                       className={`w-8 h-8 relative ${cell ? 'bg-white' : 'bg-cyan-500'}`}>
                    {cell && (
                      <input
                        type="text"
                        maxLength={1}
                        className="w-full h-full text-center uppercase font-bold text-black bg-white"
                        value={userInputs[`${y}-${x}`] || ''}
                        onChange={(e) => handleCellInput(y, x, e.target.value)}
                      />
                    )}
                    {puzzle.positions?.some(pos => pos.x === x && pos.y === y) && (
                      <span className="absolute top-0 left-0 text-xs text-black">
                        {puzzle.positions.findIndex(pos => pos.x === x && pos.y === y) + 1}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-bold mb-4">Clues</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Across</h3>
                <ul className="space-y-2">
                  {puzzle.positions
                    ?.filter(pos => pos.direction === 'across')
                    .map((pos, idx) => (
                      <li key={idx}>
                        <span className="font-medium">
                          {(puzzle.positions?.indexOf(pos) ?? 0) + 1}.
                        </span>{' '}
                        {puzzle.clues[(puzzle.positions?.indexOf(pos) ?? 0)]}
                      </li>
                    ))}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Down</h3>
                <ul className="space-y-2">
                  {puzzle.positions
                    ?.filter(pos => pos.direction === 'down')
                    .map((pos, idx) => (
                      <li key={idx}>
                        <span className="font-medium">
                          {(puzzle.positions?.indexOf(pos) ?? 0) + 1}.
                        </span>{' '}
                        {puzzle.clues[(puzzle.positions?.indexOf(pos) ?? 0)]}
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}