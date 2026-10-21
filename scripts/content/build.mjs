// Conteúdo do viviroque.com.br. Texto em primeira pessoa (o site é de uma pessoa); FAQ em terceira pessoa para quem cita.
// Marcadores <!-- REVISAR --> ficam no HTML: itens que a Viviane precisa confirmar antes de ir para a virada do DNS.
import { SITE } from '../../src/data/site.mjs';
import { esc, faq, crumbLd, crumbHtml, wa, writePage, finish, pageUrl } from './lib.mjs';

const PERSON_ID = SITE.url + '/#viviane-roque';
const RBE_ID = 'https://roquebusinessevolution.com/#org';
const SITE_ID = SITE.url + '/#website';
const OG = (n) => `/og/${n}.jpg`;
const WA_DEFAULT = SITE.wa.text;

const person = () => ({
  '@type': 'Person',
  '@id': PERSON_ID,
  name: 'Viviane Roque',
  url: SITE.url + '/',
  image: SITE.url + '/img/viviane-roque-retrato.png',
  jobTitle: 'Fundadora',
  description: 'Especialista em transformação digital, gestão de operações e inteligência artificial. Fundadora da Roque Business Evolution e do Aurora Premium.',
  sameAs: [SITE.linkedin, SITE.instagram],
  worksFor: { '@id': RBE_ID },
  hasCredential: ['PMP', 'SAFe Agilist', 'PSM', 'Six Sigma Master Black Belt'].map((n) => ({ '@type': 'EducationalOccupationalCredential', name: n, credentialCategory: 'certification' })),
  alumniOf: [
    { '@type': 'EducationalOrganization', name: 'Columbia University' },
    { '@type': 'EducationalOrganization', name: 'Massachusetts Institute of Technology (MIT)' },
    { '@type': 'EducationalOrganization', name: 'FIA Business School' },
  ],
});
const website = () => ({ '@type': 'WebSite', '@id': SITE_ID, url: SITE.url + '/', name: 'Viviane Roque', inLanguage: 'pt-BR', publisher: { '@id': PERSON_ID } });
const profile = (p, name, modified = '2026-10-21') => ({ '@type': 'ProfilePage', '@id': pageUrl(p) + '#profile', url: pageUrl(p), name, inLanguage: 'pt-BR', isPartOf: { '@id': SITE_ID }, mainEntity: { '@id': PERSON_ID }, dateModified: modified });
const webpage = (p, name, extra = {}) => ({ '@type': 'WebPage', '@id': pageUrl(p) + '#page', url: pageUrl(p), name, inLanguage: 'pt-BR', isPartOf: { '@id': SITE_ID }, about: { '@id': PERSON_ID }, ...extra });

const cta = (text = 'Falar no WhatsApp', msg = WA_DEFAULT) => `<a class="btn" href="${wa(msg)}" rel="noopener">${text}</a>`;

const BUILD = `<div class="build">
<div class="big"><h3>Roque Business Evolution</h3><p>Agência de IA, criação de sites, desenvolvimento de software e transformação digital para empresas que querem evoluir. Fundei a Roque para levar a tecnologia que sustenta grandes operações a quem empreende.</p><p><a class="more" href="https://roquebusinessevolution.com/">Conhecer a Roque Business Evolution</a></p></div>
<div class="mid"><h3>Aurora Premium</h3><p>Sistema de agendamento e gestão para salões, barbearias, clínicas, spas e pet shops.</p><p><a class="more" href="https://aurorapremium.com/">Conhecer o Aurora Premium</a></p></div>
<div class="sm"><h3>EngageBot</h3><p>Atendimento com IA no WhatsApp e no site.</p><p><a class="more" href="https://roquebusinessevolution.com/engagebot/">Conhecer o EngageBot</a></p></div>
</div>`;

