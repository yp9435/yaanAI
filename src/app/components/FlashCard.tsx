"use client";

import React, { useState, useEffect } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { TextItem } from "pdfjs-dist/types/src/display/api";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");

interface FlashCardProps {
  pdfFile: File | null;
  onClose: () => void;
}

const FlashCard: React.FC<FlashCardProps> = ({ pdfFile, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [words, setWords] = useState<string[]>([]);
  const [definitions, setDefinitions] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showDefinition, setShowDefinition] = useState(false);

  useEffect(() => {
    if (pdfFile) {
      extractTextFromPDF();
    }
  }, [pdfFile]);

  const extractTextFromPDF = async () => {
    try {
      const arrayBuffer = await pdfFile!.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = "";

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => (item as TextItem).str)
          .join(" ");
        fullText += pageText + " ";
      }

      await generateFlashcardsFromText(fullText);
    } catch (err) {
      setError("Error processing PDF: " + (err as Error).message);
      setLoading(false);
    }
  };

  const generateFlashcardsFromText = async (text: string) => {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const prompt = `Extract 10 key terms and their definitions from this text: "${text.substring(0, 1000)}". Format the response as JSON with 'words' and 'definitions' arrays.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      let responseText = response.text();

      console.log("Gemini API Response:", responseText); // Debugging output

      responseText = responseText.replace(/```json|```/g, "").trim(); // Remove markdown formatting
      responseText = responseText.replace(/^[^{[]*/, "").replace(/[^}\]]*$/, ""); // Remove unwanted text

      const flashcardData = JSON.parse(responseText);

      if (!flashcardData.words || !flashcardData.definitions) {
        throw new Error("Invalid response format (Missing 'words' or 'definitions').");
      }

      setWords(flashcardData.words);
      setDefinitions(flashcardData.definitions);
      setLoading(false);
    } catch (err) {
      console.error("Failed to parse Gemini response:", err);
      setError("Error generating flashcards: Invalid response format.");
      setLoading(false);
    }
  };

  const handleNext = () => {
    setShowDefinition(false);
    setCurrentIndex((prev) => (prev + 1) % words.length);
  };

  const handlePrev = () => {
    setShowDefinition(false);
    setCurrentIndex((prev) => (prev - 1 + words.length) % words.length);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg w-11/12 max-w-lg relative p-6 text-center">
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Loading Indicator */}
        {loading && (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        )}

        {/* Error Message */}
        {error && <div className="text-red-500 p-4 rounded-lg bg-red-50">{error}</div>}

        {/* Flashcard Content */}
        {!loading && !error && words.length > 0 && (
          <>
            <div
              className="w-full h-48 flex items-center justify-center border border-gray-300 shadow-lg rounded-lg cursor-pointer"
              onClick={() => setShowDefinition(!showDefinition)}
            >
              <h2 className="text-2xl font-bold text-gray-800">
                {showDefinition ? definitions[currentIndex] : words[currentIndex]}
              </h2>
            </div>

            {/* Navigation */}
            <div className="mt-6 flex justify-between items-center">
              <button onClick={handlePrev} className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400">
                ⬅ Previous
              </button>

              <span className="text-gray-700">
                {currentIndex + 1} / {words.length}
              </span>

              <button onClick={handleNext} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                Next ➡
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FlashCard;
