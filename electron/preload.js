"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
// Expose die Datenbank-API für den Renderer-Prozess
electron_1.contextBridge.exposeInMainWorld('electronAPI', {
    // Datenbank-Operationen
    database: {
        // Alle Einträge einer Collection abrufen
        getAll: function (collection) {
            return electron_1.ipcRenderer.invoke('db-get', collection);
        },
        // Neuen Eintrag hinzufügen
        add: function (collection, item) {
            return electron_1.ipcRenderer.invoke('db-add', { collection: collection, item: item });
        },
        // Eintrag aktualisieren
        update: function (collection, id, updates) {
            return electron_1.ipcRenderer.invoke('db-update', { collection: collection, id: id, updates: updates });
        },
        // Eintrag löschen
        delete: function (collection, id) {
            return electron_1.ipcRenderer.invoke('db-delete', { collection: collection, id: id });
        }
    }
});
