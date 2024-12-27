# Electron Build Guide für BTPlan

## Voraussetzungen

1. Node.js und npm installiert
2. Folgende npm-Pakete global installiert:
   ```bash
   npm install -g @angular/cli electron electron-builder
   ```

## Projektstruktur

Die wichtigsten Dateien für den Electron-Build:

```
BTPlan-ang/
├── electron/
│   ├── main.ts              # Electron Hauptprozess
│   └── tsconfig.json        # TypeScript-Konfiguration für Electron
├── src/
│   ├── app/
│   │   ├── services/        # Angular Services mit /api Präfix
│   │   └── ...             # Weitere Angular-Komponenten
│   └── environments/
│       ├── environment.ts          # Development API URL
│       └── environment.prod.ts     # Production API URL
├── db.json                  # Datenbank mit Employees, Patients, etc.
├── package.json            # Projekt-Konfiguration
└── server.js              # Express-Server für API
```

## Wichtige Konfigurationen

1. **API-Endpoints in den Services**
   Alle Services müssen den `/api` Präfix verwenden:

   ```typescript
   // src/app/services/employee.service.ts
   @Injectable({
     providedIn: 'root'
   })
   export class EmployeeService {
     private apiUrl = `${environment.apiUrl}/api/employees`;
     // ...
   }

   // Gleiches gilt für:
   // - patient.service.ts     (/api/patients)
   // - location.service.ts    (/api/locations)
   // - therapy.service.ts     (/api/therapies)
   // - daily-schedule.service.ts (/api/dailySchedules)
   ```

2. **Environment-Konfiguration**
   ```typescript
   // src/environments/environment.ts
   export const environment = {
     production: false,
     apiUrl: 'http://localhost:3000'
   };

   // src/environments/environment.prod.ts
   export const environment = {
     production: true,
     apiUrl: 'http://localhost:3000'
   };
   ```

3. **Express-Server (server.js)**
   ```javascript
   const express = require('express');
   const jsonServer = require('json-server');
   const path = require('path');
   const fs = require('fs');

   const app = express();
   const port = process.env.PORT || 3000;

   function getAssetPath(relativePath) {
     return process.pkg 
       ? path.join(path.dirname(process.execPath), relativePath)
       : path.join(__dirname, relativePath);
   }

   const browserPath = getAssetPath('browser');
   const dbPath = getAssetPath('db.json');

   // JSON Server mit /api Präfix
   const router = jsonServer.router(dbPath);
   app.use('/api', jsonServer.defaults(), router);

   app.use(express.static(browserPath));
   app.get('*', (req, res) => {
     res.sendFile(path.join(browserPath, 'index.html'));
   });

   app.listen(port, () => {
     console.log(`Server is running on port ${port}`);
   });
   ```

4. **Datenbank-Struktur (db.json)**
   ```json
   {
     "employees": [
       {
         "id": "string",
         "name": "string",
         "surname": "string",
         "note": "string"
       }
     ],
     "patients": [
       {
         "id": "string",
         "name": "string",
         "surname": "string",
         "note": "string"
       }
     ],
     "locations": [
       {
         "id": "string",
         "name": "string",
         "description": "string"
       }
     ],
     "therapies": [
       {
         "id": "string",
         "name": "string",
         "patients": ["Patient"],
         "leadingEmployee": "Employee",
         "location": "Location",
         "startTime": "string",
         "endTime": "string",
         "preparationTime": "number",
         "followUpTime": "number",
         "comment": "string"
       }
     ],
     "dailySchedules": [
       {
         "id": "string",
         "date": "string",
         "therapies": ["Therapy"]
       }
     ]
   }
   ```

## Build-Schritte

1. **Dependencies installieren**
   ```bash
   npm install --save-dev electron electron-builder @types/electron
   ```

2. **Electron main.ts erstellen** (in `/electron/main.ts`):
   ```typescript
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

     const server = express();
     const port = 3000;

     function getAssetPath(relativePath: string) {
       return app.isPackaged
         ? path.join(process.resourcesPath, relativePath)
         : path.join(__dirname, '..', 'dist', 'btplan', relativePath);
     }

     const dbPath = getAssetPath('db.json');
     const router = jsonServer.router(dbPath);
     server.use('/api', jsonServer.defaults(), router);

     const browserPath = getAssetPath('browser');
     server.use(express.static(browserPath));

     server.get('*', (req, res) => {
       res.sendFile(path.join(browserPath, 'index.html'));
     });

     server.listen(port, () => {
       console.log(`Server is running on port ${port}`);
       mainWindow.loadURL('http://localhost:3000');
     });
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
   ```

