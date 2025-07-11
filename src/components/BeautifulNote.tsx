'use client';

import React, { useState } from 'react';

export const BeautifulNote: React.FC = () => {
  const [topic, setTopic] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [noteHtml, setNoteHtml] = useState<string | null>(null);

  const handleGenerateNote = async (topic: string) => {
    if (!topic) return;
    setIsLoading(true);
    setError(null);
    setNoteHtml(null); // Clear previous note

    try {
      const response = await fetch('/api/generate-note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error("API Error Response:", errorBody);
        throw new Error(`Failed to generate note. Status: ${response.status}`);
      }

      const data = await response.json();
      if (!data.noteHtml) {
        console.error("Invalid data structure from API:", data);
        throw new Error("Received invalid note structure from server.");
      }
      
      // The AI returns a string of HTML. We need to clean it up
      // in case it's wrapped in markdown code fences.
      const cleanedHtml = data.noteHtml.replace(/```html/g, '').replace(/```/g, '').trim();
      setNoteHtml(cleanedHtml);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-screen flex bg-gray-100">
      {/* Sidebar for input */}
      <div className="w-96 h-full bg-white shadow-2xl p-8 flex flex-col z-10">
        <h1 className="text-3xl font-bold text-gray-800 font-serif mb-2">AI Note Generator</h1>
        <p className="text-md text-gray-600 mb-6">Enter a topic and watch the magic happen.</p>
        
        <div className="flex flex-col space-y-4">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., 'The Renaissance'"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
            disabled={isLoading}
          />
          <button
            onClick={() => handleGenerateNote(topic)}
            className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 transition-transform transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </div>
            ) : 'Generate Note'}
          </button>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>
      </div>

      {/* Main content area for displaying the note */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
        {noteHtml ? (
          <div className="w-full h-full bg-white rounded-lg shadow-inner">
            <iframe
              srcDoc={noteHtml}
              title="Generated Note"
              className="w-full h-full border-none"
            />
          </div>
        ) : (
          <div className="text-center text-gray-500">
            <h2 className="text-2xl font-semibold">Your beautiful note will appear here</h2>
            <p>Enter a topic in the sidebar to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
};
