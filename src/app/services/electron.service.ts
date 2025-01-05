import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';

// Erweitere das Window-Interface um die Electron-API
declare global {
  interface Window {
    electronAPI: {
      database: {
        getAll: (collection: string) => Promise<any[]>;
        add: (collection: string, item: any) => Promise<any>;
        update: (collection: string, id: string, updates: any) => Promise<any>;
        delete: (collection: string, id: string) => Promise<string>;
      };
    };
  }
}

@Injectable({
  providedIn: 'root'
})
export class ElectronService {
  private isElectron: boolean;

  constructor() {
    // Prüfe ob wir in Electron laufen
    this.isElectron = !!(window && window.electronAPI);
  }

  // Generische Methode zum Abrufen aller Einträge einer Collection
  getAll<T>(collection: string): Observable<T[]> {
    if (this.isElectron) {
      return from(window.electronAPI.database.getAll(collection));
    }
    throw new Error('Nicht in Electron-Umgebung');
  }

  // Generische Methode zum Hinzufügen eines Eintrags
  add<T>(collection: string, item: T): Observable<T> {
    if (this.isElectron) {
      return from(window.electronAPI.database.add(collection, item));
    }
    throw new Error('Nicht in Electron-Umgebung');
  }

  // Generische Methode zum Aktualisieren eines Eintrags
  update<T>(collection: string, id: string, updates: Partial<T>): Observable<T> {
    if (this.isElectron) {
      return from(window.electronAPI.database.update(collection, id, updates));
    }
    throw new Error('Nicht in Electron-Umgebung');
  }

  // Generische Methode zum Löschen eines Eintrags
  delete(collection: string, id: string): Observable<string> {
    if (this.isElectron) {
      return from(window.electronAPI.database.delete(collection, id));
    }
    throw new Error('Nicht in Electron-Umgebung');
  }
}
