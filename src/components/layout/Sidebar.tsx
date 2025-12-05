import React, { useState } from 'react';
import { Library, ListMusic, Plus, LogOut, Music2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { usePlaylists, useCreatePlaylist } from '@/hooks/usePlaylists';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface SidebarProps {
  activeView: 'library' | 'playlist';
  selectedPlaylistId: string | null;
  onViewChange: (view: 'library' | 'playlist', playlistId?: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  selectedPlaylistId,
  onViewChange,
}) => {
  const { data: playlists } = usePlaylists();
  const createPlaylist = useCreatePlaylist();
  const { signOut, user } = useAuth();
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleCreatePlaylist = () => {
    if (newPlaylistName.trim()) {
      createPlaylist.mutate(newPlaylistName.trim());
      setNewPlaylistName('');
      setDialogOpen(false);
    }
  };

  return (
    <aside className="w-64 h-full glass-heavy flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
            <Music2 className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">Soundwave</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-thin">
        <button
          onClick={() => onViewChange('library')}
          className={cn(
            "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all",
            activeView === 'library' && selectedPlaylistId === null
              ? "bg-primary/10 text-primary border border-primary/20"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          )}
        >
          <Library className="w-5 h-5" />
          <span className="font-medium">Library</span>
        </button>

        <div className="pt-4">
          <div className="flex items-center justify-between px-4 mb-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Playlists
            </span>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <button className="p-1 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
              </DialogTrigger>
              <DialogContent className="glass-heavy border-border/50">
                <DialogHeader>
                  <DialogTitle>Create Playlist</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <Input
                    value={newPlaylistName}
                    onChange={(e) => setNewPlaylistName(e.target.value)}
                    placeholder="Playlist name"
                    className="bg-muted/50 border-border/50"
                    onKeyDown={(e) => e.key === 'Enter' && handleCreatePlaylist()}
                  />
                  <Button onClick={handleCreatePlaylist} className="w-full btn-primary">
                    Create
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-1">
            {playlists?.map((playlist) => (
              <button
                key={playlist.id}
                onClick={() => onViewChange('playlist', playlist.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-left transition-all",
                  selectedPlaylistId === playlist.id
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <ListMusic className="w-4 h-4 flex-shrink-0" />
                <span className="truncate text-sm">{playlist.name}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-border/50">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground truncate max-w-[160px]">
            {user?.email}
          </span>
          <button
            onClick={signOut}
            className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
