import { create } from 'zustand';
import { settingsApi } from '../lib/api';

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
  author_bio: 'Hi, I\'m 博主名字！',
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

interface SettingsStore {
  settings: Settings;
  loading: boolean;
  fetched: boolean;
  fetchSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  settings: defaultSettings,
  loading: false,
  fetched: false,

  fetchSettings: async () => {
    // 如果已经获取过，不再重复请求
    if (get().fetched) return;
    
    set({ loading: true });
    try {
      const res = await settingsApi.getAll();
      if (res.data.success) {
        set({ 
          settings: { ...defaultSettings, ...res.data.data },
          fetched: true 
        });
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      set({ loading: false });
    }
  }
}));
