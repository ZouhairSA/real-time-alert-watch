
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import DetectionList from '@/components/DetectionList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MonitorOff } from 'lucide-react';
import { Detection } from '@/api/mockApi'; // Import the Detection type

// Mock data for detections - structure updated to match Detection type
const allMockDetections: Detection[] = [
  { 
    id: 1, 
    camera_id: 4, 
    camera_name: 'Lobby', 
    user_id: 1,
    model_id: 1,
    type: 'weapon', 
    timestamp: new Date(Date.now() - 300000).toISOString(),
    confidence: 0.91,
    metadata: { weapon_type: 'handgun', bounding_box: [120, 80, 45, 30] }
  },
  { 
    id: 2, 
    camera_id: 5, 
    camera_name: 'Back Entrance',
    user_id: 1,
    model_id: 3, 
    type: 'fire', 
    timestamp: new Date(Date.now() - 600000).toISOString(),
    confidence: 0.88,
    metadata: { flame_detected: true, smoke_detected: true }
  },
  { 
    id: 3, 
    camera_id: 1, 
    camera_name: 'Front Entrance',
    user_id: 2,
    model_id: 1, 
    type: 'crowd', 
    timestamp: new Date().toISOString(),
    confidence: 0.82,
    metadata: { density: 0.76, movement: 'high' }
  },
  { 
    id: 4, 
    camera_id: 2, 
    camera_name: 'Parking Lot',
    user_id: 3,
    model_id: 4, 
    type: 'object', 
    timestamp: new Date(Date.now() - 120000).toISOString(),
    confidence: 0.75,
    metadata: { object_type: 'package', bounding_box: [240, 160, 60, 50] }
  },
  { 
    id: 5, 
    camera_id: 1, 
    camera_name: 'Front Entrance',
    user_id: 2,
    model_id: 4, 
    type: 'object', 
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    confidence: 0.68,
    metadata: { object_type: 'bag', bounding_box: [320, 210, 40, 35] }
  },
  { 
    id: 6, 
    camera_id: 4, 
    camera_name: 'Lobby',
    user_id: 2,
    model_id: 1, 
    type: 'crowd', 
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    confidence: 0.79,
    metadata: { density: 0.65, movement: 'medium' }
  },
  { 
    id: 7, 
    camera_id: 2, 
    camera_name: 'Parking Lot',
    user_id: 1,
    model_id: 2, 
    type: 'weapon', 
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    confidence: 0.94,
    metadata: { weapon_type: 'rifle', bounding_box: [180, 120, 90, 40] }
  },
  { 
    id: 8, 
    camera_id: 5, 
    camera_name: 'Back Entrance',
    user_id: 3,
    model_id: 4, 
    type: 'object', 
    timestamp: new Date(Date.now() - 172800000).toISOString(),
    confidence: 0.71,
    metadata: { object_type: 'laptop', bounding_box: [200, 150, 55, 40] }
  },
];

const DetectionsPage = () => {
  const [filterType, setFilterType] = useState<string>("all");
  const [filterCamera, setFilterCamera] = useState<string>("all");
  
  // Get unique camera names
  const cameras = Array.from(new Set(allMockDetections.map(d => d.camera_name)));
  
  // Filter detections
  const filteredDetections = allMockDetections.filter(detection => {
    const typeMatch = filterType === "all" || detection.type === filterType;
    const cameraMatch = filterCamera === "all" || detection.camera_name === filterCamera;
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
