import React from 'react';
import { usePlayer } from '@/contexts/PlayerContext';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

const formatTime = (seconds: number) => {
  if (isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const MusicPlayer: React.FC = () => {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    togglePlay,
    nextSong,
    prevSong,
    seek,
    setVolume,
  } = usePlayer();

  if (!currentSong) {
    return (
      <div className="h-24 glass-heavy border-t border-border/50 flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Select a song to play</p>
      </div>
    );
  }

  return (
    <div className="h-24 glass-heavy border-t border-border/50 px-4 flex items-center gap-4">
      {/* Song info */}
      <div className="flex items-center gap-4 w-64 flex-shrink-0">
        <div className={cn(
          "w-14 h-14 rounded-xl bg-gradient-primary flex items-center justify-center",
          isPlaying && "animate-pulse-glow"
        )}>
          <span className="text-2xl">🎵</span>
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-foreground truncate">{currentSong.title}</p>
          <p className="text-sm text-muted-foreground truncate">{currentSong.artist}</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex-1 flex flex-col items-center gap-2 max-w-2xl">
        <div className="flex items-center gap-4">
          <button
            onClick={prevSong}
            className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
          >
            <SkipBack className="w-5 h-5" />
          </button>
          <button
            onClick={togglePlay}
            className="p-3 rounded-full bg-gradient-primary text-primary-foreground hover:scale-105 transition-transform glow-primary"
          >
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
          </button>
          <button
            onClick={nextSong}
            className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="w-full flex items-center gap-3">
          <span className="text-xs text-muted-foreground w-10 text-right">
            {formatTime(currentTime)}
          </span>
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={1}
            onValueChange={([value]) => seek(value)}
            className="flex-1"
          />
          <span className="text-xs text-muted-foreground w-10">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Volume */}
      <div className="w-40 flex items-center gap-2 flex-shrink-0">
        <button
          onClick={() => setVolume(volume === 0 ? 0.7 : 0)}
          className="p-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          {volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>
        <Slider
          value={[volume * 100]}
          max={100}
          step={1}
          onValueChange={([value]) => setVolume(value / 100)}
          className="flex-1"
        />
      </div>
    </div>
  );
};
