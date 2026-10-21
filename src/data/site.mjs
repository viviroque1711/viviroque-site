// Configuração única do site. O resto do código (astro.config, sitemap, robots, llms.txt, verificações) lê daqui.
export const SITE = {
  url: 'https://viviroque.com.br',
  repo: 'viviroque-site',
  name: 'Viviane Roque',
  lang: 'pt-BR',
  themeColor: '#262A31',
  wa: {
    number: '5511973967161',
    label: '+55 11 97396-7161',
    text: 'Olá, Viviane! Vim pelo seu site.',
  },
  linkedin: 'https://www.linkedin.com/in/vivianepereirambas/',
  instagram: 'https://www.instagram.com/viviroqueoficial/',
  rbe: 'https://roquebusinessevolution.com/',
  aurora: 'https://aurorapremium.com/',
};
export const waHref = (text = SITE.wa.text) => `https://wa.me/${SITE.wa.number}?text=${encodeURIComponent(text)}`;