// ------------------------------------------------------------------ linha do tempo (1998 a 2025)
const MARCOS = [
  { when: '1998', who: 'BCP, depois Claro', text: 'Comecei em tecnologia em 1998, na BCP, que depois se tornou a Claro. Naquele tempo só existia telefonia analógica, e meu trabalho era estruturar operações digitais. Acompanhei a evolução das redes até o 4G.' },
  { when: 'Ernst & Young', who: 'Bancos e bandeiras de cartão', text: 'Na Ernst & Young, trabalhei na estrutura financeira de bancos e bandeiras de cartão. É um tipo de operação em que cada processo precisa funcionar todos os dias.' },
  { when: 'NEC', who: 'Telecom e as arenas da Copa de 2014', text: 'Na NEC, colaborei na expansão de clientes, em telecomunicações e novas tecnologias. Atuei no PMO da Arena Fonte Nova, para a Copa de 2014, e como advisor na Arena Pernambuco.' },
  { when: 'Depois', who: 'Manufatura, Google, Apple e municípios', text: 'Segui por manufatura, pelos lançamentos de Google e Apple e pelo desenvolvimento de sistemas para municípios.' },
  { when: 'Roque', who: 'Roque Business Evolution', text: 'Fundei a Roque Business Evolution, agência de IA, sites e software. O objetivo é levar tecnologia, inteligência e transformação digital ao pequeno e médio empreendedor, gerando emprego e prosperidade.' },
  { when: '2025', who: 'Aurora Premium', text: 'Em 2025, lancei o Aurora Premium, sistema de agendamento e gestão para salões, barbearias, clínicas, spas e pet shops. É a tecnologia de grande empresa organizada para o dia a dia de quem atende cliente com hora marcada.' },
];
const timeline = `<ol class="tl pre" data-tl>
${MARCOS.map((m, i) => `<li${i === 0 ? ' class="open"' : ''}><button type="button" class="tl-btn" aria-expanded="${i === 0}" aria-controls="tl-p${i + 1}"><span class="tl-dot" aria-hidden="true"></span><span class="tl-when">${esc(m.when)}</span><span class="tl-who">${esc(m.who)}</span></button><div class="tl-panel" id="tl-p${i + 1}"><p>${esc(m.text)}</p></div></li>`).join('\n')}
</ol>`;
const TL_JS = `
(function () {
  var tl = document.querySelector('[data-tl]'); if (!tl) return;
  var items = [].slice.call(tl.querySelectorAll('li')), btns = items.map(function (li) { return li.querySelector('.tl-btn'); });
  var wide = function () { return window.matchMedia('(min-width: 960px)').matches; };
  function open(i, toggle) {
    items.forEach(function (li, j) {
      var on = j === i && !(toggle && li.classList.contains('open') && !wide());
      li.classList.toggle('open', on); btns[j].setAttribute('aria-expanded', on ? 'true' : 'false');
    });
  }
  btns.forEach(function (b, i) {
    b.addEventListener('click', function () { open(i, true); });
    b.addEventListener('keydown', function (e) {
      var k = e.key, n = btns.length, t = -1;
      if (k === 'ArrowRight' || k === 'ArrowDown') t = (i + 1) % n; else if (k === 'ArrowLeft' || k === 'ArrowUp') t = (i - 1 + n) % n; else if (k === 'Home') t = 0; else if (k === 'End') t = n - 1;
      if (t > -1) { e.preventDefault(); btns[t].focus(); }
    });
  });
  // o fio dourado se desenha uma vez, quando a linha do tempo entra na tela (sem JS ou com movimento reduzido: já desenhado)
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) { tl.classList.remove('pre'); return; }
  var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { tl.classList.add('drawn'); setTimeout(function () { tl.classList.remove('pre'); }, 1800); io.disconnect(); } }); }, { threshold: 0.25 });
  io.observe(tl);
})();`;

// ------------------------------------------------------------------ HOME
const home = {
  path: '/',
  title: 'Viviane Roque: Transformação Digital, IA e Gestão',
  description: 'Viviane Roque, especialista em transformação digital, fundadora do Aurora Premium e da Roque Business Evolution. Desde 1998 em tecnologia e operações.',
  image: OG('home'),
  js: TL_JS,
  body: `
<section class="hero" aria-labelledby="h1">
  <div class="hero-in">
    <div class="hero-text">
      <h1 id="h1">Viviane Roque: tecnologia de grande empresa a serviço de quem empreende</h1>
      <p class="lead">Sou Viviane Roque, especialista em transformação digital e fundadora do Aurora Premium. Trabalho com tecnologia e operações desde 1998 e hoje levo esse repertório ao pequeno e médio empreendedor.</p>
      <div class="btns">${cta()} <a class="btn ghost" href="/quem-sou/">Conhecer minha trajetória</a></div>
    </div>
    <div class="hero-photo"><img src="/img/viviane-roque-retrato.png" width="510" height="564" alt="Retrato de Viviane Roque" fetchpriority="high" decoding="async"></div>
  </div>
</section>

<section class="sec dark tl-sec" id="trajetoria" aria-labelledby="tl-h">
  <div class="wrap">
    <h2 id="tl-h">De 1998 a 2025: da telefonia analógica à inteligência artificial</h2>
    <p class="tl-intro">Minha trajetória em seis marcos. Escolha um para ler mais.</p>
    <!-- REVISAR: aguardando a Viviane confirmar os anos dos marcos intermediários (Ernst & Young, NEC, manufatura e Roque). Só 1998 e 2025 são certos. -->
    ${timeline}
  </div>
</section>

<section class="sec paper" id="o-que-construo" aria-labelledby="build-h">
  <div class="wrap">
    <h2 id="build-h">O que eu construo hoje</h2>
    <p class="read">Três frentes que nasceram da mesma ideia: tecnologia que funciona no dia a dia de quem empreende.</p>
    ${BUILD}
  </div>
</section>

<section class="sec studio" id="no-que-acredito" aria-labelledby="bel-h">
  <div class="wrap">
    <h2 id="bel-h">No que eu acredito</h2>
    <!-- REVISAR: frases vindas do site antigo e do posicionamento atual; a Viviane confirma ou troca. -->
    <ul class="beliefs">
      <li>Tecnologia de grande empresa também é para quem empreende.</li>
      <li>Estratégia sem execução é ilusão. Execução sem estratégia é exaustão.</li>
      <li>Transformação digital se faz com pessoas antes de se fazer com sistemas.</li>
      <li>Liderança verdadeira é servir ao crescimento das pessoas e da organização.</li>
    </ul>
  </div>
</section>

<section class="sec dark" id="conversar" aria-labelledby="cta-h">
  <div class="wrap">
    <h2 id="cta-h">Vamos conversar</h2>
    <p class="read">Se você empreende, lidera uma equipe ou quer levar tecnologia para a sua empresa, me chame no WhatsApp. É a forma mais rápida de falar comigo.</p>
    <div class="btns">${cta()}</div>
  </div>
</section>`,
  get graph() { return [website(), profile('/', 'Viviane Roque'), person()]; },
};

