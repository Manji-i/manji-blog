import { useEffect, useState } from 'react';
import { Save, Globe, User, Briefcase, Mail, Github, Code2, Eye } from 'lucide-react';
import { settingsApi } from '../../lib/api';
import { renderMarkdown } from '../../utils/markdown';
import { toast } from 'sonner';

interface WorkExperience {
  title: string;
  company: string;
  period: string;
  description?: string;
}

interface Settings {
  site_name: string;
  site_description: string;
  author_name: string;
  author_bio: string;
  author_location: string;
  author_company: string;
  author_email: string;
  author_github: string;
  work_experience: WorkExperience[];
  skills: string[];
  user_md: string;
}

const defaultSettings: Settings = {
  site_name: 'DevBlog',
  site_description: '记录技术成长的每一步，分享代码与生活的点滴。',
  author_name: '博主名字',
  author_bio: "Hi, I'm 博主名字！",
  author_location: '城市, 国家',
  author_company: '公司 / 职位',
  author_email: 'your@email.com',
  author_github: 'https://github.com/yourname',
  work_experience: [
    { title: '职位名称', company: '公司名称', period: '2023.6 – 至今', description: '工作简介，描述你在这个职位上的主要职责和成就。' },
    { title: '职位名称', company: '公司名称', period: '2021.3 – 2023.5', description: '工作简介，描述你在这个职位上的主要职责和成就。' }
  ],
  skills: ['Web Development', 'AI Infrastructure', 'Open Source', 'Cloud Native'],
  user_md: '# USER.md\n\n## About Me\n\n我是一个长期主义的品牌经营者，可以叫我耶律；\n\n我关注：\n\n- 用户真实需求\n- 品牌长期价值\n- 组织活力\n- 服务体验\n- 人与空间的关系\n- 生活方式品牌的长期复利\n\n我不喜欢：\n\n- 官僚主义\n- 空话套话\n- 复杂低效流程\n- 只追求短期增长\n- 脱离用户的一厢情愿\n\n---\n\n## How I Think\n\n我会优先从以下角度判断问题：\n\n1. 用户真正需要什么\n2. 这是否符合长期品牌价值\n3. 是否会伤害组织健康\n4. 是否能够规模化持续\n5. 是否只是短期收益\n\n我相信：\n\n- 真正的竞争对手是变化中的用户需求\n- 文化和组织比产品更难复制\n- 好的体验来自细节\n- 慢的是用户体验，快的是组织响应\n- 做好东西，比短期赚钱更重要\n\n---\n\n## Communication Preference\n\n我喜欢：\n\n- 简洁直接\n- 有判断\n- 少废话\n- 有本质洞察\n- 用真实场景说话\n- 先结论后分析\n\n避免：\n\n- 空泛方法论\n- 复杂管理黑话\n- 过度包装表达\n- 模糊态度\n- 长篇流水账\n\n---\n\n## What I Expect From AI\n\n我希望 AI：\n\n- 能识别问题本质\n- 能发现组织与用户之间的偏差\n- 能指出长期风险\n- 能帮助我保持品牌气质与长期主义\n- 能从用户体验角度思考问题\n- 能对官僚化和形式主义保持警惕\n- 能提出真正可执行的建议\n\n不要只做信息整理工具。\n\n要像一个真正理解品牌、组织与用户的人。'
};

