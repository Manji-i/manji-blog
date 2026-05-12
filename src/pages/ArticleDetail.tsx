import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Calendar, Eye, User, ArrowLeft, Clock } from 'lucide-react';
import { articlesApi } from '../lib/api';
import { renderMarkdown } from '../utils/markdown';

interface Article {
  id: number;
  title: string;
  slug: string;
  content: string;
  view_count: number;
  published_at: string;
  created_at: string;
  updated_at?: string;
  category_name: string;
  category_slug: string;
  author_name: string;
}

export default function ArticleDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      if (!slug) return;
      try {
        const res = await articlesApi.getBySlug(slug);
        setArticle(res.data.data);
      } catch (error) {
        console.error('Failed to fetch article:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchArticle();
  }, [slug]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Calculate reading time (approx 300 words per minute)
  const getReadingTime = (content: string) => {
    const words = content.replace(/<[^>]*>/g, '').length;
    return Math.ceil(words / 300);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-[var(--text-secondary)]">Loading...</div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="rounded-xl border border-dashed border-[var(--border-color)] bg-[var(--bg-secondary)] p-12 text-center">
        <p className="text-[var(--text-secondary)]">文章不存在</p>
        <Link
          to="/articles"
          className="mt-4 inline-flex items-center gap-2 text-[var(--accent-blue)]"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>返回文章列表</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl overflow-hidden">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center gap-2 text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>返回</span>
      </button>

      {/* Article Header */}
      <header className="mb-6 sm:mb-8">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <Link
            to={`/articles?category=${article.category_slug}`}
            className="badge badge-blue no-underline"
          >
            {article.category_name}
          </Link>
        </div>
        <h1 className="mb-5 break-words text-2xl font-bold leading-tight text-[var(--text-primary)] sm:text-3xl md:text-4xl">
          {article.title}
        </h1>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[var(--text-secondary)] sm:gap-x-6 sm:text-sm">
          <span className="flex items-center gap-2">
            <User className="h-4 w-4" />
            {article.author_name}
          </span>
          <span className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {formatDate(article.published_at || article.created_at)}
          </span>
          <span className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            {article.view_count} 阅读
          </span>
          <span className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            {getReadingTime(article.content)} 分钟阅读
          </span>
        </div>
      </header>

      {/* Article Content */}
      <article className="min-w-0">
        <div
          className="markdown-preview text-[var(--text-primary)] leading-relaxed"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(article.content) }}
        />
      </article>

      {/* Article Footer */}
      <footer className="mt-10 border-t border-[var(--border-color)] pt-6 sm:mt-12 sm:pt-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-[var(--text-muted)]">
            最后更新于 {formatDate(article.updated_at || article.created_at)}
          </div>
          <Link
            to="/articles"
            className="flex items-center gap-2 text-sm text-[var(--accent-blue)] transition-colors hover:text-[var(--accent-cyan)]"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>返回文章列表</span>
          </Link>
        </div>
      </footer>
    </div>
  );
}