// ------------------------------------------------------------------ QUEM SOU
const quemFaq = faq([
  { q: 'Quem é Viviane Roque?', a: '<p>Viviane Roque é especialista em transformação digital, gestão de operações e inteligência artificial, fundadora da Roque Business Evolution e do Aurora Premium. Trabalha com tecnologia desde 1998.</p>' },
  { q: 'Qual é a trajetória de Viviane Roque?', a: '<p>Começou em 1998 na BCP, depois Claro, estruturando operações digitais. Passou pela Ernst & Young e pela NEC, atuou no PMO da Arena Fonte Nova na Copa de 2014 e hoje conduz a Roque Business Evolution e o Aurora Premium.</p>' },
  { q: 'O que é a Roque Business Evolution?', a: '<p>É a agência de IA, criação de sites, desenvolvimento de software e transformação digital fundada por Viviane Roque. O site é <a href="https://roquebusinessevolution.com/">roquebusinessevolution.com</a>.</p>' },
  { q: 'O que é o Aurora Premium?', a: '<p>É um sistema de agendamento e gestão para salões, barbearias, clínicas, spas e pet shops, lançado por Viviane Roque em 2025. O site é <a href="https://aurorapremium.com/">aurorapremium.com</a>.</p>' },
  { q: 'Viviane Roque faz mentoria?', a: '<p>Sim, para líderes e empresários. A página de <a href="/trabalhe-comigo/">mentoria</a> explica como funciona, e o primeiro passo é uma conversa de alinhamento.</p>' },
  { q: 'Como falar com Viviane Roque?', a: `<p>Pelo WhatsApp <a href="${wa(WA_DEFAULT)}" rel="noopener">+55 11 97396-7161</a>. Também está no <a href="${SITE.linkedin}" rel="noopener me">LinkedIn</a> e no <a href="${SITE.instagram}" rel="noopener me">Instagram</a>.</p>` },
], { pagePath: '/quem-sou/' });
const quemCrumb = [{ name: 'Início', path: '/' }, { name: 'Quem sou', path: '/quem-sou/' }];
const quem = {
  path: '/quem-sou/',
  title: 'Quem é Viviane Roque, fundadora do Aurora Premium',
  description: 'Conheça Viviane Roque: trajetória desde 1998 em tecnologia e operações, fundadora da Roque Business Evolution e do Aurora Premium e formação.',
  image: OG('quem-sou'),
  body: `
<section class="page-hero" aria-labelledby="h1">
  <div class="wrap">
    ${crumbHtml(quemCrumb)}
    <h1 id="h1">Quem é Viviane Roque</h1>
    <p class="lead">Viviane Roque é especialista em transformação digital, gestão de operações e inteligência artificial, fundadora da Roque Business Evolution e do Aurora Premium. Atua em tecnologia desde 1998.</p>
  </div>
</section>

<section class="sec paper" id="trajetoria" aria-labelledby="traj-h">
  <div class="wrap">
    <div class="prose">
      <h2 id="traj-h">A trajetória de Viviane Roque</h2>
      <!-- REVISAR: texto definitivo da história virá em pacote da direção de marketing; este é o texto-base com os fatos confirmados. -->
      <p>Comecei em tecnologia em 1998, na BCP, que depois se tornou a Claro. Naquele tempo só existia telefonia analógica, e meu trabalho era estruturar operações digitais. Acompanhei a evolução das redes até o 4G.</p>
      <p>Passei pela Ernst & Young, onde trabalhei na estrutura financeira de bancos e bandeiras de cartão. Depois, na NEC, colaborei na expansão de clientes, em telecomunicações e novas tecnologias. Atuei no PMO da Arena Fonte Nova, para a Copa de 2014, e como advisor na Arena Pernambuco.</p>
      <p>Também trabalhei em manufatura, nos lançamentos de Google e Apple e no desenvolvimento de sistemas para municípios.</p>
      <p>Fundei a <a href="https://roquebusinessevolution.com/">Roque Business Evolution</a>, agência de IA, sites e software, e em 2025 lancei o <a href="https://aurorapremium.com/">Aurora Premium</a>, sistema de agendamento e gestão para negócios de serviço.</p>
      <h2>Por que levo tecnologia ao pequeno e médio empreendedor</h2>
      <p>Grandes empresas sempre tiveram acesso à tecnologia, à inteligência e à transformação digital. Quem empreende em um salão, em uma clínica ou em uma loja merece o mesmo nível de ferramenta, no tamanho do seu dia a dia. Meu trabalho é fazer essa ponte, gerando emprego e prosperidade.</p>
      <p>Por isso escrevo e construo de um jeito simples: a tecnologia está a serviço de quem empreende, e não o contrário.</p>
    </div>
  </div>
</section>

<section class="sec studio" id="o-que-construo" aria-labelledby="build-h">
  <div class="wrap">
    <h2 id="build-h">O que construo hoje</h2>
    ${BUILD}
  </div>
</section>

<section class="sec paper" id="formacao" aria-labelledby="form-h">
  <div class="wrap">
    <h2 id="form-h">Certificações e formação</h2>
    <!-- REVISAR: confirmar nomes exatos das certificações e dos programas. -->
    <div class="two">
      <div>
        <h3>Certificações</h3>
        <ul class="cred"><li>PMP</li><li>SAFe Agilist</li><li>PSM</li><li>Six Sigma Master Black Belt</li></ul>
      </div>
      <div>
        <h3>Formação</h3>
        <ul class="cred"><li>MBA em Business Intelligence, Columbia</li><li>Executive MBA em Data Science &amp; AI, MIT</li><li>Executive MBA, FIA</li></ul>
      </div>
    </div>
  </div>
</section>

${quemFaq.html}

<section class="sec dark" id="conversar" aria-labelledby="cta-h">
  <div class="wrap">
    <h2 id="cta-h">Vamos conversar</h2>
    <p class="read">Para falar comigo, o caminho mais rápido é o WhatsApp.</p>
    <div class="btns">${cta()}</div>
  </div>
</section>`,
  get graph() { return [profile('/quem-sou/', 'Quem é Viviane Roque'), person(), crumbLd(quemCrumb), quemFaq.ld]; },
};

