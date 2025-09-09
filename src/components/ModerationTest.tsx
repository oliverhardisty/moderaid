import React, { useState } from 'react';
import { useModeration } from '@/hooks/useModeration';
import { Button } from '@/components/ui/button';

export const ModerationTest: React.FC = () => {
  const [testText, setTestText] = useState('');
  const [results, setResults] = useState<any>(null);
  const { moderateWithBoth, isLoading, error } = useModeration();

  const handleTest = async () => {
    if (!testText.trim()) return;

    try {
      const results = await moderateWithBoth(testText);
      setResults(results);
    } catch (err) {
      console.error('Moderation test failed:', err);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
      <h3 className="text-lg font-semibold mb-4">API Moderation Test</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Test Text
          </label>
          <textarea
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            rows={3}
            placeholder="Enter text to moderate..."
          />
        </div>

        <Button 
          onClick={handleTest}
          disabled={isLoading || !testText.trim()}
          className="w-full"
        >
          {isLoading ? 'Testing...' : 'Test Moderation APIs'}
        </Button>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800 text-sm">Error: {error}</p>
          </div>
        )}

        {results && (
          <div className="space-y-4">
            {/* Consensus */}
            <div className="p-4 bg-gray-50 rounded-md">
              <h4 className="font-semibold text-gray-900 mb-2">Consensus</h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium">Flagged:</span>
                  <span className={`ml-2 ${results.consensus.flagged ? 'text-red-600' : 'text-green-600'}`}>
                    {results.consensus.flagged ? 'Yes' : 'No'}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Confidence:</span>
                  <span className="ml-2 capitalize">{results.consensus.confidence}</span>
                </div>
                <div>
                  <span className="font-medium">Categories:</span>
                  <span className="ml-2">{results.consensus.categories.join(', ') || 'None'}</span>
                </div>
              </div>
            </div>

            {/* OpenAI Results */}
            <div className="p-4 bg-blue-50 rounded-md">
              <h4 className="font-semibold text-blue-900 mb-2">OpenAI Results</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Flagged:</span>
                  <span className={`ml-2 ${results.openai.flagged ? 'text-red-600' : 'text-green-600'}`}>
                    {results.openai.flagged ? 'Yes' : 'No'}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Categories:</span>
                  <span className="ml-2">{results.openai.categories.join(', ') || 'None'}</span>
                </div>
              </div>
            </div>

            {/* Azure Results */}
            <div className="p-4 bg-green-50 rounded-md">
              <h4 className="font-semibold text-green-900 mb-2">Azure Results</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Flagged:</span>
                  <span className={`ml-2 ${results.azure.flagged ? 'text-red-600' : 'text-green-600'}`}>
                    {results.azure.flagged ? 'Yes' : 'No'}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Categories:</span>
                  <span className="ml-2">{results.azure.categories.join(', ') || 'None'}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};