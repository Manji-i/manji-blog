import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, FolderOpen, Settings, LogOut, Terminal, ChevronRight, Home, MessageSquareQuote } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, clearAuth } = useAuthStore();

  const handleLogout = () => {
    clearAuth();
    navigate('/admin/login');
  };

  const navItems = [
    { path: '/admin/dashboard', label: '仪表盘', icon: LayoutDashboard },
    { path: '/admin/articles', label: '文章管理', icon: FileText },
    { path: '/admin/thoughts', label: '随想管理', icon: MessageSquareQuote },
    { path: '/admin/categories', label: '分类管理', icon: FolderOpen },
    { path: '/admin/settings', label: '网站设置', icon: Settings },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex min-h-screen bg-[var(--bg-primary)]">
      {/* Sidebar */}
      <aside className="w-64 border-r border-[var(--border-color)] bg-[var(--bg-secondary)]">
        <div className="flex h-16 items-center gap-3 border-b border-[var(--border-color)] px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent-green)]/10">
            <Terminal className="h-4 w-4 text-[var(--accent-green)]" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-[var(--text-primary)]">管理后台</h1>
            <p className="text-xs text-[var(--text-muted)]">Admin Panel</p>
          </div>
        </div>

        <nav className="p-4">
          <div className="mb-4 text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
            Menu
          </div>
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition-colors ${
                    isActive(item.path)
                      ? 'bg-[var(--accent-blue)]/10 text-[var(--accent-blue)]'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                  {isActive(item.path) && <ChevronRight className="ml-auto h-4 w-4" />}
                </Link>
              </li>
            ))}
          </ul>

          <div className="my-4 border-t border-[var(--border-color)]" />

          <Link
            to="/"
            className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]"
          >
            <Home className="h-4 w-4" />
            <span>返回首页</span>
          </Link>
        </nav>

        <div className="absolute bottom-0 w-64 border-t border-[var(--border-color)] p-4">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--accent-purple)]/10">
              <span className="text-sm font-medium text-[var(--accent-purple)]">
                {user?.name?.[0] || 'A'}
              </span>
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium text-[var(--text-primary)]">
                {user?.name || 'Admin'}
              </p>
              <p className="truncate text-xs text-[var(--text-muted)]">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-tertiary)] px-4 py-2 text-sm text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
          >
            <LogOut className="h-4 w-4" />
            <span>退出登录</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-6 md:p-8 max-w-none">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
