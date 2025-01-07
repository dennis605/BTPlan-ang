@echo off
setlocal EnableDelayedExpansion
echo BTPlan Bereinigungstool
echo =====================
echo.
echo WARNUNG: Dieses Tool entfernt BTPlan vollstaendig vom System.
echo Alle Daten und Einstellungen werden geloescht.
echo.
set /p confirm=Moechten Sie fortfahren? (J/N): 
if /i not "!confirm!"=="J" (
    echo.
    echo Vorgang abgebrochen.
    pause
    exit /b
)
echo.

REM Mit Administratorrechten neu starten falls notwendig
NET SESSION >nul 2>&1
if %errorLevel% == 0 (
    echo Administrator-Rechte: OK
) else (
    echo Starte Script mit Administrator-Rechte...
    powershell -Command "Start-Process '%~dpnx0' -Verb RunAs"
    exit /b
)

echo.
echo 1. Beende laufende BTPlan-Prozesse...
taskkill /F /IM "BTPlan.exe" 2>nul
timeout /t 2 /nobreak >nul

echo.
echo 2. Suche und entferne Registry-Eintraege...
echo ----------------------------------------
for /f "tokens=*" %%G in ('reg query "HKCU\Software\Microsoft\Windows\CurrentVersion\Uninstall" /f "BTPlan" /k 2^>nul ^| findstr /i "HKEY_"') do (
    echo Gefunden: %%G
    echo Entferne Registry-Eintrag...
    reg delete "%%G" /f
)
for /f "tokens=*" %%G in ('reg query "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall" /f "BTPlan" /k 2^>nul ^| findstr /i "HKEY_"') do (
    echo Gefunden: %%G
    echo Entferne Registry-Eintrag...
    reg delete "%%G" /f
)

echo Pruefe zusaetzliche Registry-Pfade...
reg delete "HKCU\Software\BTPlan" /f 2>nul
if !errorlevel! equ 0 echo Registry-Eintrag in HKCU\Software\BTPlan entfernt
reg delete "HKLM\SOFTWARE\BTPlan" /f 2>nul
if !errorlevel! equ 0 echo Registry-Eintrag in HKLM\SOFTWARE\BTPlan entfernt

echo.
echo 3. Loesche Installationsverzeichnisse...
rd /s /q "%LocalAppData%\Programs\BTPlan" 2>nul
rd /s /q "C:\Program Files\BTPlan" 2>nul
rd /s /q "C:\Program Files (x86)\BTPlan" 2>nul

echo.
echo 4. Bereinige AppData...
rd /s /q "%AppData%\BTPlan" 2>nul
rd /s /q "%LocalAppData%\BTPlan" 2>nul
rd /s /q "%LocalAppData%\Programs\btplan" 2>nul
rd /s /q "%LocalAppData%\electron-builder" 2>nul
rd /s /q "%LocalAppData%\SquirrelSetup" 2>nul
rd /s /q "%LocalAppData%\Programs\BTPlan-arm64" 2>nul

echo.
echo 5. Bereinige NSIS-Installer Cache...
rd /s /q "%LocalAppData%\Package Cache" 2>nul
rd /s /q "%ProgramData%\Package Cache" 2>nul

echo.
echo 6. Loesche Desktop-Verknuepfung...
del /f /q "%Public%\Desktop\BTPlan.lnk" 2>nul
del /f /q "%UserProfile%\Desktop\BTPlan.lnk" 2>nul

echo.
echo 7. Loesche Startmenue-Eintraege...
rd /s /q "%AppData%\Microsoft\Windows\Start Menu\Programs\BTPlan" 2>nul
rd /s /q "%ProgramData%\Microsoft\Windows\Start Menu\Programs\BTPlan" 2>nul

echo.
echo.
echo =====================
echo Bereinigung abgeschlossen!
echo =====================
echo Bitte starten Sie den Computer neu, bevor Sie BTPlan neu installieren.
echo.
pause
