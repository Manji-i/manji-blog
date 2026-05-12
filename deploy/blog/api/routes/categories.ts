import { Router } from 'express';
import { getDb } from '../database.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Get all categories (public)
router.get('/', async (req, res) => {
  try {
    const db = await getDb();
    const categories = await db.all(
      'SELECT * FROM categories ORDER BY sort_order ASC, created_at ASC'
    );
    res.json({ success: true, data: categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ success: false, message: '获取分类列表失败' });
  }
});

// Get single category with article count (public)
router.get('/:slug', async (req, res) => {
  try {
    const db = await getDb();
    const { slug } = req.params;

    const category = await db.get('SELECT * FROM categories WHERE slug = ?', [slug]);
    if (!category) {
      res.status(404).json({ success: false, message: '分类不存在' });
      return;
    }

    const { count } = await db.get(
      'SELECT COUNT(*) as count FROM articles WHERE category_id = ? AND status = "published"',
      [category.id]
    );

    res.json({ success: true, data: { ...category, article_count: count } });
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({ success: false, message: '获取分类失败' });
  }
});

// Create category (requires auth)
router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const db = await getDb();
    const { name, slug, description, sort_order = 0 } = req.body;

    if (!name || !slug) {
      res.status(400).json({ success: false, message: '名称和标识不能为空' });
      return;
    }

    const existing = await db.get('SELECT id FROM categories WHERE slug = ?', [slug]);
    if (existing) {
      res.status(400).json({ success: false, message: '分类标识已存在' });
      return;
    }

    const result = await db.run(
      'INSERT INTO categories (name, slug, description, sort_order) VALUES (?, ?, ?, ?)',
      [name, slug, description || null, sort_order]
    );

    res.json({
      success: true,
      message: '分类创建成功',
      data: { id: result.lastID }
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ success: false, message: '创建分类失败' });
  }
});

// Update category (requires auth)
router.put('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const db = await getDb();
    const { id } = req.params;
    const { name, slug, description, sort_order } = req.body;

    const category = await db.get('SELECT * FROM categories WHERE id = ?', [id]);
    if (!category) {
      res.status(404).json({ success: false, message: '分类不存在' });
      return;
    }

    if (slug && slug !== category.slug) {
      const existing = await db.get('SELECT id FROM categories WHERE slug = ? AND id != ?', [slug, id]);
      if (existing) {
        res.status(400).json({ success: false, message: '分类标识已存在' });
        return;
      }
    }

    const updates: string[] = [];
    const params: (string | number | null)[] = [];

    if (name !== undefined) {
      updates.push('name = ?');
      params.push(name);
    }
    if (slug !== undefined) {
      updates.push('slug = ?');
      params.push(slug);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      params.push(description);
    }
    if (sort_order !== undefined) {
      updates.push('sort_order = ?');
      params.push(sort_order);
    }

    params.push(id);

    await db.run(
      `UPDATE categories SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    res.json({ success: true, message: '分类更新成功' });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ success: false, message: '更新分类失败' });
  }
});

// Delete category (requires auth)
router.delete('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const db = await getDb();
    const { id } = req.params;

    const category = await db.get('SELECT * FROM categories WHERE id = ?', [id]);
    if (!category) {
      res.status(404).json({ success: false, message: '分类不存在' });
      return;
    }

    // Check if category has articles
    const { count } = await db.get(
      'SELECT COUNT(*) as count FROM articles WHERE category_id = ?',
      [id]
    );

    if (count > 0) {
      res.status(400).json({ success: false, message: '该分类下存在文章，无法删除' });
      return;
    }

    await db.run('DELETE FROM categories WHERE id = ?', [id]);

    res.json({ success: true, message: '分类删除成功' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ success: false, message: '删除分类失败' });
  }
});

export default router;