// ------------------------------------------------------------------ MINHA ATUAÇÃO
const atuaCrumb = [{ name: 'Início', path: '/' }, { name: 'Atuação', path: '/minha-atuacao/' }];
const atua = {
  path: '/minha-atuacao/',
  title: 'Atuação de Viviane Roque: Empresas e Lideranças',
  description: 'Como Viviane Roque atua: consultoria de transformação digital e gestão de operações para empresas e mentoria individual para líderes e empresários.',
  image: OG('minha-atuacao'),
  body: `
<section class="page-hero" aria-labelledby="h1">
  <div class="wrap">
    ${crumbHtml(atuaCrumb)}
    <h1 id="h1">Como Viviane Roque atua com empresas e lideranças</h1>
    <p class="lead">Viviane Roque atua como consultora de transformação digital e gestão de operações. Com empresas, o trabalho acontece por meio da Roque Business Evolution; com líderes e empresários, em mentoria individual.</p>
  </div>
</section>

<section class="sec paper" id="empresas" aria-labelledby="emp-h">
  <div class="wrap">
    <div class="prose">
      <h2 id="emp-h">Com empresas, pela Roque Business Evolution</h2>
      <p>A <a href="https://roquebusinessevolution.com/">Roque Business Evolution</a> é a agência de IA, criação de sites, desenvolvimento de software e transformação digital que fundei. Atuo em frentes como estas:</p>
      <!-- REVISAR: lista mantida do site antigo; a Viviane confirma o posicionamento. -->
      <ul>
        <li>Transformação digital de ponta a ponta: processos, sistemas e modelos de negócio.</li>
        <li>Governança, PMO e gestão de portfólio de projetos.</li>
        <li>Operações inteligentes e automação com IA.</li>
        <li>Marketing estratégico orientado a dados.</li>
        <li>Times especializados para projetos estratégicos e operacionais.</li>
      </ul>
      <p><a href="/para-empresas/">Veja a página para empresas</a>.</p>
    </div>
  </div>
</section>

<section class="sec studio" id="como-trabalho" aria-labelledby="como-h">
  <div class="wrap">
    <h2 id="como-h">Como o trabalho acontece</h2>
    <ol class="steps">
      <li><b>Diagnóstico</b>Entendo a empresa, os processos, os sistemas e os principais gargalos.</li>
      <li><b>Planejamento</b>Defino objetivos, indicadores e um roteiro de implementação.</li>
      <li><b>Execução</b>Implementação prática, com acompanhamento direto.</li>
      <li><b>Capacitação</b>Preparo as equipes para manter as mudanças no dia a dia.</li>
    </ol>
  </div>
</section>

<section class="sec paper" id="liderancas" aria-labelledby="lid-h">
  <div class="wrap">
    <div class="prose">
      <h2 id="lid-h">Com líderes e empresários, em mentoria</h2>
      <p>Para quem lidera uma equipe ou um negócio e quer direção estratégica e execução consistente, ofereço mentoria individual. O trabalho combina diagnóstico, plano de ação e acompanhamento.</p>
      <p><a href="/trabalhe-comigo/">Conheça a mentoria</a>.</p>
    </div>
  </div>
</section>

<section class="sec dark" id="conversar" aria-labelledby="cta-h">
  <div class="wrap">
    <h2 id="cta-h">Vamos conversar sobre o seu caso</h2>
    <p class="read">Conte em poucas linhas o que você precisa. Respondo pelo WhatsApp.</p>
    <div class="btns">${cta('Falar no WhatsApp', 'Olá, Viviane! Quero conversar sobre a atuação com empresas ou lideranças.')}</div>
  </div>
</section>`,
  get graph() { return [webpage('/minha-atuacao/', 'Atuação de Viviane Roque'), crumbLd(atuaCrumb)]; },
};

