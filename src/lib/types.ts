// === 数据库行类型 ===

export interface Circle {
  id: string;
  name: string;
  description: string | null;
  invite_code: string;
  created_by: string;
  writing_style?: string;
  created_at: string;
}

export interface CircleMember {
  id: string;
  circle_id: string;
  user_id: string;
  role: "admin" | "member";
  joined_at: string;
  user_email?: string;
}

export interface Memory {
  id: string;
  circle_id: string;
  author_id: string;
  content: string;
  happened_at: string; // date string
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface Story {
  id: string;
  circle_id: string;
  title: string;
  content: string;
  period_start: string;
  period_end: string;
  memory_count: number;
  style: string | null;
  character_ids: string[] | null;
  created_at: string;
}

export interface Character {
  id: string;
  circle_id: string;
  name: string;
  avatar_emoji: string;
  description: string;
  personality: string;
  relationship: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// === 前端用类型 ===

export interface CircleWithMemberCount extends Circle {
  member_count: number;
  role: string;
}
