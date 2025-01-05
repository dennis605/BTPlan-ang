import { app, BrowserWindow, dialog } from 'electron';
import * as path from 'path';
const express = require('express');
const jsonServer = require('json-server');

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

  // Start the Express server with JSON Server
  const server = express();
  const dbPath = app.isPackaged
    ? path.join(process.resourcesPath, 'db.json')
    : path.join(__dirname, '..', 'db.json');

  const browserPath = app.isPackaged
    ? path.join(process.resourcesPath, 'browser')
    : path.join(__dirname, '..', 'dist', 'btplan', 'browser');

  const router = jsonServer.router(dbPath);
  server.use('/api', jsonServer.defaults(), router);

  // Serve static files
  server.use(express.static(browserPath));

  // All other routes should redirect to index.html
  server.get('*', (req, res) => {
    res.sendFile(path.join(browserPath, 'index.html'));
  });

  // Start server
  server.listen(3000, () => {
    console.log('Server is running on port 3000');
    mainWindow.loadURL('http://localhost:3000').catch(err => {
      dialog.showErrorBox('Fehler beim Laden',
        'Die Anwendung konnte nicht geladen werden. ' + err.message);
    });
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
