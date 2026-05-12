import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Terminal, Lock, Mail, ArrowRight } from 'lucide-react';
import { authApi } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [email, setEmail] = useState('wangxun417@foxmail.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await authApi.login(email, password);
      const { token, user } = res.data.data;
      setAuth(token, user);
      navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg-primary)] p-4">
      <div className="w-full max-w-md">
        {/* Terminal Window */}
        <div className="terminal-window">
          {/* Header */}
          <div className="terminal-header">
            <div className="terminal-dot red" />
            <div className="terminal-dot yellow" />
            <div className="terminal-dot green" />
            <span className="terminal-title">login.sh</span>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Logo */}
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-[var(--accent-green)]/10">
                <Terminal className="h-8 w-8 text-[var(--accent-green)]" />
              </div>
              <h1 className="text-xl font-bold text-[var(--text-primary)]">管理后台登录</h1>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                请输入您的凭据以继续
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 rounded-lg border border-[var(--accent-red)]/30 bg-[var(--accent-red)]/10 p-3 text-sm text-[var(--accent-red)]">
                <span className="terminal-prompt">{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm text-[var(--text-secondary)]">
                  <span className="text-[var(--accent-blue)]">const</span> email =
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@blog.com"
                    className="w-full pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm text-[var(--text-secondary)]">
                  <span className="text-[var(--accent-blue)]">const</span> password =
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--accent-blue)] px-4 py-3 text-sm font-medium text-white transition-all hover:bg-[var(--accent-blue)]/90 disabled:opacity-50"
              >
                {loading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>登录</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            {/* Hint */}
            <div className="mt-6 rounded-lg bg-[var(--bg-tertiary)] p-4">
              <p className="text-xs text-[var(--text-muted)]">
                <span className="text-[var(--accent-yellow)]">⚠</span> 默认账号: wangxun417@foxmail.com
                <br />
                <span className="text-[var(--accent-yellow)]">⚠</span> 默认密码: sj2kv1t5
              </p>
            </div>

            {/* Back Link */}
            <div className="mt-6 text-center">
              <a
                href="/"
                className="text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
              >
                ← 返回首页
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-[var(--text-muted)]">
          DevBlog Admin Panel v1.0.0
        </p>
      </div>
    </div>
  );
}
