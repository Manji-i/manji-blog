import { Router } from 'express';
import { getDb } from '../database.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Get all articles (public)
router.get('/', async (req, res) => {
  try {
    const db = await getDb();
    const { page = 1, limit = 10, category, search } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let query = `
      SELECT 
        a.id, a.title, a.slug, a.content, a.cover_image, a.status,
        a.view_count, a.published_at, a.created_at, a.updated_at,
        c.id as category_id, c.name as category_name, c.slug as category_slug,
        u.name as author_name
      FROM articles a
      LEFT JOIN categories c ON a.category_id = c.id
      LEFT JOIN users u ON a.user_id = u.id
      WHERE a.status = 'published'
    `;
    const params: (string | number)[] = [];

    if (category) {
      query += ` AND c.slug = ?`;
      params.push(category as string);
    }

    if (search) {
      query += ` AND (a.title LIKE ? OR a.content LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ` ORDER BY a.created_at DESC LIMIT ? OFFSET ?`;
    params.push(Number(limit), offset);

    const articles = await db.all(query, params);

    // Get total count
    let countQuery = `SELECT COUNT(*) as total FROM articles a LEFT JOIN categories c ON a.category_id = c.id WHERE a.status = 'published'`;
    const countParams: (string | number)[] = [];

    if (category) {
      countQuery += ` AND c.slug = ?`;
      countParams.push(category as string);
    }
    if (search) {
      countQuery += ` AND (a.title LIKE ? OR a.content LIKE ?)`;
      countParams.push(`%${search}%`, `%${search}%`);
    }

    const { total } = await db.get(countQuery, countParams);

    res.json({
      success: true,
      data: articles,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get articles error:', error);
    res.status(500).json({ success: false, message: '获取文章列表失败' });
  }
});

// Get single article (public)
router.get('/:slug', async (req, res) => {
  try {
    const db = await getDb();
    const { slug } = req.params;

    const article = await db.get(
      `SELECT 
        a.id, a.title, a.slug, a.content, a.cover_image, a.status,
        a.view_count, a.published_at, a.created_at, a.updated_at,
        c.id as category_id, c.name as category_name, c.slug as category_slug,
        u.name as author_name
      FROM articles a
      LEFT JOIN categories c ON a.category_id = c.id
      LEFT JOIN users u ON a.user_id = u.id
      WHERE a.slug = ? AND a.status = 'published'`,
      [slug]
    );

    if (!article) {
      res.status(404).json({ success: false, message: '文章不存在' });
      return;
    }

    // Increment view count
    await db.run('UPDATE articles SET view_count = view_count + 1 WHERE id = ?', [article.id]);

    res.json({ success: true, data: article });
  } catch (error) {
    console.error('Get article error:', error);
    res.status(500).json({ success: false, message: '获取文章失败' });
  }
});

// Get all articles for admin (requires auth)
router.get('/admin/list', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const db = await getDb();
    const { page = 1, limit = 10, status } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let query = `
      SELECT 
        a.id, a.title, a.slug, a.cover_image, a.status,
        a.view_count, a.published_at, a.created_at, a.updated_at,
        c.name as category_name
      FROM articles a
      LEFT JOIN categories c ON a.category_id = c.id
      WHERE 1=1
    `;
    const params: (string | number)[] = [];

    if (status) {
      query += ` AND a.status = ?`;
      params.push(status as string);
    }

    query += ` ORDER BY a.created_at DESC LIMIT ? OFFSET ?`;
    params.push(Number(limit), offset);

    const articles = await db.all(query, params);

    let countQuery = `SELECT COUNT(*) as total FROM articles WHERE 1=1`;
    const countParams: (string | number)[] = [];

    if (status) {
      countQuery += ` AND status = ?`;
      countParams.push(status as string);
    }

    const { total } = await db.get(countQuery, countParams);

    res.json({
      success: true,
      data: articles,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get admin articles error:', error);
    res.status(500).json({ success: false, message: '获取文章列表失败' });
  }
});

// Create article (requires auth)
router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const db = await getDb();
    const { title, content, category_id, cover_image, status = 'draft' } = req.body;

    if (!title || !content) {
      res.status(400).json({ success: false, message: '标题和内容不能为空' });
      return;
    }

    const slug = `${Date.now()}-${uuidv4().slice(0, 8)}`;
    const publishedAt = status === 'published' ? new Date().toISOString() : null;

    const result = await db.run(
      `INSERT INTO articles (title, slug, content, cover_image, status, user_id, category_id, published_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, slug, content, cover_image || null, status, req.user!.id, category_id || null, publishedAt]
    );

    res.json({
      success: true,
      message: '文章创建成功',
      data: { id: result.lastID, slug }
    });
  } catch (error) {
    console.error('Create article error:', error);
    res.status(500).json({ success: false, message: '创建文章失败' });
  }
});

// Update article (requires auth)
router.put('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const db = await getDb();
    const { id } = req.params;
    const { title, content, category_id, cover_image, status } = req.body;

    const article = await db.get('SELECT * FROM articles WHERE id = ?', [id]);
    if (!article) {
      res.status(404).json({ success: false, message: '文章不存在' });
      return;
    }

    const updates: string[] = [];
    const params: (string | number | null)[] = [];

    if (title !== undefined) {
      updates.push('title = ?');
      params.push(title);
    }
    if (content !== undefined) {
      updates.push('content = ?');
      params.push(content);
    }
    if (category_id !== undefined) {
      updates.push('category_id = ?');
      params.push(category_id);
    }
    if (cover_image !== undefined) {
      updates.push('cover_image = ?');
      params.push(cover_image);
    }
    if (status !== undefined) {
      updates.push('status = ?');
      params.push(status);
      if (status === 'published' && article.status !== 'published') {
        updates.push('published_at = ?');
        params.push(new Date().toISOString());
      }
    }

    updates.push('updated_at = ?');
    params.push(new Date().toISOString());
    params.push(id);

    await db.run(
      `UPDATE articles SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    res.json({ success: true, message: '文章更新成功' });
  } catch (error) {
    console.error('Update article error:', error);
    res.status(500).json({ success: false, message: '更新文章失败' });
  }
});

// Delete article (requires auth)
router.delete('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const db = await getDb();
    const { id } = req.params;

    const article = await db.get('SELECT * FROM articles WHERE id = ?', [id]);
    if (!article) {
      res.status(404).json({ success: false, message: '文章不存在' });
      return;
    }

    await db.run('DELETE FROM articles WHERE id = ?', [id]);

    res.json({ success: true, message: '文章删除成功' });
  } catch (error) {
    console.error('Delete article error:', error);
    res.status(500).json({ success: false, message: '删除文章失败' });
  }
});

export default router;
