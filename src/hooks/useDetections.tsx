
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Detection } from '@/api/mockApi';
import apiClient from '@/api/apiClient';
import { CONFIG } from '@/config';

export function useDetections() {
  const { user } = useAuth();
  const [detections, setDetections] = useState<Detection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetections = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await apiClient.get(CONFIG.API_ENDPOINTS.DETECTIONS.BASE);
        setDetections(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch detections');
        console.error('Error fetching detections:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetections();
  }, [user]);

  return { detections, isLoading, error };
}
