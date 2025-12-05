import React, { useState, useRef } from 'react';
import { Upload, Music, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useUploadSong } from '@/hooks/useSongs';
import { toast } from 'sonner';

export const UploadSongDialog: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const uploadSong = useUploadSong();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.type.includes('audio')) {
      toast.error('Please select an audio file');
      return;
    }

    setFile(selectedFile);
    
    // Extract title from filename
    const nameWithoutExt = selectedFile.name.replace(/\.[^/.]+$/, '');
    setTitle(nameWithoutExt);

    // Get duration
    const audio = new Audio();
    audio.src = URL.createObjectURL(selectedFile);
    audio.onloadedmetadata = () => {
      setDuration(Math.round(audio.duration));
      URL.revokeObjectURL(audio.src);
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title.trim() || !artist.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await uploadSong.mutateAsync({
        file,
        title: title.trim(),
        artist: artist.trim(),
        duration,
      });
      toast.success('Song uploaded successfully!');
      setOpen(false);
      resetForm();
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload song');
    }
  };

  const resetForm = () => {
    setFile(null);
    setTitle('');
    setArtist('');
    setDuration(0);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) resetForm();
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Upload className="w-4 h-4" />
          Upload Song
        </Button>
      </DialogTrigger>
      <DialogContent className="glass-heavy border-border/50">
        <DialogHeader>
          <DialogTitle>Upload a Song</DialogTitle>
          <DialogDescription>
            Upload an MP3 file to add it to your library.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="file">Audio File</Label>
            <div className="relative">
              <Input
                id="file"
                type="file"
                accept="audio/*"
                onChange={handleFileChange}
                className="cursor-pointer"
              />
            </div>
            {file && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Music className="w-4 h-4" />
                <span className="truncate">{file.name}</span>
                {duration > 0 && (
                  <span>({Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')})</span>
                )}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Song title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="artist">Artist</Label>
            <Input
              id="artist"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              placeholder="Artist name"
            />
          </div>

          <Button
            type="submit"
            className="w-full btn-primary"
            disabled={uploadSong.isPending || !file}
          >
            {uploadSong.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload Song
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
