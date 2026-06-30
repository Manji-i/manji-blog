import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, Eye, Clock, Terminal, MapPin, Briefcase, Mail, Github, MessageSquareQuote } from 'lucide-react';
import { articlesApi, thoughtsApi } from '../lib/api';
import { formatZhDate } from '../lib/date';
import { useSettingsStore } from '../store/settingsStore';
import { ThoughtMarkdown } from '../components/ThoughtMarkdown';

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

interface Thought {
  id: number;
  content: string;
  image_url: string | null;
  created_at: string;
}

export default function Home() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [loading, setLoading] = useState(true);
  const { settings } = useSettingsStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [articlesRes, thoughtsRes] = await Promise.all([
          articlesApi.getAll({ limit: 6 }),
          thoughtsApi.getAll({ limit: 3 }),
        ]);
        setArticles(articlesRes.data.data);
        setThoughts(thoughtsRes.data.data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-8 sm:space-y-12">
      {/* Hero Section - Personal Profile Summary */}
      <section className="relative overflow-hidden rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-5 sm:p-8 md:p-12">
        <div className="absolute inset-0 grid-bg opacity-50" />
        <div className="relative">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--accent-green)]/30 bg-[var(--accent-green)]/10 px-3 py-1 text-xs text-[var(--accent-green)]">
            <span className="status-dot status-online" />
            <span>Online</span>
          </div>
          
          <h1 className="mb-4 break-words text-2xl font-bold leading-tight sm:text-3xl md:text-5xl">
            <span className="text-[var(--text-primary)]">{'<'}</span>
            <span className="gradient-text">{settings.author_name}</span>
            <span className="text-[var(--text-primary)]">{' />'}</span>
          </h1>
          
          <p className="mb-6 max-w-2xl text-base text-[var(--text-secondary)] sm:text-lg">
            {settings.site_description}
          </p>

          {/* Personal Info Grid */}
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex min-w-0 items-center gap-3 text-[var(--text-secondary)]">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--bg-tertiary)]">
                <MapPin className="h-4 w-4 text-[var(--accent-blue)]" />
              </div>
              <span className="min-w-0 break-words text-sm">{settings.author_location}</span>
            </div>
            <div className="flex min-w-0 items-center gap-3 text-[var(--text-secondary)]">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--bg-tertiary)]">
                <Briefcase className="h-4 w-4 text-[var(--accent-purple)]" />
              </div>
              <span className="min-w-0 break-words text-sm">{settings.author_company}</span>
            </div>
            <div className="flex min-w-0 items-center gap-3 text-[var(--text-secondary)]">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--bg-tertiary)]">
                <Mail className="h-4 w-4 text-[var(--accent-green)]" />
              </div>
              <a href={`mailto:${settings.author_email}`} className="min-w-0 break-all text-sm hover:text-[var(--accent-blue)]">
                {settings.author_email}
              </a>
            </div>
          </div>

          {/* Social Links */}
          <div className="mb-8 flex flex-wrap gap-3">
            <a
              href={`mailto:${settings.author_email}`}
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-tertiary)] px-4 py-2 text-sm text-[var(--text-primary)] transition-all hover:bg-[var(--bg-hover)]"
            >
              <Mail className="h-4 w-4" />
              <span>Email</span>
            </a>
            <a
              href={settings.author_github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-tertiary)] px-4 py-2 text-sm text-[var(--text-primary)] transition-all hover:bg-[var(--bg-hover)]"
            >
              <Github className="h-4 w-4" />
              <span>GitHub</span>
            </a>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
            <Link
              to="/articles"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--accent-blue)] px-6 py-3 text-sm font-medium text-white transition-all hover:bg-[var(--accent-blue)]/90"
            >
              <span>浏览文章</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/about"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-tertiary)] px-6 py-3 text-sm font-medium text-[var(--text-primary)] transition-all hover:bg-[var(--bg-hover)]"
            >
              <Terminal className="h-4 w-4" />
              <span>关于我</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Recent Thoughts */}
      {thoughts.length > 0 && (
        <section>
          <div className="mb-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent-purple)]/10">
                <MessageSquareQuote className="h-4 w-4 text-[var(--accent-purple)]" />
              </div>
              <h2 className="text-xl font-semibold text-[var(--text-primary)]">最近随想</h2>
            </div>
            <Link
              to="/thoughts"
              className="flex shrink-0 items-center gap-1 text-sm text-[var(--accent-blue)] transition-colors hover:text-[var(--accent-cyan)]"
            >
              <span>查看全部</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {thoughts.map((thought) => (
              <Link
                key={thought.id}
                to="/thoughts"
                className="card flex h-full flex-col p-4 no-underline transition-colors hover:border-[var(--accent-purple)]/40 sm:p-5"
              >
                <ThoughtMarkdown
                  content={thought.content}
                  compact
                  className="flex-1 text-[var(--text-primary)]"
                />
                <div className="mt-4 flex items-center gap-1 text-xs text-[var(--text-muted)]">
                  <Calendar className="h-3 w-3" />
                  <span>{formatZhDate(thought.created_at)}</span>
                  {thought.image_url && (
                    <span className="ml-auto text-[var(--text-muted)]">含图片</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Latest Articles */}
      <section>
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent-orange)]/10">
              <Clock className="h-4 w-4 text-[var(--accent-orange)]" />
            </div>
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">最新文章</h2>
          </div>
          <Link
            to="/articles"
            className="flex shrink-0 items-center gap-1 text-sm text-[var(--accent-blue)] transition-colors hover:text-[var(--accent-cyan)]"
          >
            <span>查看全部</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-[var(--text-secondary)]">Loading...</div>
          </div>
        ) : articles.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[var(--border-color)] bg-[var(--bg-secondary)] p-12 text-center">
            <Terminal className="mx-auto mb-4 h-12 w-12 text-[var(--text-muted)]" />
            <p className="text-[var(--text-secondary)]">暂无文章</p>
            <p className="mt-1 text-sm text-[var(--text-muted)]">开始写作，分享你的知识</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <article
                key={article.id}
                className="card group flex flex-col overflow-hidden"
              >
                <div className="flex flex-1 flex-col p-4 sm:p-5">
                  <div className="mb-3 flex items-center gap-2">
                    <span className="badge badge-blue">{article.category_name}</span>
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-[var(--text-primary)] transition-colors group-hover:text-[var(--accent-blue)]">
                    <Link to={`/articles/${article.slug}`} className="no-underline">
                      {article.title}
                    </Link>
                  </h3>
                  <p className="mb-4 flex-1 text-sm text-[var(--text-secondary)] line-clamp-2">
                    {article.excerpt || '暂无摘要'}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[var(--text-muted)]">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatZhDate(article.published_at || article.created_at)}
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
      </section>
    </div>
  );
}
