// eslint-disable-next-line import/prefer-default-export
export declare global {
  interface Window {
    backend: {
      send: (channel: string, data: Record<string, unknown>) => void,
      on: (channel: string, callback: (...args: unknown[]) => void) => void,
      off: (channel: string) => void,
    }
  }
}
