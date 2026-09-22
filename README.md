# Convo

A real-time 1:1 chat app built with React Native and Expo. Clean UI, dark/light theme, instant messaging via Supabase Realtime Broadcast.

> Group chat is not implemented but the schema and architecture support it — `conversation_participants` is a junction table and can add a `type` field into conversations to support `'group'`.

---

## Features

- **Auth** — Email/password sign up and sign in with form validation
- **Real-time messaging** — Instant message delivery via Supabase Realtime Broadcast
- **Conversations list** — Live updates when new messages arrive, sorted by latest message
- **User search** — Find users by name to start a new conversation
- **Profile** — Update display name, upload avatar, toggle theme, delete account
- **Theme** — Light/dark mode with persistent preference
- **Optimistic UI** — Messages appear instantly before server confirmation

---

## Tech Stack

| Layer         | Tech                                         |
| ------------- | -------------------------------------------- |
| Framework     | Expo + Expo Router (file-based routing)      |
| Language      | TypeScript                                   |
| Auth + DB     | Supabase (Auth, Postgres, Storage, Realtime) |
| State         | Zustand (auth session, theme)                |
| Server state  | TanStack Query v5                            |
| Fonts         | Nunito (via @expo-google-fonts)              |
| Validation    | Zod + React Hook Form                        |
| Notifications | react-native-toast-message                   |

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/           # Welcome, Sign In, Sign Up screens
│   ├── (app)/            # Protected screens
│   │   ├── index.tsx     # Conversations list
│   │   ├── profile.tsx   # Profile screen
│   │   ├── new-conversation.tsx
│   │   └── conversation/
│   │       └── [id].tsx  # Chat screen
│   ├── _layout.tsx       # Root layout, auth listener, font loading
│   └── index.tsx         # Auth redirect
├── components/
│   ├── chat/             # ConversationItem, MessageBubble
│   ├── profile/          # AvatarUpdater
│   └── ui/               # Button, TextField
├── constants/
│   ├── colors.ts         # Light/dark color tokens
│   └── fonts.ts          # Font family constants
├── hooks/
│   ├── useTheme.ts       # Color tokens + toggle from Zustand
│   ├── useConversations.ts
│   ├── useMessages.ts
│   └── useRealtime.ts    # Supabase Broadcast subscriptions
├── services/
│   ├── auth.ts           # Sign in/up/out, update profile, delete account
│   ├── conversations.ts  # Fetch + create conversations
│   ├── messages.ts       # Fetch + send messages
│   └── users.ts          # Search users
├── stores/
│   ├── authStore.ts      # Session + user profile
│   └── themeStore.ts     # Theme preference (persisted)
├── types/
│   └── index.ts          # User, Conversation, Message types
└── lib/
    ├── supabase.ts       # Supabase client
    ├── queryClient.ts    # TanStack Query client
    └── schemas.ts        # Zod validation schemas
supabase/
└── migrations/
    └── 001_initial_schema.sql
```

---

## Database Schema

```
users                    — mirrors auth.users, populated via trigger
conversations            — id, created_at
conversation_participants — conversation_id, user_id, joined_at (PK: both)
messages                 — id, conversation_id, sender_id, content, created_at
```

RLS is enabled on all tables. A `SECURITY DEFINER` function `get_user_conversation_ids` is used to avoid recursive RLS policies on `conversation_participants`.

---

## Realtime Architecture

Messages are delivered via **Supabase Realtime Broadcast** — not Postgres Changes. This means:

1. Sender writes message to DB and broadcasts to channel `conversation:{id}`
2. All subscribers receive the broadcast and update their local TanStack Query cache
3. On app start or conversation open, messages are fetched fresh from DB

This gives lower latency than Postgres Changes and teaches the underlying pub/sub pattern manually.

---

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/yourusername/convo.git
cd convo
pnpm install
```

### 2. Set up Supabase

1. Create a new Supabase project
2. Run `supabase/migrations/001_initial_schema.sql` in the SQL editor
3. Create a storage bucket named `avatars` (public)
4. Add storage policies for avatar upload/read/update/delete

### 3. Environment variables

Create a `.env` file:

```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

### 4. Run

```bash
npx expo start --clear
```

---

## Adding Group Chat

The groundwork is already in place:

- `conversation_participants` is a junction table — add more than 2 participants
- Add a `type` column to `conversations` with `'direct' | 'group'`
- Add `name` and `avatar_url` columns to `conversations` for group identity
- Add a `role` column to `conversation_participants` for admin/member distinction
- Update `getConversations` to handle multiple `other_users`
- Update the chat header to show group name instead of other user's name

---

## Known Limitations

- Google OAuth not implemented
- No push notifications
- No message reactions, replies, or media attachments
- No read receipts
- Group chat not implemented (see above)
