import { useEffect, useRef, useState } from 'react';
import { MessageSquareQuote, Send, Image, Trash2, Edit2, X, Calendar } from 'lucide-react';
import { thoughtsApi, uploadApi } from '../../lib/api';
import { formatZhDateTime } from '../../lib/date';

interface Thought {
  id: number;
  content: string;
  image_url: string | null;
  created_at: string;
}

export default function AdminThoughts() {
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchThoughts();
  }, []);

  const fetchThoughts = async () => {
    try {
      const res = await thoughtsApi.getAdminList({ limit: 100 });
      setThoughts(res.data.data);
    } catch (error) {
      console.error('Failed to fetch thoughts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const res = await uploadApi.uploadImage(file);
      setImageUrl(res.data.data.url);
    } catch (error) {
      console.error('Failed to upload image:', error);
      alert('图片上传失败');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const resetForm = () => {
    setContent('');
    setImageUrl(null);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      alert('随想内容不能为空');
      return;
    }

    setSubmitting(true);
    try {
      if (editingId) {
        await thoughtsApi.update(editingId, {
          content: content.trim(),
          image_url: imageUrl,
        });
      } else {
        await thoughtsApi.create({
          content: content.trim(),
          image_url: imageUrl || undefined,
        });
      }
      resetForm();
      await fetchThoughts();
    } catch (error) {
      console.error('Failed to save thought:', error);
      alert('保存失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (thought: Thought) => {
    setEditingId(thought.id);
    setContent(thought.content);
    setImageUrl(thought.image_url);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这条随想吗？')) return;
    try {
      await thoughtsApi.delete(id);
      setThoughts(thoughts.filter((t) => t.id !== id));
      if (editingId === id) resetForm();
    } catch (error) {
      console.error('Failed to delete thought:', error);
      alert('删除失败');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">随想管理</h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          共 {thoughts.length} 条
        </p>
      </div>

      {/* Editor */}
      <form onSubmit={handleSubmit} className="card p-4 sm:p-5">
        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-[var(--text-primary)]">
          <MessageSquareQuote className="h-4 w-4 text-[var(--accent-purple)]" />
          <span>{editingId ? '编辑随想' : '写点什么...'}</span>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="ml-auto flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              <X className="h-3 w-3" />
              <span>取消编辑</span>
            </button>
          )}
        </div>
        <textarea
          placeholder="一句话、一个想法、一段感悟..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          className="w-full resize-none text-sm leading-relaxed"
        />

        {imageUrl && (
          <div className="relative mt-3 inline-block">
            <img
              src={imageUrl}
              alt="预览"
              className="max-h-48 rounded-lg border border-[var(--border-color)]"
            />
            <button
              type="button"
              onClick={() => setImageUrl(null)}
              className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--accent-red)] text-white shadow-md hover:bg-[var(--accent-red)]/90"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}

        <div className="mt-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-tertiary)] px-3 py-2 text-sm text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] disabled:opacity-50"
          >
            <Image className="h-4 w-4" />
            <span>{uploading ? '上传中...' : imageUrl ? '更换图片' : '添加图片'}</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          <button
            type="submit"
            disabled={submitting || !content.trim()}
            className="flex items-center gap-2 rounded-lg bg-[var(--accent-blue)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--accent-blue)]/90 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            <span>{submitting ? '保存中...' : editingId ? '保存修改' : '发布'}</span>
          </button>
        </div>
      </form>

      {/* List */}
      <div className="space-y-3">
        {loading ? (
          <div className="card p-8 text-center text-[var(--text-secondary)]">Loading...</div>
        ) : thoughts.length === 0 ? (
          <div className="card p-8 text-center text-[var(--text-secondary)]">
            还没有随想，从上面开始写吧
          </div>
        ) : (
          thoughts.map((thought) => (
            <article key={thought.id} className="card p-4 sm:p-5">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--text-primary)]">
                {thought.content}
              </p>
              {thought.image_url && (
                <div className="mt-3 overflow-hidden rounded-lg border border-[var(--border-color)]">
                  <img
                    src={thought.image_url}
                    alt="随想配图"
                    className="max-h-72 object-cover"
                    loading="lazy"
                  />
                </div>
              )}
              <div className="mt-3 flex items-center justify-between text-xs text-[var(--text-muted)]">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatZhDateTime(thought.created_at)}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(thought)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-tertiary)] hover:text-[var(--accent-blue)]"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(thought.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-tertiary)] hover:text-[var(--accent-red)]"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
