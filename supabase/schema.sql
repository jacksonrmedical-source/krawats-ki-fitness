-- ============================================================
-- Fitness Course Platform — Core Schema
-- Run this in the Supabase SQL editor (or via `supabase db push`)
-- ============================================================

create extension if not exists "uuid-ossp";

-- Profiles (extends Supabase auth.users)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'student' check (role in ('student', 'admin')),
  created_at timestamptz not null default now()
);

-- Courses: the top-level product. Empty at launch, filled in later via /admin.
create table courses (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  title text not null,
  subtitle text,
  description text,
  cover_image_url text,
  price_inr integer not null default 0,       -- store in paise-free rupees, or switch to paise for exactness
  is_published boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Modules: groups of lessons within a course (e.g. "Week 1")
create table modules (
  id uuid primary key default uuid_generate_v4(),
  course_id uuid not null references courses(id) on delete cascade,
  title text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- Lessons: individual video units within a module
create table lessons (
  id uuid primary key default uuid_generate_v4(),
  module_id uuid not null references modules(id) on delete cascade,
  title text not null,
  description text,
  video_id text,               -- Bunny Stream / Mux asset id (not a raw URL — signed at request time)
  duration_seconds integer,
  is_free_preview boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- Enrollments: which student has access to which course
create table enrollments (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  course_id uuid not null references courses(id) on delete cascade,
  razorpay_payment_id text,
  amount_paid_inr integer,
  enrolled_at timestamptz not null default now(),
  unique (user_id, course_id)
);

-- Progress: which lessons a student has completed
create table lesson_progress (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  lesson_id uuid not null references lessons(id) on delete cascade,
  completed_at timestamptz not null default now(),
  unique (user_id, lesson_id)
);

-- ============================================================
-- Row Level Security
-- ============================================================
alter table profiles enable row level security;
alter table courses enable row level security;
alter table modules enable row level security;
alter table lessons enable row level security;
alter table enrollments enable row level security;
alter table lesson_progress enable row level security;

-- Profiles: users can read/update their own row
create policy "profiles: self read" on profiles for select using (auth.uid() = id);
create policy "profiles: self update" on profiles for update using (auth.uid() = id);

-- Courses: anyone can read published courses; only admins write
create policy "courses: public read published" on courses for select using (is_published = true);
create policy "courses: admin all" on courses for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Modules/Lessons: readable if parent course is published; admin writes
create policy "modules: public read" on modules for select using (
  exists (select 1 from courses where courses.id = modules.course_id and courses.is_published = true)
);
create policy "modules: admin all" on modules for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

create policy "lessons: public read metadata" on lessons for select using (
  exists (
    select 1 from modules
    join courses on courses.id = modules.course_id
    where modules.id = lessons.module_id and courses.is_published = true
  )
);
create policy "lessons: admin all" on lessons for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Enrollments: users see their own; admin sees all
create policy "enrollments: self read" on enrollments for select using (auth.uid() = user_id);
create policy "enrollments: self insert" on enrollments for insert with check (auth.uid() = user_id);
create policy "enrollments: admin read all" on enrollments for select using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Progress: users manage their own
create policy "progress: self all" on lesson_progress for all using (auth.uid() = user_id);

-- ============================================================
-- Helper view: does a user have access to a given lesson?
-- (free preview OR enrolled in the parent course)
-- ============================================================
create or replace view lesson_access as
select
  l.id as lesson_id,
  l.module_id,
  m.course_id,
  l.is_free_preview
from lessons l
join modules m on m.id = l.module_id;
