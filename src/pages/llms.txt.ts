import { contentPages } from '../lib/pages.mjs';
import { GROUPS, LLMS_INTRO } from '../data/llms.mjs';
import { SITE } from '../data/site.mjs';

export function GET() {
  const pages = contentPages().filter((p) => p.entrega);
  const out = [`# ${LLMS_INTRO.title}`, '', `> ${LLMS_INTRO.summary}`, '', LLMS_INTRO.about, ''];
  GROUPS.forEach((g, i) => {
    const list = pages.filter((p) => p.group === i);
    if (!list.length) return;
    out.push(`## ${g}`);
    for (const p of list) out.push(`- [${p.title}](${SITE.url}${p.path}): ${p.entrega}`);
    out.push('');
  });
  return new Response(out.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
