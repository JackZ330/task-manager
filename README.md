# 智能任务管理系统 task-manager

低代码实践 练习二作业：Node.js（Express）+ Supabase（PostgreSQL）+ Vercel 部署。

## 功能

- 输入标题 + 选择优先级（高 / 中 / 低）添加任务
- 任务列表按创建时间倒序展示（最新在最上面）
- 每条任务显示标题、优先级标签、完成状态
- 每条任务可「切换完成 / 未完成」、可「删除」
- 按优先级筛选：全部 / 高 / 中 / 低
- 已完成任务文字加删除线并变淡
- 底部任务统计：总任务 / 已完成 / 完成率
- 数据存在 Supabase 云端，关掉浏览器再打开数据还在

## 目录结构

```
task-manager/
├── server.js          # Express 后端 + Supabase 接口（GET/POST/PUT/DELETE）
├── public/index.html  # 前端页面（原生 HTML + CSS + JS）
├── vercel.json        # Vercel 构建与路由配置
├── 建表SQL.sql        # Supabase 建表 + RLS 策略
├── .env.example       # 环境变量模板
└── package.json
```

## 一、在 Supabase 建表

1. 打开 https://supabase.com 新建项目（Region 建议 Southeast Asia (Singapore)）
2. 左侧 SQL Editor → New query → 粘贴 `建表SQL.sql` 全文 → Run
3. 看到 `Success. No rows returned` 即成功
4. 到 Project Settings → API Keys 复制两项：Project URL、`sb_publishable_` 开头的 Publishable key

## 二、本地运行

```bash
cd task-manager
npm install
cp .env.example .env      # 然后填入真实的 URL 和 key
npm start                 # 打开 http://localhost:3000
```

## 三、部署到 Vercel

1. Vercel → Add New → Project → 导入本仓库
2. 在 Environment Variables 中逐条添加（变量名必须一字不差）：

| 变量名 | 值 |
|---|---|
| `SUPABASE_URL` | `https://你的项目ID.supabase.co` |
| `SUPABASE_ANON_KEY` | `sb_publishable_...` |
| `NODE_ENV` | `production` |
| `CLIENT_BASE_PATH` | `/` |

3. 点 Deploy，等 1～3 分钟，拿到 `https://xxx.vercel.app`

## 四、自测清单

- [ ] 页面上能添加任务、切换完成、删除、按优先级筛选
- [ ] Supabase Table Editor 里能看到 `tasks` 表和数据
- [ ] `.env` 没有被提交到仓库（本仓库只有 `.env.example`）
- [ ] Vercel 网址能打开，添加任务后 Supabase 能看到
- [ ] 关浏览器再打开，数据还在

## 常见报错

- `new row violates row-level security policy`：`建表SQL.sql` 第 3 部分四条 policy 没跑全
- `relation "tasks" does not exist`：第 1 部分建表 SQL 没成功
- 页面提示「服务器未配置 SUPABASE_URL / SUPABASE_ANON_KEY」：Vercel 环境变量没配或配完没 Redeploy
