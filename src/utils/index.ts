export async function loadRemoteModule(
  remoteUrl: string,
  scope: string,
  module: string,
) {
  try {
    if (typeof window === 'undefined') {
      throw new Error(
        'loadRemoteModule can only be used in a browser environment',
      );
    }

    // Load the remote entry script
    await new Promise<void>((resolve, reject) => {
      const existingScript = document.querySelector(
        `script[src="${remoteUrl}"]`,
      );
      if (existingScript) {
        return resolve();
      }

      const script = document.createElement('script');
      script.src = remoteUrl;
      script.type = 'text/javascript';
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load ${remoteUrl}`));
      document.head.appendChild(script);
    });

    // Initialize the shared scope
    await __webpack_init_sharing__('default');
    const container = (window as any)[scope];
    if (!container) {
      throw new Error(`Container ${scope} not found on window`);
    }
    await container.init(__webpack_share_scopes__.default);

    // Load the module
    const factory = await container.get(module);
    return factory();
  } catch (error) {
    console.error('Error loading remote module:', error);
    return null;
  }
}
