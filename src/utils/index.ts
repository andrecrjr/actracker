export async function loadRemoteModule(
  remoteUrl: string,
  scope: string,
  module: string,
) {
  try {
    if (typeof window === undefined) {
      return false;
    }
    // Load the remote entry script
    await new Promise<void>((resolve, reject) => {
      const script = window.document.createElement('script');
      script.src = remoteUrl;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load ${remoteUrl}`));
      window.document.head.appendChild(script);
    });

    // Initialize the shared scope
    await __webpack_init_sharing__('default');
    const container = window[scope];
    await container.init(__webpack_share_scopes__.default);

    // Load the module
    const factory = await container.get(module);
    const Module = factory();
    console.log(Module);
    return Module.default;
  } catch (error) {
    console.log('error', error);
  }
}
