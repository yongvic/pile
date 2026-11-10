create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text not null,
  role text not null default 'etudiant' check (role in ('etudiant', 'operateur')),
  first_name text,
  phone text,
  whatsapp text,
  city text,
  school text,
  level text check (level is null or level in ('l2', 'l3', 'master', 'jeune_diplome')),
  domains text[] not null default '{}',
  skills text[] not null default '{}',
  looking_for text[] not null default '{}',
  availability text,
  cv_name text,
  cv_data text,
  created_at timestamptz not null default now()
);

create table if not exists organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text not null default 'Lome',
  sector text not null default '',
  website text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists opportunities (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations (id) on delete restrict,
  type text not null check (type in ('stage', 'job', 'hackathon')),
  title text not null,
  description text not null default '',
  city text not null,
  remote boolean not null default false,
  domains text[] not null default '{}',
  levels text[] not null default '{}',
  paid text not null default 'inconnu' check (paid in ('oui', 'non', 'inconnu')),
  compensation_note text not null default '',
  duration text not null default '',
  start_date date,
  deadline date,
  apply_mode text not null default 'interet' check (apply_mode in ('lien', 'email', 'interet')),
  apply_target text not null default '',
  status text not null default 'brouillon' check (status in ('brouillon', 'publiee', 'pourvue', 'expiree')),
  source text not null default '',
  verified_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists interests (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles (id) on delete cascade,
  opportunity_id uuid not null references opportunities (id) on delete cascade,
  status text not null check (status in ('interesse', 'candidate')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (profile_id, opportunity_id)
);

create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles (id) on delete cascade,
  opportunity_id uuid not null references opportunities (id) on delete cascade,
  kind text not null check (kind in ('pas_pour_moi', 'signalement')),
  reason text not null,
  note text not null default '',
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);
