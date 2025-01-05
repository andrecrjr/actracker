import { createModuleFederationConfig } from '@module-federation/modern-js';

const deps = require('./package.json').dependencies;

export default createModuleFederationConfig({
  name: 'actracker',
  filename: 'mainRemote.js',
  shared: {
    react: { singleton: true },
    'react-dom': { singleton: true },
    ...deps,
  },
  exposes: {
    './Button': './src/components/ui/button',
    './Components': './src/components/ui/',
    './types': './src/types/',
  },
});
