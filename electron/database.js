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
exports.DatabaseManager = void 0;
var Datastore = require('nedb');
var path = require("path");
var electron_1 = require("electron");
var fs = require("fs");
var DatabaseManager = /** @class */ (function () {
    function DatabaseManager() {
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
            employees: new Datastore({ filename: path.join(this.dbPath, 'employees.db'), autoload: true }),
            patients: new Datastore({ filename: path.join(this.dbPath, 'patients.db'), autoload: true }),
            therapies: new Datastore({ filename: path.join(this.dbPath, 'therapies.db'), autoload: true }),
            locations: new Datastore({ filename: path.join(this.dbPath, 'locations.db'), autoload: true }),
            dailySchedules: new Datastore({ filename: path.join(this.dbPath, 'dailySchedules.db'), autoload: true })
        };
        // Indizes erstellen
        this.db.employees.ensureIndex({ fieldName: 'id', unique: true });
        this.db.patients.ensureIndex({ fieldName: 'id', unique: true });
        this.db.therapies.ensureIndex({ fieldName: 'id', unique: true });
        this.db.locations.ensureIndex({ fieldName: 'id', unique: true });
        this.db.dailySchedules.ensureIndex({ fieldName: 'id', unique: true });
    }
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
    // CRUD Operationen für jede Kollektion
    DatabaseManager.prototype.find = function (collection_1) {
        return __awaiter(this, arguments, void 0, function (collection, query) {
            var _this = this;
            if (query === void 0) { query = {}; }
            return __generator(this, function (_a) {
                return [2 /*return*/, this.promisify(function (cb) { return _this.db[collection].find(query, cb); })];
            });
        });
    };
    DatabaseManager.prototype.findOne = function (collection, query) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, this.promisify(function (cb) { return _this.db[collection].findOne(query, cb); })];
            });
        });
    };
    DatabaseManager.prototype.insert = function (collection, doc) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, this.promisify(function (cb) { return _this.db[collection].insert(doc, cb); })];
            });
        });
    };
    DatabaseManager.prototype.update = function (collection_1, query_1, update_1) {
        return __awaiter(this, arguments, void 0, function (collection, query, update, options) {
            var _this = this;
            if (options === void 0) { options = {}; }
            return __generator(this, function (_a) {
                return [2 /*return*/, this.promisify(function (cb) { return _this.db[collection].update(query, update, options, cb); })];
            });
        });
    };
    DatabaseManager.prototype.remove = function (collection_1, query_1) {
        return __awaiter(this, arguments, void 0, function (collection, query, options) {
            var _this = this;
            if (options === void 0) { options = {}; }
            return __generator(this, function (_a) {
                return [2 /*return*/, this.promisify(function (cb) { return _this.db[collection].remove(query, options, cb); })];
            });
        });
    };
    // Methode zum Migrieren der JSON-Daten
    DatabaseManager.prototype.migrateFromJson = function (jsonPath) {
        return __awaiter(this, void 0, void 0, function () {
            var jsonData, _loop_1, _i, _a, _b, collection, data, error_1;
            var _this = this;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 6, , 7]);
                        jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
                        // Lösche alte Daten
                        return [4 /*yield*/, Promise.all(Object.keys(this.db).map(function (collection) {
                                return _this.remove(collection, {}, { multi: true });
                            }))];
                    case 1:
                        // Lösche alte Daten
                        _c.sent();
                        _loop_1 = function (collection, data) {
                            return __generator(this, function (_d) {
                                switch (_d.label) {
                                    case 0:
                                        if (!Array.isArray(data)) return [3 /*break*/, 2];
                                        return [4 /*yield*/, Promise.all(data.map(function (item) {
                                                return _this.insert(collection, item);
                                            }))];
                                    case 1:
                                        _d.sent();
                                        _d.label = 2;
                                    case 2: return [2 /*return*/];
                                }
                            });
                        };
                        _i = 0, _a = Object.entries(jsonData);
                        _c.label = 2;
                    case 2:
                        if (!(_i < _a.length)) return [3 /*break*/, 5];
                        _b = _a[_i], collection = _b[0], data = _b[1];
                        return [5 /*yield**/, _loop_1(collection, data)];
                    case 3:
                        _c.sent();
                        _c.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5:
                        console.log('Datenmigration abgeschlossen');
                        return [3 /*break*/, 7];
                    case 6:
                        error_1 = _c.sent();
                        console.error('Fehler bei der Datenmigration:', error_1);
                        throw error_1;
                    case 7: return [2 /*return*/];
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
