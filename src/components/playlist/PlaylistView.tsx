import React, { useState } from 'react';
import { usePlayer, Song } from '@/contexts/PlayerContext';
import {
  usePlaylists,
  usePlaylistSongs,
  useUpdatePlaylist,
  useDeletePlaylist,
  useRemoveSongFromPlaylist,
  useReorderPlaylistSongs,
} from '@/hooks/usePlaylists';
import { Play, Pause, Trash2, Edit2, GripVertical, Clock, Music, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';

interface PlaylistViewProps {
  playlistId: string;
  onPlaylistDeleted: () => void;
}

const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const PlaylistView: React.FC<PlaylistViewProps> = ({ playlistId, onPlaylistDeleted }) => {
  const { data: playlists } = usePlaylists();
  const { data: playlistSongs, isLoading } = usePlaylistSongs(playlistId);
  const updatePlaylist = useUpdatePlaylist();
  const deletePlaylist = useDeletePlaylist();
  const removeSong = useRemoveSongFromPlaylist();
  const reorderSongs = useReorderPlaylistSongs();
  const { currentSong, isPlaying, playPlaylist, togglePlay } = usePlayer();

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const playlist = playlists?.find((p) => p.id === playlistId);
  const songs: Song[] = playlistSongs?.map((ps: any) => ps.songs) || [];

  const handleSaveEdit = () => {
    if (editName.trim() && playlist) {
      updatePlaylist.mutate({ id: playlist.id, name: editName.trim() });
      setIsEditing(false);
    }
  };

  const handleDeletePlaylist = () => {
    deletePlaylist.mutate(playlistId, {
      onSuccess: () => {
        onPlaylistDeleted();
      },
    });
    setDeleteDialogOpen(false);
  };

  const handlePlaySong = (song: Song, index: number) => {
    if (currentSong?.id === song.id) {
      togglePlay();
    } else {
      playPlaylist(songs, index);
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newSongs = [...songs];
    const [draggedItem] = newSongs.splice(draggedIndex, 1);
    newSongs.splice(index, 0, draggedItem);

    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    if (draggedIndex !== null) {
      const songIds = songs.map((s) => s.id);
      reorderSongs.mutate({ playlistId, songIds });
    }
    setDraggedIndex(null);
  };

  if (isLoading || !playlist) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-24 h-24 rounded-2xl bg-gradient-primary flex items-center justify-center glow-primary">
            <Music className="w-10 h-10 text-primary-foreground" />
          </div>
          <div>
            {isEditing ? (
              <div className="flex items-center gap-2">
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="text-2xl font-bold h-auto py-1 bg-muted/50 border-border/50"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveEdit();
                    if (e.key === 'Escape') setIsEditing(false);
                  }}
                />
                <button
                  onClick={handleSaveEdit}
                  className="p-2 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="p-2 rounded-lg hover:bg-muted/50 text-muted-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <h1 className="text-3xl font-bold text-foreground">{playlist.name}</h1>
            )}
            <p className="text-muted-foreground mt-1">{songs.length} songs</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {songs.length > 0 && (
            <Button
              onClick={() => playPlaylist(songs)}
              className="btn-primary rounded-full px-6"
            >
              <Play className="w-4 h-4 mr-2" />
              Play
            </Button>
          )}
          <button
            onClick={() => {
              setEditName(playlist.name);
              setIsEditing(true);
            }}
            className="p-3 rounded-xl hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Edit2 className="w-5 h-5" />
          </button>
          <button
            onClick={() => setDeleteDialogOpen(true)}
            className="p-3 rounded-xl hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Songs */}
      {songs.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center">
          <Music className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">This playlist is empty</p>
          <p className="text-sm text-muted-foreground/70 mt-1">
            Add songs from the library
          </p>
        </div>
      ) : (
        <div className="glass rounded-xl overflow-hidden">
          <div className="grid grid-cols-[auto_auto_1fr_1fr_auto_auto] gap-4 px-6 py-3 border-b border-border/50 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            <span className="w-6"></span>
            <span className="w-10">#</span>
            <span>Title</span>
            <span>Artist</span>
            <span className="flex items-center justify-end">
              <Clock className="w-4 h-4" />
            </span>
            <span className="w-10"></span>
          </div>

          <div className="divide-y divide-border/30">
            {songs.map((song, index) => {
              const isCurrentSong = currentSong?.id === song.id;
              return (
                <div
                  key={song.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className={cn(
                    "grid grid-cols-[auto_auto_1fr_1fr_auto_auto] gap-4 px-6 py-3 items-center group transition-all",
                    isCurrentSong ? "bg-primary/5" : "hover:bg-muted/30",
                    draggedIndex === index && "opacity-50"
                  )}
                >
                  <span className="w-6 cursor-grab active:cursor-grabbing">
                    <GripVertical className="w-4 h-4 text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </span>
                  <span className="w-10 text-center">
                    <button onClick={() => handlePlaySong(song, index)} className="relative">
                      <span
                        className={cn(
                          "text-sm transition-opacity",
                          isCurrentSong ? "text-primary" : "text-muted-foreground group-hover:opacity-0"
                        )}
                      >
                        {isCurrentSong && isPlaying ? (
                          <Music className="w-4 h-4 animate-pulse-glow" />
                        ) : (
                          index + 1
                        )}
                      </span>
                      {!isCurrentSong && (
                        <Play className="w-4 h-4 absolute inset-0 opacity-0 group-hover:opacity-100 text-foreground transition-opacity" />
                      )}
                      {isCurrentSong && (
                        <span className="absolute inset-0 flex items-center justify-center">
                          {isPlaying ? (
                            <Pause className="w-4 h-4 text-primary" />
                          ) : (
                            <Play className="w-4 h-4 text-primary" />
                          )}
                        </span>
                      )}
                    </button>
                  </span>
                  <span className={cn("font-medium truncate", isCurrentSong ? "text-primary" : "text-foreground")}>
                    {song.title}
                  </span>
                  <span className="text-muted-foreground truncate">{song.artist}</span>
                  <span className="text-sm text-muted-foreground text-right">
                    {formatDuration(song.duration)}
                  </span>
                  <div className="w-10 flex justify-center">
                    <button
                      onClick={() => removeSong.mutate({ playlistId, songId: song.id })}
                      className="p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="glass-heavy border-border/50">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Playlist</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{playlist.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-muted/50 border-border/50 hover:bg-muted">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePlaylist}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
