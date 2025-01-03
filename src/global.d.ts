export type {};

declare global {
  interface Window {
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    [key: string]: any;
  }
}
