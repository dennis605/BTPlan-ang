import { contextBridge, ipcRenderer } from 'electron';

// Expose die Datenbank-API für den Renderer-Prozess
contextBridge.exposeInMainWorld('electronAPI', {
  // Datenbank-Operationen
  database: {
    // Alle Einträge einer Collection abrufen
    getAll: (collection: string) => 
      ipcRenderer.invoke('db-get', collection),

    // Neuen Eintrag hinzufügen
    add: (collection: string, item: any) => 
      ipcRenderer.invoke('db-add', { collection, item }),

    // Eintrag aktualisieren
    update: (collection: string, id: string, updates: any) => 
      ipcRenderer.invoke('db-update', { collection, id, updates }),

    // Eintrag löschen
    delete: (collection: string, id: string) => 
      ipcRenderer.invoke('db-delete', { collection, id })
  }
});
