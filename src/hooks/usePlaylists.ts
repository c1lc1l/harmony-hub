import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Playlist {
  id: string;
  name: string;
  owner: string;
  created_at: string;
  updated_at: string;
}

export interface PlaylistSong {
  id: string;
  playlist_id: string;
  song_id: string;
  song_order: number;
}

export const usePlaylists = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['playlists', user?.id],
    queryFn: async (): Promise<Playlist[]> => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('playlists')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
};

export const usePlaylistSongs = (playlistId: string | null) => {
  return useQuery({
    queryKey: ['playlist-songs', playlistId],
    queryFn: async () => {
      if (!playlistId) return [];
      const { data, error } = await supabase
        .from('playlist_songs')
        .select(`
          id,
          playlist_id,
          song_id,
          song_order,
          songs (*)
        `)
        .eq('playlist_id', playlistId)
        .order('song_order');

      if (error) throw error;
      return data || [];
    },
    enabled: !!playlistId,
  });
};

export const useCreatePlaylist = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (name: string) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('playlists')
        .insert({ name, owner: user.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlists'] });
      toast.success('Playlist created');
    },
    onError: () => {
      toast.error('Failed to create playlist');
    },
  });
};

export const useUpdatePlaylist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const { error } = await supabase
        .from('playlists')
        .update({ name })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlists'] });
      toast.success('Playlist updated');
    },
    onError: () => {
      toast.error('Failed to update playlist');
    },
  });
};

export const useDeletePlaylist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('playlists')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlists'] });
      toast.success('Playlist deleted');
    },
    onError: () => {
      toast.error('Failed to delete playlist');
    },
  });
};

export const useAddSongToPlaylist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ playlistId, songId }: { playlistId: string; songId: string }) => {
      // Get current max order
      const { data: existing } = await supabase
        .from('playlist_songs')
        .select('song_order')
        .eq('playlist_id', playlistId)
        .order('song_order', { ascending: false })
        .limit(1);

      const nextOrder = existing && existing.length > 0 ? existing[0].song_order + 1 : 0;

      const { error } = await supabase
        .from('playlist_songs')
        .insert({ playlist_id: playlistId, song_id: songId, song_order: nextOrder });

      if (error) throw error;
    },
    onSuccess: (_, { playlistId }) => {
      queryClient.invalidateQueries({ queryKey: ['playlist-songs', playlistId] });
      toast.success('Song added to playlist');
    },
    onError: (error: any) => {
      if (error?.code === '23505') {
        toast.error('Song already in playlist');
      } else {
        toast.error('Failed to add song');
      }
    },
  });
};

export const useRemoveSongFromPlaylist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ playlistId, songId }: { playlistId: string; songId: string }) => {
      const { error } = await supabase
        .from('playlist_songs')
        .delete()
        .eq('playlist_id', playlistId)
        .eq('song_id', songId);

      if (error) throw error;
    },
    onSuccess: (_, { playlistId }) => {
      queryClient.invalidateQueries({ queryKey: ['playlist-songs', playlistId] });
      toast.success('Song removed from playlist');
    },
    onError: () => {
      toast.error('Failed to remove song');
    },
  });
};

export const useReorderPlaylistSongs = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ playlistId, songIds }: { playlistId: string; songIds: string[] }) => {
      // Update each song's order
      const updates = songIds.map((songId, index) =>
        supabase
          .from('playlist_songs')
          .update({ song_order: index })
          .eq('playlist_id', playlistId)
          .eq('song_id', songId)
      );

      await Promise.all(updates);
    },
    onSuccess: (_, { playlistId }) => {
      queryClient.invalidateQueries({ queryKey: ['playlist-songs', playlistId] });
    },
  });
};
