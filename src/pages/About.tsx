import { MapPin, Briefcase, Mail, Code2, Terminal } from 'lucide-react';
import { useSettingsStore } from '../store/settingsStore';
import { renderMarkdown } from '../utils/markdown';

export default function About() {
  const { settings } = useSettingsStore();

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <section className="relative overflow-hidden rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-5 sm:p-8 md:p-12">
        <div className="absolute inset-0 grid-bg opacity-50" />
        <div className="relative">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--accent-green)]/30 bg-[var(--accent-green)]/10 px-3 py-1 text-xs text-[var(--accent-green)]">
            <span className="status-dot status-online" />
            <span>Online</span>
          </div>
          
          <h1 className="mb-4 break-words text-2xl font-bold leading-tight sm:text-3xl md:text-5xl">
            <span className="text-[var(--text-primary)]">{'<'}</span>
            <span className="gradient-text">关于我</span>
            <span className="text-[var(--text-primary)]">{' />'}</span>
          </h1>
          
          <div className="max-w-2xl text-base sm:text-lg">
            <div 
              className="markdown-preview text-[var(--text-secondary)]"
              dangerouslySetInnerHTML={{ 
                __html: renderMarkdown(settings.author_bio)
              }}
            />
          </div>
        </div>
      </section>

      {/* Basic Info */}
      <section className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4 sm:p-6 md:p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent-blue)]/10">
            <Terminal className="h-4 w-4 text-[var(--accent-blue)]" />
          </div>
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">基本信息</h2>
        </div>
        
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="flex min-w-0 items-center gap-4 rounded-lg bg-[var(--bg-tertiary)] p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--bg-secondary)]">
              <MapPin className="h-5 w-5 text-[var(--accent-blue)]" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-[var(--text-muted)]">位置</p>
              <p className="break-words text-sm font-medium text-[var(--text-primary)]">{settings.author_location}</p>
            </div>
          </div>
          
          <div className="flex min-w-0 items-center gap-4 rounded-lg bg-[var(--bg-tertiary)] p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--bg-secondary)]">
              <Briefcase className="h-5 w-5 text-[var(--accent-purple)]" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-[var(--text-muted)]">目前工作</p>
              <p className="break-words text-sm font-medium text-[var(--text-primary)]">{settings.author_company}</p>
            </div>
          </div>

          <div className="flex min-w-0 items-center gap-4 rounded-lg bg-[var(--bg-tertiary)] p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--bg-secondary)]">
              <Mail className="h-5 w-5 text-[var(--accent-green)]" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-[var(--text-muted)]">联系方式</p>
              <a href={`mailto:${settings.author_email}`} className="break-all text-sm font-medium text-[var(--accent-blue)] hover:underline">
                {settings.author_email}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Work Experience */}
      <section className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4 sm:p-6 md:p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent-purple)]/10">
            <Briefcase className="h-4 w-4 text-[var(--accent-purple)]" />
          </div>
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">工作经历</h2>
        </div>
        
        <div className="space-y-4">
          {settings.work_experience.map((exp, index) => (
            <div key={index} className="flex flex-col gap-2 border-l-2 border-[var(--accent-purple)]/30 pl-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex-1">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="font-medium text-[var(--text-primary)]">{exp.title}</h3>
                    <p className="text-sm text-[var(--text-secondary)]">{exp.company}</p>
                  </div>
                  <span className="text-xs text-[var(--text-muted)] sm:whitespace-nowrap">{exp.period}</span>
                </div>
                {exp.description && (
                  <div className="mt-2">
                    <div 
                      className="markdown-preview text-[var(--text-secondary)] text-sm"
                      dangerouslySetInnerHTML={{ 
                        __html: renderMarkdown(exp.description)
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* USER.md 展示 */}
      {settings.user_md && (
        <section className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4 sm:p-6 md:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent-purple)]/10">
              <Code2 className="h-4 w-4 text-[var(--accent-purple)]" />
            </div>
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">USER.md</h2>
          </div>
          <div className="markdown-preview text-[var(--text-secondary)]">
            <div 
              dangerouslySetInnerHTML={{ 
                __html: renderMarkdown(settings.user_md)
              }}
            />
          </div>
        </section>
      )}
    </div>
  );
}
