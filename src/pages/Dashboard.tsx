
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import CameraView from '@/components/CameraView';
import DetectionList from '@/components/DetectionList';
import { useAuth } from '@/context/AuthContext';
import { useCameras } from '@/hooks/useCameras';
import { useDetections } from '@/hooks/useDetections';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Camera, Shield, AlertTriangle, Video, MonitorOff, Users } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const { cameras, isLoading: camerasLoading } = useCameras();
  const { detections, isLoading: detectionsLoading } = useDetections();
  const [activeTab, setActiveTab] = useState('cameras');

  // Count statistics
  const activeCameras = cameras.filter(cam => cam.status === 'active').length;
  const inactiveCameras = cameras.length - activeCameras;
  const weaponDetections = detections.filter(d => d.type === 'weapon').length;
  const fireDetections = detections.filter(d => d.type === 'fire').length;
  
  // Sort detections by timestamp (newest first)
  const sortedDetections = [...detections].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  
  // Get recent detections (last 5)
  const recentDetections = sortedDetections.slice(0, 5);

  // Generate camera props from our camera data
  const cameraViewProps = cameras.map(camera => ({
    id: camera.id,
    name: camera.name,
    location: camera.location,
    status: camera.status,
    detections: detections
      .filter(d => d.camera_id === camera.id)
      .map(d => ({
        type: d.type,
        timestamp: d.timestamp,
        confidence: d.confidence
      }))
  }));

  return (
    <Layout>
      <div className="container mx-auto p-4 md:p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Welcome, {user?.username}</h1>
          <p className="text-muted-foreground">
            AI SecurityV2 | {user?.role === 'admin' ? 'Administrator' : 'User'}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Total Cameras
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="text-2xl font-bold">{cameras.length}</div>
                <Camera className="h-6 w-6 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Active Cameras
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="text-2xl font-bold">{activeCameras}</div>
                <Video className="h-6 w-6 text-success" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Inactive Cameras
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="text-2xl font-bold">{inactiveCameras}</div>
                <MonitorOff className="h-6 w-6 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Critical Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="text-2xl font-bold">{weaponDetections + fireDetections}</div>
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="cameras" className="mb-6" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="cameras">
              <Camera className="h-4 w-4 mr-2" />
              Cameras
            </TabsTrigger>
            <TabsTrigger value="detections">
              <Shield className="h-4 w-4 mr-2" />
              Recent Detections
            </TabsTrigger>
            {user?.role === 'admin' && (
              <TabsTrigger value="users">
                <Users className="h-4 w-4 mr-2" />
                User Management
              </TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="cameras" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {camerasLoading ? (
                <div className="col-span-full flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : cameraViewProps.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <p className="text-muted-foreground">No cameras found</p>
                </div>
              ) : (
                cameraViewProps.map(camera => (
                  <CameraView key={camera.id} {...camera} />
                ))
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="detections" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Detections</CardTitle>
                <CardDescription>
                  Recent detection events from all cameras
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DetectionList 
                  detections={recentDetections} 
                  isLoading={detectionsLoading} 
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="users" className="mt-6">
            {user?.role === 'admin' && (
              <Card>
                <CardHeader>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>
                    Manage user accounts and permissions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-center py-6 text-muted-foreground">
                    User management functionality to be implemented
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Dashboard;
