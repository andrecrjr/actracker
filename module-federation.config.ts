import { createModuleFederationConfig } from '@module-federation/modern-js';

const deps = require('./package.json').dependencies;

export default createModuleFederationConfig({
  name: 'actracker',
  filename: 'static/mainRemote.js',
  shared: {
    react: { singleton: true },
    'react-dom': { singleton: true },
    ...deps,
  },
  exposes: {
    './Components': './src/app/components/ui',
    './types': './src/app/types',
    './hooks': './src/app/hooks',
  },
  manifest: {
    filePath: 'static',
  },
});
