import { app, BrowserWindow, dialog, ipcMain } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { DatabaseManager } from './database';

let dbManager: DatabaseManager;

// Initialisiere die Datenbank
dbManager = new DatabaseManager();

// IPC Handler für Datenbankoperationen
ipcMain.handle('db-get', async (event, collection) => {
  try {
    return await dbManager.find(collection);
  } catch (error) {
    console.error(`Fehler beim Laden von ${collection}:`, error);
    throw error;
  }
});

ipcMain.handle('db-add', async (event, { collection, item }) => {
  try {
    return await dbManager.insert(collection, item);
  } catch (error) {
    console.error(`Fehler beim Hinzufügen zu ${collection}:`, error);
    throw error;
  }
});

ipcMain.handle('db-update', async (event, { collection, id, updates }) => {
  try {
    await dbManager.update(collection, { id }, { $set: updates });
    return updates;
  } catch (error) {
    console.error(`Fehler beim Aktualisieren in ${collection}:`, error);
    throw error;
  }
});

ipcMain.handle('db-delete', async (event, { collection, id }) => {
  try {
    await dbManager.remove(collection, { id });
    return id;
  } catch (error) {
    console.error(`Fehler beim Löschen aus ${collection}:`, error);
    throw error;
  }
});

async function migrateDataIfNeeded() {
  const migrationFlagPath = path.join(app.getPath('userData'), 'migration-completed');
  
  // Prüfe, ob die Migration bereits durchgeführt wurde
  if (!fs.existsSync(migrationFlagPath)) {
    const jsonPath = app.isPackaged
      ? path.join(process.resourcesPath, 'db.json')
      : path.join(__dirname, '..', 'db.json');

    if (fs.existsSync(jsonPath)) {
      try {
        await dbManager.migrateFromJson(jsonPath);
        console.log('Datenmigration erfolgreich');
        
        // Erstelle die Flag-Datei, um anzuzeigen, dass die Migration abgeschlossen ist
        fs.writeFileSync(migrationFlagPath, new Date().toISOString());
      } catch (error) {
        console.error('Fehler bei der Datenmigration:', error);
      }
    }
  }
}

async function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // Führe die Datenmigration durch, wenn nötig
  await migrateDataIfNeeded();

  // Lade die Angular App
  const browserPath = app.isPackaged
    ? path.join(process.resourcesPath, 'browser')
    : path.join(__dirname, '..', 'dist', 'btplan', 'browser');

  mainWindow.loadFile(path.join(browserPath, 'index.html')).catch(err => {
    dialog.showErrorBox('Fehler beim Laden',
      'Die Anwendung konnte nicht geladen werden. ' + err.message);
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
