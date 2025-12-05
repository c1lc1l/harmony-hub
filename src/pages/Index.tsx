import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AuthForm } from '@/components/auth/AuthForm';
import { Sidebar } from '@/components/layout/Sidebar';
import { MusicPlayer } from '@/components/player/MusicPlayer';
import { SongList } from '@/components/library/SongList';
import { PlaylistView } from '@/components/playlist/PlaylistView';

const Index: React.FC = () => {
  const { user, loading } = useAuth();
  const [activeView, setActiveView] = useState<'library' | 'playlist'>('library');
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);

  const handleViewChange = (view: 'library' | 'playlist', playlistId?: string) => {
    setActiveView(view);
    setSelectedPlaylistId(playlistId || null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          activeView={activeView}
          selectedPlaylistId={selectedPlaylistId}
          onViewChange={handleViewChange}
        />
        <main className="flex-1 overflow-y-auto scrollbar-thin p-8">
          {activeView === 'library' && !selectedPlaylistId && <SongList />}
          {selectedPlaylistId && (
            <PlaylistView
              playlistId={selectedPlaylistId}
              onPlaylistDeleted={() => handleViewChange('library')}
            />
          )}
        </main>
      </div>
      <MusicPlayer />
    </div>
  );
};

export default Index;
