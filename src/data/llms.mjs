// Gera o /llms.txt (índice em texto simples para assistentes de IA). Uma frase por página dizendo o que ela entrega.
// Ao mudar uma página de verdade, atualize a frase aqui e a data em src/data/lastmod.json (o gerador de conteúdo já faz a data).
export const LLMS_INTRO = {
  title: 'Viviane Roque',
  summary: 'Viviane Roque é especialista em transformação digital, gestão de operações e inteligência artificial, fundadora da Roque Business Evolution e do Aurora Premium. Atua em tecnologia desde 1998.',
  about: 'Este site apresenta a trajetória, a atuação com empresas e lideranças e a mentoria de Viviane Roque. Contato pelo WhatsApp +55 11 97396-7161. Empresas: Roque Business Evolution (https://roquebusinessevolution.com/), agência de IA, sites e software. Produto: Aurora Premium (https://aurorapremium.com/), sistema de agendamento e gestão para salões, barbearias, clínicas, spas e pet shops.',
};
export const GROUPS = ['Sobre Viviane Roque', 'Atuação e mentoria', 'Contato e institucional'];
export const LLMS = {
  '/': { group: 0, entrega: 'Apresenta Viviane Roque, a linha do tempo de 1998 a 2025 e o que ela constrói hoje: Roque Business Evolution, Aurora Premium e EngageBot.' },
  '/quem-sou/': { group: 0, entrega: 'Conta a trajetória de Viviane Roque, por que ela leva tecnologia ao pequeno e médio empreendedor, certificações, formação e perguntas frequentes.' },
  '/minha-atuacao/': { group: 1, entrega: 'Explica como Viviane Roque atua com empresas (Roque Business Evolution) e com líderes e empresários (mentoria).' },
  '/trabalhe-comigo/': { group: 1, entrega: 'Descreve a mentoria individual com Viviane Roque: para quem é, como funciona, critério de entrada e próximo passo.' },
  '/para-empresas/': { group: 1, entrega: 'Mostra o que a Roque Business Evolution faz para empresas: agência de IA, sites, SEO, software e transformação digital.' },
  '/conteudos/': { group: 1, entrega: 'Lista os temas dos artigos de Viviane Roque sobre liderança, estratégia, governança e transformação digital.' },
  '/contato/': { group: 2, entrega: 'Como falar com Viviane Roque: WhatsApp +55 11 97396-7161, LinkedIn e Instagram.' },
  '/politica-de-privacidade/': { group: 2, entrega: 'Política de Privacidade do site, em conformidade com a LGPD.' },
  '/termos-de-uso/': { group: 2, entrega: 'Termos de Uso do site.' },
};
