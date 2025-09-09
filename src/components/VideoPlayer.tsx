import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, MoreVertical, Eye, EyeOff, Lock } from 'lucide-react';

// YouTube Player API types
declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
  }
}

interface VideoPlayerProps {
  isBlurred: boolean;
  onUnblur: () => void;
  onReportIssue: () => void;
  videoUrl?: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  isBlurred, 
  onUnblur, 
  onReportIssue,
  videoUrl 
}) => {
  const playerRef = useRef<any>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const [progress, setProgress] = useState(0);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  
  // Convert URL to YouTube video ID, Google Drive embed, or use default
  const getVideoId = (url?: string) => {
    if (!url) return 'UDdy1vI_oiU'; // Default YouTube video
    
    // For YouTube URLs, extract video ID
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
      return match ? match[1] : 'UDdy1vI_oiU';
    }
    
    // For Google Drive URLs, extract file ID and return embed URL
    if (url.includes('drive.google.com')) {
      const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
      if (match) {
        return `https://drive.google.com/file/d/${match[1]}/preview`;
      }
    }
    
    return 'UDdy1vI_oiU'; // Default fallback
  };

  const processedVideoUrl = getVideoId(videoUrl);
  const isGoogleDrive = processedVideoUrl?.includes('drive.google.com');
  const youtubeVideoId = isGoogleDrive ? null : processedVideoUrl;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    if (playerRef.current && isPlayerReady) {
      if (isPlaying) {
        playerRef.current.pauseVideo();
      } else {
        playerRef.current.playVideo();
      }
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    if (playerRef.current && isPlayerReady) {
      const volumePercent = newVolume * 100;
      playerRef.current.setVolume(volumePercent);
      setVolume(volumePercent);
    }
  };

  const handleProgressChange = (newProgress: number) => {
    if (playerRef.current && isPlayerReady && duration > 0) {
      const newTime = (newProgress / 100) * duration;
      playerRef.current.seekTo(newTime);
      setProgress(newProgress);
    }
  };

  const loadYouTubeAPI = () => {
    return new Promise((resolve) => {
      if (window.YT && window.YT.Player) {
        resolve(window.YT);
        return;
      }

      window.onYouTubeIframeAPIReady = () => {
        resolve(window.YT);
      };

      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      document.body.appendChild(script);
    });
  };

  const initializePlayer = async () => {
    await loadYouTubeAPI();
    
    if (playerContainerRef.current && youtubeVideoId) {
      playerRef.current = new window.YT.Player(playerContainerRef.current, {
        videoId: youtubeVideoId,
        width: '100%',
        height: '100%',
        playerVars: {
          controls: 0,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          fs: 1,
          cc_load_policy: 0,
          iv_load_policy: 3,
          autohide: 0
        },
        events: {
          onReady: (event: any) => {
            setIsPlayerReady(true);
            setDuration(event.target.getDuration());
            setVolume(event.target.getVolume());
          },
          onStateChange: (event: any) => {
            if (event.data === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true);
            } else if (event.data === window.YT.PlayerState.PAUSED) {
              setIsPlaying(false);
            }
          }
        }
      });
    }
  };

  useEffect(() => {
    if (!isGoogleDrive) {
      initializePlayer();
    }
  }, [isGoogleDrive]);

  useEffect(() => {
    if (isPlayerReady && playerRef.current && !isGoogleDrive) {
      const updateTime = () => {
        const current = playerRef.current.getCurrentTime();
        const total = playerRef.current.getDuration();
        setCurrentTime(current);
        setProgress((current / total) * 100);
      };

      const interval = setInterval(updateTime, 100);
      return () => clearInterval(interval);
    }
  }, [isPlayerReady]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="relative aspect-video bg-gray-900 rounded-t-lg overflow-hidden">
        {/* Video Player Container */}
        {isGoogleDrive ? (
          // Google Drive iframe
          <iframe
            src={processedVideoUrl}
            className="w-full h-full"
            allowFullScreen
            title="Google Drive Video"
          />
        ) : (
          // YouTube Video Player Container
          <div 
            ref={playerContainerRef}
            className="w-full h-full"
          />
        )}

        {/* Blur Overlay */}
        {isBlurred && (
          <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-lg flex items-center justify-center">
            <div className="text-center text-white p-8">
              <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-6 h-6 text-white" fill="white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                Content Blurred for Protection
              </h3>
              <p className="text-sm text-gray-300">
                This content has been flagged as potentially sensitive material
              </p>
            </div>
          </div>
        )}

        {/* Settings Button */}
        <button className="absolute top-4 right-4 p-2 bg-black/30 hover:bg-black/50 rounded-lg transition-colors">
          <MoreVertical className="w-4 h-4 text-white" fill="hsl(var(--primary))" />
        </button>

      </div>
      
       {/* Video Controls */}
       <div className="bg-white p-4 space-y-2">
         {/* Progress Bar */}
         <div className="w-full">
           <div className="w-full bg-gray-200 rounded-full h-1 cursor-pointer" 
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const clickX = e.clientX - rect.left;
                  const newProgress = (clickX / rect.width) * 100;
                  handleProgressChange(newProgress);
                }}>
             <div 
               className="h-1 bg-purple-600 rounded-full transition-all" 
               style={{ width: `${progress}%` }}
             ></div>
           </div>
         </div>

         {/* Control Buttons */}
         <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Play/Pause Button */}
              <button 
                onClick={handlePlayPause}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6 text-purple-600" />
                ) : (
                  <Play className="w-6 h-6 text-purple-600" />
                )}
              </button>

              {/* Volume Controls */}
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleVolumeChange(volume > 0 ? 0 : 1)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {volume > 0 ? (
                    <Volume2 className="w-6 h-6 text-purple-600" />
                  ) : (
                    <VolumeX className="w-6 h-6 text-purple-600" />
                  )}
                </button>
                <div className="w-16 bg-gray-300 rounded-full h-1 cursor-pointer"
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const clickX = e.clientX - rect.left;
                      const newVolume = (clickX / rect.width);
                      handleVolumeChange(Math.max(0, Math.min(1, newVolume)));
                    }}>
                 <div 
                   className="h-1 bg-purple-600 rounded-full transition-all" 
                   style={{ width: `${volume}%` }}
                 ></div>
               </div>
             </div>

             {/* Time Display */}
             <span className="text-xs text-gray-600">
               {formatTime(currentTime)} / {formatTime(duration)}
             </span>
           </div>

           {/* Action Buttons */}
           <div className="flex items-center gap-2">
             <button 
               onClick={onUnblur}
               className="flex items-center gap-2 text-purple-600 border border-purple-600 bg-white hover:bg-purple-50 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
             >
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   {isBlurred ? (
                     <>
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                     </>
                   ) : (
                     <>
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                     </>
                   )}
                 </svg>
                {isBlurred ? 'Unblur' : 'Blur'}
             </button>
             <button 
               onClick={onReportIssue}
               className="bg-purple-600 text-white hover:bg-purple-700 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
             >
               Report issue
             </button>
           </div>
         </div>
       </div>
     </div>
   );
 };
