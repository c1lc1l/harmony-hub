import React from 'react';
import { useSongs } from '@/hooks/useSongs';
import { usePlayer, Song } from '@/contexts/PlayerContext';
import { usePlaylists, useAddSongToPlaylist } from '@/hooks/usePlaylists';
import { Play, Pause, Plus, Clock, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const SongList: React.FC = () => {
  const { data: songs, isLoading } = useSongs();
  const { data: playlists } = usePlaylists();
  const { currentSong, isPlaying, playSong, playPlaylist, togglePlay } = usePlayer();
  const addSongToPlaylist = useAddSongToPlaylist();

  const handlePlaySong = (song: Song, index: number) => {
    if (currentSong?.id === song.id) {
      togglePlay();
    } else if (songs) {
      playPlaylist(songs, index);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Library</h1>
          <p className="text-muted-foreground mt-1">{songs?.length || 0} songs</p>
        </div>
        {songs && songs.length > 0 && (
          <Button
            onClick={() => playPlaylist(songs)}
            className="btn-primary rounded-full px-6"
          >
            <Play className="w-4 h-4 mr-2" />
            Play All
          </Button>
        )}
      </div>

      {/* Songs table */}
      <div className="glass rounded-xl overflow-hidden">
        <div className="grid grid-cols-[auto_1fr_1fr_auto_auto] gap-4 px-6 py-3 border-b border-border/50 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          <span className="w-10">#</span>
          <span>Title</span>
          <span>Artist</span>
          <span className="flex items-center justify-end">
            <Clock className="w-4 h-4" />
          </span>
          <span className="w-10"></span>
        </div>

        <div className="divide-y divide-border/30">
          {songs?.map((song, index) => {
            const isCurrentSong = currentSong?.id === song.id;
            return (
              <div
                key={song.id}
                className={cn(
                  "grid grid-cols-[auto_1fr_1fr_auto_auto] gap-4 px-6 py-3 items-center group transition-colors",
                  isCurrentSong ? "bg-primary/5" : "hover:bg-muted/30"
                )}
              >
                <span className="w-10 text-center">
                  <button
                    onClick={() => handlePlaySong(song, index)}
                    className="relative"
                  >
                    <span className={cn(
                      "text-sm transition-opacity",
                      isCurrentSong ? "text-primary" : "text-muted-foreground group-hover:opacity-0"
                    )}>
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
                <span className={cn(
                  "font-medium truncate",
                  isCurrentSong ? "text-primary" : "text-foreground"
                )}>
                  {song.title}
                </span>
                <span className="text-muted-foreground truncate">{song.artist}</span>
                <span className="text-sm text-muted-foreground text-right">
                  {formatDuration(song.duration)}
                </span>
                <div className="w-10 flex justify-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-all">
                        <Plus className="w-4 h-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="glass-heavy border-border/50">
                      {playlists?.length === 0 ? (
                        <DropdownMenuItem disabled>No playlists yet</DropdownMenuItem>
                      ) : (
                        playlists?.map((playlist) => (
                          <DropdownMenuItem
                            key={playlist.id}
                            onClick={() => addSongToPlaylist.mutate({ playlistId: playlist.id, songId: song.id })}
                          >
                            Add to {playlist.name}
                          </DropdownMenuItem>
                        ))
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
