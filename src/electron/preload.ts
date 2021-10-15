// https://stackoverflow.com/a/59888788/3973896

import { contextBridge, ipcRenderer } from 'electron';

const validMainChannels = ['test', 'selectImages', 'makeVideo'];
const validRendererChannels = ['test', 'onSelectImages', 'onVideoOutput'];
// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'backend', {
    send: (channel: string, data: Record<string, unknown> = {}) => {
      // whitelist channels
      if (validMainChannels.includes(channel)) {
        ipcRenderer.send(channel, data);
      }
    },
    on: (channel: string, callback: (...args: unknown[]) => void) => {
      if (validRendererChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender`
        ipcRenderer.on(channel, (event, ...args) => callback(...args));
      }
    },
    off: (channel: string) => {
      if (validRendererChannels.includes(channel)) {
        ipcRenderer.removeAllListeners(channel);
      }
    },
  },
);
