-- ============================================================
-- 故事花园 - 数据库迁移脚本
-- 在 Supabase SQL Editor 中执行
-- ============================================================

-- 1. 圈子表
create table circles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  invite_code text not null unique,
  created_by uuid not null references auth.users(id) on delete cascade,
  writing_style text not null default 'warm',
  created_at timestamptz not null default now()
);

-- 2. 圈子成员表
create table circle_members (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null references circles(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('admin', 'member')) default 'member',
  joined_at timestamptz not null default now(),
  unique(circle_id, user_id)
);

-- 3. 记忆表
create table memories (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null references circles(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  happened_at date not null,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 4. 小说表
create table stories (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null references circles(id) on delete cascade,
  title text not null,
  content text not null,
  period_start date not null,
  period_end date not null,
  memory_count integer not null default 0,
  style text,
  character_ids uuid[],
  created_at timestamptz not null default now()
);

-- 5. 人物表
create table characters (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null references circles(id) on delete cascade,
  name text not null,
  avatar_emoji text not null default '👤',
  description text not null default '',
  personality text not null default '',
  relationship text not null default '',
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_characters_circle on characters(circle_id);

alter table characters enable row level security;

create policy "成员可查看人物" on characters for select using (circle_id in (select circle_id from circle_members where user_id = auth.uid()));
create policy "成员可新增人物" on characters for insert with check (circle_id in (select circle_id from circle_members where user_id = auth.uid()) and created_by = auth.uid());
create policy "成员可编辑人物" on characters for update using (circle_id in (select circle_id from circle_members where user_id = auth.uid()));
create policy "成员可删除人物" on characters for delete using (circle_id in (select circle_id from circle_members where user_id = auth.uid()));

-- 6. 索引
create index idx_memories_circle_date on memories(circle_id, happened_at desc);
create index idx_memories_author on memories(author_id);
create index idx_stories_circle on stories(circle_id, created_at desc);
create index idx_circle_members_user on circle_members(user_id);

-- ============================================================
-- Row Level Security
-- ============================================================

alter table circles enable row level security;
alter table circle_members enable row level security;
alter table memories enable row level security;
alter table stories enable row level security;

-- 圈子：登录用户可查看（通过邀请码加入时需要）
create policy "登录用户可查看圈子"
  on circles for select
  using (auth.role() = 'authenticated');

create policy "用户可创建圈子"
  on circles for insert
  with check (created_by = auth.uid());

-- 圈子成员：登录用户可查看所有成员
create policy "成员可查看所有成员"
  on circle_members for select
  using (true);

-- 用户可以加入圈子（添加自己为成员）
create policy "成员可加入圈子"
  on circle_members for insert
  with check (user_id = auth.uid());

-- 用户可退出（删除自己）
create policy "成员可退出"
  on circle_members for delete
  using (user_id = auth.uid());

-- 记忆：成员可 CRUD
create policy "成员可读记忆"
  on memories for select
  using (
    circle_id in (select circle_id from circle_members where user_id = auth.uid())
  );

create policy "成员可写记忆"
  on memories for insert
  with check (
    circle_id in (select circle_id from circle_members where user_id = auth.uid())
    and author_id = auth.uid()
  );

create policy "作者可编辑记忆"
  on memories for update
  using (author_id = auth.uid())
  with check (author_id = auth.uid());

create policy "作者可删除记忆"
  on memories for delete
  using (author_id = auth.uid());

-- 小说：成员可读
create policy "成员可读小说"
  on stories for select
  using (
    circle_id in (select circle_id from circle_members where user_id = auth.uid())
  );

-- 成员可写入故事（AI 生成）
create policy "成员可写故事"
  on stories for insert
  with check (
    circle_id in (select circle_id from circle_members where user_id = auth.uid())
  );

-- ============================================================
-- 自动更新 updated_at 的函数
-- ============================================================

create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger memories_updated_at
  before update on memories
  for each row
  execute function update_updated_at();
