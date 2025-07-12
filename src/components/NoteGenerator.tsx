'use client';

import { useState } from 'react';
import { Send, Loader2, Wand2, Coins } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface NoteGeneratorProps {
  onNoteGenerated: (note: { noteHtml: string; topic: string }) => void;
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
  const [pages, setPages] = useState(1);
  const { userCoins, spendCoins, refundCoins, user } = useAuth();

  const generateNote = async () => {
    if (!topic.trim()) return;

    // Check if user has enough coins (1 coin per page)
    const noteCost = pages;
    if (userCoins < noteCost) {
      alert(`Not enough coins to generate ${pages > 1 ? pages + ' pages' : 'a note'}. You need ${noteCost} coins but only have ${userCoins}.`);
      return;
    }

    setIsGenerating(true);
    
    try {
      // Spend coins first
      const success = await spendCoins(noteCost, `Note generation: ${topic}`, undefined);
      if (!success) {
        alert('Failed to spend coins. Please try again.');
        setIsGenerating(false);
        return;
      }

      // Call Google Gemini API
      const response = await fetch('/api/generate-note', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic,
          noteType,
          pages,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate note');
      }

      const data = await response.json();
      onNoteGenerated(data);
    } catch (error) {
      console.error('Error generating note:', error);
      alert('Failed to generate note. Your coins have been refunded.');
      
      // Refund coins on failure
      try {
        await refundCoins(noteCost, `Refund for failed note generation: ${topic}`);
      } catch (refundError) {
        console.error('Failed to refund coins:', refundError);
      }
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
      {/* Coin Balance Display */}
      <div className="mb-4 flex justify-center">
        <div className="bg-white/70 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg flex items-center gap-2">
          <Coins className="w-5 h-5 text-yellow-500" />
          <span className="font-semibold text-gray-800">
            {userCoins} coins
          </span>
          {!user && (
            <span className="text-sm text-gray-600">
              (Guest - Sign in for more coins!)
            </span>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg">            <div className="flex items-center gap-2 mb-6">
              <Wand2 className="w-6 h-6 text-purple-600" />
              <h2 className="text-2xl font-bold text-gray-800">Create Your Note</h2>
              <div className="ml-auto bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                Costs {pages} coin{pages > 1 ? 's' : ''}
              </div>
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

              <div>
                <label htmlFor="pages" className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Pages (1 coin per page)
                </label>
                <select
                  id="pages"
                  value={pages}
                  onChange={(e) => setPages(parseInt(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                  disabled={isGenerating}
                >
                  <option value={1}>1 Page (1 coin)</option>
                  <option value={2}>2 Pages (2 coins)</option>
                  <option value={3}>3 Pages (3 coins)</option>
                  <option value={4}>4 Pages (4 coins)</option>
                  <option value={5}>5 Pages (5 coins)</option>
                </select>
              </div>
            </div>

          <button
            type="submit"
            disabled={!topic.trim() || isGenerating || userCoins < pages}
            className={`w-full mt-6 font-medium py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${
              userCoins < pages
                ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 text-white'
            }`}
          >
            {userCoins < pages ? (
              <>
                <Coins className="w-5 h-5" />
                Not enough coins (need {pages})
              </>
            ) : isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating your beautiful note...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Generate Beautiful Note ({pages} coin{pages > 1 ? 's' : ''})
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
