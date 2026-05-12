import { marked } from 'marked';

// 配置 marked - 允许 HTML
marked.setOptions({
  breaks: true,
  gfm: true,
  async: false
});

/**
 * 彻底还原 HTML 实体
 */
function unescapeHtml(text: string): string {
  let result = text;
  // 多次还原，处理双重转义的情况
  for (let i = 0; i < 3; i++) {
    const newResult = result
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&#x27;/g, "'")
      .replace(/&#x2F;/g, '/');
    if (newResult === result) break;
    result = newResult;
  }
  return result;
}

/**
 * 将 Markdown 文本转换为 HTML
 * @param content Markdown 格式的文本
 * @returns HTML 字符串
 */
export function renderMarkdown(content: string): string {
  if (!content) return '';
  try {
    // 先彻底还原 HTML 实体
    const unescapedContent = unescapeHtml(content);
    const result = marked.parse(unescapedContent);
    // 确保返回字符串
    if (typeof result === 'string') {
      return unescapeHtml(result);
    }
    console.warn('Marked returned a Promise, expected string');
    return content;
  } catch (e) {
    console.error('Markdown parse error:', e);
    return content;
  }
}

/**
 * 截断内容用于预览
 * @param content 原始内容
 * @param maxLength 最大长度
 * @returns 截断后的内容
 */
export function truncateContent(content: string, maxLength: number = 500): string {
  if (!content || content.length <= maxLength) return content;
  return content.slice(0, maxLength) + '...';
}
