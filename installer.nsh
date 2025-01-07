!include LogicLib.nsh
!include MUI2.nsh
!include FileFunc.nsh

!define APP_NAME "BTPlan"

!macro customInit
  ; Setze Standardpfad
  StrCpy $INSTDIR "$LOCALAPPDATA\Programs\${APP_NAME}-ARM64"

  ; Prüfe ob Verzeichnis existiert und leer ist
  ${If} ${FileExists} "$INSTDIR\*.*"
    MessageBox MB_YESNO|MB_ICONQUESTION "Das Zielverzeichnis existiert bereits. Möchten Sie es löschen und neu installieren?" IDYES deleteDir IDNO selectDir
    deleteDir:
      RMDir /r "$INSTDIR"
      Goto setDir
    selectDir:
      nsDialogs::SelectFolderDialog "Wählen Sie einen anderen Installationsort" "$INSTDIR"
      Pop $0
      ${If} $0 != "error"
        StrCpy $INSTDIR $0
      ${EndIf}
  ${EndIf}
  setDir:
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
