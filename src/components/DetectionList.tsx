
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

interface Detection {
  id: number;
  cameraId: number;
  cameraName: string;
  type: 'crowd' | 'weapon' | 'fire' | 'object';
  timestamp: string;
  confidence: number;
  metadata?: Record<string, any>;
}

interface DetectionListProps {
  detections: Detection[];
  isLoading?: boolean;
}

const DetectionList: React.FC<DetectionListProps> = ({ detections, isLoading = false }) => {
  const getDetectionBadge = (type: string) => {
    switch (type) {
      case 'weapon':
        return <Badge variant="destructive">Weapon</Badge>;
      case 'fire':
        return <Badge variant="destructive">Fire</Badge>;
      case 'crowd':
        return <Badge className="bg-warning text-warning-foreground">Crowd</Badge>;
      case 'object':
        return <Badge variant="outline">Object</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  };
  
  if (isLoading) {
    return (
      <Card className="w-full p-6">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Card>
    );
  }
  
  if (detections.length === 0) {
    return (
      <Card className="w-full p-6">
        <p className="text-center text-muted-foreground">No detections found</p>
      </Card>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Camera</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Confidence</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {detections.map((detection) => (
            <TableRow key={detection.id}>
              <TableCell>{getDetectionBadge(detection.type)}</TableCell>
              <TableCell>{detection.cameraName}</TableCell>
              <TableCell>{formatTimestamp(detection.timestamp)}</TableCell>
              <TableCell>{Math.round(detection.confidence * 100)}%</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default DetectionList;
