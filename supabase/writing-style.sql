-- 给圈子添加写作风格字段
alter table circles add column if not exists writing_style text not null default '温暖日常';

-- 存储每次生成时使用的风格（方便追溯）
alter table stories add column if not exists style text;
