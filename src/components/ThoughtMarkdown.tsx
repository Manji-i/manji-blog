import { renderMarkdown } from '../utils/markdown';

interface ThoughtMarkdownProps {
  content: string;
  compact?: boolean;
  className?: string;
}

export function ThoughtMarkdown({ content, compact = false, className = '' }: ThoughtMarkdownProps) {
  if (!content) return null;

  const classes = [
    'markdown-preview',
    'thought-markdown',
    compact ? 'thought-markdown--compact' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={classes}
      dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
    />
  );
}
