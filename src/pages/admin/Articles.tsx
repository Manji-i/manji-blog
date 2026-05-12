import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit2, Trash2, Eye, Calendar } from 'lucide-react';
import { articlesApi } from '../../lib/api';

interface Article {
  id: number;
  title: string;
  slug: string;
  status: 'draft' | 'published';
  view_count: number;
  published_at: string | null;
  created_at: string;
  category_name: string;
}

export default function AdminArticles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  useEffect(() => {
    fetchArticles();
  }, [statusFilter]);

  const fetchArticles = async () => {
    try {
      const res = await articlesApi.getAdminList({
        status: statusFilter || undefined,
        limit: 100,
      });
      setArticles(res.data.data);
    } catch (error) {
      console.error('Failed to fetch articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这篇文章吗？')) return;
    try {
      await articlesApi.delete(id);
      setArticles(articles.filter((a) => a.id !== id));
    } catch (error) {
      console.error('Failed to delete article:', error);
      alert('删除失败');
    }
  };

  const handlePublish = async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === 'published' ? 'draft' : 'published';
    try {
      await articlesApi.update(id, { status: newStatus });
      fetchArticles();
    } catch (error) {
      console.error('Failed to update article:', error);
      alert('更新失败');
    }
  };

  const filteredArticles = articles.filter((article) =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('zh-CN');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">文章管理</h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            共 {filteredArticles.length} 篇文章
          </p>
        </div>
        <Link
          to="/admin/articles/new"
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent-blue)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--accent-blue)]/90"
        >
          <Plus className="h-4 w-4" />
          <span>新建文章</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="搜索文章..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full sm:w-40"
        >
          <option value="">全部状态</option>
          <option value="published">已发布</option>
          <option value="draft">草稿</option>
        </select>
      </div>

      {/* Articles Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-[var(--text-secondary)]">Loading...</div>
        ) : filteredArticles.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-[var(--text-secondary)]">暂无文章</p>
            <Link
              to="/admin/articles/new"
              className="mt-2 inline-block text-sm text-[var(--accent-blue)]"
            >
              创建第一篇文章 →
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[var(--bg-tertiary)]">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[var(--text-secondary)]">
                    文章
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[var(--text-secondary)]">
                    分类
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[var(--text-secondary)]">
                    状态
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[var(--text-secondary)]">
                    阅读量
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[var(--text-secondary)]">
                    发布时间
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-[var(--text-secondary)]">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {filteredArticles.map((article) => (
                  <tr key={article.id} className="hover:bg-[var(--bg-tertiary)]/50">
                    <td className="px-4 py-4">
                      <div className="min-w-0">
                        <p className="truncate font-medium text-[var(--text-primary)]">
                          {article.title}
                        </p>
                        <p className="text-xs text-[var(--text-muted)]">{article.slug}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-[var(--text-secondary)]">
                      {article.category_name || '-'}
                    </td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => handlePublish(article.id, article.status)}
                        className={`badge cursor-pointer ${
                          article.status === 'published' ? 'badge-green' : 'badge-orange'
                        }`}
                      >
                        {article.status === 'published' ? '已发布' : '草稿'}
                      </button>
                    </td>
                    <td className="px-4 py-4 text-sm text-[var(--text-secondary)]">
                      {article.view_count}
                    </td>
                    <td className="px-4 py-4 text-sm text-[var(--text-secondary)]">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(article.published_at || article.created_at)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={`/articles/${article.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-tertiary)] hover:text-[var(--accent-blue)]"
                        >
                          <Eye className="h-4 w-4" />
                        </a>
                        <Link
                          to={`/admin/articles/${article.id}/edit`}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-tertiary)] hover:text-[var(--accent-blue)]"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(article.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-tertiary)] hover:text-[var(--accent-red)]"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
