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
  return null;
};