
import React from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '@/context/AuthContext';

// Mock AI model data
const mockAiModels = [
  { 
    id: 1, 
    name: 'AIcrowd_v1', 
    endpoint: 'https://aicrowd-v1.onrender.com/detect', 
    description: 'Detects unusual crowd behavior and density',
    enabled: true
  },
  { 
    id: 2, 
    name: 'AIweapon_v1', 
    endpoint: 'https://aiweapon-v1.onrender.com/detect', 
    description: 'Identifies potential weapons in the video stream',
    enabled: true
  },
  { 
    id: 3, 
    name: 'AIfire_v1', 
    endpoint: 'https://aifire-v1.onrender.com/detect', 
    description: 'Detects fire and smoke in the environment',
    enabled: true
  },
  { 
    id: 4, 
    name: 'AIobject_v1', 
    endpoint: 'https://aiobject-v1.onrender.com/detect', 
    description: 'Recognizes and tracks objects of interest',
    enabled: false
  },
];

const Settings = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [autoRecordingEnabled, setAutoRecordingEnabled] = React.useState(true);
  const [aiModels, setAiModels] = React.useState(mockAiModels);
  
  const handleToggleModel = (id: number) => {
    setAiModels(prev => prev.map(model => 
      model.id === id ? { ...model, enabled: !model.enabled } : model
    ));
    
    const model = aiModels.find(m => m.id === id);
    if (model) {
      toast.success(`${model.name} ${model.enabled ? 'disabled' : 'enabled'}`);
    }
  };
  
  const handleSaveSettings = () => {
    toast.success("Settings saved successfully");
  };

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Configure your surveillance system preferences</p>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Configure how you want to receive alerts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notifications">Enable notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive alerts for detection events</p>
                </div>
                <Switch 
                  id="notifications"
                  checked={notificationsEnabled}
                  onCheckedChange={setNotificationsEnabled}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-recording">Automatic recording</Label>
                  <p className="text-sm text-muted-foreground">Record video clips when detections occur</p>
                </div>
                <Switch 
                  id="auto-recording"
                  checked={autoRecordingEnabled}
                  onCheckedChange={setAutoRecordingEnabled}
                />
              </div>
            </CardContent>
          </Card>

          {isAdmin && (
            <Card>
              <CardHeader>
                <CardTitle>AI Models Configuration</CardTitle>
                <CardDescription>Configure detection models and their parameters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {aiModels.map((model) => (
                  <div key={model.id}>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-base font-medium flex items-center">
                          {model.name}
                          {model.enabled ? (
                            <Badge variant="outline" className="bg-success/10 text-success border-success/20 ml-2">
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="ml-2">
                              Disabled
                            </Badge>
                          )}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">{model.description}</p>
                        <p className="text-xs text-muted-foreground mt-2 font-mono">{model.endpoint}</p>
                      </div>
                      <Switch 
                        checked={model.enabled}
                        onCheckedChange={() => handleToggleModel(model.id)}
                      />
                    </div>
                    {model.id < aiModels.length && <Separator className="my-4" />}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>User Preferences</CardTitle>
              <CardDescription>Update your personal settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid w-full items-center gap-2">
                <Label htmlFor="email">Email for notifications</Label>
                <Input id="email" defaultValue={user?.email} />
              </div>
              
              <div className="grid w-full items-center gap-2">
                <Label htmlFor="password">Change Password</Label>
                <Input id="password" type="password" placeholder="Enter new password" />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleSaveSettings}>Save Changes</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
