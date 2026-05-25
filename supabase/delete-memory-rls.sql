-- 允许所有圈内成员删除记忆
drop policy if exists "作者可删除记忆" on memories;
create policy "成员可删除记忆"
  on memories for delete
  using (
    circle_id in (select circle_id from circle_members where user_id = auth.uid())
  );
