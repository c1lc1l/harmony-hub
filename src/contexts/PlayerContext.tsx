import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';

export interface Song {
  id: string;
  title: string;
  artist: string;
  s3_url: string;
  duration: number;
}

interface PlayerContextType {
  currentSong: Song | null;
  playlist: Song[];
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playSong: (song: Song) => void;
  playPlaylist: (songs: Song[], startIndex?: number) => void;
  togglePlay: () => void;
  nextSong: () => void;
  prevSong: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [playlist, setPlaylist] = useState<Song[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.7);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.volume = volume;

    const audio = audioRef.current;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded = () => nextSong();

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
    };
  }, []);

  const playSong = useCallback((song: Song) => {
    if (audioRef.current) {
      audioRef.current.src = song.s3_url;
      audioRef.current.play();
      setCurrentSong(song);
      setIsPlaying(true);
    }
  }, []);

  const playPlaylist = useCallback((songs: Song[], startIndex = 0) => {
    setPlaylist(songs);
    if (songs.length > 0 && songs[startIndex]) {
      playSong(songs[startIndex]);
    }
  }, [playSong]);

  const togglePlay = useCallback(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  const nextSong = useCallback(() => {
    if (playlist.length === 0 || !currentSong) return;
    const currentIndex = playlist.findIndex(s => s.id === currentSong.id);
    const nextIndex = (currentIndex + 1) % playlist.length;
    playSong(playlist[nextIndex]);
  }, [playlist, currentSong, playSong]);

  const prevSong = useCallback(() => {
    if (playlist.length === 0 || !currentSong) return;
    const currentIndex = playlist.findIndex(s => s.id === currentSong.id);
    const prevIndex = currentIndex <= 0 ? playlist.length - 1 : currentIndex - 1;
    playSong(playlist[prevIndex]);
  }, [playlist, currentSong, playSong]);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const setVolume = useCallback((vol: number) => {
    if (audioRef.current) {
      audioRef.current.volume = vol;
      setVolumeState(vol);
    }
  }, []);

  return (
    <PlayerContext.Provider
      value={{
        currentSong,
        playlist,
        isPlaying,
        currentTime,
        duration,
        volume,
        playSong,
        playPlaylist,
        togglePlay,
        nextSong,
        prevSong,
        seek,
        setVolume,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};
