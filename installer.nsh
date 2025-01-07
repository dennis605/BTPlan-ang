!include LogicLib.nsh
!include MUI2.nsh

!define APP_NAME "BTPlan"

Function .onInit
    ; Standard-Installationsverzeichnis vorschlagen
    StrCpy $INSTDIR "$LOCALAPPDATA\Programs\${APP_NAME}-ARM64"

    ; Dialog für Installationsort anzeigen
    MessageBox MB_YESNO|MB_ICONQUESTION "Möchten Sie den Standard-Installationsort verwenden?$\n$\nStandard: $INSTDIR" IDYES useDefault
    
    ; Wenn Nein, dann Verzeichnisauswahl anzeigen
    nsDialogs::SelectFolderDialog "Wählen Sie den Installationsort" "$INSTDIR"
    Pop $0
    StrCmp $0 "error" useDefault
    StrCpy $INSTDIR $0
    
    useDefault:
FunctionEnd

!macro customInit
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
