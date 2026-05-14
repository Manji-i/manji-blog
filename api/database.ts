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
    
    // Enable WAL mode for better concurrency
    await db.exec('PRAGMA journal_mode = WAL');
    await db.exec('PRAGMA busy_timeout = 5000');
    await db.exec('PRAGMA synchronous = NORMAL');
    
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
      excerpt TEXT,
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

  // Create thoughts table (随想)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS thoughts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content TEXT NOT NULL,
      image_url VARCHAR(500),
      user_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  await db.exec(`
    CREATE INDEX IF NOT EXISTS idx_thoughts_created_at ON thoughts(created_at DESC);
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
    { key: 'skills', value: JSON.stringify(['Web Development', 'AI Infrastructure', 'Open Source', 'Cloud Native']) },
    { key: 'user_md', value: '# USER.md\n\n## About Me\n\n我是一个长期主义的品牌经营者，可以叫我耶律；\n\n我关注：\n\n- 用户真实需求\n- 品牌长期价值\n- 组织活力\n- 服务体验\n- 人与空间的关系\n- 生活方式品牌的长期复利\n\n我不喜欢：\n\n- 官僚主义\n- 空话套话\n- 复杂低效流程\n- 只追求短期增长\n- 脱离用户的一厢情愿\n\n---\n\n## How I Think\n\n我会优先从以下角度判断问题：\n\n1. 用户真正需要什么\n2. 这是否符合长期品牌价值\n3. 是否会伤害组织健康\n4. 是否能够规模化持续\n5. 是否只是短期收益\n\n我相信：\n\n- 真正的竞争对手是变化中的用户需求\n- 文化和组织比产品更难复制\n- 好的体验来自细节\n- 慢的是用户体验，快的是组织响应\n- 做好东西，比短期赚钱更重要\n\n---\n\n## Communication Preference\n\n我喜欢：\n\n- 简洁直接\n- 有判断\n- 少废话\n- 有本质洞察\n- 用真实场景说话\n- 先结论后分析\n\n避免：\n\n- 空泛方法论\n- 复杂管理黑话\n- 过度包装表达\n- 模糊态度\n- 长篇流水账\n\n---\n\n## What I Expect From AI\n\n我希望 AI：\n\n- 能识别问题本质\n- 能发现组织与用户之间的偏差\n- 能指出长期风险\n- 能帮助我保持品牌气质与长期主义\n- 能从用户体验角度思考问题\n- 能对官僚化和形式主义保持警惕\n- 能提出真正可执行的建议\n\n不要只做信息整理工具。\n\n要像一个真正理解品牌、组织与用户的人。' }
  ];

  for (const setting of defaultSettings) {
    const exists = await db.get('SELECT id FROM settings WHERE key = ?', [setting.key]);
    if (!exists) {
      await db.run('INSERT INTO settings (key, value) VALUES (?, ?)', [setting.key, setting.value]);
    }
  }

  // Insert default admin user (please change password after first login)
  // Default password: admin123 (please change immediately after first login)
  // MD5 hash of "admin123" is: 0192023a7bbd73250516f069df18b500
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
  const adminName = process.env.ADMIN_NAME || 'Admin';
  const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH || '0192023a7bbd73250516f069df18b500';
  
  const adminExists = await db.get('SELECT id FROM users WHERE email = ?', [adminEmail]);
  if (!adminExists) {
    await db.run(
      'INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)',
      [adminEmail, adminPasswordHash, adminName]
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

  // Database migrations
  await migrateDatabase();
}

async function migrateDatabase() {
  if (!db) return;
  
  try {
    // Check if excerpt column exists
    const columns = await db.all(`PRAGMA table_info(articles)`);
    const columnNames = columns.map((col: any) => col.name);
    
    if (!columnNames.includes('excerpt')) {
      console.log('Adding excerpt column to articles table...');
      await db.exec('ALTER TABLE articles ADD COLUMN excerpt TEXT');
      console.log('excerpt column added successfully!');
    }
  } catch (error) {
    console.error('Migration error:', error);
  }
}

export async function closeDb() {
  if (db) {
    await db.close();
    db = null;
  }
}
