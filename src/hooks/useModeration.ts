import { useState } from 'react';

interface ModerationResult {
  flagged: boolean;
  categories: string[];
  categoryScores: Record<string, number>;
  provider: string;
  timestamp: string;
}

interface ModerationHook {
  moderateWithOpenAI: (text: string) => Promise<ModerationResult>;
  moderateWithAzure: (text: string) => Promise<ModerationResult>;
  moderateWithBoth: (text: string) => Promise<{
    openai: ModerationResult;
    azure: ModerationResult;
    consensus: {
      flagged: boolean;
      categories: string[];
      confidence: 'high' | 'medium' | 'low';
    };
  }>;
  isLoading: boolean;
  error: string | null;
}

export const useModeration = (): ModerationHook => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const moderateWithOpenAI = async (text: string): Promise<ModerationResult> => {
    setIsLoading(true);
    setError(null);

    try {
      // Use Supabase function URL
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/moderate-openai`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI moderation failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const moderateWithAzure = async (text: string): Promise<ModerationResult> => {
    setIsLoading(true);
    setError(null);

    try {
      // Use Supabase function URL
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/moderate-azure`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error(`Azure moderation failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const moderateWithBoth = async (text: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const [openaiResult, azureResult] = await Promise.all([
        moderateWithOpenAI(text),
        moderateWithAzure(text),
      ]);

      // Create consensus analysis
      const bothFlagged = openaiResult.flagged && azureResult.flagged;
      const eitherFlagged = openaiResult.flagged || azureResult.flagged;
      
      // Combine categories from both providers
      const allCategories = [
        ...new Set([...openaiResult.categories, ...azureResult.categories])
      ];

      // Determine confidence level
      let confidence: 'high' | 'medium' | 'low';
      if (bothFlagged) {
        confidence = 'high';
      } else if (eitherFlagged) {
        confidence = 'medium';
      } else {
        confidence = 'low';
      }

      return {
        openai: openaiResult,
        azure: azureResult,
        consensus: {
          flagged: eitherFlagged,
          categories: allCategories,
          confidence,
        },
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    moderateWithOpenAI,
    moderateWithAzure,
    moderateWithBoth,
    isLoading,
    error,
  };
};