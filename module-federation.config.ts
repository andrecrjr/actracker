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
    './Components': './src/ac-components/components/ui',
    './types': './src/ac-components/types',
    './hooks': './src/ac-components/hooks',
  },
  manifest: {
    filePath: 'static',
  },
});
