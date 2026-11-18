const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================================
// 🔑 Supabase 连接配置（从环境变量读取）
// 本地开发：把 .env.example 复制成 .env 并填入真实值
// Vercel 部署：在 Project Settings → Environment Variables 里配置
// 注意：新版 key 以 sb_publishable_ 开头，绝不要使用 sb_secret_ 开头的密钥
// ============================================================
const SUPABASE_URL = (process.env.SUPABASE_URL || '').trim().replace(/\/+$/, '');
const SUPABASE_ANON_KEY = (process.env.SUPABASE_ANON_KEY || '').trim();

const missingEnv = !SUPABASE_URL || !SUPABASE_ANON_KEY;
if (missingEnv) {
  console.error('❌ 缺少环境变量 SUPABASE_URL 或 SUPABASE_ANON_KEY');
}

// 配置缺失时不初始化客户端，避免直接抛错导致整个函数崩溃
const supabase = missingEnv ? null : createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 统一的配置缺失提示
function ensureClient(res) {
  if (!supabase) {
    res.status(500).json({
      error: '服务器未配置 SUPABASE_URL / SUPABASE_ANON_KEY，请检查环境变量（Vercel 上配置后需 Redeploy）'
    });
    return false;
  }
  return true;
}

// ============================================================
// API 接口
// ============================================================

// 获取所有任务（支持按优先级筛选）
app.get('/api/tasks', async (req, res) => {
  if (!ensureClient(res)) return;
  try {
    const { priority } = req.query;
    let query = supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (priority && priority !== 'all') {
      query = query.eq('priority', priority);
    }

    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 添加新任务
app.post('/api/tasks', async (req, res) => {
  if (!ensureClient(res)) return;
  try {
    const { title, priority } = req.body || {};
    if (!title || !String(title).trim()) {
      return res.status(400).json({ error: '任务标题不能为空' });
    }

    const { data, error } = await supabase
      .from('tasks')
      .insert([{ title: String(title).trim(), priority: priority || '中', completed: false }])
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 切换任务完成状态
app.put('/api/tasks/:id/toggle', async (req, res) => {
  if (!ensureClient(res)) return;
  try {
    const { id } = req.params;
    const { completed } = req.body || {};

    const { data, error } = await supabase
      .from('tasks')
      .update({ completed: !completed })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 删除任务
app.delete('/api/tasks/:id', async (req, res) => {
  if (!ensureClient(res)) return;
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 本地启动（Vercel 由平台托管，不需要 listen）
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`✅ 服务器运行在 http://localhost:${PORT}`);
  });
}

module.exports = app;
