import { app, BrowserWindow, dialog, ipcMain } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import * as Lowdb from 'lowdb';
import * as FileSync from 'lowdb/adapters/FileSync';

interface Database {
  employees: any[];
  patients: any[];
  therapies: any[];
  locations: any[];
  dailySchedules: any[];
}

let db: Lowdb.LowdbSync<Database>;

async function createWindow() {
  // Initialisiere die Datenbank
  const dbPath = app.isPackaged
    ? path.join(process.resourcesPath, 'db.json')
    : path.join(__dirname, '..', 'db.json');

  // Stelle sicher, dass die Datei existiert
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify({
      employees: [],
      patients: [],
      therapies: [],
      locations: [],
      dailySchedules: []
    }));
  }

  const adapter = new FileSync.default<Database>(dbPath);
  db = Lowdb.default(adapter);
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // Lade die Angular App
  const browserPath = app.isPackaged
    ? path.join(process.resourcesPath, 'browser')
    : path.join(__dirname, '..', 'dist', 'btplan', 'browser');

  mainWindow.loadFile(path.join(browserPath, 'index.html')).catch(err => {
    dialog.showErrorBox('Fehler beim Laden',
      'Die Anwendung konnte nicht geladen werden. ' + err.message);
  });

  // IPC Handlers für Datenbankoperationen
  // IPC Handlers für Datenbankoperationen
  ipcMain.handle('db-get', (event, collection: keyof Database) => {
    return db.get(collection).value();
  });

  ipcMain.handle('db-add', (event, { collection, item }: { collection: keyof Database; item: any }) => {
    const items = db.get(collection);
    if (Array.isArray(items.value())) {
      items.push(item).write();
      return item;
    }
    throw new Error(`Collection ${collection} ist kein Array`);
  });

  ipcMain.handle('db-update', (event, { collection, id, updates }: { collection: keyof Database; id: string; updates: any }) => {
    const items = db.get(collection);
    if (Array.isArray(items.value())) {
      items.find({ id: id }).assign(updates).write();
      return updates;
    }
    throw new Error(`Collection ${collection} ist kein Array`);
  });

  ipcMain.handle('db-delete', (event, { collection, id }: { collection: keyof Database; id: string }) => {
    const items = db.get(collection);
    if (Array.isArray(items.value())) {
      items.remove({ id: id }).write();
      return id;
    }
    throw new Error(`Collection ${collection} ist kein Array`);
  });

  // DevTools im Entwicklungsmodus
  if (!app.isPackaged) {
    mainWindow.webContents.openDevTools();
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
