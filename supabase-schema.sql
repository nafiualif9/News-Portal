-- The Weekly Bengal
-- Supabase-ready schema for the bilingual editorial portal.

create extension if not exists "uuid-ossp";

create type public.user_role as enum ('admin', 'reporter');
create type public.article_status as enum ('draft', 'pending', 'published');

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  role public.user_role not null default 'reporter',
  avatar_url text,
  bio text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.articles (
  id uuid primary key default uuid_generate_v4(),
  author_id uuid not null references public.profiles(id) on delete restrict,
  title_bn text not null,
  title_en text not null,
  content_bn text not null,
  content_en text not null,
  excerpt_bn text not null,
  excerpt_en text not null,
  category text not null,
  featured_image_url text,
  status public.article_status not null default 'draft',
  is_breaking boolean not null default false,
  is_lead boolean not null default false,
  views_count integer not null default 0 check (views_count >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.comments (
  id uuid primary key default uuid_generate_v4(),
  article_id uuid not null references public.articles(id) on delete cascade,
  user_name text not null,
  comment_text text not null,
  created_at timestamptz not null default now()
);

create index if not exists articles_status_created_at_idx
  on public.articles(status, created_at desc);
create index if not exists articles_author_id_idx
  on public.articles(author_id);
create index if not exists comments_article_id_created_at_idx
  on public.comments(article_id, created_at desc);

alter table public.profiles enable row level security;
alter table public.articles enable row level security;
alter table public.comments enable row level security;

-- Helper functions keep role checks readable in policies and avoid repeated
-- joins in client-side integrations.
create or replace function public.current_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create policy "Published articles are publicly readable"
  on public.articles for select
  using (status = 'published');

create policy "Admins can manage all articles"
  on public.articles for all
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

create policy "Reporters can read their own articles"
  on public.articles for select
  using (author_id = auth.uid());

create policy "Reporters can create their own articles"
  on public.articles for insert
  with check (
    author_id = auth.uid()
    and public.current_user_role() = 'reporter'
  );

create policy "Reporters can update their own articles"
  on public.articles for update
  using (author_id = auth.uid())
  with check (
    author_id = auth.uid()
    and public.current_user_role() = 'reporter'
  );

create policy "Admins can manage profiles"
  on public.profiles for all
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

create policy "Users can read their own profile"
  on public.profiles for select
  using (id = auth.uid());

create policy "Published article comments are publicly readable"
  on public.comments for select
  using (
    exists (
      select 1
      from public.articles
      where articles.id = comments.article_id
        and articles.status = 'published'
    )
  );

create policy "Anyone can comment on published articles"
  on public.comments for insert
  with check (
    exists (
      select 1
      from public.articles
      where articles.id = comments.article_id
        and articles.status = 'published'
    )
  );

create policy "Admins can manage comments"
  on public.comments for all
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');