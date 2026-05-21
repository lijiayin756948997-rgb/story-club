-- ============================================================
-- 故事花园 - 综合修复脚本
-- 在 Supabase SQL Editor 中完整运行一遍
-- ============================================================

-- 1. 修复 circles 查询权限：允许登录用户查看
-- （不需要是成员就能看到圈子信息，否则用邀请码查不到）
drop policy if exists "成员可查看圈子" on circles;
create policy "登录用户可查看圈子"
  on circles for select
  using (auth.role() = 'authenticated');

-- 2. 修复 circle_members 插入权限
drop policy if exists "成员可加入圈子" on circle_members;
create policy "成员可加入圈子"
  on circle_members for insert
  with check (user_id = auth.uid());

-- 3. 允许成员查看所有成员列表
drop policy if exists "成员可查看" on circle_members;
create policy "成员可查看所有成员"
  on circle_members for select
  using (true);

-- 4. 允许退出（删除自己）
drop policy if exists "成员可退出" on circle_members;
create policy "成员可退出"
  on circle_members for delete
  using (user_id = auth.uid());

-- 5. 允许成员写入故事（AI 生成时插入）
drop policy if exists "成员可写故事" on stories;
create policy "成员可写故事"
  on stories for insert
  with check (
    circle_id in (select circle_id from circle_members where user_id = auth.uid())
  );
