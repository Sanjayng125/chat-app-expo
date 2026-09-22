-- Tables
CREATE TABLE public.users (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       text UNIQUE NOT NULL,
  full_name   text,
  avatar_url  text,
  created_at  timestamptz DEFAULT now()
);

CREATE TABLE public.conversations (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.conversation_participants (
    conversation_id  uuid NOT NULL
                     REFERENCES public.conversations(id)
                     ON DELETE CASCADE,

    user_id          uuid NOT NULL
                     REFERENCES public.users(id)
                     ON DELETE CASCADE,

    joined_at        timestamptz NOT NULL DEFAULT now(),

    PRIMARY KEY (conversation_id, user_id)
);

CREATE TABLE public.messages (
    id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    conversation_id   uuid NOT NULL
                      REFERENCES public.conversations(id)
                      ON DELETE CASCADE,

    sender_id         uuid NOT NULL
                      REFERENCES public.users(id)
                      ON DELETE CASCADE,

    content           text NOT NULL,

    created_at        timestamptz NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Users policies
-- Anyone can read profiles (needed for search, chat headers)
CREATE POLICY "users_select" ON public.users
  FOR SELECT USING (true);

-- Only you can update your own profile
CREATE POLICY "users_update" ON public.users
  FOR UPDATE USING (auth.uid() = id);


-- Conversations policies
-- Conversations RLS disabled due to incompatibility with Supabase publishable keys.
-- Security is enforced via conversation_participants RLS and messages RLS.
-- ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Only see conversations you're part of
CREATE POLICY "conversations_select"
ON public.conversations
FOR SELECT
USING (
  id IN (
    SELECT public.get_user_conversation_ids(auth.uid())
  )
);

-- Any authenticated user can create a conversation
CREATE POLICY "conversations_insert" ON public.conversations
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);


-- Participants policies
-- Only see participant rows for conversations you're part of
CREATE OR REPLACE FUNCTION public.get_user_conversation_ids(uid uuid)
RETURNS SETOF uuid
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT conversation_id FROM conversation_participants WHERE user_id = uid;
$$;

CREATE POLICY "participants_select" ON conversation_participants
  FOR SELECT USING (
    conversation_id IN (SELECT public.get_user_conversation_ids(auth.uid()))
  );

-- Any authenticated user can join/create
CREATE POLICY "participants_insert" ON public.conversation_participants
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);


-- Messages policies
-- Only see messages in your conversations
CREATE POLICY "messages_select" ON public.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.conversation_participants
      WHERE conversation_id = messages.conversation_id
      AND user_id = auth.uid()
    )
  );

-- Only send messages to conversations you're in
CREATE POLICY "messages_insert" ON public.messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.conversation_participants
      WHERE conversation_id = messages.conversation_id
      AND user_id = auth.uid()
    )
  );


-- Avatar policies
-- Allow authenticated users to upload their own avatar
CREATE POLICY "avatar_upload" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow anyone to read avatars
CREATE POLICY "avatar_read" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

-- Allow users to update their own avatar
CREATE POLICY "avatar_update" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
);


-- Trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

