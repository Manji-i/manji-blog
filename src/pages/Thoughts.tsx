import { useEffect, useState } from 'react';
import { MessageSquareQuote, Calendar } from 'lucide-react';
import { thoughtsApi } from '../lib/api';

interface Thought {
  id: number;
  content: string;
  image_url: string | null;
  created_at: string;
  author_name: string;
}

export default function Thoughts() {
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await thoughtsApi.getAll({ limit: 50 });
        setThoughts(res.data.data);
      } catch (error) {
        console.error('Failed to fetch thoughts:', error);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--accent-purple)]/10">
          <MessageSquareQuote className="h-5 w-5 text-[var(--accent-purple)]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">随想</h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            一些零散的想法和片段
          </p>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-[var(--text-secondary)]">Loading...</div>
        </div>
      ) : thoughts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--border-color)] bg-[var(--bg-secondary)] p-12 text-center">
          <MessageSquareQuote className="mx-auto mb-4 h-12 w-12 text-[var(--text-muted)]" />
          <p className="text-[var(--text-secondary)]">还没有随想</p>
        </div>
      ) : (
        <div className="space-y-4">
          {thoughts.map((thought) => (
            <article
              key={thought.id}
              className="card overflow-hidden p-5 sm:p-6"
            >
              <p className="whitespace-pre-wrap text-base leading-relaxed text-[var(--text-primary)]">
                {thought.content}
              </p>
              {thought.image_url && (
                <div className="mt-4 overflow-hidden rounded-lg border border-[var(--border-color)]">
                  <img
                    src={thought.image_url}
                    alt="随想配图"
                    className="max-h-[480px] w-full object-cover"
                    loading="lazy"
                  />
                </div>
              )}
              <div className="mt-4 flex items-center gap-2 text-xs text-[var(--text-muted)]">
                <Calendar className="h-3 w-3" />
                <span>{formatDate(thought.created_at)}</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
