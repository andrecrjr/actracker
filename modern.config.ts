import { appTools, defineConfig } from '@modern-js/app-tools';

import { tailwindcssPlugin } from '@modern-js/plugin-tailwindcss';
import moduleFederationPlugin from '@module-federation/modern-js';

// https://modernjs.dev/en/configure/app/usage
export default defineConfig({
  builderPlugins: [],
  runtime: {
    router: true,
  },
  server: {
    ssr: {
      mode: 'stream',
    },
  },
  plugins: [
    appTools({
      bundler: 'rspack', // Set to 'webpack' to enable webpack
    }),
    moduleFederationPlugin({
      ssr: false,
    }),
    tailwindcssPlugin(),
  ],
});
