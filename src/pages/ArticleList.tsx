import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Calendar, Eye, Search, FolderOpen, X } from 'lucide-react';
import { articlesApi, categoriesApi } from '../lib/api';

interface Article {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  view_count: number;
  published_at: string;
  created_at: string;
  category_name: string;
  category_slug: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

export default function ArticleList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  const currentPage = Number(searchParams.get('page')) || 1;
  const currentCategory = searchParams.get('category') || '';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [articlesRes, categoriesRes] = await Promise.all([
          articlesApi.getAll({
            page: currentPage,
            limit: 10,
            category: currentCategory || undefined,
            search: searchQuery || undefined,
          }),
          categoriesApi.getAll(),
        ]);
        setArticles(articlesRes.data.data);
        setTotalPages(articlesRes.data.pagination.totalPages);
        setCategories(categoriesRes.data.data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentPage, currentCategory, searchQuery]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({ search: searchQuery });
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSearchParams({});
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">文章列表</h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            共 {articles.length} 篇文章
          </p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex w-full gap-2 md:w-auto">
          <div className="relative min-w-0 flex-1 md:flex-none">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="搜索文章..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 md:w-64"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-[var(--accent-blue)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--accent-blue)]/90"
          >
            搜索
          </button>
        </form>
      </div>

      {/* Filters */}
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
        <button
          onClick={() => setSearchParams({})}
          className={`flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-sm transition-colors ${
            !currentCategory
              ? 'bg-[var(--accent-blue)] text-white'
              : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
          }`}
        >
          <FolderOpen className="h-4 w-4" />
          <span>全部</span>
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSearchParams({ category: category.slug })}
            className={`shrink-0 rounded-lg px-4 py-2 text-sm transition-colors ${
              currentCategory === category.slug
                ? 'bg-[var(--accent-blue)] text-white'
                : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
            }`}
          >
            {category.name}
          </button>
        ))}
        {(currentCategory || searchQuery) && (
          <button
            onClick={clearFilters}
            className="flex shrink-0 items-center gap-1 rounded-lg px-3 py-2 text-sm text-[var(--text-muted)] transition-colors hover:text-[var(--text-secondary)]"
          >
            <X className="h-4 w-4" />
            <span>清除筛选</span>
          </button>
        )}
      </div>

      {/* Articles Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-[var(--text-secondary)]">Loading...</div>
        </div>
      ) : articles.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--border-color)] bg-[var(--bg-secondary)] p-12 text-center">
          <FolderOpen className="mx-auto mb-4 h-12 w-12 text-[var(--text-muted)]" />
          <p className="text-[var(--text-secondary)]">暂无文章</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
          {articles.map((article) => (
              <article
                key={article.id}
                className="card group overflow-hidden p-4 sm:p-5"
              >
                <div className="flex flex-1 flex-col">
                <div className="mb-2 flex items-center gap-2">
                  <span className="badge badge-blue text-xs">{article.category_name}</span>
                </div>
                <h3 className="mb-2 text-base font-semibold text-[var(--text-primary)] transition-colors group-hover:text-[var(--accent-blue)]">
                  <Link to={`/articles/${article.slug}`} className="no-underline">
                    {article.title}
                  </Link>
                </h3>
                <p className="mb-3 line-clamp-2 text-sm text-[var(--text-secondary)]">
                  {article.excerpt || '暂无摘要'}
                </p>
                <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[var(--text-muted)]">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(article.published_at || article.created_at)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {article.view_count}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 overflow-x-auto pb-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setSearchParams({ page: String(page), category: currentCategory })}
              className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm transition-colors ${
                currentPage === page
                  ? 'bg-[var(--accent-blue)] text-white'
                  : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
