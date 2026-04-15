import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'region/:region',
    renderMode: RenderMode.Prerender,
    /**
     * Required for dynamic routes when using RenderMode.Prerender.
     * This provides the specific parameter values to the build engine
     * so it can generate the static HTML files at build time.
     */
    getPrerenderParams: async () => {
      return [
        { region: 'veneto' },
        { region: 'malopolska' }
      ];
    },
  },
  {
    /**
     * This catch-all route ensures that all other routes defined in 
     * app.routes.ts (home, login, register, etc.) are also prerendered.
     */
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
