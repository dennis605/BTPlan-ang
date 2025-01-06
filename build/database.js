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
exports.DatabaseManager = void 0;
const Datastore = require('nedb');
const path = __importStar(require("path"));
const electron_1 = require("electron");
const fs = __importStar(require("fs"));
class DatabaseManager {
    constructor() {
        // Bestimme den Pfad für die Datenbank-Dateien
        this.dbPath = electron_1.app.isPackaged
            ? path.join(process.resourcesPath, 'database')
            : path.join(__dirname, '..', 'database');
        // Stelle sicher, dass das Datenbankverzeichnis existiert
        if (!fs.existsSync(this.dbPath)) {
            fs.mkdirSync(this.dbPath, { recursive: true });
        }
        // Initialisiere die Datenbanken
        this.db = {
            employees: new Datastore({
                filename: path.join(this.dbPath, 'employees.db'),
                autoload: true,
                timestampData: true
            }),
            patients: new Datastore({
                filename: path.join(this.dbPath, 'patients.db'),
                autoload: true,
                timestampData: true
            }),
            therapies: new Datastore({
                filename: path.join(this.dbPath, 'therapies.db'),
                autoload: true,
                timestampData: true
            }),
            locations: new Datastore({
                filename: path.join(this.dbPath, 'locations.db'),
                autoload: true,
                timestampData: true
            }),
            dailySchedules: new Datastore({
                filename: path.join(this.dbPath, 'dailySchedules.db'),
                autoload: true,
                timestampData: true
            })
        };
        // Regelmäßige Komprimierung der Datenbanken
        Object.values(this.db).forEach(db => {
            db.persistence.setAutocompactionInterval(5000); // Alle 5 Sekunden
        });
        // Indizes erstellen
        this.db.employees.ensureIndex({ fieldName: 'id', unique: true });
        this.db.patients.ensureIndex({ fieldName: 'id', unique: true });
        this.db.therapies.ensureIndex({ fieldName: 'id', unique: true });
        this.db.locations.ensureIndex({ fieldName: 'id', unique: true });
        this.db.dailySchedules.ensureIndex({ fieldName: 'id', unique: true });
        this.db.dailySchedules.ensureIndex({ fieldName: 'date' });
    }
    // Hilfsmethode zum Promisify von NeDB Callbacks
    promisify(operation) {
        return new Promise((resolve, reject) => {
            operation((err, result) => {
                if (err)
                    reject(err);
                else
                    resolve(result);
            });
        });
    }
    // CRUD Operationen für jede Kollektion
    find(collection_1) {
        return __awaiter(this, arguments, void 0, function* (collection, query = {}) {
            this.logDbOperation('FIND', collection, { query });
            const result = yield this.promisify(cb => this.db[collection].find(query, cb));
            console.log(`[DB FIND RESULT] ${collection}: ${result.length} Einträge gefunden`);
            return result;
        });
    }
    findOne(collection, query) {
        return __awaiter(this, void 0, void 0, function* () {
            this.logDbOperation('FIND_ONE', collection, { query });
            const result = yield this.promisify(cb => this.db[collection].findOne(query, cb));
            console.log(`[DB FIND_ONE RESULT] ${collection}:`, result ? 'Gefunden' : 'Nicht gefunden');
            return result;
        });
    }
    logDbOperation(operation, collection, data) {
        console.log(`[DB ${operation}] ${collection}:`, JSON.stringify(data, null, 2));
        console.log(`[DB Zeitstempel] ${new Date().toISOString()}`);
    }
    insert(collection, doc) {
        return __awaiter(this, void 0, void 0, function* () {
            this.logDbOperation('INSERT', collection, doc);
            const result = yield this.promisify(cb => this.db[collection].insert(doc, cb));
            return result;
        });
    }
    update(collection_1, query_1, update_1) {
        return __awaiter(this, arguments, void 0, function* (collection, query, update, options = {}) {
            this.logDbOperation('UPDATE', collection, { query, update, options });
            const result = yield this.promisify(cb => this.db[collection].update(query, update, options, cb));
            return result;
        });
    }
    remove(collection_1, query_1) {
        return __awaiter(this, arguments, void 0, function* (collection, query, options = {}) {
            this.logDbOperation('REMOVE', collection, { query, options });
            const result = yield this.promisify(cb => this.db[collection].remove(query, options, cb));
            return result;
        });
    }
    // Methode zum Migrieren der JSON-Daten
    migrateFromJson(jsonPath) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('Starte Migration von:', jsonPath);
                const jsonContent = fs.readFileSync(jsonPath, 'utf8');
                console.log('JSON-Inhalt gelesen');
                const jsonData = JSON.parse(jsonContent);
                console.log('JSON geparst:', Object.keys(jsonData));
                // Lösche alte Daten
                for (const collection of Object.keys(this.db)) {
                    console.log(`Lösche alte Daten aus ${collection}...`);
                    yield this.remove(collection, {}, { multi: true });
                }
                // Füge neue Daten ein
                for (const [collection, data] of Object.entries(jsonData)) {
                    if (Array.isArray(data)) {
                        console.log(`Füge ${data.length} Einträge in ${collection} ein...`);
                        for (const item of data) {
                            try {
                                yield this.insert(collection, item);
                            }
                            catch (err) {
                                console.error(`Fehler beim Einfügen in ${collection}:`, err);
                                console.error('Problematischer Datensatz:', item);
                            }
                        }
                    }
                }
                console.log('Datenmigration erfolgreich abgeschlossen');
            }
            catch (error) {
                console.error('Fehler bei der Datenmigration:', error);
                throw error;
            }
        });
    }
    // Getter für die Datenbank-Instanz
    getDatabase() {
        return this.db;
    }
}
exports.DatabaseManager = DatabaseManager;
//# sourceMappingURL=database.js.map