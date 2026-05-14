import { Router } from 'express';
import { getDb } from '../database.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';

const router = Router();

// 公开：获取随想列表
router.get('/', async (req, res) => {
  try {
    const db = await getDb();
    const { page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const thoughts = await db.all(
      `SELECT t.id, t.content, t.image_url, t.created_at, t.updated_at,
              u.name as author_name
       FROM thoughts t
       LEFT JOIN users u ON t.user_id = u.id
       ORDER BY t.created_at DESC
       LIMIT ? OFFSET ?`,
      [Number(limit), offset]
    );

    const { total } = await db.get('SELECT COUNT(*) as total FROM thoughts');

    res.json({
      success: true,
      data: thoughts,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get thoughts error:', error);
    res.status(500).json({ success: false, message: '获取随想列表失败' });
  }
});

// 后台：列表（与公开接口一致，但保留独立路径方便后续扩展草稿等状态）
router.get('/admin/list', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const db = await getDb();
    const { page = 1, limit = 50 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const thoughts = await db.all(
      `SELECT t.id, t.content, t.image_url, t.created_at, t.updated_at
       FROM thoughts t
       ORDER BY t.created_at DESC
       LIMIT ? OFFSET ?`,
      [Number(limit), offset]
    );

    const { total } = await db.get('SELECT COUNT(*) as total FROM thoughts');

    res.json({
      success: true,
      data: thoughts,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get admin thoughts error:', error);
    res.status(500).json({ success: false, message: '获取随想列表失败' });
  }
});

// 创建随想
router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const db = await getDb();
    const { content, image_url } = req.body;

    if (!content || !content.trim()) {
      res.status(400).json({ success: false, message: '随想内容不能为空' });
      return;
    }

    const result = await db.run(
      `INSERT INTO thoughts (content, image_url, user_id) VALUES (?, ?, ?)`,
      [content.trim(), image_url || null, req.user!.id]
    );

    res.json({
      success: true,
      message: '发布成功',
      data: { id: result.lastID }
    });
  } catch (error) {
    console.error('Create thought error:', error);
    res.status(500).json({ success: false, message: '发布失败' });
  }
});

// 更新随想
router.put('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const db = await getDb();
    const { id } = req.params;
    const { content, image_url } = req.body;

    const thought = await db.get('SELECT * FROM thoughts WHERE id = ?', [id]);
    if (!thought) {
      res.status(404).json({ success: false, message: '随想不存在' });
      return;
    }

    const updates: string[] = [];
    const params: (string | number | null)[] = [];

    if (content !== undefined) {
      if (!content.trim()) {
        res.status(400).json({ success: false, message: '随想内容不能为空' });
        return;
      }
      updates.push('content = ?');
      params.push(content.trim());
    }
    if (image_url !== undefined) {
      updates.push('image_url = ?');
      params.push(image_url || null);
    }

    updates.push('updated_at = ?');
    params.push(new Date().toISOString());
    params.push(id);

    await db.run(`UPDATE thoughts SET ${updates.join(', ')} WHERE id = ?`, params);

    res.json({ success: true, message: '更新成功' });
  } catch (error) {
    console.error('Update thought error:', error);
    res.status(500).json({ success: false, message: '更新失败' });
  }
});

// 删除随想
router.delete('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const db = await getDb();
    const { id } = req.params;

    const thought = await db.get('SELECT * FROM thoughts WHERE id = ?', [id]);
    if (!thought) {
      res.status(404).json({ success: false, message: '随想不存在' });
      return;
    }

    await db.run('DELETE FROM thoughts WHERE id = ?', [id]);

    res.json({ success: true, message: '删除成功' });
  } catch (error) {
    console.error('Delete thought error:', error);
    res.status(500).json({ success: false, message: '删除失败' });
  }
});

export default router;