// ------------------------------------------------------------------ MENTORIA
const mentCrumb = [{ name: 'Início', path: '/' }, { name: 'Mentoria', path: '/trabalhe-comigo/' }];
const ment = {
  path: '/trabalhe-comigo/',
  title: 'Mentoria com Viviane Roque para Líderes e Empresários',
  description: 'Mentoria individual com Viviane Roque para líderes e empresários que querem direção estratégica e execução consistente. Veja como funciona.',
  image: OG('trabalhe-comigo'),
  body: `
<!-- REVISAR: aguardando pacote da direção de marketing. Texto mantido do site antigo, com algumas expressões do posicionamento antigo retiradas, até a Viviane decidir o posicionamento da mentoria. -->
<section class="page-hero" aria-labelledby="h1">
  <div class="wrap">
    ${crumbHtml(mentCrumb)}
    <h1 id="h1">Mentoria com Viviane Roque</h1>
    <p class="lead">A mentoria com Viviane Roque é um acompanhamento individual para líderes e empresários que querem direção estratégica e execução consistente. O primeiro passo é uma conversa de alinhamento.</p>
  </div>
</section>

<section class="sec paper" id="para-quem" aria-labelledby="pq-h">
  <div class="wrap">
    <div class="prose">
      <h2 id="pq-h">Para quem é a mentoria</h2>
      <p>Para quem já entendeu que o crescimento do negócio passa pela forma de decidir e de liderar, e está pronto para fazer o trabalho com constância.</p>
      <ul>
        <li>Líderes e executivos que querem clareza e direção estratégica.</li>
        <li>Profissionais em transição de carreira que buscam realinhar propósito.</li>
        <li>Empreendedores que sentem que o jeito de decidir limita o crescimento do negócio.</li>
        <li>Quem quer integrar prosperidade financeira e bem-estar.</li>
        <li>Quem busca uma liderança estável e consciente.</li>
      </ul>
    </div>
  </div>
</section>

<section class="sec studio" id="como-funciona" aria-labelledby="cf-h">
  <div class="wrap">
    <h2 id="cf-h">Como funciona</h2>
    <ol class="steps">
      <li><b>Diagnóstico</b>Uma conversa profunda para identificar os padrões e os bloqueios que travam seu avanço.</li>
      <li><b>Plano estratégico</b>Objetivos claros, metas tangíveis e um plano de ação estruturado.</li>
      <li><b>Execução acompanhada</b>Sessões regulares, combinados entre as sessões e ajustes de rota.</li>
      <li><b>Revisão</b>Medimos o que mudou e definimos os próximos passos.</li>
    </ol>
  </div>
</section>

<section class="sec paper" id="o-que-muda" aria-labelledby="muda-h">
  <div class="wrap">
    <h2 id="muda-h">O que muda ao longo do processo</h2>
    <ul class="facts read">
      <li><b>Clareza.</b> Menos ruído e mais confiança para decidir.</li>
      <li><b>Direção.</b> Você sabe aonde quer chegar e como.</li>
      <li><b>Crescimento sustentável.</b> Evolução consistente, sem esgotamento.</li>
      <li><b>Liderança autêntica.</b> Presença, propósito e impacto.</li>
    </ul>
  </div>
</section>

<section class="sec studio" id="criterio" aria-labelledby="crit-h">
  <div class="wrap">
    <div class="prose">
      <h2 id="crit-h">Critério de entrada</h2>
      <p>Este não é um processo para todos. Trabalho com quem está pronto para a transformação. Se você se identifica com os pontos abaixo, podemos ter um bom encaixe:</p>
      <ul>
        <li>Compromisso real com a própria transformação.</li>
        <li>Disponibilidade para as sessões e para o trabalho entre elas.</li>
        <li>Disposição para questionar hábitos e sair da zona de conforto.</li>
        <li>Busca por evolução real, e não por soluções rápidas.</li>
        <li>Um momento de vida que permita dedicação ao processo.</li>
      </ul>
    </div>
  </div>
</section>

<section class="sec dark" id="proximo-passo" aria-labelledby="pp-h">
  <div class="wrap">
    <h2 id="pp-h">Próximo passo: uma conversa de alinhamento</h2>
    <p class="read">Essa conversa serve para entender se há encaixe entre o que você busca e o que eu ofereço.</p>
    <div class="btns">${cta('Solicitar conversa de alinhamento', 'Olá, Viviane! Quero solicitar uma conversa de alinhamento sobre a mentoria.')}</div>
  </div>
</section>`,
  get graph() { return [webpage('/trabalhe-comigo/', 'Mentoria com Viviane Roque', { '@type': ['WebPage'] }), crumbLd(mentCrumb)]; },
};

