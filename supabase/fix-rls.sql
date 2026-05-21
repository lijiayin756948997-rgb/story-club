-- 补：允许成员插入自己（创建圈子时把自己加进去）
create policy "成员可加入圈子"
  on circle_members for insert
  with check (
    user_id = auth.uid()
  );

-- 补：允许成员退出（删除自己）
create policy "成员可退出"
  on circle_members for delete
  using (user_id = auth.uid());
