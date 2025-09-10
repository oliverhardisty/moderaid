import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, X, CheckCircle } from 'lucide-react';
import { useModeration } from '@/hooks/useModeration';

interface VideoUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadComplete: () => void;
}

export const VideoUploadDialog: React.FC<VideoUploadDialogProps> = ({
  open,
  onOpenChange,
  onUploadComplete,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadComplete, setUploadComplete] = useState(false);
  const { toast } = useToast();
  const { moderateWithGoogleVideo } = useModeration();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.type.startsWith('video/')) {
        toast({
          title: "Invalid file type",
          description: "Please select a video file (MP4, AVI, MOV, etc.)",
          variant: "destructive",
        });
        return;
      }
      
      if (selectedFile.size > 500 * 1024 * 1024) { // 500MB limit
        toast({
          title: "File too large",
          description: "Please select a video file smaller than 500MB",
          variant: "destructive",
        });
        return;
      }
      
      setFile(selectedFile);
      if (!title) {
        setTitle(selectedFile.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const generateThumbnail = (videoFile: File): Promise<string> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      video.addEventListener('loadedmetadata', () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        video.currentTime = Math.min(1, video.duration / 2);
      });
      
      video.addEventListener('seeked', () => {
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        }
      });
      
      video.src = URL.createObjectURL(videoFile);
    });
  };

  const handleUpload = async () => {
    if (!file || !title.trim()) {
      toast({
        title: "Missing information",
        description: "Please select a file and enter a title",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 10;
        });
      }, 200);

      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('videos')
        .upload(filePath, file);

      clearInterval(progressInterval);
      setUploadProgress(100); // Set to 100% when upload completes

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('videos')
        .getPublicUrl(filePath);

      // Generate thumbnail (optional)
      let thumbnailUrl = '';
      try {
        thumbnailUrl = await generateThumbnail(file);
      } catch (error) {
        console.log('Thumbnail generation failed:', error);
      }

      // Save metadata to database
      const { error: dbError } = await supabase
        .from('content_items')
        .insert({
          title: title.trim(),
          video_url: publicUrl,
          storage_path: filePath,
          file_size: file.size,
          thumbnail_url: thumbnailUrl,
        });

      if (dbError) {
        throw dbError;
      }

      setUploadComplete(true);
      toast({
        title: "Upload successful!",
        description: "Your video has been uploaded successfully.",
      });

      // Kick off moderation checks in the background (non-blocking)
      try {
        toast({
          title: "Starting moderation checks",
          description: "Running video safety analysis in the background.",
        });
        // Fire and forget
        void (async () => {
          try {
            await moderateWithGoogleVideo(publicUrl);
            toast({ title: "Moderation checks complete", description: "Analysis finished." });
          } catch (e) {
            console.warn('Background moderation failed:', e);
          }
        })();
      } catch (e) {
        console.warn('Unable to start background moderation:', e);
      }

      // Reset form after a delay
      setTimeout(() => {
        setFile(null);
        setTitle('');
        setUploadProgress(0);
        setUploadComplete(false);
        onUploadComplete();
        onOpenChange(false);
      }, 2000);

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "An error occurred during upload",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const resetDialog = () => {
    setFile(null);
    setTitle('');
    setUploadProgress(0);
    setUploadComplete(false);
    setUploading(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!uploading) {
      if (!newOpen) {
        resetDialog();
      }
      onOpenChange(newOpen);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Video Content</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* File Selection */}
          <div className="space-y-2">
            <Label htmlFor="video-file">Video File</Label>
            <div className="flex items-center justify-center w-full">
              <label
                htmlFor="video-file"
                className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                  file 
                    ? 'border-green-300 bg-green-50' 
                    : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
                } ${uploading ? 'pointer-events-none opacity-50' : ''}`}
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {file ? (
                    <>
                      <CheckCircle className="w-8 h-8 mb-2 text-green-500" />
                      <p className="text-sm text-green-700 font-medium">{file.name}</p>
                      <p className="text-xs text-green-600">
                        {(file.size / (1024 * 1024)).toFixed(1)} MB
                      </p>
                    </>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 mb-2 text-gray-500" />
                      <p className="text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">MP4, AVI, MOV, etc. (Max 500MB)</p>
                    </>
                  )}
                </div>
                <input
                  id="video-file"
                  type="file"
                  className="hidden"
                  accept="video/*"
                  onChange={handleFileSelect}
                  disabled={uploading}
                />
              </label>
            </div>
          </div>

          {/* Title Input */}
          <div className="space-y-2">
            <Label htmlFor="video-title">Video Title</Label>
            <Input
              id="video-title"
              placeholder="Enter video title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={uploading}
            />
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uploading...</span>
                <span>{Math.round(uploadProgress)}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          )}

          {/* Upload Complete */}
          {uploadComplete && (
            <div className="flex items-center justify-center p-4 bg-green-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              <span className="text-green-700 font-medium">Upload completed successfully!</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!file || !title.trim() || uploading || uploadComplete}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {uploading ? 'Uploading...' : 'Upload Video'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};