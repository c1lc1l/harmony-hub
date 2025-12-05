import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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

interface UploadSongParams {
  file: File;
  title: string;
  artist: string;
  duration: number;
}

export const useUploadSong = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ file, title, artist, duration }: UploadSongParams) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Must be logged in to upload');

      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('audio')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('audio')
        .getPublicUrl(fileName);

      // Create song record
      const { data, error } = await supabase
        .from('songs')
        .insert({
          title,
          artist,
          s3_url: publicUrl,
          duration,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['songs'] });
    },
  });
};

export const useDeleteSong = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (songId: string) => {
      const { error } = await supabase
        .from('songs')
        .delete()
        .eq('id', songId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['songs'] });
    },
  });
};
