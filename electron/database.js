"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.DatabaseManager = void 0;
var Datastore = require('nedb');
var path = require("path");
var electron_1 = require("electron");
var fs = require("fs");
var DatabaseManager = /** @class */ (function () {
    function DatabaseManager() {
        var _this = this;
        // Bestimme den Pfad für die Datenbank-Dateien
        var devDbPath = path.join(__dirname, '..', 'database');
        this.dbPath = electron_1.app.isPackaged
            ? path.join(electron_1.app.getPath('userData'), 'database')
            : devDbPath;
        // Stelle sicher, dass das Datenbankverzeichnis existiert
        if (!fs.existsSync(this.dbPath)) {
            fs.mkdirSync(this.dbPath, { recursive: true });
            // Wenn wir im gepackten Modus sind und das Verzeichnis neu erstellt wurde,
            // kopiere die Entwicklungsdatenbanken als initiale Daten
            if (electron_1.app.isPackaged && fs.existsSync(devDbPath)) {
                var dbFiles = ['dailySchedules.db', 'employees.db', 'locations.db', 'patients.db', 'therapies.db'];
                dbFiles.forEach(function (file) {
                    var srcPath = path.join(devDbPath, file);
                    var destPath = path.join(_this.dbPath, file);
                    if (fs.existsSync(srcPath)) {
                        fs.copyFileSync(srcPath, destPath);
                    }
                });
            }
        }
        // Initialisiere die Datenbanken
        this.db = {
            employees: new Datastore({
                filename: path.join(this.dbPath, 'employees.db'),
                autoload: false,
                timestampData: true
            }),
            patients: new Datastore({
                filename: path.join(this.dbPath, 'patients.db'),
                autoload: false,
                timestampData: true
            }),
            therapies: new Datastore({
                filename: path.join(this.dbPath, 'therapies.db'),
                autoload: false,
                timestampData: true
            }),
            locations: new Datastore({
                filename: path.join(this.dbPath, 'locations.db'),
                autoload: false,
                timestampData: true
            }),
            dailySchedules: new Datastore({
                filename: path.join(this.dbPath, 'dailySchedules.db'),
                autoload: false,
                timestampData: true
            })
        };
        // Indizes erstellen
        this.db.employees.ensureIndex({ fieldName: 'id', unique: true });
        this.db.patients.ensureIndex({ fieldName: 'id', unique: true });
        this.db.therapies.ensureIndex({ fieldName: 'id', unique: true });
        this.db.locations.ensureIndex({ fieldName: 'id', unique: true });
        this.db.dailySchedules.ensureIndex({ fieldName: 'id', unique: true });
        this.db.dailySchedules.ensureIndex({ fieldName: 'date' });
        // Regelmäßige Komprimierung der Datenbanken
        Object.values(this.db).forEach(function (db) {
            db.persistence.setAutocompactionInterval(5000); // Alle 5 Sekunden
        });
    }
    // Methode zum Laden aller Datenbanken
    DatabaseManager.prototype.loadAllDatabases = function () {
        return __awaiter(this, void 0, void 0, function () {
            var counts, _loop_1, this_1, _i, _a, _b, name_1, db;
            var _this = this;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        counts = {};
                        // Zuerst alle Datenbanken laden
                        return [4 /*yield*/, Promise.all(Object.values(this.db).map(function (db) {
                                return _this.promisify(function (cb) { return db.loadDatabase(cb); });
                            }))];
                    case 1:
                        // Zuerst alle Datenbanken laden
                        _c.sent();
                        _loop_1 = function (name_1, db) {
                            var data;
                            return __generator(this, function (_d) {
                                switch (_d.label) {
                                    case 0: return [4 /*yield*/, this_1.promisify(function (cb) { return db.find({}, cb); })];
                                    case 1:
                                        data = _d.sent();
                                        counts[name_1] = data.length;
                                        console.log("[DB LOAD] ".concat(name_1, ": ").concat(data.length, " Eintr\u00E4ge geladen"));
                                        return [2 /*return*/];
                                }
                            });
                        };
                        this_1 = this;
                        _i = 0, _a = Object.entries(this.db);
                        _c.label = 2;
                    case 2:
                        if (!(_i < _a.length)) return [3 /*break*/, 5];
                        _b = _a[_i], name_1 = _b[0], db = _b[1];
                        return [5 /*yield**/, _loop_1(name_1, db)];
                    case 3:
                        _c.sent();
                        _c.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5: return [2 /*return*/, counts];
                }
            });
        });
    };
    // Hilfsmethode zum Promisify von NeDB Callbacks
    DatabaseManager.prototype.promisify = function (operation) {
        return new Promise(function (resolve, reject) {
            operation(function (err, result) {
                if (err)
                    reject(err);
                else
                    resolve(result);
            });
        });
    };
    // Hilfsmethode zum Laden der Datenbank
    DatabaseManager.prototype.loadDatabase = function (collection) {
        return __awaiter(this, void 0, void 0, function () {
            var error_1;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.promisify(function (cb) { return _this.db[collection].loadDatabase(cb); })];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        console.error("[DB ERROR] Fehler beim Laden der Datenbank ".concat(collection, ":"), error_1);
                        throw error_1;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // CRUD Operationen für jede Kollektion
    DatabaseManager.prototype.find = function (collection_1) {
        return __awaiter(this, arguments, void 0, function (collection, query) {
            var result, error_2;
            var _this = this;
            if (query === void 0) { query = {}; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.loadDatabase(collection)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.promisify(function (cb) { return _this.db[collection].find(query, cb); })];
                    case 2:
                        result = _a.sent();
                        console.log("[DB FIND] ".concat(collection, ": ").concat(result.length, " Eintr\u00E4ge gefunden"));
                        return [2 /*return*/, result];
                    case 3:
                        error_2 = _a.sent();
                        console.error("[DB ERROR] Fehler beim Suchen in ".concat(collection, ":"), error_2);
                        throw error_2;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    DatabaseManager.prototype.findOne = function (collection, query) {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_3;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.loadDatabase(collection)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.promisify(function (cb) { return _this.db[collection].findOne(query, cb); })];
                    case 2:
                        result = _a.sent();
                        console.log("[DB FIND_ONE] ".concat(collection, ": ").concat(result ? 'Gefunden' : 'Nicht gefunden'));
                        return [2 /*return*/, result];
                    case 3:
                        error_3 = _a.sent();
                        console.error("[DB ERROR] Fehler beim Suchen eines Eintrags in ".concat(collection, ":"), error_3);
                        throw error_3;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    DatabaseManager.prototype.insert = function (collection, doc) {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_4;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.loadDatabase(collection)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.promisify(function (cb) { return _this.db[collection].insert(doc, cb); })];
                    case 2:
                        result = _a.sent();
                        console.log("[DB INSERT] ".concat(collection, ": Eintrag hinzugef\u00FCgt"));
                        return [2 /*return*/, result];
                    case 3:
                        error_4 = _a.sent();
                        console.error("[DB ERROR] Fehler beim Einf\u00FCgen in ".concat(collection, ":"), error_4);
                        throw error_4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    DatabaseManager.prototype.update = function (collection_1, query_1, update_1) {
        return __awaiter(this, arguments, void 0, function (collection, query, update, options) {
            var result, error_5;
            var _this = this;
            if (options === void 0) { options = {}; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.loadDatabase(collection)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.promisify(function (cb) { return _this.db[collection].update(query, update, options, cb); })];
                    case 2:
                        result = _a.sent();
                        console.log("[DB UPDATE] ".concat(collection, ": ").concat(result, " Eintr\u00E4ge aktualisiert"));
                        return [2 /*return*/, result];
                    case 3:
                        error_5 = _a.sent();
                        console.error("[DB ERROR] Fehler beim Aktualisieren in ".concat(collection, ":"), error_5);
                        throw error_5;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    DatabaseManager.prototype.remove = function (collection_1, query_1) {
        return __awaiter(this, arguments, void 0, function (collection, query, options) {
            var result, error_6;
            var _this = this;
            if (options === void 0) { options = {}; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.loadDatabase(collection)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.promisify(function (cb) { return _this.db[collection].remove(query, options, cb); })];
                    case 2:
                        result = _a.sent();
                        console.log("[DB REMOVE] ".concat(collection, ": ").concat(result, " Eintr\u00E4ge gel\u00F6scht"));
                        return [2 /*return*/, result];
                    case 3:
                        error_6 = _a.sent();
                        console.error("[DB ERROR] Fehler beim L\u00F6schen in ".concat(collection, ":"), error_6);
                        throw error_6;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    // Methode zum Migrieren der JSON-Daten
    DatabaseManager.prototype.migrateFromJson = function (jsonPath) {
        return __awaiter(this, void 0, void 0, function () {
            var jsonContent, jsonData, _i, _a, collection, _b, _c, therapy, err_1, _d, _e, schedule, scheduleToAdd, err_2, _f, _g, _h, collection, data, _j, data_1, item, err_3, error_7;
            return __generator(this, function (_k) {
                switch (_k.label) {
                    case 0:
                        _k.trys.push([0, 25, , 26]);
                        console.log('Starte Migration von:', jsonPath);
                        jsonContent = fs.readFileSync(jsonPath, 'utf8');
                        console.log('JSON-Inhalt gelesen');
                        jsonData = JSON.parse(jsonContent);
                        console.log('JSON geparst:', Object.keys(jsonData));
                        _i = 0, _a = Object.keys(this.db);
                        _k.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        collection = _a[_i];
                        console.log("L\u00F6sche alte Daten aus ".concat(collection, "..."));
                        return [4 /*yield*/, this.remove(collection, {}, { multi: true })];
                    case 2:
                        _k.sent();
                        _k.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4:
                        if (!Array.isArray(jsonData.therapies)) return [3 /*break*/, 10];
                        console.log("F\u00FCge ".concat(jsonData.therapies.length, " Therapien ein..."));
                        _b = 0, _c = jsonData.therapies;
                        _k.label = 5;
                    case 5:
                        if (!(_b < _c.length)) return [3 /*break*/, 10];
                        therapy = _c[_b];
                        _k.label = 6;
                    case 6:
                        _k.trys.push([6, 8, , 9]);
                        return [4 /*yield*/, this.insert('therapies', therapy)];
                    case 7:
                        _k.sent();
                        return [3 /*break*/, 9];
                    case 8:
                        err_1 = _k.sent();
                        console.error('Fehler beim Einfügen einer Therapie:', err_1);
                        return [3 /*break*/, 9];
                    case 9:
                        _b++;
                        return [3 /*break*/, 5];
                    case 10:
                        if (!Array.isArray(jsonData.dailySchedules)) return [3 /*break*/, 16];
                        console.log("F\u00FCge ".concat(jsonData.dailySchedules.length, " Tagespl\u00E4ne ein..."));
                        _d = 0, _e = jsonData.dailySchedules;
                        _k.label = 11;
                    case 11:
                        if (!(_d < _e.length)) return [3 /*break*/, 16];
                        schedule = _e[_d];
                        _k.label = 12;
                    case 12:
                        _k.trys.push([12, 14, , 15]);
                        scheduleToAdd = __assign(__assign({}, schedule), { therapies: schedule.therapies.map(function (t) { return t.id || t; }) });
                        return [4 /*yield*/, this.insert('dailySchedules', scheduleToAdd)];
                    case 13:
                        _k.sent();
                        return [3 /*break*/, 15];
                    case 14:
                        err_2 = _k.sent();
                        console.error('Fehler beim Einfügen eines Tagesplans:', err_2);
                        return [3 /*break*/, 15];
                    case 15:
                        _d++;
                        return [3 /*break*/, 11];
                    case 16:
                        _f = 0, _g = Object.entries(jsonData);
                        _k.label = 17;
                    case 17:
                        if (!(_f < _g.length)) return [3 /*break*/, 24];
                        _h = _g[_f], collection = _h[0], data = _h[1];
                        if (!(collection !== 'therapies' && collection !== 'dailySchedules' && Array.isArray(data))) return [3 /*break*/, 23];
                        console.log("F\u00FCge ".concat(data.length, " Eintr\u00E4ge in ").concat(collection, " ein..."));
                        _j = 0, data_1 = data;
                        _k.label = 18;
                    case 18:
                        if (!(_j < data_1.length)) return [3 /*break*/, 23];
                        item = data_1[_j];
                        _k.label = 19;
                    case 19:
                        _k.trys.push([19, 21, , 22]);
                        return [4 /*yield*/, this.insert(collection, item)];
                    case 20:
                        _k.sent();
                        return [3 /*break*/, 22];
                    case 21:
                        err_3 = _k.sent();
                        console.error("Fehler beim Einf\u00FCgen in ".concat(collection, ":"), err_3);
                        return [3 /*break*/, 22];
                    case 22:
                        _j++;
                        return [3 /*break*/, 18];
                    case 23:
                        _f++;
                        return [3 /*break*/, 17];
                    case 24:
                        console.log('Datenmigration erfolgreich abgeschlossen');
                        return [3 /*break*/, 26];
                    case 25:
                        error_7 = _k.sent();
                        console.error('Fehler bei der Datenmigration:', error_7);
                        throw error_7;
                    case 26: return [2 /*return*/];
                }
            });
        });
    };
    // Getter für die Datenbank-Instanz
    DatabaseManager.prototype.getDatabase = function () {
        return this.db;
    };
    return DatabaseManager;
}());
exports.DatabaseManager = DatabaseManager;
