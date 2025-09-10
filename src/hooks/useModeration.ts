import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";

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
  moderateWithGoogleVideo: (uri: string) => Promise<ModerationResult>;
  moderateWithGoogleVideoContent: (inputContentB64: string) => Promise<ModerationResult>;
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
      const { data, error } = await supabase.functions.invoke('moderate-openai', {
        body: { text },
      });

      if (error) throw new Error(`OpenAI moderation failed: ${error.message}`);
      return data as ModerationResult;
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
      const { data, error } = await supabase.functions.invoke('moderate-azure', {
        body: { text },
      });

      if (error) throw new Error(`Azure moderation failed: ${error.message}`);
      return data as ModerationResult;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const moderateWithGoogleVideo = async (uri: string): Promise<ModerationResult> => {
    setIsLoading(true);
    setError(null);
    try {
      const body: any = uri.startsWith('gs://') ? { gcsUri: uri } : { videoUrl: uri };
      const { data, error } = await supabase.functions.invoke('moderate-video', {
        body,
      });
      if (error) throw new Error(`Google Video Intelligence failed: ${error.message}`);
      return data as ModerationResult;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const moderateWithGoogleVideoContent = async (inputContentB64: string): Promise<ModerationResult> => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.functions.invoke('moderate-video', {
        body: { inputContentB64 },
      });
      if (error) throw new Error(`Google Video Intelligence failed: ${error.message}`);
      return data as ModerationResult;
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
    moderateWithGoogleVideo,
    moderateWithGoogleVideoContent,
    moderateWithBoth,
    isLoading,
    error,
  };
};