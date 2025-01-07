const Datastore = require('nedb');
import * as path from 'path';
import { app } from 'electron';
import * as fs from 'fs';

export interface Database {
    employees: any;
    patients: any;
    therapies: any;
    locations: any;
    dailySchedules: any;
}

export class DatabaseManager {
    private db: Database;
    private dbPath: string;

    constructor() {
        // Bestimme den Pfad für die Datenbank-Dateien
        this.dbPath = app.isPackaged
            ? path.join(app.getPath('userData'), 'database')
            : path.join(__dirname, '..', 'database');

        // Stelle sicher, dass das Datenbankverzeichnis existiert
        if (!fs.existsSync(this.dbPath)) {
            fs.mkdirSync(this.dbPath, { recursive: true });
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
        Object.values(this.db).forEach(db => {
            db.persistence.setAutocompactionInterval(5000); // Alle 5 Sekunden
        });
    }

    // Methode zum Laden aller Datenbanken
    async loadAllDatabases(): Promise<{ [key: string]: number }> {
        const counts: { [key: string]: number } = {};
        
        // Zuerst alle Datenbanken laden
        await Promise.all(Object.values(this.db).map(db => 
            this.promisify(cb => db.loadDatabase(cb))
        ));

        // Dann die Daten abrufen
        for (const [name, db] of Object.entries(this.db)) {
            const data = await this.promisify<any[]>(cb => db.find({}, cb));
            counts[name] = data.length;
            console.log(`[DB LOAD] ${name}: ${data.length} Einträge geladen`);
        }

        return counts;
    }

    // Hilfsmethode zum Promisify von NeDB Callbacks
    private promisify<T>(operation: (callback: (err: Error | null, result: T) => void) => void): Promise<T> {
        return new Promise((resolve, reject) => {
            operation((err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
    }

    // Hilfsmethode zum Laden der Datenbank
    private async loadDatabase(collection: keyof Database): Promise<void> {
        try {
            await this.promisify(cb => this.db[collection].loadDatabase(cb));
        } catch (error) {
            console.error(`[DB ERROR] Fehler beim Laden der Datenbank ${collection}:`, error);
            throw error;
        }
    }

    // CRUD Operationen für jede Kollektion
    async find<T>(collection: keyof Database, query: any = {}): Promise<T[]> {
        try {
            await this.loadDatabase(collection);
            const result = await this.promisify<T[]>(cb => this.db[collection].find(query, cb));
            console.log(`[DB FIND] ${collection}: ${result.length} Einträge gefunden`);
            return result;
        } catch (error) {
            console.error(`[DB ERROR] Fehler beim Suchen in ${collection}:`, error);
            throw error;
        }
    }

    async findOne<T>(collection: keyof Database, query: any): Promise<T | null> {
        try {
            await this.loadDatabase(collection);
            const result = await this.promisify<T | null>(cb => this.db[collection].findOne(query, cb));
            console.log(`[DB FIND_ONE] ${collection}: ${result ? 'Gefunden' : 'Nicht gefunden'}`);
            return result;
        } catch (error) {
            console.error(`[DB ERROR] Fehler beim Suchen eines Eintrags in ${collection}:`, error);
            throw error;
        }
    }

    async insert<T>(collection: keyof Database, doc: T): Promise<T> {
        try {
            await this.loadDatabase(collection);
            const result = await this.promisify<T>(cb => this.db[collection].insert(doc, cb));
            console.log(`[DB INSERT] ${collection}: Eintrag hinzugefügt`);
            return result;
        } catch (error) {
            console.error(`[DB ERROR] Fehler beim Einfügen in ${collection}:`, error);
            throw error;
        }
    }

    async update(collection: keyof Database, query: any, update: any, options: any = {}): Promise<number> {
        try {
            await this.loadDatabase(collection);
            const result = await this.promisify<number>(cb => this.db[collection].update(query, update, options, cb));
            console.log(`[DB UPDATE] ${collection}: ${result} Einträge aktualisiert`);
            return result;
        } catch (error) {
            console.error(`[DB ERROR] Fehler beim Aktualisieren in ${collection}:`, error);
            throw error;
        }
    }

    async remove(collection: keyof Database, query: any, options: any = {}): Promise<number> {
        try {
            await this.loadDatabase(collection);
            const result = await this.promisify<number>(cb => this.db[collection].remove(query, options, cb));
            console.log(`[DB REMOVE] ${collection}: ${result} Einträge gelöscht`);
            return result;
        } catch (error) {
            console.error(`[DB ERROR] Fehler beim Löschen in ${collection}:`, error);
            throw error;
        }
    }

    // Methode zum Migrieren der JSON-Daten
    async migrateFromJson(jsonPath: string): Promise<void> {
        try {
            console.log('Starte Migration von:', jsonPath);
            const jsonContent = fs.readFileSync(jsonPath, 'utf8');
            console.log('JSON-Inhalt gelesen');
            const jsonData = JSON.parse(jsonContent);
            console.log('JSON geparst:', Object.keys(jsonData));

            // Lösche alte Daten
            for (const collection of Object.keys(this.db)) {
                console.log(`Lösche alte Daten aus ${collection}...`);
                await this.remove(collection as keyof Database, {}, { multi: true });
            }

            // Füge zuerst alle Therapien ein
            if (Array.isArray(jsonData.therapies)) {
                console.log(`Füge ${jsonData.therapies.length} Therapien ein...`);
                for (const therapy of jsonData.therapies) {
                    try {
                        await this.insert('therapies', therapy);
                    } catch (err) {
                        console.error('Fehler beim Einfügen einer Therapie:', err);
                    }
                }
            }

            // Dann die Tagespläne, aber nur mit Therapie-IDs
            if (Array.isArray(jsonData.dailySchedules)) {
                console.log(`Füge ${jsonData.dailySchedules.length} Tagespläne ein...`);
                for (const schedule of jsonData.dailySchedules) {
                    try {
                        const scheduleToAdd = {
                            ...schedule,
                            therapies: schedule.therapies.map((t: any) => t.id || t)
                        };
                        await this.insert('dailySchedules', scheduleToAdd);
                    } catch (err) {
                        console.error('Fehler beim Einfügen eines Tagesplans:', err);
                    }
                }
            }

            // Füge andere Daten ein
            for (const [collection, data] of Object.entries(jsonData)) {
                if (collection !== 'therapies' && collection !== 'dailySchedules' && Array.isArray(data)) {
                    console.log(`Füge ${data.length} Einträge in ${collection} ein...`);
                    for (const item of data) {
                        try {
                            await this.insert(collection as keyof Database, item);
                        } catch (err) {
                            console.error(`Fehler beim Einfügen in ${collection}:`, err);
                        }
                    }
                }
            }

            console.log('Datenmigration erfolgreich abgeschlossen');
        } catch (error) {
            console.error('Fehler bei der Datenmigration:', error);
            throw error;
        }
    }

    // Getter für die Datenbank-Instanz
    getDatabase(): Database {
        return this.db;
    }
}
