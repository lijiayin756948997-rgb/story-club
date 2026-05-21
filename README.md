# 故事花园 (Story Garden)

> 一群人共同记录回忆，AI 帮你写成故事。

## 功能

- **多人共同记录**：创建一个圈子，邀请朋友加入，每个人都可以写下自己的记忆片段
- **时间线浏览**：按时间顺序查看所有人的记忆，像翻阅一本日记
- **AI 故事生成**：选择任意时间段，Claude 会将这段时期的所有记忆编织成一篇叙事小说
- **故事收藏**：每次生成的故事都会保存，随时可以翻看回顾

## 技术栈

- **前端/后端**：Next.js 14 (App Router) + TypeScript
- **数据库/认证**：Supabase (PostgreSQL + RLS + Auth)
- **AI 生成**：支持 DeepSeek / OpenAI / Groq 等（OpenAI 兼容格式）
- **样式**：Tailwind CSS

## 快速开始

### 1. 配置 Supabase

1. 在 [supabase.com](https://supabase.com) 创建一个新项目
2. 进入项目的 **SQL Editor**，粘贴并执行 `supabase/migration.sql` 中的所有 SQL
3. 进入项目的 **Settings > API**，复制 `Project URL` 和 `anon public key`

### 2. 配置 AI API Key

支持 DeepSeek（推荐，国产便宜）、OpenAI、Groq 等。在 `.env.local` 中配置：

```env
# deepseek（推荐，极其便宜）
AI_PROVIDER=deepseek
AI_API_KEY=sk-your-deepseek-api-key
AI_MODEL=deepseek-chat

# 或换成 openai
# AI_PROVIDER=openai
# AI_API_KEY=sk-your-openai-api-key
# AI_MODEL=gpt-4o-mini

# 或 groq（免费）
# AI_PROVIDER=groq
# AI_API_KEY=gsk-your-groq-api-key
# AI_MODEL=llama-3.3-70b-versatile
```

各平台申请：
- **DeepSeek**：[platform.deepseek.com](https://platform.deepseek.com) → API Keys → 充值几块钱就能用
- **OpenAI**：[platform.openai.com](https://platform.openai.com) → API Keys
- **Groq**：[console.groq.com](https://console.groq.com) → API Keys（免费额度）

### 3. 配置环境变量

```bash
cp .env.local.example .env.local
```

编辑 `.env.local`：

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
ANTHROPIC_API_KEY=sk-ant-your-api-key
NEXT_PUBLIC_APP_NAME=故事花园
```

### 4. 设置 Supabase Auth

在 Supabase Dashboard > **Authentication > Settings** 中：

1. 将 **Site URL** 设置为 `http://localhost:3000`
2. 在 **Redirect URLs** 中添加：
   - `http://localhost:3000/api/auth/callback`
3. 确认 **Email Auth Provider** 已启用（默认开启）

### 5. 安装并运行

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

访问 `http://localhost:3000`

### 6. 部署到生产

推荐部署到 [Vercel](https://vercel.com)：

```bash
# 安装 Vercel CLI
npm install -g vercel

# 部署
vercel
```

部署后，在 Supabase Dashboard 更新：
- **Site URL** → 你的 Vercel 域名
- **Redirect URLs** → 添加 `https://你的域名/api/auth/callback`

## 项目结构

```
story-club/
├── src/
│   ├── app/
│   │   ├── page.tsx              # 首页 / 着陆页
│   │   ├── layout.tsx            # 根布局
│   │   ├── login/
│   │   │   └── page.tsx          # 登录页（邮箱魔法链接）
│   │   ├── circles/
│   │   │   ├── page.tsx          # 我的圈子列表
│   │   │   ├── [id]/
│   │   │   │   ├── page.tsx      # 圈子首页（记忆时间线）
│   │   │   │   ├── members/
│   │   │   │   │   └── page.tsx  # 成员管理
│   │   │   │   └── stories/
│   │   │   │       ├── page.tsx      # 故事列表
│   │   │   │       └── [storyId]/
│   │   │   │           └── page.tsx  # 阅读故事
│   │   └── api/
│   │       ├── auth/callback/    # Supabase Auth 回调
│   │       └── generate-story/   # 调用 Claude API
│   ├── components/
│   │   ├── auth-provider.tsx     # 认证上下文
│   │   ├── nav.tsx               # 导航栏
│   │   ├── memory-card.tsx       # 记忆卡片
│   │   ├── memory-form.tsx       # 写记忆表单
│   │   ├── timeline.tsx          # 时间线组件
│   │   ├── story-reader.tsx      # 故事阅读器
│   │   ├── copy-button.tsx       # 复制按钮
│   │   └── ui/                   # 基础 UI 组件
│   └── lib/
│       ├── types.ts              # TypeScript 类型
│       ├── supabase.ts           # 客户端 Supabase
│       └── supabase-server.ts    # 服务端 Supabase
├── supabase/
│   └── migration.sql             # 数据库迁移脚本
├── middleware.ts                 # Next.js 中间件（刷新 auth session）
└── package.json
```

## 使用流程

1. **注册/登录**：输入邮箱，点击邮件中的链接即可登录
2. **创建圈子**：登录后创建一个新圈子，会生成一个邀请码
3. **邀请朋友**：把邀请码分享给朋友，他们可以在首页输入加入
4. **记录记忆**：在圈子页面写下记忆片段，标注日期和标签
5. **生成故事**：选择开始和结束日期，点击"生成故事"
6. **阅读故事**：AI 生成完成后自动跳转到故事页面，也可以在故事列表中翻看

## AI 提示词说明

生成故事时使用的提示词会：
- 按时间顺序排列所有记忆
- 用第三人称叙事风格编织故事
- 保留所有真实记忆的核心事实
- 加入适当的环境描写和过渡
- 处理多人视角下的同一事件

## 许可证

MIT
