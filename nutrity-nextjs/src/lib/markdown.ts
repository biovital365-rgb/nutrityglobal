/**
 * Lightweight Markdown → HTML renderer.
 * Pure function, no dependencies. Safe for both Server and Client components.
 */
export function renderMarkdown(content: string): string {
    return content
        .replace(/^### (.+)$/gm, '<h3 class="text-xl font-bold text-nutrity-primary mt-8 mb-3 font-display">$1</h3>')
        .replace(/^## (.+)$/gm, '<h2 class="text-2xl font-display font-bold text-nutrity-primary mt-10 mb-4">$1</h2>')
        .replace(/^# (.+)$/gm, '<h1 class="text-3xl font-display font-bold text-nutrity-primary mt-12 mb-4">$1</h1>')
        .replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold text-nutrity-primary">$1</strong>')
        .replace(/\*(.+?)\*/g, '<em class="italic text-nutrity-gray-text">$1</em>')
        .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-nutrity-accent pl-5 my-6 italic text-nutrity-gray-text bg-nutrity-bg py-3 rounded-r-xl">$1</blockquote>')
        .replace(/^- (.+)$/gm, '<li class="flex items-start gap-2.5 mb-2"><span class="mt-2 w-1.5 h-1.5 rounded-full bg-nutrity-accent flex-shrink-0 block"></span><span>$1</span></li>')
        .replace(/^\d+\. (.+)$/gm, '<li class="ml-5 mb-2 list-decimal text-nutrity-primary/80">$1</li>')
        .replace(/(<li[\s\S]*?<\/li>\n?)+/g, (m) => `<ul class="my-5 space-y-1 text-nutrity-primary/85">${m}</ul>`)
        .replace(/`(.+?)`/g, '<code class="bg-nutrity-bg px-2 py-0.5 rounded-lg text-nutrity-primary font-mono text-[13px] border border-nutrity-border">$1</code>')
        .replace(/^---$/gm, '<hr class="border-nutrity-border my-10" />')
        .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-nutrity-accent font-semibold underline underline-offset-2 hover:text-nutrity-primary transition-colors" target="_blank" rel="noopener noreferrer">$1</a>')
        .split('\n\n')
        .map(block => {
            if (block.trim().startsWith('<')) return block;
            if (block.trim() === '') return '';
            return `<p class="leading-relaxed text-nutrity-primary/80 mb-5">${block.trim()}</p>`;
        })
        .join('\n');
}
