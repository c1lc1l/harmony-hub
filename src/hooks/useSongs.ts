import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Song } from '@/contexts/PlayerContext';

export const useSongs = () => {
  return useQuery({
    queryKey: ['songs'],
    queryFn: async (): Promise<Song[]> => {
      const { data, error } = await supabase
        .from('songs')
        .select('*')
        .order('title');

      if (error) throw error;
      return data || [];
    },
  });
};
