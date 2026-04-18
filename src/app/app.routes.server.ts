import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'region/:region',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => {
      return [
        { region: 'veneto' },
        { region: 'malopolska' }
      ];
    },
  },
  {
    path: 'region/:region/:category/:slug',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => {
      return [
        {
          region: 'veneto',
          category: 'churches',
          slug: 'basilica-di-san-marco'
        },
        {
          region: 'malopolska',
          category: 'castles',
          slug: 'wawel-royal-castle'
        }
      ];
    }
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
