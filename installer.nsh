!macro customInit
  ; Beende BTPlan vor der Installation
  nsProcess::_FindProcess "BTPlan.exe"
  Pop $R0
  ${If} $R0 = 0
    nsProcess::_KillProcess "BTPlan.exe"
    Sleep 2000
  ${EndIf}
!macroend

!macro customUnInit
  ; Beende BTPlan vor der Deinstallation
  nsProcess::_FindProcess "BTPlan.exe"
  Pop $R0
  ${If} $R0 = 0
    nsProcess::_KillProcess "BTPlan.exe"
    Sleep 2000
  ${EndIf}
!macroend
