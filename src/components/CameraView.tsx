
import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MonitorOff } from "lucide-react";

interface CameraViewProps {
  id: number;
  name: string;
  location: string;
  status: 'active' | 'inactive';
  imageUrl?: string;
  detections?: {
    type: 'crowd' | 'weapon' | 'fire' | 'object';
    timestamp: string;
    confidence: number;
  }[];
}

const CameraView: React.FC<CameraViewProps> = ({
  id,
  name,
  location,
  status,
  imageUrl,
  detections = []
}) => {
  const [isLoading, setIsLoading] = useState(true);

  // Simulated load time for demo purposes
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, Math.random() * 2000 + 500);

    return () => clearTimeout(timer);
  }, []);

  const getAlertBadge = (type: string) => {
    switch (type) {
      case 'weapon':
        return <Badge variant="destructive" className="alert-badge weapon">Weapon Detected</Badge>;
      case 'fire':
        return <Badge variant="destructive" className="alert-badge">Fire Detected</Badge>;
      case 'crowd':
        return <Badge variant="secondary" className="bg-warning text-warning-foreground">Crowd Detected</Badge>;
      case 'object':
        return <Badge variant="default" className="bg-primary text-primary-foreground">Object Detected</Badge>;
      default:
        return null;
    }
  };

  // Get the most critical detection (weapon > fire > crowd > object)
  const getCriticalDetection = () => {
    if (detections.length === 0) return null;
    
    const priorityOrder = ['weapon', 'fire', 'crowd', 'object'];
    const sortedDetections = [...detections].sort((a, b) => {
      return priorityOrder.indexOf(a.type) - priorityOrder.indexOf(b.type);
    });
    
    return sortedDetections[0];
  };

  const criticalDetection = getCriticalDetection();

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{name}</CardTitle>
            <p className="text-sm text-muted-foreground">{location}</p>
          </div>
          {status === 'active' ? (
            <Badge variant="outline" className="bg-success/10 text-success border-success/20">
              Active
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
              Offline
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="camera-feed">
          {status === 'active' ? (
            <>
              {isLoading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <img 
                  src={imageUrl || `https://picsum.photos/id/${(id * 10) % 100}/800/450`} 
                  alt={`Camera feed from ${name}`} 
                  className="w-full h-full object-cover"
                />
              )}
            </>
          ) : (
            <div className="camera-feed-offline absolute inset-0 flex flex-col items-center justify-center">
              <MonitorOff className="h-8 w-8 mb-2 text-muted-foreground/60" />
              <span>No Signal</span>
            </div>
          )}
          
          {/* Detection alert overlay */}
          {criticalDetection && status === 'active' && !isLoading && (
            <div className="absolute top-3 left-3">
              {getAlertBadge(criticalDetection.type)}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-3">
        <div className="w-full">
          {criticalDetection && status === 'active' ? (
            <p className="text-xs text-muted-foreground">
              Detection at {new Date(criticalDetection.timestamp).toLocaleTimeString()} (Confidence: {Math.round(criticalDetection.confidence * 100)}%)
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">No recent detections</p>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default CameraView;
