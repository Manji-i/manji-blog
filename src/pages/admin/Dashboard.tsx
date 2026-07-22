import { useEffect, useState } from 'react';
import { FileText, Eye, FolderOpen, Clock, TrendingUp, Activity } from 'lucide-react';
import { articlesApi, categoriesApi } from '../../lib/api';

interface Stats {
  totalArticles: number;
  totalViews: number;
  totalCategories: number;
  recentArticles: Array<{
    id: number;
    title: string;
    slug: string;
    view_count: number;
    created_at: string;
    status: string;
  }>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [articlesRes, categoriesRes] = await Promise.all([
          articlesApi.getAdminList({ limit: 100 }),
          categoriesApi.getAll(),
        ]);

        const articles: Stats['recentArticles'] = articlesRes.data.data;
        const categories = categoriesRes.data.data;

        const totalViews = articles.reduce((sum, article) => sum + (article.view_count || 0), 0);
        const recentArticles = articles.slice(0, 5);

        setStats({
          totalArticles: articles.length,
          totalViews,
          totalCategories: categories.length,
          recentArticles,
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
    });
  };

  const statCards = [
    {
      title: '文章总数',
      value: stats?.totalArticles || 0,
      icon: FileText,
      color: 'blue',
    },
    {
      title: '总阅读量',
      value: stats?.totalViews || 0,
      icon: Eye,
      color: 'green',
    },
    {
      title: '分类数量',
      value: stats?.totalCategories || 0,
      icon: FolderOpen,
      color: 'purple',
    },
  ];

  const getColorClass = (color: string) => {
    const colors: Record<string, string> = {
      blue: 'bg-[var(--accent-blue)]/10 text-[var(--accent-blue)]',
      green: 'bg-[var(--accent-green)]/10 text-[var(--accent-green)]',
      purple: 'bg-[var(--accent-purple)]/10 text-[var(--accent-purple)]',
      orange: 'bg-[var(--accent-orange)]/10 text-[var(--accent-orange)]',
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">仪表盘</h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          欢迎回来，查看您的博客数据概览
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((card) => (
          <div key={card.title} className="card p-6">
            <div className="flex items-center gap-4">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${getColorClass(card.color)}`}>
                <card.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-[var(--text-secondary)]">{card.title}</p>
                <p className="text-2xl font-bold text-[var(--text-primary)]">
                  {loading ? '-' : card.value.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Articles */}
      <div className="card">
        <div className="flex items-center justify-between border-b border-[var(--border-color)] p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent-orange)]/10">
              <Clock className="h-4 w-4 text-[var(--accent-orange)]" />
            </div>
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">最近发布</h2>
          </div>
          <a
            href="/admin/articles"
            className="text-sm text-[var(--accent-blue)] transition-colors hover:text-[var(--accent-cyan)]"
          >
            查看全部
          </a>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="py-8 text-center text-[var(--text-secondary)]">Loading...</div>
          ) : stats?.recentArticles.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-[var(--text-secondary)]">暂无文章</p>
              <a
                href="/admin/articles/new"
                className="mt-2 inline-block text-sm text-[var(--accent-blue)]"
              >
                创建第一篇文章 →
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              {stats?.recentArticles.map((article) => (
                <div
                  key={article.id}
                  className="flex items-center justify-between rounded-lg border border-[var(--border-color)] bg-[var(--bg-tertiary)] p-4 transition-colors hover:border-[var(--bg-hover)]"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <h3 className="truncate font-medium text-[var(--text-primary)]">
                        <a
                          href={`/articles/${article.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="no-underline hover:text-[var(--accent-blue)]"
                        >
                          {article.title}
                        </a>
                      </h3>
                      <span
                        className={`badge ${
                          article.status === 'published'
                            ? 'badge-green'
                            : 'badge-orange'
                        }`}
                      >
                        {article.status === 'published' ? '已发布' : '草稿'}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-[var(--text-muted)]">
                      {formatDate(article.created_at)}
                    </p>
                  </div>
                  <div className="ml-4 flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                    <Eye className="h-4 w-4" />
                    <span>{article.view_count}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2">
        <a
          href="/admin/articles/new"
          className="card group flex items-center gap-4 p-6 no-underline"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--accent-blue)]/10 transition-colors group-hover:bg-[var(--accent-blue)]">
            <TrendingUp className="h-6 w-6 text-[var(--accent-blue)] transition-colors group-hover:text-white" />
          </div>
          <div>
            <h3 className="font-medium text-[var(--text-primary)]">写文章</h3>
            <p className="text-sm text-[var(--text-secondary)]">创建新的博客文章</p>
          </div>
        </a>

        <a
          href="/admin/categories"
          className="card group flex items-center gap-4 p-6 no-underline"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--accent-purple)]/10 transition-colors group-hover:bg-[var(--accent-purple)]">
            <Activity className="h-6 w-6 text-[var(--accent-purple)] transition-colors group-hover:text-white" />
          </div>
          <div>
            <h3 className="font-medium text-[var(--text-primary)]">管理分类</h3>
            <p className="text-sm text-[var(--text-secondary)]">组织文章分类</p>
          </div>
        </a>
      </div>
    </div>
  );
}