// ------------------------------------------------------------------ PARA EMPRESAS
const empCrumb = [{ name: 'Início', path: '/' }, { name: 'Para empresas', path: '/para-empresas/' }];
const emp = {
  path: '/para-empresas/',
  title: 'Viviane Roque para Empresas: Roque Business Evolution',
  description: 'Para empresas, Viviane Roque atua pela Roque Business Evolution: agência de IA, criação de sites, software e transformação digital.',
  image: OG('para-empresas'),
  body: `
<section class="page-hero" aria-labelledby="h1">
  <div class="wrap">
    ${crumbHtml(empCrumb)}
    <h1 id="h1">Para empresas: Roque Business Evolution</h1>
    <p class="lead">Para empresas, Viviane Roque atua por meio da Roque Business Evolution, agência de IA, transformação digital e software que ela fundou.</p>
    <div class="btns"><a class="btn" href="https://roquebusinessevolution.com/">Conhecer a Roque Business Evolution</a></div>
  </div>
</section>

<section class="sec paper" id="o-que-faz" aria-labelledby="faz-h">
  <div class="wrap">
    <h2 id="faz-h">O que a Roque Business Evolution faz</h2>
    <p class="read">A Roque Business Evolution reúne estratégia, tecnologia e inteligência artificial para empresas que querem evoluir. As principais frentes:</p>
    <ul class="facts read">
      <li><b><a href="https://roquebusinessevolution.com/agencia-de-ia/">Agência de IA</a>.</b> Agentes de inteligência artificial e automação de processos.</li>
      <li><b><a href="https://roquebusinessevolution.com/criacao-de-sites/">Criação de sites</a>.</b> Sites profissionais que aparecem no Google e trazem clientes.</li>
      <li><b><a href="https://roquebusinessevolution.com/seo/">SEO e busca com IA</a>.</b> Visibilidade no Google e nas buscas com inteligência artificial.</li>
      <li><b><a href="https://roquebusinessevolution.com/desenvolvimento-de-software/">Desenvolvimento de software</a>.</b> Sistemas sob medida, do MVP à produção.</li>
      <li><b><a href="https://roquebusinessevolution.com/transformacao-digital/">Transformação digital</a>.</b> Consultoria para modernizar processos e adotar IA com segurança.</li>
    </ul>
  </div>
</section>

<section class="sec studio" id="o-que-construo" aria-labelledby="build-h">
  <div class="wrap">
    <h2 id="build-h">O que eu construo hoje</h2>
    ${BUILD}
  </div>
</section>

<section class="sec dark" id="conversar" aria-labelledby="cta-h">
  <div class="wrap">
    <h2 id="cta-h">Vamos conversar sobre a sua empresa</h2>
    <p class="read">Se a sua empresa precisa de direção, governança ou transformação digital, me chame no WhatsApp.</p>
    <div class="btns">${cta('Falar no WhatsApp', 'Olá, Viviane! Quero conversar sobre a minha empresa.')}</div>
  </div>
</section>`,
  get graph() { return [webpage('/para-empresas/', 'Viviane Roque para empresas'), crumbLd(empCrumb)]; },
};

// ------------------------------------------------------------------ CONTEÚDOS
const contCrumb = [{ name: 'Início', path: '/' }, { name: 'Conteúdos', path: '/conteudos/' }];
const ARTIGOS = [
  ['O que CEOs subestimam ao assumir uma operação local no Brasil', 'As armadilhas culturais e operacionais que derrubam líderes globais ao assumir operações locais.'],
  ['Por que crescimento sem governança destrói margens', 'Crescer rápido é o sonho de qualquer negócio. Sem governança, vira ineficiência e perda de margem.'],
  ['Os 3 erros silenciosos que travam operações B2B no Brasil', 'Os maiores obstáculos ao crescimento raramente aparecem em dashboards. Eles se escondem em processos e detalhes.'],
  ['O líder que você precisa se tornar', 'Liderança não é controlar pessoas. É criar um ambiente em que elas possam crescer.'],
  ['Estratégia sem execução é ilusão', 'Por que a maioria das estratégias falha na implementação e como evitar esse erro.'],
  ['Transformação digital começa com as pessoas', 'A tecnologia é a ferramenta. A mudança de verdade acontece nas pessoas.'],
  ['Governança que funciona na prática', 'Frameworks de governança aplicados em empresas reais.'],
];
const cont = {
  path: '/conteudos/',
  title: 'Artigos de Viviane Roque sobre Gestão e Tecnologia',
  description: 'Temas dos artigos de Viviane Roque sobre liderança, estratégia, governança e transformação digital, escritos para empresas e empreendedores.',
  image: OG('conteudos'),
  body: `
<!-- REVISAR: aguardando pacote com os artigos. Os títulos abaixo vieram do site antigo, onde os artigos nunca tiveram página própria. Quando o texto de cada artigo chegar, cada item vira uma URL individual. -->
<section class="page-hero" aria-labelledby="h1">
  <div class="wrap">
    ${crumbHtml(contCrumb)}
    <h1 id="h1">Conteúdos de Viviane Roque</h1>
    <p class="lead">Reflexões sobre liderança, estratégia, governança e transformação digital para empresas e empreendedores. Os artigos completos estão em preparação; abaixo estão os temas.</p>
  </div>
</section>

<section class="sec paper" id="temas" aria-labelledby="temas-h">
  <div class="wrap">
    <h2 id="temas-h">Temas dos próximos artigos</h2>
    <ul class="list-art">
${ARTIGOS.map(([t, d]) => `      <li><h3>${esc(t)}</h3><p>${esc(d)}</p></li>`).join('\n')}
    </ul>
  </div>
</section>

<section class="sec dark" id="conversar" aria-labelledby="cta-h">
  <div class="wrap">
    <h2 id="cta-h">Quer ser avisado quando os artigos saírem?</h2>
    <p class="read">Me chame no WhatsApp e eu aviso quando cada artigo for publicado.</p>
    <div class="btns">${cta('Falar no WhatsApp', 'Olá, Viviane! Quero ser avisado quando os artigos forem publicados.')}</div>
  </div>
</section>`,
  get graph() { return [webpage('/conteudos/', 'Conteúdos de Viviane Roque', { '@type': 'CollectionPage' }), crumbLd(contCrumb)]; },
};

