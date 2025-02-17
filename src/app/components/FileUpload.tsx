import React, { useState } from 'react';
import { extractTextFromPDF } from '@/utils/pdf-utils';
import { analyzeContent } from '@/utils/gemini-utils';

interface FileUploadProps {
  onTopicDetected: (topic: string) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onTopicDetected }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);

    try {
      console.log('Processing file:', file.name); // Debug log
      const text = await extractTextFromPDF(file);
      if (!text || text.trim().length === 0) {
        throw new Error('No text was extracted from the PDF');
      }
      
      const topic = await analyzeContent(text);
      if (!topic || topic.trim().length === 0) {
        throw new Error('No topic was detected');
      }
      
      onTopicDetected(topic.trim());
    } catch (err) {
      console.error('File upload error:', err);
      setError(err instanceof Error ? err.message : 'Error processing file. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 border-2 border-dashed rounded-lg">
      <input
        type="file"
        accept=".pdf"
        onChange={handleFileUpload}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />
      {isLoading && <div className="mt-2">Analyzing PDF...</div>}
      {error && <div className="mt-2 text-red-500">{error}</div>}
    </div>
  );
};

export default FileUpload;
