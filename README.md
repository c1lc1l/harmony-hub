# 🎵 **Harmony Hub --- Full-Stack Music Streaming App**

A modern music-streaming web app built with **React**, **Supabase
PostgreSQL**, **shadcn/ui**, and **Tailwind CSS**.\
Upload MP3s, manage playlists, stream audio, and enjoy a clean,
responsive UI.

------------------------------------------------------------------------

## ✨ **Features**

-   🔐 **User Authentication**\
    Email/password login & signup powered by Supabase Auth.

-   🎵 **MP3 Upload**\
    Upload MP3 files directly from the browser to Supabase Storage.

-   🗄️ **SQL Database**\
    Structured PostgreSQL tables:

    -   `songs`\
    -   `playlists`\
    -   `playlist_songs`\
        With Row-Level Security (RLS) enabled.

-   🛠️ **CRUD Operations**\
    Create, update, delete songs and playlists.

-   ▶️ **Built-in Audio Player**\
    Custom HTML5 player with:

    -   Play / Pause\
    -   Next / Previous\
    -   Seek bar\
    -   Playlist queue

-   🧩 **Drag & Drop Reordering**\
    Reorder songs inside playlists.

-   📱 **Responsive UI**\
    Fully mobile-friendly using **shadcn/ui** + **Tailwind**.

------------------------------------------------------------------------

## 🛠️ **Tech Stack**

  Layer        Tools
  ------------ --------------------------------------------------
  Frontend     React, TypeScript, Vite, shadcn/ui, Tailwind CSS
  Backend      Supabase Auth, Supabase Storage, PostgreSQL
  Audio        Native HTML5 `<audio>`
  Deployment   Vercel

------------------------------------------------------------------------

## 🗄️ **Database Schema (SQL)**

``` sql
CREATE TABLE songs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  artist text,
  file_url text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE playlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE playlist_songs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id uuid REFERENCES playlists(id) ON DELETE CASCADE,
  song_id uuid REFERENCES songs(id) ON DELETE CASCADE,
  position integer NOT NULL
);
```

------------------------------------------------------------------------

## 🚀 **Getting Started (Local Development)**

### 1️⃣ Clone the repo

``` bash
git clone https://github.com/your-username/harmony-hub
cd harmony-hub
```

### 2️⃣ Install dependencies

``` bash
npm install
```

### 3️⃣ Create your `.env` file

``` env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Get the values from **Supabase → Project Settings → API**.

### 4️⃣ Run development server

``` bash
npm run dev
```

------------------------------------------------------------------------

## ☁️ **Deployment (Vercel)**

Click the deploy button 🇻🇪:

[![Deploy to
Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository=your-username/harmony-hub)

Make sure to set your Supabase environment variables in the Vercel
dashboard.

------------------------------------------------------------------------

## 📦 **Project Structure**

    src/
     ├── components/
     ├── hooks/
     ├── lib/
     ├── pages/
     ├── store/
     └── utils/

------------------------------------------------------------------------

## 🤝 **Contributing**

Pull requests are welcome!\
If submitting a new feature, please include:

-   A clear description\
-   Relevant screenshots\
-   Any new API endpoints or DB schema changes

------------------------------------------------------------------------

## 📜 **License**

MIT License.\
You may use, modify, and deploy the project freely.
