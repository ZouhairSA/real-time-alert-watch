
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import DetectionList from '@/components/DetectionList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MonitorOff } from 'lucide-react';

// Mock data for detections
const allMockDetections = [
  { 
    id: 1, 
    cameraId: 4, 
    cameraName: 'Lobby', 
    type: 'weapon' as const, 
    timestamp: new Date(Date.now() - 300000).toISOString(),
    confidence: 0.91 
  },
  { 
    id: 2, 
    cameraId: 5, 
    cameraName: 'Back Entrance', 
    type: 'fire' as const, 
    timestamp: new Date(Date.now() - 600000).toISOString(),
    confidence: 0.88 
  },
  { 
    id: 3, 
    cameraId: 1, 
    cameraName: 'Front Entrance', 
    type: 'crowd' as const, 
    timestamp: new Date().toISOString(),
    confidence: 0.82 
  },
  { 
    id: 4, 
    cameraId: 2, 
    cameraName: 'Parking Lot', 
    type: 'object' as const, 
    timestamp: new Date(Date.now() - 120000).toISOString(),
    confidence: 0.75 
  },
  { 
    id: 5, 
    cameraId: 1, 
    cameraName: 'Front Entrance', 
    type: 'object' as const, 
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    confidence: 0.68 
  },
  { 
    id: 6, 
    cameraId: 4, 
    cameraName: 'Lobby', 
    type: 'crowd' as const, 
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    confidence: 0.79 
  },
  { 
    id: 7, 
    cameraId: 2, 
    cameraName: 'Parking Lot', 
    type: 'weapon' as const, 
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    confidence: 0.94 
  },
  { 
    id: 8, 
    cameraId: 5, 
    cameraName: 'Back Entrance', 
    type: 'object' as const, 
    timestamp: new Date(Date.now() - 172800000).toISOString(),
    confidence: 0.71 
  },
];

const DetectionsPage = () => {
  const [filterType, setFilterType] = useState<string>("all");
  const [filterCamera, setFilterCamera] = useState<string>("all");
  
  // Get unique camera names
  const cameras = Array.from(new Set(allMockDetections.map(d => d.cameraName)));
  
  // Filter detections
  const filteredDetections = allMockDetections.filter(detection => {
    const typeMatch = filterType === "all" || detection.type === filterType;
    const cameraMatch = filterCamera === "all" || detection.cameraName === filterCamera;
    return typeMatch && cameraMatch;
  });

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Detection History</h1>
          <p className="text-muted-foreground">View and filter all AI-detected events</p>
        </div>

        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium">
              <div className="flex items-center">
                <MonitorOff className="mr-2 h-5 w-5" />
                Filter Detections
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="w-full sm:w-1/2">
                <label className="text-sm font-medium mb-1 block">Detection Type</label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="weapon">Weapon</SelectItem>
                    <SelectItem value="fire">Fire</SelectItem>
                    <SelectItem value="crowd">Crowd</SelectItem>
                    <SelectItem value="object">Object</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="w-full sm:w-1/2">
                <label className="text-sm font-medium mb-1 block">Camera</label>
                <Select value={filterCamera} onValueChange={setFilterCamera}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select camera" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Cameras</SelectItem>
                    {cameras.map(camera => (
                      <SelectItem key={camera} value={camera}>{camera}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <DetectionList detections={filteredDetections} />
      </div>
    </Layout>
  );
};

export default DetectionsPage;