3. **TypeScript-Konfiguration für Electron** (in `/electron/tsconfig.json`):
   ```json
   {
     "compilerOptions": {
       "target": "es5",
       "module": "commonjs",
       "sourceMap": true,
       "outDir": ".",
       "rootDir": ".",
       "strict": true,
       "moduleResolution": "node",
       "esModuleInterop": true,
       "skipLibCheck": true,
       "forceConsistentCasingInFileNames": true
     },
     "include": [
       "main.ts"
     ]
   }
   ```

4. **package.json konfigurieren**:
   ```json
   {
     "name": "btplan",
     "version": "0.0.0",
     "main": "electron/main.js",
     "scripts": {
       "electron:dev": "ng build && tsc electron/main.ts && electron .",
       "electron:build": "ng build && tsc electron/main.ts && electron-builder build",
       "dist": "ng build && tsc electron/main.ts && electron-builder build -mw --dir"
     },
     "build": {
       "appId": "com.btplan.app",
       "productName": "BTPlan",
       "directories": {
         "output": "release",
         "buildResources": "dist/btplan/browser"
       },
       "files": [
         "electron/main.js",
         "dist/btplan/browser/**/*"
       ],
       "extraResources": [
         {
           "from": "db.json",
           "to": "db.json"
         },
         {
           "from": "dist/btplan/browser",
           "to": "browser"
         }
       ],
       "mac": {
         "category": "public.app-category.productivity",
         "target": ["dmg", "zip"]
       },
       "win": {
         "target": "nsis"
       }
     }
   }
   ```

5. **.gitignore anpassen**:
   ```gitignore
   # Electron & Build spezifisch
   /release
   /browser
   *.exe
   *.app
   *.dmg
   *.zip
   *.pkg
   *.blockmap
   *.asar
   /electron/main.js
   ```

## Build-Prozess

1. **Entwicklungsversion testen**:
   ```bash
   npm run electron:dev
   ```

2. **Produktionsversion erstellen**:
   ```bash
   # Für beide Plattformen (macOS und Windows)
   npm run dist

   # Nur für macOS
   npm run electron:build -- -m

   # Nur für Windows
   npm run electron:build -- -w
   ```

## Build-Ausgabe

Die fertigen Builds befinden sich im `release`-Ordner:

- **macOS**:
  - `BTPlan-[version]-arm64.dmg` - Installer
  - `BTPlan-[version]-arm64-mac.zip` - Portable Version

- **Windows**:
  - `BTPlan Setup [version].exe` - Installer
  - Im `win-unpacked` Ordner - Portable Version

## Wichtige Hinweise

1. Für die Entwicklung den normalen Angular-Server verwenden (`ng serve`)
2. Electron-Build nur für Tests und Releases verwenden
3. Pfade in `main.ts` beachten (unterschiedlich für Entwicklung und Produktion)
4. Die `db.json` wird als Resource mitgepackt
5. Der Express-Server läuft auf Port 3000 und verwendet `/api` als Präfix

## Entwicklung vs. Produktion

1. **Entwicklung**:
   - `ng serve` für Angular
   - `node server.js` für API
   - Beide Server laufen getrennt

2. **Produktion (Electron)**:
   - Ein einzelner Server (in main.ts)
   - API und Frontend in einer Executable
   - Gleiche Pfade (/api) wie in Entwicklung

## Wichtige Hinweise

1. Der Server verwendet IMMER den `/api` Präfix für die JSON-Server-Routen
2. Die Datenbank (`db.json`) muss alle erforderlichen Collections enthalten
3. Alle Angular-Services müssen den `/api` Präfix in ihren URLs verwenden
4. Die Entwicklungs- und Produktionsumgebung verwenden die gleiche Server-Konfiguration
5. Die `db.json` wird als Resource in die Electron-App eingebettet

## Troubleshooting

1. **API nicht erreichbar**: 
   - Prüfen Sie, ob der Server auf `/api` läuft
   - Überprüfen Sie die Service-URLs
   - Kontrollieren Sie die environment.ts Dateien

2. **Datenbank-Fehler**:
   - Stellen Sie sicher, dass `db.json` alle erforderlichen Collections enthält
   - Überprüfen Sie die Pfade in `getAssetPath`
   - Prüfen Sie die Berechtigungen der `db.json`

3. **Build-Probleme**:
   - Löschen Sie den `release` Ordner vor einem neuen Build
   - Stellen Sie sicher, dass die API-Pfade korrekt sind
   - Überprüfen Sie die Server-Konfiguration in `main.ts`
