-- Create storage bucket for audio files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('audio', 'audio', true, 52428800, ARRAY['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav']);

-- Allow authenticated users to upload audio files
CREATE POLICY "Authenticated users can upload audio"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'audio');

-- Allow public read access to audio files
CREATE POLICY "Public read access to audio"
ON storage.objects
FOR SELECT
USING (bucket_id = 'audio');

-- Allow authenticated users to delete their own uploads
CREATE POLICY "Users can delete their own audio"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'audio' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Update songs table to allow authenticated users to insert songs
CREATE POLICY "Authenticated users can insert songs"
ON public.songs
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow users to delete songs (for cleanup)
CREATE POLICY "Authenticated users can delete songs"
ON public.songs
FOR DELETE
TO authenticated
USING (true);