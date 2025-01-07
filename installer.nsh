!define PRODUCT_GUID "B6A98E78-5DAD-4F6E-B6E9-C6E7B1A6F5D2"

!macro customInit
  ; Prüfe zuerst, ob BTPlan überhaupt installiert ist
  ReadRegStr $R1 HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\{${PRODUCT_GUID}}" "UninstallString"
  ${If} $R1 == ""
    ; Keine vorherige Installation gefunden
    StrCpy $R2 "CLEAN_INSTALL"
  ${Else}
    StrCpy $R2 "UPDATE"
  ${EndIf}

  ; Beende BTPlan nur wenn es läuft
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
