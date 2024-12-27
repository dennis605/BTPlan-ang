import { app, BrowserWindow } from 'electron';
import * as path from 'path';
import * as express from 'express';
import * as jsonServer from 'json-server';

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // Start the Express server
  const server = express();
  const port = 3000;

  // Helper function to get the correct asset path
  function getAssetPath(relativePath: string) {
    return app.isPackaged
      ? path.join(process.resourcesPath, relativePath)
      : path.join(__dirname, '..', 'dist', 'btplan', relativePath);
  }

  // JSON Server middleware
  const dbPath = getAssetPath('db.json');
  const router = jsonServer.router(dbPath);
  server.use('/api', jsonServer.defaults(), router);

  // Serve static files from the Angular app
  const browserPath = getAssetPath('browser');
  server.use(express.static(browserPath));

  // All other routes should redirect to the index.html
  server.get('*', (req, res) => {
    res.sendFile(path.join(browserPath, 'index.html'));
  });

  server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log(`Browser path: ${browserPath}`);
    console.log(`Database path: ${dbPath}`);

    // Load the app after the server is ready
    mainWindow.loadURL('http://localhost:3000');
  });

  // Open the DevTools in development
  if (!app.isPackaged) {
    mainWindow.webContents.openDevTools();
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
