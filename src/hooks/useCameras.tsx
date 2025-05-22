
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getCameras, Camera } from '@/api/mockApi';

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
        const isAdmin = user.role === 'admin';
        const data = await getCameras(user.id, isAdmin);
        setCameras(data);
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
