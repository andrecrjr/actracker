import { createModuleFederationConfig } from '@module-federation/modern-js';

export default createModuleFederationConfig({
  name: 'actracker_main',
  remotes: {},
  shared: {
    react: { singleton: true },
    'react-dom': { singleton: true },
  },
  exposes: {
    './Button': './src/components/ui/button',
  },
});
