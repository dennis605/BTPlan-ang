"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const database_1 = require("./database");
let dbManager;
// Initialisiere die Datenbank
dbManager = new database_1.DatabaseManager();
// IPC Handler für Datenbankoperationen
electron_1.ipcMain.handle('db-get', (event, collection) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(`Lade Daten aus Collection ${collection}...`);
        const result = yield dbManager.find(collection);
        console.log(`Gefundene Daten in ${collection}:`, result);
        return result;
    }
    catch (error) {
        console.error(`Fehler beim Laden von ${collection}:`, error);
        throw error;
    }
}));
electron_1.ipcMain.handle('db-add', (event_1, _a) => __awaiter(void 0, [event_1, _a], void 0, function* (event, { collection, item }) {
    try {
        console.log(`Füge Datensatz zu ${collection} hinzu:`, item);
        const result = yield dbManager.insert(collection, item);
        console.log(`Datensatz hinzugefügt:`, result);
        return result;
    }
    catch (error) {
        console.error(`Fehler beim Hinzufügen zu ${collection}:`, error);
        throw error;
    }
}));
electron_1.ipcMain.handle('db-update', (event_1, _a) => __awaiter(void 0, [event_1, _a], void 0, function* (event, { collection, id, updates }) {
    try {
        yield dbManager.update(collection, { id }, { $set: updates });
        return updates;
    }
    catch (error) {
        console.error(`Fehler beim Aktualisieren in ${collection}:`, error);
        throw error;
    }
}));
electron_1.ipcMain.handle('db-delete', (event_1, _a) => __awaiter(void 0, [event_1, _a], void 0, function* (event, { collection, id }) {
    try {
        yield dbManager.remove(collection, { id });
        return id;
    }
    catch (error) {
        console.error(`Fehler beim Löschen aus ${collection}:`, error);
        throw error;
    }
}));
function migrateDataIfNeeded() {
    return __awaiter(this, void 0, void 0, function* () {
        const jsonPath = electron_1.app.isPackaged
            ? path.join(process.resourcesPath, 'db.json')
            : path.join(__dirname, '..', 'db.json');
        console.log('Suche nach db.json:', jsonPath);
        if (fs.existsSync(jsonPath)) {
            try {
                console.log('db.json gefunden, starte Migration...');
                yield dbManager.migrateFromJson(jsonPath);
            }
            catch (error) {
                console.error('Fehler bei der Datenmigration:', error);
            }
        }
        else {
            console.log('db.json nicht gefunden');
        }
    });
}
function createWindow() {
    return __awaiter(this, void 0, void 0, function* () {
        const mainWindow = new electron_1.BrowserWindow({
            width: 1200,
            height: 800,
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true,
                preload: path.join(__dirname, 'preload.js')
            }
        });
        // Führe die Datenmigration durch, wenn nötig
        yield migrateDataIfNeeded();
        // Lade die Angular App
        const browserPath = electron_1.app.isPackaged
            ? path.join(process.resourcesPath, 'browser')
            : path.join(__dirname, '..', 'dist', 'btplan', 'browser');
        mainWindow.loadFile(path.join(browserPath, 'index.html')).catch(err => {
            electron_1.dialog.showErrorBox('Fehler beim Laden', 'Die Anwendung konnte nicht geladen werden. ' + err.message);
        });
        // DevTools immer öffnen für Debugging
        mainWindow.webContents.openDevTools();
    });
}
electron_1.app.whenReady().then(createWindow);
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
electron_1.app.on('activate', () => {
    if (electron_1.BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
//# sourceMappingURL=main.js.map