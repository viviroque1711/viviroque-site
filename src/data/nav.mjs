import { SITE, waHref } from './site.mjs';

export const NAV = [
  { href: '/quem-sou/', label: 'Quem sou' },
  { href: '/minha-atuacao/', label: 'Atuação' },
  { href: '/trabalhe-comigo/', label: 'Mentoria' },
  { href: '/para-empresas/', label: 'Empresas' },
  { href: '/conteudos/', label: 'Conteúdos' },
  { href: '/contato/', label: 'Contato' },
];
export const LEGAL = [
  { href: '/politica-de-privacidade/', label: 'Política de Privacidade' },
  { href: '/termos-de-uso/', label: 'Termos de Uso' },
];
export const WHATSAPP = { href: waHref(), label: SITE.wa.label };
export const EXTERNAL = {
  rbe: { href: SITE.rbe, label: 'Roque Business Evolution' },
  aurora: { href: SITE.aurora, label: 'Aurora Premium' },
  engagebot: { href: 'https://roquebusinessevolution.com/engagebot/', label: 'EngageBot' },
};
