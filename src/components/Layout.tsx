import { useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Terminal, BookOpen, FolderOpen, User, Github, MessageSquareQuote } from 'lucide-react';
import { useSettingsStore } from '../store/settingsStore';

export default function Layout() {
  const location = useLocation();
  const { settings, fetchSettings } = useSettingsStore();
  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[var(--border-color)] bg-[var(--bg-primary)]/95 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex min-h-16 flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:py-0">
            {/* Logo */}
            <Link to="/" className="flex min-w-0 items-center gap-3 text-[var(--text-primary)] no-underline">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--accent-green)]/10">
                <Terminal className="h-5 w-5 text-[var(--accent-green)]" />
              </div>
              <div className="min-w-0">
                <h1 className="truncate text-base font-semibold sm:text-lg">{settings.site_name}</h1>
                <p className="truncate text-xs text-[var(--text-secondary)]">echo "Hello, World!"</p>
              </div>
            </Link>

            {/* Navigation */}
            <nav className="flex w-full items-center gap-1 overflow-x-auto pb-1 sm:w-auto sm:overflow-visible sm:pb-0">
              <Link
                to="/"
                className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors sm:px-4 ${
                  isActive('/')
                    ? 'bg-[var(--bg-tertiary)] text-[var(--accent-blue)]'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <BookOpen className="h-4 w-4" />
                <span>首页</span>
              </Link>
              <Link
                to="/articles"
                className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors sm:px-4 ${
                  location.pathname.startsWith('/articles')
                    ? 'bg-[var(--bg-tertiary)] text-[var(--accent-blue)]'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <FolderOpen className="h-4 w-4" />
                <span>文章</span>
              </Link>
              <Link
                to="/thoughts"
                className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors sm:px-4 ${
                  location.pathname.startsWith('/thoughts')
                    ? 'bg-[var(--bg-tertiary)] text-[var(--accent-blue)]'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <MessageSquareQuote className="h-4 w-4" />
                <span>随想</span>
              </Link>
              <Link
                to="/about"
                className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors sm:px-4 ${
                  isActive('/about')
                    ? 'bg-[var(--bg-tertiary)] text-[var(--accent-blue)]'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <User className="h-4 w-4" />
                <span>关于</span>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border-color)] bg-[var(--bg-secondary)]">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="text-center md:text-left">
              <p className="text-xs text-[var(--text-muted)]">
                © {new Date().getFullYear()} {settings.site_name}. All rights reserved.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <a
                href={settings.author_github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
              >
                <Github className="h-4 w-4" />
                <span>GitHub</span>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
