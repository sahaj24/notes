'use client';

import { useState } from 'react';
import { Send, Loader2, Wand2 } from 'lucide-react';

interface NoteGeneratorProps {
  onNoteGenerated: (note: any) => void;
  isGenerating: boolean;
  setIsGenerating: (generating: boolean) => void;
}

export const NoteGenerator: React.FC<NoteGeneratorProps> = ({
  onNoteGenerated,
  isGenerating,
  setIsGenerating,
}) => {
  const [topic, setTopic] = useState('');
  const [noteType, setNoteType] = useState('study');

  const generateNote = async () => {
    if (!topic.trim()) return;

    setIsGenerating(true);
    
    try {
      // Call Google Gemini API
      const response = await fetch('/api/generate-note', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic,
          noteType,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate note');
      }

      const data = await response.json();
      onNoteGenerated(data);
    } catch (error) {
      console.error('Error generating note:', error);
      alert('Failed to generate note. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    generateNote();
  };

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
          <div className="flex items-center gap-2 mb-6">
            <Wand2 className="w-6 h-6 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-800">Create Your Note</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-2">
                What would you like to learn about?
              </label>
              <input
                type="text"
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Human anatomy, JavaScript functions, History of Rome..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                disabled={isGenerating}
              />
            </div>

            <div>
              <label htmlFor="noteType" className="block text-sm font-medium text-gray-700 mb-2">
                Note Type
              </label>
              <select
                id="noteType"
                value={noteType}
                onChange={(e) => setNoteType(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                disabled={isGenerating}
              >
                <option value="study">Study Guide</option>
                <option value="summary">Summary</option>
                <option value="mindmap">Mind Map</option>
                <option value="flowchart">Flowchart</option>
                <option value="anatomy">Anatomy Diagram</option>
                <option value="timeline">Timeline</option>
                <option value="comparison">Comparison Chart</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={!topic.trim() || isGenerating}
            className="w-full mt-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating your beautiful note...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Generate Beautiful Note
              </>
            )}
          </button>
        </div>
      </form>

      {/* Quick Examples */}
      <div className="mt-8 text-center">
        <p className="text-gray-600 mb-4">Try these examples:</p>
        <div className="flex flex-wrap gap-2 justify-center">
          {[
            'Human Heart Anatomy',
            'JavaScript Functions',
            'Solar System',
            'Cell Division',
            'Renaissance Art',
            'Periodic Table',
          ].map((example) => (
            <button
              key={example}
              onClick={() => setTopic(example)}
              disabled={isGenerating}
              className="px-4 py-2 bg-white/60 hover:bg-white/80 rounded-full text-sm text-gray-700 transition-colors disabled:opacity-50"
            >
              {example}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
