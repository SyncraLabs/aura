-- Create a table for public profiles (optional, but good practice)
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone,
  email text,
  full_name text,
  avatar_url text,

  constraint username_length check (char_length(full_name) >= 3)
);

-- Set up Row Level Security (RLS)
alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone." on public.profiles
  for select using (true);

create policy "Users can insert their own profile." on public.profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on public.profiles
  for update using (auth.uid() = id);

-- Create a table for clinics
create type clinic_type as enum ('dental', 'hair', 'nails', 'other');

create table public.clinics (
  id uuid default gen_random_uuid() primary key,
  owner_id uuid references auth.users on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  type clinic_type not null,
  business_doc_url text,
  onboarding_completed boolean default false,
  
  constraint owner_unique unique (owner_id)
);

alter table public.clinics enable row level security;

create policy "Users can view own clinic." on public.clinics
  for select using (auth.uid() = owner_id);

create policy "Users can insert own clinic." on public.clinics
  for insert with check (auth.uid() = owner_id);

create policy "Users can update own clinic." on public.clinics
  for update using (auth.uid() = owner_id);

-- Create a table for training examples
create table public.examples (
  id uuid default gen_random_uuid() primary key,
  clinic_id uuid references public.clinics on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  before_image_url text not null,
  after_image_url text not null
);

alter table public.examples enable row level security;

create policy "Clinics can view own examples." on public.examples
  for select using (exists (
    select 1 from public.clinics 
    where public.clinics.id = public.examples.clinic_id 
    and public.clinics.owner_id = auth.uid()
  ));

create policy "Clinics can insert own examples." on public.examples
  for insert with check (exists (
    select 1 from public.clinics 
    where public.clinics.id = public.examples.clinic_id 
    and public.clinics.owner_id = auth.uid()
  ));

-- Create storage bucket for documents and images
insert into storage.buckets (id, name, public) 
values ('clinic-assets', 'clinic-assets', true);

create policy "Any authenticated user can upload assets."
on storage.objects for insert
with check ( bucket_id = 'clinic-assets' and auth.role() = 'authenticated' );

create policy "Assets are publicly accessible."
on storage.objects for select
using ( bucket_id = 'clinic-assets' );
