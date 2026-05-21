-- 人物表
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

-- 索引
create index idx_characters_circle on characters(circle_id);

-- RLS
alter table characters enable row level security;

create policy "成员可查看人物"
  on characters for select
  using (
    circle_id in (select circle_id from circle_members where user_id = auth.uid())
  );

create policy "成员可新增人物"
  on characters for insert
  with check (
    circle_id in (select circle_id from circle_members where user_id = auth.uid())
    and created_by = auth.uid()
  );

create policy "成员可编辑人物"
  on characters for update
  using (
    circle_id in (select circle_id from circle_members where user_id = auth.uid())
  );

create policy "成员可删除人物"
  on characters for delete
  using (
    circle_id in (select circle_id from circle_members where user_id = auth.uid())
  );

-- 写故事时关联使用的人物
alter table stories add column if not exists character_ids uuid[];
