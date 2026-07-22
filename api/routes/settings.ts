import { Router } from 'express';
import { getDb } from '../database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// Get all settings (public)
router.get('/', async (req, res) => {
  try {
    const db = await getDb();
    const settings = await db.all('SELECT key, value FROM settings');
    
    const result: Record<string, unknown> = {};
    for (const setting of settings) {
      // Try to parse JSON values
      try {
        result[setting.key] = JSON.parse(setting.value);
      } catch {
        result[setting.key] = setting.value;
      }
    }
    
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Failed to get settings:', error);
    res.status(500).json({ success: false, message: '获取设置失败' });
  }
});

// Get single setting (public)
router.get('/:key', async (req, res) => {
  try {
    const db = await getDb();
    const setting = await db.get('SELECT key, value FROM settings WHERE key = ?', [req.params.key]);
    
    if (!setting) {
      return res.status(404).json({ success: false, message: '设置不存在' });
    }
    
    // Try to parse JSON value
    let value: unknown = setting.value;
    try {
      value = JSON.parse(setting.value);
    } catch {
      // Keep as string
    }
    
    res.json({ success: true, data: { key: setting.key, value } });
  } catch (error) {
    console.error('Failed to get setting:', error);
    res.status(500).json({ success: false, message: '获取设置失败' });
  }
});

// Update settings (admin only)
router.put('/', authenticateToken, async (req, res) => {
  try {
    const db = await getDb();
    const updates = req.body;
    
    if (!updates || typeof updates !== 'object') {
      return res.status(400).json({ success: false, message: '无效的更新数据' });
    }
    
    for (const [key, value] of Object.entries(updates)) {
      const valueToStore = typeof value === 'object' ? JSON.stringify(value) : String(value);
      
      const exists = await db.get('SELECT id FROM settings WHERE key = ?', [key]);
      if (exists) {
        await db.run(
          'UPDATE settings SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE key = ?',
          [valueToStore, key]
        );
      } else {
        await db.run('INSERT INTO settings (key, value) VALUES (?, ?)', [key, valueToStore]);
      }
    }
    
    res.json({ success: true, message: '设置已更新' });
  } catch (error) {
    console.error('Failed to update settings:', error);
    res.status(500).json({ success: false, message: '更新设置失败' });
  }
});

// Update single setting (admin only)
router.put('/:key', authenticateToken, async (req, res) => {
  try {
    const db = await getDb();
    const { value } = req.body;
    
    if (value === undefined) {
      return res.status(400).json({ success: false, message: '缺少 value 字段' });
    }
    
    const valueToStore = typeof value === 'object' ? JSON.stringify(value) : String(value);
    
    const exists = await db.get('SELECT id FROM settings WHERE key = ?', [req.params.key]);
    if (exists) {
      await db.run(
        'UPDATE settings SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE key = ?',
        [valueToStore, req.params.key]
      );
    } else {
      await db.run('INSERT INTO settings (key, value) VALUES (?, ?)', [req.params.key, valueToStore]);
    }
    
    res.json({ success: true, message: '设置已更新' });
  } catch (error) {
    console.error('Failed to update setting:', error);
    res.status(500).json({ success: false, message: '更新设置失败' });
  }
});

export default router;
