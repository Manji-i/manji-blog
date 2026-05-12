import { Router } from 'express';
import { getDb } from '../database.js';
import { generateToken, authMiddleware, AuthRequest } from '../middleware/auth.js';
import crypto from 'crypto';

const router = Router();

// Login
router.post('/login', async (req, res) => {
  try {
    const db = await getDb();
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: '邮箱和密码不能为空' });
      return;
    }

    // Hash password with MD5
    const passwordHash = crypto.createHash('md5').update(password).digest('hex');

    const user = await db.get(
      'SELECT id, email, name FROM users WHERE email = ? AND password_hash = ?',
      [email, passwordHash]
    );

    if (!user) {
      res.status(401).json({ success: false, message: '邮箱或密码错误' });
      return;
    }

    const token = generateToken(user);

    res.json({
      success: true,
      message: '登录成功',
      data: {
        token,
        user
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: '登录失败' });
  }
});

// Get current user info (requires auth)
router.get('/me', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const db = await getDb();
    const user = await db.get(
      'SELECT id, email, name, created_at FROM users WHERE id = ?',
      [req.user!.id]
    );

    if (!user) {
      res.status(404).json({ success: false, message: '用户不存在' });
      return;
    }

    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ success: false, message: '获取用户信息失败' });
  }
});

// Change password (requires auth)
router.put('/password', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const db = await getDb();
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      res.status(400).json({ success: false, message: '原密码和新密码不能为空' });
      return;
    }

    const oldPasswordHash = crypto.createHash('md5').update(oldPassword).digest('hex');
    const user = await db.get(
      'SELECT id FROM users WHERE id = ? AND password_hash = ?',
      [req.user!.id, oldPasswordHash]
    );

    if (!user) {
      res.status(401).json({ success: false, message: '原密码错误' });
      return;
    }

    const newPasswordHash = crypto.createHash('md5').update(newPassword).digest('hex');
    await db.run(
      'UPDATE users SET password_hash = ? WHERE id = ?',
      [newPasswordHash, req.user!.id]
    );

    res.json({ success: true, message: '密码修改成功' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, message: '修改密码失败' });
  }
});

export default router;
