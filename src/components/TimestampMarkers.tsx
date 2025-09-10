import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Clock } from 'lucide-react';

interface TimestampMarker {
  timeOffset: number;
  categories: string[];
  confidence: number;
}

interface TimestampMarkersProps {
  timestamps?: TimestampMarker[];
  onSeekTo: (time: number) => void;
  videoDuration?: number;
}

export const TimestampMarkers: React.FC<TimestampMarkersProps> = ({ 
  timestamps = [], 
  onSeekTo,
  videoDuration = 0 
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'sexual_explicit': return 'destructive';
      case 'violence': return 'secondary';
      case 'weapons': return 'outline';
      case 'graphic_content': return 'destructive';
      default: return 'default';
    }
  };

  if (timestamps.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <Clock className="h-4 w-4" />
        <span>Flagged Timestamps ({timestamps.length})</span>
      </div>
      
      <div className="space-y-2">
        {timestamps.map((marker, index) => (
          <div 
            key={index}
            className="flex items-center justify-between p-3 rounded-lg border bg-muted/50"
          >
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">
                    {formatTime(marker.timeOffset)}
                  </span>
                  <Badge variant={getCategoryColor(marker.categories[0])}>
                    {marker.categories[0].replace(/[/_]/g, ' ')}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Confidence: {Math.round(marker.confidence * 100)}%
                </div>
              </div>
            </div>
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => onSeekTo(marker.timeOffset)}
              className="h-8"
            >
              Jump to
            </Button>
          </div>
        ))}
      </div>
      
      {/* Visual timeline */}
      <div className="relative h-2 bg-muted rounded-full overflow-hidden">
        {timestamps.map((marker, index) => {
          const position = videoDuration > 0 ? (marker.timeOffset / videoDuration) * 100 : 0;
          return (
            <div
              key={index}
              className="absolute top-0 w-1 h-full bg-destructive"
              style={{ left: `${Math.min(position, 99)}%` }}
              title={`${formatTime(marker.timeOffset)} - ${marker.categories.join(', ')}`}
            />
          );
        })}
      </div>
    </div>
  );
};