import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useModeration } from '@/hooks/useModeration';
import { Upload, CheckCircle, Globe, PlayCircle, Loader2 } from 'lucide-react';

interface ModerateByUrlDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
  initialUrl?: string;
  initialTitle?: string;
  autoStart?: boolean;
}

export const ModerateByUrlDialog: React.FC<ModerateByUrlDialogProps> = ({
  open,
  onOpenChange,
  onComplete,
  initialUrl,
  initialTitle,
  autoStart,
}) => {
  const [url, setUrl] = useState(initialUrl || '');
  const [title, setTitle] = useState(initialTitle || '');
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const startedRef = useRef(false);
  const { toast } = useToast();
  const { moderateWithGoogleVideo } = useModeration();

  useEffect(() => {
    if (open) {
      if (initialUrl) setUrl(initialUrl);
      if (initialTitle) setTitle(initialTitle);
      setDone(false);
      setProgress(0);
      setProcessing(false);
      startedRef.current = false;
    }
  }, [open, initialUrl, initialTitle]);

  useEffect(() => {
    if (open && autoStart && url && !startedRef.current) {
      startedRef.current = true;
      void handleStart();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, autoStart, url]);

  const fileNameFromUrl = useMemo(() => {
    try {
      const u = new URL(url);
      return decodeURIComponent(u.pathname.split('/').pop() || 'video.mp4');
    } catch {
      return 'video.mp4';
    }
  }, [url]);

  const handleStart = async () => {
    if (!url.trim()) {
      toast({ title: 'Missing URL', description: 'Please enter a video URL to moderate', variant: 'destructive' });
      return;
    }

    setProcessing(true);
    setProgress(5);

    const progressInterval = setInterval(() => {
      setProgress((p) => (p < 85 ? p + Math.random() * 7 : p));
    }, 250);

    try {
      // 1) Fetch from URL (requires CORS enabled on the source)
      const res = await fetch(url, { mode: 'cors' });
      if (!res.ok) throw new Error(`Failed to fetch video (HTTP ${res.status})`);
      const blob = await res.blob();

      // 2) Upload to Supabase Storage (reliable path for server-side moderation)
      const extGuess = fileNameFromUrl.split('.').pop() || 'mp4';
      const filePath = `uploads/${Date.now()}-${Math.random().toString(36).slice(2)}.${extGuess}`;
      const { error: uploadError } = await supabase.storage
        .from('videos')
        .upload(filePath, blob, { contentType: blob.type || 'video/mp4' });
      if (uploadError) throw uploadError;

      // 3) Public URL
      const { data: { publicUrl } } = supabase.storage.from('videos').getPublicUrl(filePath);

      // 4) Save DB record
      const effectiveTitle = title.trim() || fileNameFromUrl.replace(/\.[^/.]+$/, '');
      const { error: dbError } = await supabase.from('content_items').insert({
        title: effectiveTitle,
        video_url: publicUrl,
        storage_path: filePath,
        file_size: blob.size,
        thumbnail_url: '',
      });
      if (dbError) throw dbError;

      setProgress(92);

      // 5) Kick off moderation (await to "carry out automated checks")
      toast({ title: 'Analyzing video', description: 'Running safety analysis...' });
      await moderateWithGoogleVideo(publicUrl);

      clearInterval(progressInterval);
      setProgress(100);
      setDone(true);
      toast({ title: 'Moderation complete', description: 'Checks finished successfully.' });

      // Close after a short delay
      setTimeout(() => {
        onComplete();
        onOpenChange(false);
      }, 1200);
    } catch (error) {
      clearInterval(progressInterval);
      setProcessing(false);
      setProgress(0);
      console.error('Moderate by URL error:', error);
      const message = error instanceof Error ? error.message : 'Unexpected error';
      const corsHint = message.includes('fetch') || message.toLowerCase().includes('network')
        ? ' If this is a localhost URL, please enable CORS on your server or use the Upload dialog instead.'
        : '';
      toast({ title: 'Unable to analyze URL', description: message + corsHint, variant: 'destructive' });
    }
  };

  const handleClose = (newOpen: boolean) => {
    if (!processing) {
      onOpenChange(newOpen);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Moderate by URL</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="video-url">Video URL</Label>
            <div className="flex gap-2">
              <Input
                id="video-url"
                placeholder="https://example.com/video.mp4 or http://localhost:8000/video.mp4"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={processing}
              />
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Globe className="w-3 h-3" /> Source must allow CORS for the browser to fetch the video.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="video-title">Title</Label>
            <Input
              id="video-title"
              placeholder="Enter title (optional)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={processing}
            />
          </div>

          {processing && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Processing...
                </span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          {done && (
            <div className="flex items-center justify-center p-4 rounded-lg bg-green-50 text-green-700">
              <CheckCircle className="w-5 h-5 mr-2" /> Moderation completed successfully
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => handleClose(false)} disabled={processing}>
              Cancel
            </Button>
            <Button onClick={handleStart} disabled={processing || !url.trim()}>
              <PlayCircle className="w-4 h-4 mr-2" />
              {processing ? 'Processing...' : 'Fetch & Analyze'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