// ------------------------------------------------------------------ CONTATO
const contatoCrumb = [{ name: 'Início', path: '/' }, { name: 'Contato', path: '/contato/' }];
const contato = {
  path: '/contato/',
  title: 'Contato | Viviane Roque',
  description: 'Fale com Viviane Roque pelo WhatsApp +55 11 97396-7161. Também no LinkedIn e no Instagram.',
  image: OG('contato'),
  body: `
<section class="page-hero" aria-labelledby="h1">
  <div class="wrap">
    ${crumbHtml(contatoCrumb)}
    <h1 id="h1">Fale com Viviane Roque</h1>
    <p class="lead">A forma mais rápida de falar com Viviane Roque é pelo WhatsApp, no número +55 11 97396-7161.</p>
    <div class="btns">${cta()}</div>
  </div>
</section>

<section class="sec paper" id="canais" aria-labelledby="canais-h">
  <div class="wrap">
    <h2 id="canais-h">Outros canais</h2>
    <!-- REVISAR: nenhum e-mail publicado até a Viviane confirmar qual usar. -->
    <ul class="facts read">
      <li><b>LinkedIn.</b> <a href="${SITE.linkedin}" rel="noopener me">linkedin.com/in/vivianepereirambas</a></li>
      <li><b>Instagram.</b> <a href="${SITE.instagram}" rel="noopener me">@viviroqueoficial</a></li>
      <li><b>Para empresas.</b> <a href="https://roquebusinessevolution.com/contato/">Roque Business Evolution</a></li>
      <li><b>Sistema de agendamento e gestão.</b> <a href="https://aurorapremium.com/">Aurora Premium</a></li>
    </ul>
  </div>
</section>`,
  get graph() { return [webpage('/contato/', 'Contato de Viviane Roque', { '@type': 'ContactPage' }), crumbLd(contatoCrumb)]; },
};

