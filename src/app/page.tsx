import Image from "next/image"
import Link from 'next/link'

export default function Home() {
  return (
    <main className="container mt-20 mx-auto px-20 py-8">
      <div className="flex flex-col md:flex-row items-center justify-between">
        <div className="md:w-1/2 mb-8 md:mb-0">
          <h2 className="text-5xl md:text-7xl font-extrabold mb-4 text-[#2c3e50] flex">
            <span className="mr-2">Learn.</span>
            <span className="mr-2">Play.</span>
            <span>Grow.</span>
          </h2>
          <h3 className="text-3xl md:text-5xl font-semibold mb-6 text-[#2c3e50]">with YaanAI</h3>
          <p className="text-lg mb-8 text-gray-700">
            Discover the joy of learning with our AI-powered education platform designed for curious minds.
          </p>
          <Link href="/dashboard">
            <button className="bg-[#2c3e50] text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-[#1a2428] transition-colors shadow-md">
              Get Started
            </button>
          </Link>
        </div>
        <div className="md:w-1/2 flex justify-end">
          <Image
            src="/yaanailogo.png"
            alt="yaan.ai logo"
            width={400}
            height={400}
            className="transition-transform transform hover:scale-105"
          />
        </div>
      </div>
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-lg transition-transform transform hover:scale-105">
          <h4 className="text-xl font-semibold mb-4 text-[#2c3e50]">Personalized Learning</h4>
          <p className="text-gray-600">
            At YaanAI, we're making learning fun again. No more boring lessons; we're gamifying everything! With AI-powered paths, we ensure each student's learning is personalized to fit their style and pace.
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg transition-transform transform hover:scale-105">
          <h4 className="text-xl font-semibold mb-4 text-[#2c3e50]">Gamified Experience</h4>
          <p className="text-gray-600">
            Flashcards, puzzles, and challenges? Yep, we've got them all to keep things exciting and help students actually remember what they learn.
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg transition-transform transform hover:scale-105">
          <h4 className="text-xl font-semibold mb-4 text-[#2c3e50]">Adaptive Learning</h4>
          <p className="text-gray-600">
            Our AI integration uses Llama (via Groq API) to adapt learning paths, ensuring every student receives a tailored educational experience.
          </p>
        </div>
      </div>
    </main>
  )
}

