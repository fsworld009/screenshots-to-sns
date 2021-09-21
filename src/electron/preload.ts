// https://stackoverflow.com/a/59888788/3973896

import { contextBridge, ipcRenderer } from 'electron';

const validChannels = ['test'];
// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'backend', {
    send: (channel: string, data: Record<string, unknown>) => {
      // whitelist channels
      if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, data);
      }
    },
    on: (channel: string, callback: (...args: unknown[]) => void) => {
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender`
        ipcRenderer.on(channel, (event, ...args) => callback(...args));
      }
    },
    off: (channel: string) => {
      if (validChannels.includes(channel)) {
        ipcRenderer.removeAllListeners(channel);
      }
    },
  },
);
