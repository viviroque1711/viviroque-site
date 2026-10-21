# viviroque.com.br — como este repositório funciona

Site estático (Astro, `trailingSlash: 'always'`, `build.format: 'directory'`) publicado no GitHub Pages. Todo o texto principal está no HTML inicial (SSG): nada depende de JavaScript para ser lido por Google e robôs de IA.

- **Conteúdo:** `scripts/content/build.mjs` descreve cada página UMA vez; o mesmo texto vira HTML visível e JSON-LD (o FAQPage é sempre idêntico às perguntas visíveis). Rode `npm run content` e depois `npm run build`. Saída: `src/content-pages/<slug>/` (`head.html`, `body.html`, `ld.json`, `script.js`); `__` no nome da pasta = `/`; `_home` = `/`.
- **Pacotes prontos (HTML) da direção de marketing:** copie a pasta para `src/content-pages/<slug>/` com os mesmos arquivos, acrescente a frase em `src/data/llms.mjs` e a data em `src/data/lastmod.json` (ou use `scripts/import-package.mjs <pasta-do-pacote>`).
- **Moldura única:** `SiteHeader`, `SiteFooter` e `WhatsAppFloat` (`src/components`) entram em todas as páginas via `src/pages/[...slug].astro`. Estilo em `src/styles/site.css` (tokens no topo).
- **Dados:** `src/data/site.mjs` (domínio, WhatsApp, redes), `nav.mjs`, `lastmod.json`, `llms.mjs` (gera `/llms.txt`), `redirects.mjs` (rotas antigas).
- **Ambientes:** `SITE_ENV=staging` publica o endereço de teste (`https://viviroque1711.github.io/viviroque-site/`, noindex, caminhos com prefixo). `SITE_ENV=production` publica no domínio (robots e sitemap liberados; precisa de `public/CNAME`). O workflow `deploy.yml` define qual.
- **Robôs:** `src/pages/robots.txt.ts` libera Googlebot, Bingbot e os robôs de IA de `scripts/bots.mjs` (GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-SearchBot, Claude-User, PerplexityBot, Perplexity-User, Google-Extended, Applebot, Applebot-Extended, CCBot).
- **Testes:** `node scripts/verify-site.mjs <url-base> [prefixo]` (HTML recebido, título, 1 H1, canonical, JSON-LD, FAQ = JSON-LD, links, imagens, robots, sitemap, llms.txt, URLs antigas, 404 real); `node scripts/ld-count.mjs` (sem Organization/Person/FAQPage duplicado, roda no deploy).
- **Monitoramento depois de publicar:** `.github/workflows/monitor.yml` roda `scripts/monitor.mjs` todo dia (precisa da variável do repositório `MONITOR_ENABLED=true` depois da virada): páginas, robots de IA, sitemap, 404, http→https, www→raiz e validade do certificado. Falhou = o GitHub avisa por e-mail.
- **Imagens de compartilhamento e ícones:** `node scripts/og-build.mjs <caminho do puppeteer-core>` (só no computador).

## Regras
- Nenhum depoimento, número de resultado ou avaliação inventado; nada de `Review`/`AggregateRating` no JSON-LD.
- Não publique e-mail, endereço, CPF nem a liderança de "500+ profissionais" até a Viviane confirmar (marcados `<!-- REVISAR -->`).
- Não trocar nameservers, não mexer em MX/SPF/DKIM/DMARC/TXT ao apontar o domínio; virada de DNS só com autorização da Viviane.
- O `@id` da Viviane (`https://viviroque.com.br/#viviane-roque`) é o mesmo nos três sites (aurorapremium.com, roquebusinessevolution.com e este).
- Fontes self-host (`@fontsource`), sem Google Fonts em tempo de execução. Sem preto puro, sem fundo creme, sem degradê decorativo.