// ------------------------------------------------------------------ LEGAL
const privCrumb = [{ name: 'Início', path: '/' }, { name: 'Política de Privacidade', path: '/politica-de-privacidade/' }];
const priv = {
  path: '/politica-de-privacidade/',
  title: 'Política de Privacidade | Viviane Roque',
  description: 'Como o site viviroque.com.br trata dados pessoais, em conformidade com a LGPD: quais dados, para quê, por quanto tempo e como exercer seus direitos.',
  image: OG('home'),
  body: `
<section class="page-hero" aria-labelledby="h1">
  <div class="wrap">
    ${crumbHtml(privCrumb)}
    <h1 id="h1">Política de Privacidade</h1>
    <p class="lead">Esta política explica como o site viviroque.com.br trata dados pessoais, de acordo com a Lei Geral de Proteção de Dados (Lei 13.709/2018). Última atualização: 21 de outubro de 2026.</p>
  </div>
</section>
<section class="sec paper"><div class="wrap"><div class="prose">
<!-- REVISAR: texto jurídico escrito a partir do que o site faz hoje; recomenda-se revisão jurídica antes da virada. -->
<h2>1. Quem é a responsável</h2>
<p>A responsável pelo tratamento de dados neste site é Viviane Roque. Para qualquer assunto sobre dados pessoais, fale pelo WhatsApp +55 11 97396-7161.</p>
<h2>2. Quais dados o site trata</h2>
<p>O site é informativo e não tem formulários, cadastro nem área de login. Os dados tratados são:</p>
<ul>
<li><b>Dados técnicos de acesso</b> (endereço IP, navegador, data e hora), registrados pelo provedor de hospedagem do site, o GitHub Pages, para manter o site no ar e seguro.</li>
<li><b>Dados que você envia ao chamar pelo WhatsApp</b> (nome, número de telefone e conteúdo da mensagem). Esses dados são tratados pelo WhatsApp e por Viviane Roque para responder à sua conversa.</li>
</ul>
<p>O site não usa cookies de publicidade nem de rastreamento de comportamento.</p>
<h2>3. Para que usamos e em que base legal</h2>
<ul>
<li>Responder à sua mensagem e conversar sobre mentoria ou serviços: execução de procedimentos preliminares relacionados a um possível contrato, a pedido do titular (LGPD, art. 7º, V), e legítimo interesse (art. 7º, IX).</li>
<li>Manter a segurança e o funcionamento do site: legítimo interesse (art. 7º, IX).</li>
</ul>
<h2>4. Com quem os dados são compartilhados</h2>
<p>Os dados não são vendidos. Podem ser tratados por prestadores necessários ao serviço: o provedor de hospedagem (GitHub Pages) e o WhatsApp (Meta). Esses prestadores têm as próprias políticas de privacidade.</p>
<h2>5. Por quanto tempo</h2>
<p>As conversas de WhatsApp são mantidas pelo tempo necessário para o atendimento e para cumprir obrigações legais. Os registros técnicos seguem a política do provedor de hospedagem.</p>
<h2>6. Seus direitos</h2>
<p>Você pode pedir confirmação de que tratamos seus dados, acesso, correção, anonimização, portabilidade, eliminação e informação sobre compartilhamento, e pode revogar consentimentos (LGPD, art. 18). Para exercer qualquer direito, fale pelo WhatsApp +55 11 97396-7161.</p>
<h2>7. Segurança</h2>
<p>O site é servido por conexão segura (HTTPS). Adotamos medidas razoáveis para proteger os dados, mas nenhum sistema é totalmente imune a falhas.</p>
<h2>8. Links para outros sites</h2>
<p>O site tem links para o Aurora Premium, a Roque Business Evolution, o LinkedIn e o Instagram. Cada um deles tem a própria política de privacidade.</p>
<h2>9. Mudanças nesta política</h2>
<p>Esta política pode ser atualizada. A data da última atualização fica no topo da página.</p>
</div></div></section>`,
  get graph() { return [webpage('/politica-de-privacidade/', 'Política de Privacidade'), crumbLd(privCrumb)]; },
};

const termCrumb = [{ name: 'Início', path: '/' }, { name: 'Termos de Uso', path: '/termos-de-uso/' }];
const term = {
  path: '/termos-de-uso/',
  title: 'Termos de Uso | Viviane Roque',
  description: 'Termos de uso do site viviroque.com.br: finalidade informativa, propriedade intelectual, limites de responsabilidade e contato.',
  image: OG('home'),
  body: `
<section class="page-hero" aria-labelledby="h1">
  <div class="wrap">
    ${crumbHtml(termCrumb)}
    <h1 id="h1">Termos de Uso</h1>
    <p class="lead">Estes termos explicam as regras de uso do site viviroque.com.br. Ao navegar por ele, você concorda com o que está escrito aqui. Última atualização: 21 de outubro de 2026.</p>
  </div>
</section>
<section class="sec paper"><div class="wrap"><div class="prose">
<!-- REVISAR: texto jurídico escrito a partir do que o site faz hoje; recomenda-se revisão jurídica antes da virada. -->
<h2>1. Sobre o site</h2>
<p>O site viviroque.com.br apresenta a trajetória, a atuação e os conteúdos de Viviane Roque. O conteúdo é informativo e não substitui consultoria, mentoria ou aconselhamento profissional contratado.</p>
<h2>2. Uso adequado</h2>
<p>Você pode navegar e compartilhar os links do site. Não é permitido tentar comprometer a segurança do site, copiar o conteúdo para fins comerciais sem autorização ou se passar por Viviane Roque.</p>
<h2>3. Propriedade intelectual</h2>
<p>Textos, imagens, marcas e demais materiais do site pertencem a Viviane Roque e à Roque Business Evolution Serviços Ltda. Para reproduzir qualquer parte, peça autorização.</p>
<h2>4. Limites de responsabilidade</h2>
<p>Buscamos manter as informações corretas e atualizadas, mas o site é oferecido no estado em que está. Resultados de mentoria ou de serviços dependem de cada caso e não são garantidos pelo conteúdo do site.</p>
<h2>5. Links para outros sites</h2>
<p>Os links para sites de terceiros e para outras empresas de Viviane Roque levam a ambientes com regras próprias, pelos quais este site não responde.</p>
<h2>6. Contato</h2>
<p>Dúvidas sobre estes termos: WhatsApp +55 11 97396-7161.</p>
<h2>7. Lei aplicável</h2>
<p>Estes termos seguem a legislação brasileira.</p>
</div></div></section>`,
  get graph() { return [webpage('/termos-de-uso/', 'Termos de Uso'), crumbLd(termCrumb)]; },
};

for (const p of [home, quem, atua, ment, emp, cont, contato, priv, term]) writePage(p);
finish();
