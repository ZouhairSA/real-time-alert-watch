
import React from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Video } from 'lucide-react';

// Mock data for cameras
const mockCameras = [
  { 
    id: 1, 
    name: 'Front Entrance', 
    location: 'Main Building', 
    ipAddress: 'rtsp://192.168.1.100:554/stream', 
    status: 'active',
    assignedTo: 'admin',
    lastActive: new Date().toISOString()
  },
  { 
    id: 2, 
    name: 'Parking Lot', 
    location: 'North Side', 
    ipAddress: 'rtsp://192.168.1.101:554/stream', 
    status: 'active',
    assignedTo: 'admin',
    lastActive: new Date(Date.now() - 120000).toISOString()
  },
  { 
    id: 3, 
    name: 'Storage Room', 
    location: 'Basement', 
    ipAddress: 'rtsp://192.168.1.102:554/stream', 
    status: 'inactive',
    assignedTo: 'user1',
    lastActive: new Date(Date.now() - 86400000).toISOString()
  },
  { 
    id: 4, 
    name: 'Lobby', 
    location: 'First Floor', 
    ipAddress: 'rtsp://192.168.1.103:554/stream', 
    status: 'active',
    assignedTo: 'user1',
    lastActive: new Date(Date.now() - 300000).toISOString()
  },
  { 
    id: 5, 
    name: 'Back Entrance', 
    location: 'Warehouse', 
    ipAddress: 'rtsp://192.168.1.104:554/stream', 
    status: 'active',
    assignedTo: 'user2',
    lastActive: new Date(Date.now() - 600000).toISOString()
  },
];

const CamerasPage = () => {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString();
  };

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Camera Management</h1>
            <p className="text-muted-foreground">Manage surveillance cameras and their assignments</p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add Camera
          </Button>
        </div>

        <Card className="mb-8">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium">
              <div className="flex items-center">
                <Video className="mr-2 h-5 w-5" />
                Surveillance Cameras
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockCameras.map((camera) => (
                  <TableRow key={camera.id}>
                    <TableCell className="font-medium">{camera.name}</TableCell>
                    <TableCell>{camera.location}</TableCell>
                    <TableCell className="font-mono text-xs">{camera.ipAddress}</TableCell>
                    <TableCell>
                      {camera.status === 'active' ? (
                        <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
                          Offline
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{camera.assignedTo}</TableCell>
                    <TableCell>{formatTime(camera.lastActive)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">Edit</Button>
                      <Button variant="ghost" size="sm" className="text-destructive">Delete</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default CamerasPage;
