"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
var path = require("path");
var fs = require("fs");
var database_1 = require("./database");
// Logger-Funktion einrichten
function log(message) {
    try {
        var logPath = path.join(electron_1.app.getPath('userData'), 'btplan.log');
        var timestamp = new Date().toISOString();
        var logMessage = "".concat(timestamp, ": ").concat(message, "\n");
        fs.appendFileSync(logPath, logMessage);
        console.log(message);
    }
    catch (error) {
        console.error('Logging failed:', error);
    }
}
// Globaler Error Handler
process.on('uncaughtException', function (error) {
    try {
        log('Uncaught Exception: ' + error.toString());
        log(error.stack || 'No stack trace available');
    }
    catch (logError) {
        console.error('Failed to log error:', logError);
    }
});
var dbManager;
// Sofort beim Start loggen
try {
    log('App starting...');
    log('User Data Path: ' + electron_1.app.getPath('userData'));
}
catch (error) {
    console.error('Initial logging failed:', error);
}
// Initialisiere die Datenbank
function initDatabase() {
    return __awaiter(this, void 0, void 0, function () {
        var counts;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    dbManager = new database_1.DatabaseManager();
                    return [4 /*yield*/, dbManager.loadAllDatabases()];
                case 1:
                    counts = _a.sent();
                    if (!Object.values(counts).every(function (count) { return count === 0; })) return [3 /*break*/, 3];
                    console.log('Datenbank ist leer, starte Migration...');
                    return [4 /*yield*/, dbManager.migrateFromJson(path.join(__dirname, '..', 'db.json'))];
                case 2:
                    _a.sent();
                    return [2 /*return*/, dbManager];
                case 3: return [2 /*return*/, dbManager];
            }
        });
    });
}
// IPC Handler für Datenbankoperationen
// Hilfsfunktion zum Loggen der Datenbankoperationen
function logDatabaseOperation(operation, collection) {
    return __awaiter(this, void 0, void 0, function () {
        var data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, dbManager.find(collection)];
                case 1:
                    data = _a.sent();
                    console.log("[".concat(operation, "] ").concat(String(collection), " enth\u00E4lt jetzt ").concat(data.length, " Eintr\u00E4ge:"), data);
                    return [2 /*return*/];
            }
        });
    });
}
electron_1.ipcMain.handle('db-get', function (event, collection) { return __awaiter(void 0, void 0, void 0, function () {
    var result, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                console.log("[GET] Lade Daten aus Collection ".concat(String(collection), "..."));
                return [4 /*yield*/, dbManager.find(collection)];
            case 1:
                result = _a.sent();
                console.log("[GET] Gefundene Daten in ".concat(String(collection), ":"), result);
                return [2 /*return*/, result];
            case 2:
                error_1 = _a.sent();
                console.error("[GET] Fehler beim Laden von ".concat(String(collection), ":"), error_1);
                throw error_1;
            case 3: return [2 /*return*/];
        }
    });
}); });
electron_1.ipcMain.handle('db-add', function (event_1, _a) { return __awaiter(void 0, [event_1, _a], void 0, function (event, _b) {
    var result, error_2;
    var collection = _b.collection, item = _b.item;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 3, , 4]);
                console.log("[ADD] F\u00FCge Datensatz zu ".concat(String(collection), " hinzu:"), item);
                return [4 /*yield*/, dbManager.insert(collection, item)];
            case 1:
                result = _c.sent();
                console.log("[ADD] Datensatz hinzugef\u00FCgt:", result);
                return [4 /*yield*/, logDatabaseOperation('ADD', collection)];
            case 2:
                _c.sent();
                return [2 /*return*/, result];
            case 3:
                error_2 = _c.sent();
                console.error("[ADD] Fehler beim Hinzuf\u00FCgen zu ".concat(String(collection), ":"), error_2);
                throw error_2;
            case 4: return [2 /*return*/];
        }
    });
}); });
electron_1.ipcMain.handle('db-update', function (event_1, _a) { return __awaiter(void 0, [event_1, _a], void 0, function (event, _b) {
    var error_3;
    var collection = _b.collection, id = _b.id, updates = _b.updates;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 3, , 4]);
                console.log("[UPDATE] Aktualisiere Datensatz in ".concat(String(collection), ":"), { id: id, updates: updates });
                return [4 /*yield*/, dbManager.update(collection, { id: id }, { $set: updates })];
            case 1:
                _c.sent();
                return [4 /*yield*/, logDatabaseOperation('UPDATE', collection)];
            case 2:
                _c.sent();
                return [2 /*return*/, updates];
            case 3:
                error_3 = _c.sent();
                console.error("[UPDATE] Fehler beim Aktualisieren in ".concat(String(collection), ":"), error_3);
                throw error_3;
            case 4: return [2 /*return*/];
        }
    });
}); });
electron_1.ipcMain.handle('db-delete', function (event_1, _a) { return __awaiter(void 0, [event_1, _a], void 0, function (event, _b) {
    var error_4;
    var collection = _b.collection, id = _b.id;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 3, , 4]);
                console.log("[DELETE] L\u00F6sche Datensatz aus ".concat(String(collection), ":"), id);
                return [4 /*yield*/, dbManager.remove(collection, { id: id })];
            case 1:
                _c.sent();
                return [4 /*yield*/, logDatabaseOperation('DELETE', collection)];
            case 2:
                _c.sent();
                return [2 /*return*/, id];
            case 3:
                error_4 = _c.sent();
                console.error("[DELETE] Fehler beim L\u00F6schen aus ".concat(String(collection), ":"), error_4);
                throw error_4;
            case 4: return [2 /*return*/];
        }
    });
}); });
function createWindow() {
    return __awaiter(this, void 0, void 0, function () {
        var mainWindow, browserPath;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, initDatabase()];
                case 1:
                    // Initialisiere und lade die Datenbank
                    dbManager = _a.sent();
                    mainWindow = new electron_1.BrowserWindow({
                        width: 1200,
                        height: 800,
                        webPreferences: {
                            nodeIntegration: false,
                            contextIsolation: true,
                            preload: path.join(__dirname, 'preload.js')
                        }
                    });
                    browserPath = electron_1.app.isPackaged
                        ? path.join(process.resourcesPath, 'browser')
                        : path.join(__dirname, '..', 'dist', 'btplan', 'browser');
                    log('App Path: ' + electron_1.app.getAppPath());
                    log('Resource Path: ' + process.resourcesPath);
                    log('Browser Path: ' + browserPath);
                    log('Index File Path: ' + path.join(browserPath, 'index.html'));
                    if (!fs.existsSync(path.join(browserPath, 'index.html'))) {
                        electron_1.dialog.showErrorBox('Fehler beim Laden', "Die Anwendung konnte nicht gefunden werden. Pfad: ".concat(path.join(browserPath, 'index.html')));
                        electron_1.app.quit();
                        return [2 /*return*/];
                    }
                    mainWindow.loadFile(path.join(browserPath, 'index.html')).catch(function (err) {
                        electron_1.dialog.showErrorBox('Fehler beim Laden', 'Die Anwendung konnte nicht geladen werden. ' + err.message);
                    });
                    return [2 /*return*/];
            }
        });
    });
}
electron_1.app.whenReady().then(createWindow);
electron_1.app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
electron_1.app.on('activate', function () {
    if (electron_1.BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
