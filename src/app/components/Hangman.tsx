import React, { useState, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { TextItem } from 'pdfjs-dist/types/src/display/api';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface HangmanProps {
  pdfFile: File;
}

const Hangman: React.FC<HangmanProps> = ({ pdfFile }) => {
  const [word, setWord] = useState<string>('');
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
  const [incorrectGuesses, setIncorrectGuesses] = useState(0);

  const maxIncorrectGuesses = 6;

  useEffect(() => {
    if (!pdfFile) return;

    const extractWordFromPDF = async () => {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let text = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items
          .filter((item): item is TextItem => 'str' in item)
          .map(item => item.str)
          .join(' ');
      }

      try {
        const response = await fetch('https://api-inference.huggingface.co/models/deepseek-ai/DeepSeek-R1', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ inputs: text })
        });

        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }

        const result = await response.json();
        console.log('API Response:', result);

        const keywords = result.map((item: any) => item.label).filter((word: string) => word.length > 3);
        if (keywords.length === 0) {
          throw new Error('No suitable keywords found');
        }

        const randomWord = keywords[Math.floor(Math.random() * keywords.length)].toUpperCase();
        setWord(randomWord);
      } catch (error) {
        console.error('Error extracting keywords:', error);
        setWord('ERROR');
      }
    };

    extractWordFromPDF();
  }, [pdfFile]);

  const handleGuess = (letter: string) => {
    if (guessedLetters.includes(letter)) return;

    setGuessedLetters([...guessedLetters, letter]);

    if (!word.includes(letter)) {
      setIncorrectGuesses(incorrectGuesses + 1);
    }
  };

  const isGameOver = incorrectGuesses >= maxIncorrectGuesses;
  const isGameWon = word.split('').every(letter => guessedLetters.includes(letter));

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Hangman</h2>
      <div className="mb-4">
        {word.split('').map((letter, index) => (
          <span key={index} className="text-2xl mx-1">
            {guessedLetters.includes(letter) ? letter : '_'}
          </span>
        ))}
      </div>
      <div className="mb-4">
        <p>Incorrect Guesses: {incorrectGuesses} / {maxIncorrectGuesses}</p>
      </div>
      <div className="mb-4">
        <p>Guessed Letters: {guessedLetters.join(', ')}</p>
      </div>
      <div>
        {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(letter => (
          <button
            key={letter}
            onClick={() => handleGuess(letter)}
            disabled={guessedLetters.includes(letter) || isGameOver || isGameWon}
            className="m-1 p-2 border rounded"
          >
            {letter}
          </button>
        ))}
      </div>
      {isGameOver && <p className="text-red-500">Game Over! The word was {word}.</p>}
      {isGameWon && <p className="text-green-500">Congratulations! You've won!</p>}
    </div>
  );
};

export default Hangman; 