import { useState, useEffect } from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';
import apiService from '../../../Services/api';

export default function MotivationalQuotes() {
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchQuote = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Using ZenQuotes API - free and no auth required
      const response = await fetch('https://api.quotable.io/random?tags=inspirational|motivational|success|perseverance');
      
      if (!response.ok) {
        throw new Error('Failed to fetch quote');
      }
      
      const data = await response.json();
      setQuote({
        text: data.content,
        author: data.author
      });
    } catch (err) {
      setError('Unable to load quote');
      // Fallback quotes for rehab patients
      const fallbackQuotes = [
        {
          text: "Every small step forward is progress. Celebrate your victories, no matter how small.",
          author: "Recovery Wisdom"
        },
        {
          text: "Your body has an amazing ability to heal. Trust the process and stay committed.",
          author: "Rehabilitation Guide"
        },
        {
          text: "Strength doesn't come from what you can do. It comes from overcoming the things you once thought you couldn't.",
          author: "Unknown"
        },
        {
          text: "Recovery is not a race. You don't have to feel guilty for taking the time you need to heal.",
          author: "Wellness Support"
        },
        {
          text: "The only way out is through. Keep going, you're doing better than you think.",
          author: "Healing Journey"
        }
      ];
      
      setQuote(fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuote();
    // Refresh quote every 24 hours
    const interval = setInterval(fetchQuote, 24 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 shadow-sm border border-blue-100 dark:border-gray-700 mb-20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Daily Motivation
          </h3>
        </div>
        <button
          onClick={fetchQuote}
          disabled={loading}
          className="p-2 hover:bg-white dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
          aria-label="Get new quote"
        >
          <RefreshCw className={`w-4 h-4 text-indigo-600 dark:text-indigo-400 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="relative">
        {loading && !quote ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mt-4"></div>
          </div>
        ) : quote ? (
          <div className="space-y-4">
            <div className="relative">
              <svg
                className="absolute -top-2 -left-1 w-8 h-8 text-indigo-200 dark:text-indigo-900 opacity-50"
                fill="currentColor"
                viewBox="0 0 32 32"
              >
                <path d="M10 8c-3.3 0-6 2.7-6 6s2.7 6 6 6c1.4 0 2.6-.5 3.6-1.2L11 24h4l2-6c.3-1 .5-2 .5-3 0-3.9-3.1-7-7-7zm14 0c-3.3 0-6 2.7-6 6s2.7 6 6 6c1.4 0 2.6-.5 3.6-1.2L25 24h4l2-6c.3-1 .5-2 .5-3 0-3.9-3.1-7-7-7z" />
              </svg>
              <p className="text-gray-800 dark:text-gray-100 text-base leading-relaxed pl-6 italic">
                {quote.text}
              </p>
            </div>
            
            <div className="flex items-center justify-between pt-3 border-t border-indigo-100 dark:border-gray-700">
              <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
                — {quote.author}
              </p>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Keep going!
                </span>
              </div>
            </div>
          </div>
        ) : null}

        {error && !quote && (
          <div className="text-center py-4">
            <p className="text-red-600 dark:text-red-400 text-sm mb-2">{error}</p>
            <button
              onClick={fetchQuote}
              className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Try again
            </button>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-indigo-100 dark:border-gray-700">
        <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
          Remember: Progress, not perfection. You're stronger than you know. 💪
        </p>
      </div>
    </div>
  );
}