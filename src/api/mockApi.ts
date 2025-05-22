
import { toast } from "@/components/ui/sonner";

// Types
export type User = {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'user';
};

export type Camera = {
  id: number;
  name: string;
  location: string;
  ip_address: string;
  user_id: number;
  status: 'active' | 'inactive';
  created_at: string;
};

export type AiModel = {
  id: number;
  name: string;
  endpoint_url: string;
  api_key: string;
  description: string;
  created_at: string;
};

export type Detection = {
  id: number;
  camera_id: number;
  camera_name: string;
  user_id: number;
  model_id: number;
  type: 'crowd' | 'weapon' | 'fire' | 'object';
  confidence: number;
  timestamp: string;
  metadata: any;
  video_clip_path?: string;
};

// Mock data
const mockCameras: Camera[] = [
  {
    id: 1,
    name: "Main Entrance",
    location: "Front Gate",
    ip_address: "rtsp://192.168.1.101:554/stream",
    user_id: 2,
    status: "active",
    created_at: "2025-05-10T09:30:00Z"
  },
  {
    id: 2,
    name: "Parking Lot",
    location: "North Side",
    ip_address: "rtsp://192.168.1.102:554/stream",
    user_id: 2,
    status: "active",
    created_at: "2025-05-10T10:15:00Z"
  },
  {
    id: 3,
    name: "Staff Entrance",
    location: "East Wing",
    ip_address: "rtsp://192.168.1.103:554/stream",
    user_id: 2,
    status: "inactive",
    created_at: "2025-05-10T11:00:00Z"
  },
  {
    id: 4,
    name: "Server Room",
    location: "Basement",
    ip_address: "rtsp://192.168.1.104:554/stream",
    user_id: 3,
    status: "active",
    created_at: "2025-05-11T08:45:00Z"
  }
];

const mockModels: AiModel[] = [
  {
    id: 1,
    name: "AIcrowd_v1",
    endpoint_url: "https://aicrowd-v1.onrender.com/detect",
    api_key: "api_key_crowd_123",
    description: "Crowd detection model",
    created_at: "2025-05-01T10:00:00Z"
  },
  {
    id: 2,
    name: "AIweapon_v1",
    endpoint_url: "https://aiweapon-v1.onrender.com/detect",
    api_key: "api_key_weapon_456",
    description: "Weapon detection model",
    created_at: "2025-05-02T11:30:00Z"
  },
  {
    id: 3,
    name: "AIfire_v1",
    endpoint_url: "https://aifire-v1.onrender.com/detect",
    api_key: "api_key_fire_789",
    description: "Fire and smoke detection model",
    created_at: "2025-05-03T14:15:00Z"
  },
  {
    id: 4,
    name: "AIobject_v1",
    endpoint_url: "https://aiobject-v1.onrender.com/detect",
    api_key: "api_key_object_012",
    description: "Object recognition model",
    created_at: "2025-05-04T16:45:00Z"
  }
];

const mockDetections: Detection[] = [
  {
    id: 1,
    camera_id: 1,
    camera_name: "Main Entrance",
    user_id: 2,
    model_id: 2,
    type: "weapon",
    confidence: 0.87,
    timestamp: "2025-05-22T14:32:15Z",
    metadata: {
      weapon_type: "handgun",
      bounding_box: [124, 195, 83, 45]
    }
  },
  {
    id: 2,
    camera_id: 2,
    camera_name: "Parking Lot",
    user_id: 2,
    model_id: 1,
    type: "crowd",
    confidence: 0.93,
    timestamp: "2025-05-22T14:35:22Z",
    metadata: {
      density: 0.76,
      movement: "rapid"
    }
  },
  {
    id: 3,
    camera_id: 4,
    camera_name: "Server Room",
    user_id: 3,
    model_id: 3,
    type: "fire",
    confidence: 0.68,
    timestamp: "2025-05-22T14:40:05Z",
    metadata: {
      flame_detected: true,
      smoke_detected: true
    }
  },
  {
    id: 4,
    camera_id: 1,
    camera_name: "Main Entrance",
    user_id: 2,
    model_id: 4,
    type: "object",
    confidence: 0.95,
    timestamp: "2025-05-22T14:45:30Z",
    metadata: {
      object_type: "suitcase",
      bounding_box: [220, 310, 100, 120]
    }
  }
];

