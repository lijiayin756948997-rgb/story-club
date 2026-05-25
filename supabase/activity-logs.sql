-- 活动日志表
create table activity_logs (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null references circles(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  action text not null,
  description text not null,
  created_at timestamptz not null default now()
);

create index idx_activity_logs_circle on activity_logs(circle_id, created_at desc);

alter table activity_logs enable row level security;

create policy "成员可查看日志"
  on activity_logs for select
  using (
    circle_id in (select circle_id from circle_members where user_id = auth.uid())
  );

create policy "成员可写日志"
  on activity_logs for insert
  with check (
    circle_id in (select circle_id from circle_members where user_id = auth.uid())
    and user_id = auth.uid()
  );