export default function Settings() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await settingsApi.getAll();
      if (res.data.success) {
        setSettings({ ...defaultSettings, ...res.data.data });
      }
    } catch (error) {
      toast.error('获取设置失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await settingsApi.update(settings);
      toast.success('设置已保存');
    } catch (error) {
      toast.error('保存失败');
    } finally {
      setSaving(false);
    }
  };

  const updateWorkExperience = (index: number, field: keyof WorkExperience, value: string) => {
    const newExp = [...settings.work_experience];
    newExp[index] = { ...newExp[index], [field]: value };
    setSettings({ ...settings, work_experience: newExp });
  };

  const addWorkExperience = () => {
    setSettings({
      ...settings,
      work_experience: [...settings.work_experience, { title: '', company: '', period: '', description: '' }]
    });
  };

  const removeWorkExperience = (index: number) => {
    const newExp = settings.work_experience.filter((_, i) => i !== index);
    setSettings({ ...settings, work_experience: newExp });
  };

  const addSkill = () => {
    if (newSkill.trim() && !settings.skills.includes(newSkill.trim())) {
      setSettings({ ...settings, skills: [...settings.skills, newSkill.trim()] });
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setSettings({ ...settings, skills: settings.skills.filter(s => s !== skill) });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-[var(--text-secondary)]">加载中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">网站设置</h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">管理博客名称、个人简介等信息</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent-blue)] px-4 py-2 text-sm font-medium text-white transition-all hover:bg-[var(--accent-blue)]/90 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          <span>{saving ? '保存中...' : '保存设置'}</span>
        </button>
      </div>

      {/* Site Settings */}
      <section className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent-blue)]/10">
            <Globe className="h-4 w-4 text-[var(--accent-blue)]" />
          </div>
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">网站信息</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--text-primary)]">
              博客名称
            </label>
            <input
              type="text"
              value={settings.site_name}
              onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
              className="input w-full"
              placeholder="DevBlog"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--text-primary)]">
              博主名字
            </label>
            <input
              type="text"
              value={settings.author_name}
              onChange={(e) => setSettings({ ...settings, author_name: e.target.value })}
              className="input w-full"
              placeholder="博主名字"
            />
          </div>
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-[var(--text-primary)]">
              网站描述
            </label>
            <textarea
              value={settings.site_description}
              onChange={(e) => setSettings({ ...settings, site_description: e.target.value })}
              className="input w-full"
              rows={2}
              placeholder="记录技术成长的每一步..."
            />
          </div>
          <div className="md:col-span-2">
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--text-primary)]">
                  个人简介 (支持 Markdown)
                </label>
                <textarea
                  value={settings.author_bio}
                  onChange={(e) => setSettings({ ...settings, author_bio: e.target.value })}
                  className="input w-full font-mono text-sm"
                  rows={4}
                  placeholder="Hi, I'm ..."
                />
              </div>
              <div>
                <div className="mb-2 flex items-center gap-2 text-sm font-medium text-[var(--text-primary)]">
                  <Eye className="h-4 w-4" />
                  <span>预览</span>
                </div>
                <div className="h-full overflow-auto rounded-lg bg-[var(--bg-tertiary)] p-3">
                  <div 
                    className="markdown-preview text-[var(--text-secondary)] text-sm"
                    dangerouslySetInnerHTML={{ 
                      __html: renderMarkdown(settings.author_bio)
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Personal Info */}
      <section className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent-purple)]/10">
            <User className="h-4 w-4 text-[var(--accent-purple)]" />
          </div>
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">个人信息</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--text-primary)]">
              位置
            </label>
            <input
              type="text"
              value={settings.author_location}
              onChange={(e) => setSettings({ ...settings, author_location: e.target.value })}
              className="input w-full"
              placeholder="城市, 国家"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--text-primary)]">
              目前工作
            </label>
            <input
              type="text"
              value={settings.author_company}
              onChange={(e) => setSettings({ ...settings, author_company: e.target.value })}
              className="input w-full"
              placeholder="公司 / 职位"
            />
          </div>
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-[var(--text-primary)]">
              <Mail className="h-4 w-4" />
              Email
            </label>
            <input
              type="email"
              value={settings.author_email}
              onChange={(e) => setSettings({ ...settings, author_email: e.target.value })}
              className="input w-full"
              placeholder="your@email.com"
            />
          </div>
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-[var(--text-primary)]">
              <Github className="h-4 w-4" />
              GitHub
            </label>
            <input
              type="url"
              value={settings.author_github}
              onChange={(e) => setSettings({ ...settings, author_github: e.target.value })}
              className="input w-full"
              placeholder="https://github.com/yourname"
            />
          </div>
        </div>
      </section>

      {/* Work Experience */}
      <section className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent-orange)]/10">
            <Briefcase className="h-4 w-4 text-[var(--accent-orange)]" />
          </div>
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">工作经历</h2>
        </div>

        <div className="space-y-4">
          {settings.work_experience.map((exp, index) => (
            <div key={index} className="flex flex-col gap-3 rounded-lg bg-[var(--bg-tertiary)] p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <input
                  type="text"
                  value={exp.title}
                  onChange={(e) => updateWorkExperience(index, 'title', e.target.value)}
                  className="input flex-1"
                  placeholder="职位名称"
                />
                <input
                  type="text"
                  value={exp.company}
                  onChange={(e) => updateWorkExperience(index, 'company', e.target.value)}
                  className="input flex-1"
                  placeholder="公司名称"
                />
                <input
                  type="text"
                  value={exp.period}
                  onChange={(e) => updateWorkExperience(index, 'period', e.target.value)}
                  className="input w-full sm:w-40"
                  placeholder="2023.6 – 至今"
                />
                <button
                  onClick={() => removeWorkExperience(index)}
                  className="rounded-lg border border-[var(--border-color)] px-3 py-2 text-sm text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
                >
                  删除
                </button>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[var(--text-primary)]">
                    工作简介 (支持 Markdown)
                  </label>
                  <textarea
                    value={exp.description || ''}
                    onChange={(e) => updateWorkExperience(index, 'description', e.target.value)}
                    className="input w-full font-mono text-sm"
                    rows={4}
                    placeholder="使用 Markdown 描述你在这个职位上的主要职责和成就..."
                  />
                </div>
                <div>
                  <div className="mb-2 flex items-center gap-2 text-sm font-medium text-[var(--text-primary)]">
                    <Eye className="h-4 w-4" />
                    <span>预览</span>
                  </div>
                  <div className="h-full overflow-auto rounded-lg bg-[var(--bg-secondary)] p-3">
                    <div 
                      className="markdown-preview text-[var(--text-secondary)] text-sm"
                      dangerouslySetInnerHTML={{ 
                        __html: renderMarkdown(exp.description || '')
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
          <button
            onClick={addWorkExperience}
            className="w-full rounded-lg border border-dashed border-[var(--border-color)] py-3 text-sm text-[var(--text-secondary)] transition-colors hover:border-[var(--accent-blue)] hover:text-[var(--accent-blue)]"
          >
            + 添加工作经历
          </button>
        </div>
      </section>

      {/* Skills */}
      <section className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent-green)]/10">
            <Code2 className="h-4 w-4 text-[var(--accent-green)]" />
          </div>
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">技术方向 / 技能</h2>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {settings.skills.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center gap-1 rounded-full border border-[var(--border-color)] bg-[var(--bg-tertiary)] px-3 py-1 text-sm text-[var(--text-primary)]"
            >
              {skill}
              <button
                onClick={() => removeSkill(skill)}
                className="ml-1 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                ×
              </button>
            </span>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addSkill()}
            className="input flex-1"
            placeholder="输入技能标签，按回车添加"
          />
          <button
            onClick={addSkill}
            className="rounded-lg bg-[var(--accent-blue)] px-4 py-2 text-sm font-medium text-white transition-all hover:bg-[var(--accent-blue)]/90"
          >
            添加
          </button>
        </div>
      </section>

      {/* USER.md 编辑 */}
      <section className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-6 md:p-8">
        <h2 className="mb-4 text-lg font-semibold text-[var(--text-primary)]">
          USER.md (个人说明)
        </h2>
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
          <div className="w-full">
            <label className="mb-2 block text-sm font-medium text-[var(--text-primary)]">
              Markdown 编辑器
            </label>
            <textarea
              value={settings.user_md}
              onChange={(e) => setSettings({ ...settings, user_md: e.target.value})}
              className="input w-full h-[600px] font-mono text-sm"
              placeholder="编写你的 USER.md..."
            />
          </div>
          <div className="w-full">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-[var(--text-primary)]">
              <Eye className="h-4 w-4" />
              <span>预览</span>
            </div>
            <div className="h-[600px] overflow-auto rounded-lg bg-[var(--bg-secondary)] p-4 w-full">
              <div 
                className="markdown-preview text-[var(--text-secondary)]"
                dangerouslySetInnerHTML={{ 
                  __html: renderMarkdown(settings.user_md)
                }}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
