import { contextBridge, ipcRenderer } from 'electron';

// Expose geschützte Methoden, die IPC-Aufrufe erlauben
contextBridge.exposeInMainWorld(
  'electron',
  {
    ipcRenderer: {
      invoke: (channel: string, ...args: any[]) => {
        const validChannels = ['db-get', 'db-add', 'db-update', 'db-delete'];
        if (validChannels.includes(channel)) {
          return ipcRenderer.invoke(channel, ...args);
        }
        throw new Error(`Unerlaubter IPC-Kanal: ${channel}`);
      }
    }
  }
);
