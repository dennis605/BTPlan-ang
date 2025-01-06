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

    // Methode zum Laden aller Datenbanken
    async loadAllDatabases(): Promise<{ [key: string]: number }> {
        const counts: { [key: string]: number } = {};
        
        for (const [name, db] of Object.entries(this.db)) {
            await this.promisify(cb => db.loadDatabase(cb));
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

    // CRUD Operationen für jede Kollektion
    async find<T>(collection: keyof Database, query: any = {}): Promise<T[]> {
        await this.promisify(cb => this.db[collection].loadDatabase(cb));
        return this.promisify<T[]>(cb => this.db[collection].find(query, cb));
    }

    async findOne<T>(collection: keyof Database, query: any): Promise<T | null> {
        await this.promisify(cb => this.db[collection].loadDatabase(cb));
        return this.promisify<T | null>(cb => this.db[collection].findOne(query, cb));
    }

    async insert<T>(collection: keyof Database, doc: T): Promise<T> {
        const result = await this.promisify<T>(cb => this.db[collection].insert(doc, cb));
        await this.promisify(cb => this.db[collection].loadDatabase(cb));
        return result;
    }

    async update(collection: keyof Database, query: any, update: any, options: any = {}): Promise<number> {
        const result = await this.promisify<number>(cb => this.db[collection].update(query, update, options, cb));
        await this.promisify(cb => this.db[collection].loadDatabase(cb));
        return result;
    }

    async remove(collection: keyof Database, query: any, options: any = {}): Promise<number> {
        const result = await this.promisify<number>(cb => this.db[collection].remove(query, options, cb));
        await this.promisify(cb => this.db[collection].loadDatabase(cb));
        return result;
    }

    // Getter für die Datenbank-Instanz
    getDatabase(): Database {
        return this.db;
    }
}
