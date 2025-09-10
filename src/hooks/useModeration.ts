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
  moderateWithGoogleVideo: (uri: string) => Promise<ModerationResult>;
  moderateWithGoogleVideoContent: (inputContentB64: string) => Promise<ModerationResult>;
  isLoading: boolean;
  error: string | null;
}

export const useModeration = (): ModerationHook => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
 
  return {
    moderateWithGoogleVideo,
    moderateWithGoogleVideoContent,
    isLoading,
    error,
  };
};