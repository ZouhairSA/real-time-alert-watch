
import { useState, useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/context/AuthContext';
import { toast } from "@/components/ui/sonner";
import { WEBSOCKET_URL } from '@/config';
import { Detection } from '@/api/mockApi';

export function useWebSocket() {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [latestDetection, setLatestDetection] = useState<Detection | null>(null);

  // Connect to WebSocket
  useEffect(() => {
    if (!user) {
      return;
    }

    // Create socket connection
    const newSocket = io(WEBSOCKET_URL);

    newSocket.on('connect', () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      
      // Subscribe to user-specific notifications
      newSocket.emit('subscribe', { user_id: user.id });
    });

    newSocket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    });

    // Listen for detection alerts
    newSocket.on('detection_alert', (data: Detection) => {
      console.log('Detection alert received:', data);
      setLatestDetection(data);
      
      // Show a toast notification
      const alertType = data.type;
      const severity = alertType === 'weapon' || alertType === 'fire' ? 'error' : 'warning';
      
      toast[severity](`${alertType.charAt(0).toUpperCase() + alertType.slice(1)} detected on ${data.camera_name}`, {
        description: `Confidence: ${Math.round(data.confidence * 100)}%`,
        duration: 6000
      });
    });

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [user]);

  // Function to manually send a message (for testing)
  const sendMessage = useCallback((event: string, data: any) => {
    if (socket && isConnected) {
      socket.emit(event, data);
    }
  }, [socket, isConnected]);

  return { isConnected, latestDetection, sendMessage };
}
