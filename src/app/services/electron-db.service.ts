import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';

interface ElectronWindow extends Window {
  electron: {
    ipcRenderer: {
      invoke(channel: string, ...args: any[]): Promise<any>;
    };
  };
}

declare const window: ElectronWindow;

@Injectable({
  providedIn: 'root'
})
export class ElectronDbService {
  constructor() {}

  // Generische Get-Methode für alle Kollektionen
  get<T>(collection: string): Observable<T[]> {
    return from(window.electron.ipcRenderer.invoke('db-get', collection))
      .pipe(map(result => result as T[]));
  }

  // Generische Add-Methode
  add<T>(collection: string, item: T): Observable<T> {
    return from(window.electron.ipcRenderer.invoke('db-add', { collection, item }))
      .pipe(map(result => result as T));
  }

  // Generische Update-Methode
  update<T>(collection: string, id: string, updates: Partial<T>): Observable<T> {
    return from(window.electron.ipcRenderer.invoke('db-update', { collection, id, updates }))
      .pipe(map(result => result as T));
  }

  // Generische Delete-Methode
  delete(collection: string, id: string): Observable<string> {
    return from(window.electron.ipcRenderer.invoke('db-delete', { collection, id }))
      .pipe(map(result => result as string));
  }
}
