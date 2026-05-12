import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, FolderOpen } from 'lucide-react';
import { categoriesApi } from '../../lib/api';

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  sort_order: number;
}

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    sort_order: 0,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await categoriesApi.getAll();
      setCategories(res.data.data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await categoriesApi.update(editing.id, formData);
      } else {
        await categoriesApi.create(formData);
      }
      setFormData({ name: '', slug: '', description: '', sort_order: 0 });
      setEditing(null);
      fetchCategories();
    } catch (error) {
      console.error('Failed to save category:', error);
      alert('保存失败');
    }
  };

  const handleEdit = (category: Category) => {
    setEditing(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      sort_order: category.sort_order,
    });
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这个分类吗？')) return;
    try {
      await categoriesApi.delete(id);
      fetchCategories();
    } catch (error: any) {
      alert(error.response?.data?.message || '删除失败');
    }
  };

  const cancelEdit = () => {
    setEditing(null);
    setFormData({ name: '', slug: '', description: '', sort_order: 0 });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">分类管理</h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          管理文章分类，帮助读者更好地浏览内容
        </p>
      </div>

      {/* Form */}
      <div className="card p-6">
        <h2 className="mb-4 text-lg font-semibold text-[var(--text-primary)]">
          {editing ? '编辑分类' : '新建分类'}
        </h2>
        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="mb-2 block text-sm text-[var(--text-secondary)]">名称</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="分类名称"
              required
            />
          </div>
          <div>
            <label className="mb-2 block text-sm text-[var(--text-secondary)]">标识</label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="category-slug"
              required
            />
          </div>
          <div>
            <label className="mb-2 block text-sm text-[var(--text-secondary)]">排序</label>
            <input
              type="number"
              value={formData.sort_order}
              onChange={(e) => setFormData({ ...formData, sort_order: Number(e.target.value) })}
              placeholder="0"
            />
          </div>
          <div className="flex items-end gap-2">
            <button
              type="submit"
              className="flex items-center gap-2 rounded-lg bg-[var(--accent-blue)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--accent-blue)]/90"
            >
              <Plus className="h-4 w-4" />
              <span>{editing ? '更新' : '创建'}</span>
            </button>
            {editing && (
              <button
                type="button"
                onClick={cancelEdit}
                className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-tertiary)] px-4 py-2 text-sm text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-hover)]"
              >
                取消
              </button>
            )}
          </div>
          <div className="sm:col-span-2 lg:col-span-4">
            <label className="mb-2 block text-sm text-[var(--text-secondary)]">描述</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="分类描述（可选）"
            />
          </div>
        </form>
      </div>

      {/* Categories List */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-[var(--text-secondary)]">Loading...</div>
        ) : categories.length === 0 ? (
          <div className="p-8 text-center">
            <FolderOpen className="mx-auto mb-4 h-12 w-12 text-[var(--text-muted)]" />
            <p className="text-[var(--text-secondary)]">暂无分类</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[var(--bg-tertiary)]">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[var(--text-secondary)]">
                    名称
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[var(--text-secondary)]">
                    标识
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[var(--text-secondary)]">
                    描述
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[var(--text-secondary)]">
                    排序
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-[var(--text-secondary)]">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {categories.map((category) => (
                  <tr key={category.id} className="hover:bg-[var(--bg-tertiary)]/50">
                    <td className="px-4 py-4 font-medium text-[var(--text-primary)]">
                      {category.name}
                    </td>
                    <td className="px-4 py-4 text-sm text-[var(--text-secondary)]">
                      {category.slug}
                    </td>
                    <td className="px-4 py-4 text-sm text-[var(--text-secondary)]">
                      {category.description || '-'}
                    </td>
                    <td className="px-4 py-4 text-sm text-[var(--text-secondary)]">
                      {category.sort_order}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(category)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-tertiary)] hover:text-[var(--accent-blue)]"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(category.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-tertiary)] hover:text-[var(--accent-red)]"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
