
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import Layout from '@/components/Layout';
import CameraView from '@/components/CameraView';
import DetectionList from '@/components/DetectionList';

// Mock data for cameras
const mockCameras = [
  { 
    id: 1, 
    name: 'Front Entrance', 
    location: 'Main Building',  
    status: 'active' as const,
    userId: 1,
    detections: [
      { type: 'crowd' as const, timestamp: new Date().toISOString(), confidence: 0.82 }
    ]
  },
  { 
    id: 2, 
    name: 'Parking Lot', 
    location: 'North Side', 
    status: 'active' as const,
    userId: 1,
    detections: [
      { type: 'object' as const, timestamp: new Date(Date.now() - 120000).toISOString(), confidence: 0.75 }
    ]
  },
  { 
    id: 3, 
    name: 'Storage Room', 
    location: 'Basement', 
    status: 'inactive' as const,
    userId: 2,
    detections: []
  },
  { 
    id: 4, 
    name: 'Lobby', 
    location: 'First Floor', 
    status: 'active' as const,
    userId: 2,
    detections: [
      { type: 'weapon' as const, timestamp: new Date(Date.now() - 300000).toISOString(), confidence: 0.91 }
    ]
  },
  { 
    id: 5, 
    name: 'Back Entrance', 
    location: 'Warehouse', 
    status: 'active' as const,
    userId: 1,
    detections: [
      { type: 'fire' as const, timestamp: new Date(Date.now() - 600000).toISOString(), confidence: 0.88 }
    ]
  },
];

// Mock data for detections
const mockDetections = [
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
];

const Dashboard = () => {
  const { user } = useAuth();
  
  // Filter cameras based on user role
  const filteredCameras = user?.role === 'admin' 
    ? mockCameras 
    : mockCameras.filter(camera => camera.userId === user?.id);
  
  // Filter detections based on user role and camera access
  const userCameraIds = filteredCameras.map(camera => camera.id);
  const filteredDetections = user?.role === 'admin' 
    ? mockDetections
    : mockDetections.filter(detection => userCameraIds.includes(detection.cameraId));

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            {user?.role === 'admin' ? 'Monitor all surveillance cameras and detections' : 'View your assigned cameras and detections'}
          </p>
        </div>
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Active Cameras</h2>
          <div className="camera-grid">
            {filteredCameras.map(camera => (
              <CameraView
                key={camera.id}
                id={camera.id}
                name={camera.name}
                location={camera.location}
                status={camera.status}
                detections={camera.detections}
              />
            ))}
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Recent Detections</h2>
          <DetectionList detections={filteredDetections} />
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
