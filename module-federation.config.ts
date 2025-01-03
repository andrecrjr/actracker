import { createModuleFederationConfig } from '@module-federation/modern-js';

export default createModuleFederationConfig({
  name: 'actracker-main',
  remotes: {},
  shared: {
    react: { singleton: true },
    'react-dom': { singleton: true },
  },
});