// API simulation functions

// Camera API
export const getCameras = async (userId: number, isAdmin: boolean): Promise<Camera[]> => {
  await simulateNetworkDelay();
  
  // Return all cameras for admin, or only cameras assigned to the user
  return isAdmin 
    ? mockCameras 
    : mockCameras.filter(camera => camera.user_id === userId);
};

export const getCamera = async (id: number): Promise<Camera | undefined> => {
  await simulateNetworkDelay();
  return mockCameras.find(camera => camera.id === id);
};

export const createCamera = async (camera: Omit<Camera, 'id' | 'created_at'>): Promise<Camera> => {
  await simulateNetworkDelay();
  
  const newCamera: Camera = {
    ...camera,
    id: Math.max(...mockCameras.map(c => c.id)) + 1,
    created_at: new Date().toISOString()
  };
  
  mockCameras.push(newCamera);
  toast.success("Camera created successfully");
  
  return newCamera;
};

export const updateCamera = async (id: number, updates: Partial<Camera>): Promise<Camera | undefined> => {
  await simulateNetworkDelay();
  
  const cameraIndex = mockCameras.findIndex(camera => camera.id === id);
  if (cameraIndex === -1) {
    toast.error("Camera not found");
    return undefined;
  }
  
  mockCameras[cameraIndex] = {
    ...mockCameras[cameraIndex],
    ...updates
  };
  
  toast.success("Camera updated successfully");
  return mockCameras[cameraIndex];
};

export const deleteCamera = async (id: number): Promise<boolean> => {
  await simulateNetworkDelay();
  
  const initialLength = mockCameras.length;
  const newCameras = mockCameras.filter(camera => camera.id !== id);
  mockCameras.length = 0;
  mockCameras.push(...newCameras);
  
  const success = initialLength > mockCameras.length;
  if (success) {
    toast.success("Camera deleted successfully");
  } else {
    toast.error("Camera not found");
  }
  
  return success;
};

// Models API
export const getModels = async (): Promise<AiModel[]> => {
  await simulateNetworkDelay();
  return mockModels;
};

export const getModel = async (id: number): Promise<AiModel | undefined> => {
  await simulateNetworkDelay();
  return mockModels.find(model => model.id === id);
};

export const createModel = async (model: Omit<AiModel, 'id' | 'created_at'>): Promise<AiModel> => {
  await simulateNetworkDelay();
  
  const newModel: AiModel = {
    ...model,
    id: Math.max(...mockModels.map(m => m.id)) + 1,
    created_at: new Date().toISOString()
  };
  
  mockModels.push(newModel);
  toast.success("AI Model created successfully");
  
  return newModel;
};

export const updateModel = async (id: number, updates: Partial<AiModel>): Promise<AiModel | undefined> => {
  await simulateNetworkDelay();
  
  const modelIndex = mockModels.findIndex(model => model.id === id);
  if (modelIndex === -1) {
    toast.error("AI Model not found");
    return undefined;
  }
  
  mockModels[modelIndex] = {
    ...mockModels[modelIndex],
    ...updates
  };
  
  toast.success("AI Model updated successfully");
  return mockModels[modelIndex];
};

export const deleteModel = async (id: number): Promise<boolean> => {
  await simulateNetworkDelay();
  
  const initialLength = mockModels.length;
  const newModels = mockModels.filter(model => model.id !== id);
  mockModels.length = 0;
  mockModels.push(...newModels);
  
  const success = initialLength > mockModels.length;
  if (success) {
    toast.success("AI Model deleted successfully");
  } else {
    toast.error("AI Model not found");
  }
  
  return success;
};

// Detections API
export const getDetections = async (userId: number, isAdmin: boolean): Promise<Detection[]> => {
  await simulateNetworkDelay();
  
  // Return all detections for admin, or only detections from cameras assigned to the user
  return isAdmin 
    ? mockDetections 
    : mockDetections.filter(detection => detection.user_id === userId);
};

export const createDetection = async (detection: Omit<Detection, 'id'>): Promise<Detection> => {
  await simulateNetworkDelay();
  
  const newDetection: Detection = {
    ...detection,
    id: Math.max(...mockDetections.map(d => d.id)) + 1
  };
  
  mockDetections.push(newDetection);
  return newDetection;
};

// Helper function to simulate network delay
const simulateNetworkDelay = (): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 500));
};
