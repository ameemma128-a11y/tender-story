CREATE TABLE public.stories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  template TEXT NOT NULL,
  character_name TEXT NOT NULL,
  reader_name TEXT,
  reader_traits TEXT[] DEFAULT '{}',
  tones TEXT[] DEFAULT '{}',
  length TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own stories" ON public.stories
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users insert own stories" ON public.stories
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own stories" ON public.stories
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users delete own stories" ON public.stories
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX idx_stories_user_created ON public.stories(user_id, created_at DESC);