-- 给记忆添加作者邮箱字段
alter table memories add column if not exists author_email text;

-- 给故事添加创建者邮箱字段
alter table stories add column if not exists creator_email text;
