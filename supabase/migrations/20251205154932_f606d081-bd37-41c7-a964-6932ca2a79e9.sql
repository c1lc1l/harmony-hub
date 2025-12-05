-- Create songs table
CREATE TABLE public.songs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  artist VARCHAR(255) NOT NULL,
  s3_url TEXT NOT NULL,
  duration INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create playlists table with user ownership
CREATE TABLE public.playlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  owner UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create playlist_songs junction table
CREATE TABLE public.playlist_songs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id UUID REFERENCES public.playlists(id) ON DELETE CASCADE NOT NULL,
  song_id UUID REFERENCES public.songs(id) ON DELETE CASCADE NOT NULL,
  song_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(playlist_id, song_id)
);

-- Enable RLS on all tables
ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlist_songs ENABLE ROW LEVEL SECURITY;

-- Songs are readable by all authenticated users
CREATE POLICY "Songs are viewable by authenticated users"
ON public.songs FOR SELECT
TO authenticated
USING (true);

-- Playlists policies - private to owner
CREATE POLICY "Users can view their own playlists"
ON public.playlists FOR SELECT
TO authenticated
USING (auth.uid() = owner);

CREATE POLICY "Users can create their own playlists"
ON public.playlists FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = owner);

CREATE POLICY "Users can update their own playlists"
ON public.playlists FOR UPDATE
TO authenticated
USING (auth.uid() = owner);

CREATE POLICY "Users can delete their own playlists"
ON public.playlists FOR DELETE
TO authenticated
USING (auth.uid() = owner);

-- Playlist songs policies - based on playlist ownership
CREATE POLICY "Users can view songs in their playlists"
ON public.playlist_songs FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.playlists
    WHERE playlists.id = playlist_songs.playlist_id
    AND playlists.owner = auth.uid()
  )
);

CREATE POLICY "Users can add songs to their playlists"
ON public.playlist_songs FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.playlists
    WHERE playlists.id = playlist_songs.playlist_id
    AND playlists.owner = auth.uid()
  )
);

CREATE POLICY "Users can update songs in their playlists"
ON public.playlist_songs FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.playlists
    WHERE playlists.id = playlist_songs.playlist_id
    AND playlists.owner = auth.uid()
  )
);

CREATE POLICY "Users can remove songs from their playlists"
ON public.playlist_songs FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.playlists
    WHERE playlists.id = playlist_songs.playlist_id
    AND playlists.owner = auth.uid()
  )
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for playlists
CREATE TRIGGER update_playlists_updated_at
BEFORE UPDATE ON public.playlists
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample songs for demo
INSERT INTO public.songs (title, artist, s3_url, duration) VALUES
('Midnight Dreams', 'Luna Wave', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', 210),
('Electric Pulse', 'Neon Riders', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', 185),
('Ocean Breeze', 'Coastal Vibes', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', 240),
('Urban Jungle', 'Metro Beats', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', 198),
('Starlight Serenade', 'Cosmic Flow', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3', 225),
('Rhythm & Soul', 'Groove Masters', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3', 267),
('Desert Wind', 'Sahara Sound', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3', 195),
('Neon Nights', 'Synth City', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3', 220);