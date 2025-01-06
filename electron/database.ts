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
    private promisify<T>(operation: (callback: (err: Error | null, result: T) => void) => void): Promise<T> {
        return new Promise((resolve, reject) => {
            operation((err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
    }

    // CRUD Operationen für jede Kollektion
    async find<T>(collection: keyof Database, query: any = {}): Promise<T[]> {
        return this.promisify<T[]>(cb => this.db[collection].find(query, cb));
    }

    async findOne<T>(collection: keyof Database, query: any): Promise<T | null> {
        return this.promisify<T | null>(cb => this.db[collection].findOne(query, cb));
    }

    async insert<T>(collection: keyof Database, doc: T): Promise<T> {
        return this.promisify<T>(cb => this.db[collection].insert(doc, cb));
    }

    async update(collection: keyof Database, query: any, update: any, options: any = {}): Promise<number> {
        return this.promisify<number>(cb => this.db[collection].update(query, update, options, cb));
    }

    async remove(collection: keyof Database, query: any, options: any = {}): Promise<number> {
        return this.promisify<number>(cb => this.db[collection].remove(query, options, cb));
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

            // Füge neue Daten ein
            for (const [collection, data] of Object.entries(jsonData)) {
                if (Array.isArray(data)) {
                    console.log(`Füge ${data.length} Einträge in ${collection} ein...`);
                    for (const item of data) {
                        try {
                            await this.insert(collection as keyof Database, item);
                        } catch (err) {
                            console.error(`Fehler beim Einfügen in ${collection}:`, err);
                            console.error('Problematischer Datensatz:', item);
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
