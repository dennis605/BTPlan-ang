!include LogicLib.nsh

!define MULTIUSER_INSTALLMODE_INSTDIR "${localappdata}\Programs\BTPlan-ARM64"
!define INSTALL_DIR "${localappdata}\Programs\BTPlan-ARM64"

Function .onInit
    StrCpy $INSTDIR "${INSTALL_DIR}"
FunctionEnd

!macro customInit
    SetOutPath "$INSTDIR"
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
