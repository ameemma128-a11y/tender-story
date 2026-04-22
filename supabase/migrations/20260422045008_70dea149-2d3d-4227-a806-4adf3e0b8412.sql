
ALTER TABLE public.stories
  ADD COLUMN IF NOT EXISTS character_traits text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS character_notes text,
  ADD COLUMN IF NOT EXISTS reader_notes text,
  ADD COLUMN IF NOT EXISTS cover_url text;

INSERT INTO storage.buckets (id, name, public)
VALUES ('story-covers', 'story-covers', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read story covers"
ON storage.objects FOR SELECT
USING (bucket_id = 'story-covers');

CREATE POLICY "Users upload own covers"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'story-covers' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users update own covers"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'story-covers' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users delete own covers"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'story-covers' AND auth.uid()::text = (storage.foldername(name))[1]);
