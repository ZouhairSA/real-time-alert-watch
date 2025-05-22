
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getDetections, Detection } from '@/api/mockApi';

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
        const isAdmin = user.role === 'admin';
        const data = await getDetections(user.id, isAdmin);
        setDetections(data);
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
