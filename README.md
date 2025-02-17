# YaanAI - Interactive Learning Platform 🐘

YaanAI is an innovative learning platform that transforms PDF documents into interactive learning experiences through games, videos, and mind maps.

## Features

- **PDF Processing**: Upload and analyze PDF documents
- **Interactive Games**:
  - Crossword Puzzles: Generated from PDF content
  - Hangman: Words extracted from uploaded documents
  - Mind Map: Create visual connections between concepts
- **Video Learning**: Automatically fetches relevant educational videos
- **Real-time Chat Interface**: Get instant assistance and explanations

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- A modern web browser

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/yaanAI.git
   ```

2. Install dependencies:
   ```bash
   cd yaanAI
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory and add:
   ```env
   NEXT_PUBLIC_HUGGINGFACE_API_KEY = your_api_key_here
   NEXT_PUBLIC_YOUTUBE_API_KEY = your_api_key_here
   NEXT_PUBLIC_GEMINI_API_KEY = your_api_key_here
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser


## Component Details

### FileUpload Component
- Handles PDF file uploads
- Extracts text content
- Detects topics for video recommendations

### Crossword Component
- Generates crossword puzzles from PDF content
- Interactive puzzle interface
- Provides hints and answers

### Hangman Component
- Extracts keywords from PDF
- Classic hangman game implementation
- Educational word guessing

### MindMap Component
- Create nodes with custom text
- Drag and drop interface
- Visual learning tool

### Video Component
- Fetches relevant educational videos
- Uses YouTube Data API
- Topic-based video recommendations

## Tech Stack

- **Frontend Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **PDF Processing**: PDF.js
- **AI Integration**: gemini, Hugging Face API
- **Video Integration**: YouTube Data API

## Development Guidelines

### Code Style
- Use TypeScript for type safety
- Follow React best practices
- Implement responsive design
- Use client components when necessary

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
