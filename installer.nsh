!define PRODUCT_GUID "B6A98E78-5DAD-4F6E-B6E9-C6E7B1A6F5D2"

!macro customInit
  ; Prüfe zuerst, ob BTPlan überhaupt installiert ist
  ReadRegStr $R1 HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\{${PRODUCT_GUID}}" "UninstallString"
  ${If} $R1 != ""
    ; Prüfe ob der Installationspfad noch existiert
    ReadRegStr $R3 HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\{${PRODUCT_GUID}}" "InstallLocation"
    ${If} ${FileExists} "$R3\BTPlan.exe"
      StrCpy $R2 "UPDATE"
    ${Else}
      ; Installation nicht gefunden, Registry bereinigen
      DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\{${PRODUCT_GUID}}"
      DeleteRegKey HKCU "Software\BTPlan"
      StrCpy $R2 "CLEAN_INSTALL"
    ${EndIf}
  ${Else}
    StrCpy $R2 "CLEAN_INSTALL"
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
