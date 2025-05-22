
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Camera } from '@/api/mockApi';
import apiClient from '@/api/apiClient';
import { CONFIG } from '@/config';

export function useCameras() {
  const { user } = useAuth();
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCameras = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await apiClient.get(CONFIG.API_ENDPOINTS.CAMERAS.BASE);
        setCameras(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch cameras');
        console.error('Error fetching cameras:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCameras();
  }, [user]);

  return { cameras, isLoading, error };
}
