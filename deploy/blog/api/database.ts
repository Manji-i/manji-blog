import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let db: Database<sqlite3.Database, sqlite3.Statement> | null = null;

export async function getDb() {
  if (!db) {
    db = await open({
      filename: path.join(__dirname, 'database', 'blog.db'),
      driver: sqlite3.Database
    });
    await initDatabase();
  }
  return db;
}

async function initDatabase() {
  if (!db) return;

  // Create users table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      name VARCHAR(100) NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create categories table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(100) NOT NULL,
      slug VARCHAR(100) UNIQUE NOT NULL,
      description TEXT,
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create articles table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS articles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title VARCHAR(255) NOT NULL,
      slug VARCHAR(255) UNIQUE NOT NULL,
      content TEXT NOT NULL,
      cover_image VARCHAR(500),
      status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
      user_id INTEGER NOT NULL,
      category_id INTEGER,
      view_count INTEGER DEFAULT 0,
      published_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (category_id) REFERENCES categories(id)
    )
  `);

  // Create indexes
  await db.exec(`
    CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
    CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category_id);
    CREATE INDEX IF NOT EXISTS idx_articles_created_at ON articles(created_at DESC);
  `);

  // Create settings table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key VARCHAR(100) UNIQUE NOT NULL,
      value TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Insert default settings
  const defaultSettings = [
    { key: 'site_name', value: 'DevBlog' },
    { key: 'site_description', value: '记录技术成长的每一步，分享代码与生活的点滴。' },
    { key: 'author_name', value: '博主名字' },
    { key: 'author_bio', value: 'Hi, I\'m 博主名字！' },
    { key: 'author_location', value: '城市, 国家' },
    { key: 'author_company', value: '公司 / 职位' },
    { key: 'author_email', value: 'your@email.com' },
    { key: 'author_github', value: 'https://github.com/yourname' },
    { key: 'work_experience', value: JSON.stringify([
      { title: '职位名称', company: '公司名称', period: '2023.6 – 至今' },
      { title: '职位名称', company: '公司名称', period: '2021.3 – 2023.5' }
    ]) },
    { key: 'skills', value: JSON.stringify(['Web Development', 'AI Infrastructure', 'Open Source', 'Cloud Native']) }
  ];

  for (const setting of defaultSettings) {
    const exists = await db.get('SELECT id FROM settings WHERE key = ?', [setting.key]);
    if (!exists) {
      await db.run('INSERT INTO settings (key, value) VALUES (?, ?)', [setting.key, setting.value]);
    }
  }

  // Insert default admin user (password: sj2kv1t5)
  const adminExists = await db.get('SELECT id FROM users WHERE email = ?', ['wangxun417@foxmail.com']);
  if (!adminExists) {
    await db.run(
      'INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)',
      ['wangxun417@foxmail.com', 'c4ca4238a0b923820dcc509a6f75849b', '博主']
    );
  }

  // Insert default categories
  const categoriesExist = await db.get('SELECT id FROM categories LIMIT 1');
  if (!categoriesExist) {
    const defaultCategories = [
      { name: '技术', slug: 'tech', description: '技术文章分享', sort_order: 1 },
      { name: '生活', slug: 'life', description: '生活随笔', sort_order: 2 },
      { name: '随笔', slug: 'notes', description: '随想随记', sort_order: 3 }
    ];
    for (const cat of defaultCategories) {
      await db.run(
        'INSERT INTO categories (name, slug, description, sort_order) VALUES (?, ?, ?, ?)',
        [cat.name, cat.slug, cat.description, cat.sort_order]
      );
    }
  }
}

export async function closeDb() {
  if (db) {
    await db.close();
    db = null;
  }
}
