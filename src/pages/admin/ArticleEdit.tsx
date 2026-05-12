import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, Eye, Image, ArrowLeft, History } from 'lucide-react';
import { articlesApi, categoriesApi, uploadApi } from '../../lib/api';
import { renderMarkdown } from '../../utils/markdown';

interface Category {
  id: number;
  name: string;
}

const DRAFT_KEY = (id?: string) => `article_draft_${id || 'new'}`;

export default function AdminArticleEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);

  // 尝试从 localStorage 加载草稿
  const loadDraft = () => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY(id));
      if (saved) {
        const draft = JSON.parse(saved);
        return draft;
      }
    } catch (error) {
      console.error('Failed to load draft:', error);
    }
    return null;
  };

  // 保存草稿到 localStorage
  const saveDraft = () => {
    if (!title && !content) return;
    try {
      const draft = {
        title,
        content,
        excerpt,
        categoryId,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(DRAFT_KEY(id), JSON.stringify(draft));
      setHasDraft(true);
    } catch (error) {
      console.error('Failed to save draft:', error);
    }
  };

  // 清除草稿
  const clearDraft = () => {
    try {
      localStorage.removeItem(DRAFT_KEY(id));
      setHasDraft(false);
    } catch (error) {
      console.error('Failed to clear draft:', error);
    }
  };

  // 恢复草稿
  const restoreDraft = () => {
    const draft = loadDraft();
    if (draft) {
      setTitle(draft.title || '');
      setContent(draft.content || '');
      setExcerpt(draft.excerpt || '');
      setCategoryId(draft.categoryId || '');
    }
  };

  useEffect(() => {
    fetchCategories();
    if (isEdit) {
      fetchArticle();
    } else {
      // 新建文章时先检查是否有草稿
      const draft = loadDraft();
      if (draft) {
        setHasDraft(true);
      }
    }
  }, [id]);

  // 监听内容变化，自动保存草稿（防抖）
  useEffect(() => {
    const timer = setTimeout(() => {
      saveDraft();
    }, 2000);
    return () => clearTimeout(timer);
  }, [title, content, excerpt, categoryId]);

  const fetchCategories = async () => {
    try {
      const res = await categoriesApi.getAll();
      setCategories(res.data.data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchArticle = async () => {
    if (!id) return;
    setLoading(true);
    try {
      console.log('Fetching article with id:', id);
      const res = await articlesApi.getAdminDetail(Number(id));
      const article = res.data.data;
      console.log('Article data:', article);
      if (article) {
        setTitle(article.title);
        setContent(article.content || '');
        setExcerpt(article.excerpt || '');
        setCategoryId(article.category_id || '');
        setStatus(article.status);
        console.log('Set content:', article.content);
      }
    } catch (error) {
      console.error('Failed to fetch article:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert('标题和内容不能为空');
      return;
    }

    setSaving(true);
    try {
      const data = {
        title: title.trim(),
        content: content.trim(),
        excerpt: excerpt.trim(),
        category_id: categoryId || undefined,
        status,
      };
      console.log('Saving article data:', data);

      if (isEdit) {
        console.log('Updating article with id:', id);
        await articlesApi.update(Number(id), data);
      } else {
        console.log('Creating new article');
        await articlesApi.create(data);
      }
      // 保存成功后清除草稿
      clearDraft();
      navigate('/admin/articles');
    } catch (error) {
      console.error('Failed to save article:', error);
      alert('保存失败');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const res = await uploadApi.uploadImage(file);
      const imageUrl = res.data.data.url;
      const imageMarkdown = `\n![${file.name}](${imageUrl})\n`;
      setContent((prev) => prev + imageMarkdown);
    } catch (error) {
      console.error('Failed to upload image:', error);
      alert('图片上传失败');
    } finally {
      setUploading(false);
    }
  };

  const insertMarkdown = (syntax: string) => {
    const textarea = document.getElementById('content') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const newText = content.substring(0, start) + syntax.replace('{}', selectedText) + content.substring(end);
    setContent(newText);

    setTimeout(() => {
      textarea.focus();
      const newCursor = start + syntax.indexOf('{}') + selectedText.length;
      textarea.setSelectionRange(newCursor, newCursor);
    }, 0);
  };

  if (loading) {
    return <div className="p-8 text-center text-[var(--text-secondary)]">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/articles')}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-tertiary)]"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            {isEdit ? '编辑文章' : '新建文章'}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {hasDraft && (
            <button
              type="button"
              onClick={restoreDraft}
              className="flex items-center gap-2 rounded-lg bg-[var(--accent-yellow)]/20 px-3 py-2 text-sm text-[var(--accent-yellow)] transition-colors hover:bg-[var(--accent-yellow)]/30"
            >
              <History className="h-4 w-4" />
              <span>恢复草稿</span>
            </button>
          )}
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}
            className="w-32 bg-[var(--bg-secondary)] text-[var(--text-primary)] border-[var(--border-color)]"
          >
            <option value="draft">草稿</option>
            <option value="published">发布</option>
          </select>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-[var(--accent-blue)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--accent-blue)]/90 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            <span>{saving ? '保存中...' : '保存'}</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-4 lg:col-span-2">
          <input
            type="text"
            placeholder="文章标题"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-lg font-semibold"
          />
          
          <textarea
            placeholder="文章摘要（可选）"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={3}
            className="w-full resize-none text-sm"
          />

          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-tertiary)] p-2">
            {[
              { label: 'B', action: () => insertMarkdown('**{}**'), title: '粗体' },
              { label: 'I', action: () => insertMarkdown('*{}*'), title: '斜体' },
              { label: 'H1', action: () => insertMarkdown('\n# {}\n'), title: '标题1' },
              { label: 'H2', action: () => insertMarkdown('\n## {}\n'), title: '标题2' },
              { label: 'H3', action: () => insertMarkdown('\n### {}\n'), title: '标题3' },
              { label: '```', action: () => insertMarkdown('\n```\n{}\n```\n'), title: '代码块' },
              { label: '-', action: () => insertMarkdown('\n- {}\n'), title: '列表' },
              { label: '1.', action: () => insertMarkdown('\n1. {}\n'), title: '有序列表' },
              { label: '>', action: () => insertMarkdown('\n> {}\n'), title: '引用' },
              { label: '---', action: () => insertMarkdown('\n---\n'), title: '分割线' },
            ].map((btn) => (
              <button
                key={btn.label}
                type="button"
                onClick={btn.action}
                title={btn.title}
                className="flex h-8 min-w-[32px] items-center justify-center rounded px-2 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
              >
                {btn.label}
              </button>
            ))}
            <div className="mx-2 h-4 w-px bg-[var(--border-color)]" />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-1 rounded px-3 py-1 text-sm text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] disabled:opacity-50"
            >
              <Image className="h-4 w-4" />
              <span>{uploading ? '上传中...' : '图片'}</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          <textarea
            id="content"
            placeholder="使用 Markdown 编写文章内容..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[500px] w-full resize-none font-mono text-sm leading-relaxed"
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Category */}
          <div className="card p-4">
            <label className="mb-2 block text-sm font-medium text-[var(--text-primary)]">
              分类
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(Number(e.target.value) || '')}
              className="w-full bg-[var(--bg-secondary)] text-[var(--text-primary)] border-[var(--border-color)]"
            >
              <option value="">选择分类</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Preview */}
          <div className="card p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-[var(--text-primary)]">
              <Eye className="h-4 w-4" />
              <span>预览</span>
            </div>
            <div className="max-h-[600px] overflow-auto rounded-lg bg-[var(--bg-tertiary)] p-3 text-sm">
              <h3 className="mb-2 font-semibold text-[var(--text-primary)]">
                {title || '无标题'}
              </h3>
              <div 
                className="markdown-preview text-[var(--text-secondary)]"
                dangerouslySetInnerHTML={{ 
                  __html: renderMarkdown(content)
                }}
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
