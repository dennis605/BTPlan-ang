!include LogicLib.nsh
!include FileFunc.nsh

!macro customInit
  ; Setze Standardwerte
  StrCpy $R2 "CLEAN_INSTALL"
  
  ; Suche nach existierenden Installationen in verschiedenen Verzeichnissen
  ${If} ${FileExists} "$LOCALAPPDATA\Programs\BTPlan\BTPlan.exe"
  ${OrIf} ${FileExists} "$PROGRAMFILES\BTPlan\BTPlan.exe"
  ${OrIf} ${FileExists} "$PROGRAMFILES64\BTPlan\BTPlan.exe"
    MessageBox MB_YESNO|MB_ICONQUESTION "Eine bestehende BTPlan-Installation wurde gefunden. Möchten Sie diese entfernen und neu installieren?" IDYES remove IDNO continue
    remove:
      ExecWait 'cmd.exe /c "$TEMP\clean-btplan.bat"'
      Goto continue
    continue:
  ${EndIf}

  ; Beende BTPlan falls es läuft
  nsProcess::_FindProcess "BTPlan.exe"
  Pop $R0
  ${If} $R0 = 0
    MessageBox MB_ICONINFORMATION|MB_OK "BTPlan wird beendet..."
    nsProcess::_KillProcess "BTPlan.exe"
    Sleep 2000
  ${EndIf}
!macroend

!macro customUnInit
  ; Beende BTPlan vor der Deinstallation
  ; Prüfe ob BTPlan läuft und beende es nur wenn nötig
  nsProcess::_FindProcess "BTPlan.exe"
  Pop $R0
  ${If} $R0 = 0
    MessageBox MB_ICONINFORMATION|MB_OK "BTPlan wird beendet..."
    nsProcess::_KillProcess "BTPlan.exe"
    Sleep 2000
  ${EndIf}
!macroend
