import { app, BrowserWindow, dialog, ipcMain } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { DatabaseManager, Database } from './database';

// Logger-Funktion einrichten
function log(message: string) {
  try {
    const logPath = path.join(app.getPath('userData'), 'btplan.log');
    const timestamp = new Date().toISOString();
    const logMessage = `${timestamp}: ${message}\n`;
    fs.appendFileSync(logPath, logMessage);
    console.log(message);
  } catch (error) {
    console.error('Logging failed:', error);
  }
}

// Globaler Error Handler
process.on('uncaughtException', (error) => {
  try {
    log('Uncaught Exception: ' + error.toString());
    log(error.stack || 'No stack trace available');
  } catch (logError) {
    console.error('Failed to log error:', logError);
  }
});

let dbManager: DatabaseManager;

// Sofort beim Start loggen
try {
  log('App starting...');
  log('User Data Path: ' + app.getPath('userData'));
} catch (error) {
  console.error('Initial logging failed:', error);
}

// Initialisiere die Datenbank
async function initDatabase() {
  dbManager = new DatabaseManager();
  // Warte auf das tatsächliche Laden der Datenbank
  const counts = await dbManager.loadAllDatabases();
  
  // Wenn die Datenbank leer ist, migriere die Daten aus db.json
  if (Object.values(counts).every(count => count === 0)) {
    console.log('Datenbank ist leer, starte Migration...');
    await dbManager.migrateFromJson(path.join(__dirname, '..', 'db.json'));
    return dbManager;
  }
  
  return dbManager;
}

// IPC Handler für Datenbankoperationen
// Hilfsfunktion zum Loggen der Datenbankoperationen
async function logDatabaseOperation(operation: string, collection: keyof Database) {
  const data = await dbManager.find(collection);
  console.log(`[${operation}] ${String(collection)} enthält jetzt ${data.length} Einträge:`, data);
}

ipcMain.handle('db-get', async (event, collection: keyof Database) => {
  try {
    console.log(`[GET] Lade Daten aus Collection ${String(collection)}...`);
    const result = await dbManager.find(collection);
    console.log(`[GET] Gefundene Daten in ${String(collection)}:`, result);
    return result;
  } catch (error) {
    console.error(`[GET] Fehler beim Laden von ${String(collection)}:`, error);
    throw error;
  }
});

ipcMain.handle('db-add', async (event, { collection, item }: { collection: keyof Database, item: any }) => {
  try {
    console.log(`[ADD] Füge Datensatz zu ${String(collection)} hinzu:`, item);
    const result = await dbManager.insert(collection, item);
    console.log(`[ADD] Datensatz hinzugefügt:`, result);
    await logDatabaseOperation('ADD', collection);
    return result;
  } catch (error) {
    console.error(`[ADD] Fehler beim Hinzufügen zu ${String(collection)}:`, error);
    throw error;
  }
});

ipcMain.handle('db-update', async (event, { collection, id, updates }: { collection: keyof Database, id: string, updates: any }) => {
  try {
    console.log(`[UPDATE] Aktualisiere Datensatz in ${String(collection)}:`, { id, updates });
    await dbManager.update(collection, { id }, { $set: updates });
    await logDatabaseOperation('UPDATE', collection);
    return updates;
  } catch (error) {
    console.error(`[UPDATE] Fehler beim Aktualisieren in ${String(collection)}:`, error);
    throw error;
  }
});

ipcMain.handle('db-delete', async (event, { collection, id }: { collection: keyof Database, id: string }) => {
  try {
    console.log(`[DELETE] Lösche Datensatz aus ${String(collection)}:`, id);
    await dbManager.remove(collection, { id });
    await logDatabaseOperation('DELETE', collection);
    return id;
  } catch (error) {
    console.error(`[DELETE] Fehler beim Löschen aus ${String(collection)}:`, error);
    throw error;
  }
});

async function createWindow() {
  try {
    log('Starting createWindow function...');

    // Initialisiere und lade die Datenbank
    log('Initializing database...');
    try {
      dbManager = await initDatabase();
      log('Database initialized successfully');
    } catch (dbError) {
      log('Database initialization failed: ' + dbError);
      throw dbError;
    }

    log('Creating browser window...');
    const mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, 'preload.js')
      }
    });
    log('Browser window created');

    // Lade die Angular App
    const browserPath = app.isPackaged
      ? path.join(process.resourcesPath, 'browser')
      : path.join(__dirname, '..', 'dist', 'btplan', 'browser');

    log('App Path: ' + app.getAppPath());
    log('Resource Path: ' + process.resourcesPath);
    log('Browser Path: ' + browserPath);
    log('Index File Path: ' + path.join(browserPath, 'index.html'));
    
    // Liste den Inhalt des Ressourcen-Verzeichnisses auf
    try {
      const resourceFiles = fs.readdirSync(process.resourcesPath);
      log('Resource directory contents: ' + JSON.stringify(resourceFiles));

      if (fs.existsSync(path.join(process.resourcesPath, 'browser'))) {
        const browserFiles = fs.readdirSync(path.join(process.resourcesPath, 'browser'));
        log('Browser directory contents: ' + JSON.stringify(browserFiles));
      } else {
        log('Browser directory does not exist');
      }
    } catch (fsError) {
      log('Error reading directory: ' + fsError);
    }
    
    if (!fs.existsSync(path.join(browserPath, 'index.html'))) {
      const errorMessage = `Die Anwendung konnte nicht gefunden werden. Pfad: ${path.join(browserPath, 'index.html')}`;
      log('Error: ' + errorMessage);
      dialog.showErrorBox('Fehler beim Laden', errorMessage);
      app.quit();
      return;
    }

    log('Loading index.html...');
    mainWindow.loadFile(path.join(browserPath, 'index.html')).catch(err => {
      log('Error loading index.html: ' + err);
      dialog.showErrorBox('Fehler beim Laden',
        'Die Anwendung konnte nicht geladen werden. ' + err.message);
    });

  } catch (error) {
    log('Critical error in createWindow: ' + error);
    if (error.stack) {
      log('Stack trace: ' + error.stack);
    }
    dialog.showErrorBox('Kritischer Fehler',
      'Ein kritischer Fehler ist aufgetreten: ' + error.message);
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
