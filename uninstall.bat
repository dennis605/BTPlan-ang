@echo off
echo Beende BTPlan Prozesse...
taskkill /F /IM btplan.exe 2>nul
taskkill /F /IM "BTPlan.exe" 2>nul

echo Entferne Programmdateien...
rd /s /q "%ProgramFiles%\btplan" 2>nul
rd /s /q "%ProgramFiles(x86)%\btplan" 2>nul
rd /s /q "%LocalAppData%\Programs\btplan" 2>nul

echo Entferne Anwendungsdaten...
rd /s /q "%AppData%\btplan" 2>nul
rd /s /q "%LocalAppData%\btplan" 2>nul
rd /s /q "%LocalAppData%\btplan-updater" 2>nul

echo Entferne Desktop-Verknüpfung...
del /f /q "%Public%\Desktop\BTPlan.lnk" 2>nul
del /f /q "%UserProfile%\Desktop\BTPlan.lnk" 2>nul

echo Entferne Startmenü-Einträge...
rd /s /q "%ProgramData%\Microsoft\Windows\Start Menu\Programs\BTPlan" 2>nul
rd /s /q "%AppData%\Microsoft\Windows\Start Menu\Programs\BTPlan" 2>nul

echo Bereinigung abgeschlossen.
pause
