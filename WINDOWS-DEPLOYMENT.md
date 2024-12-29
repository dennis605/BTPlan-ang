# Windows Deployment Anleitung für BTPlan

## Voraussetzungen

- Node.js (LTS Version)
- npm (kommt mit Node.js)
- Git (optional, für Versionskontrolle)

## Build-Prozess

1. Öffnen Sie die Kommandozeile im Projektverzeichnis
2. Führen Sie die Datei `build-windows.bat` aus
3. Warten Sie, bis der Build-Prozess abgeschlossen ist
4. Der fertige Installer befindet sich im `release` Ordner

## Installation auf Zielrechner

1. Führen Sie die Datei `BTPlan-Setup-0.0.0.exe` aus dem `release` Ordner aus
2. Der Installer führt automatisch alle notwendigen Schritte durch
3. Nach der Installation wird eine Desktop-Verknüpfung erstellt
4. Die App kann über das Startmenü oder die Desktop-Verknüpfung gestartet werden

## Wichtige Hinweise

- Die Datenbank (db.json) wird automatisch mit der Anwendung installiert
- Alle Daten werden lokal auf dem Rechner gespeichert
- Updates können durch einfaches Ausführen des neuen Installers durchgeführt werden

## Fehlerbehebung

Falls die App nicht startet:
1. Prüfen Sie, ob der Port 3000 frei ist
2. Starten Sie den Computer neu
3. Deinstallieren und reinstallieren Sie die App bei anhaltenden Problemen

## Deinstallation

1. Öffnen Sie die Windows-Systemsteuerung
2. Wählen Sie "Programme und Funktionen"
3. Wählen Sie "BTPlan" aus der Liste
4. Klicken Sie auf "Deinstallieren"
