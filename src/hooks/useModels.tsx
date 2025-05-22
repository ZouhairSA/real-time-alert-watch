
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getModels, AiModel } from '@/api/mockApi';

export function useModels() {
  const { user } = useAuth();
  const [models, setModels] = useState<AiModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchModels = async () => {
      if (!user || user.role !== 'admin') {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const data = await getModels();
        setModels(data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch AI models');
        console.error('Error fetching AI models:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchModels();
  }, [user]);

  return { models, isLoading, error };
}
