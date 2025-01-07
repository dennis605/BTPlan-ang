!macro customInit
  ; Beende BTPlan vor der Installation
  ; Versuche mehrmals den Prozess zu beenden
  StrCpy $1 0
  ${Do}
    nsProcess::_FindProcess "BTPlan.exe"
    Pop $R0
    ${If} $R0 = 0
      nsProcess::_KillProcess "BTPlan.exe"
      Sleep 3000
    ${Else}
      ${Break}
    ${EndIf}
    IntOp $1 $1 + 1
    ${If} $1 > 2
      ${Break}
    ${EndIf}
  ${Loop}
!macroend

!macro customUnInit
  ; Beende BTPlan vor der Deinstallation
  ; Versuche mehrmals den Prozess zu beenden
  StrCpy $1 0
  ${Do}
    nsProcess::_FindProcess "BTPlan.exe"
    Pop $R0
    ${If} $R0 = 0
      nsProcess::_KillProcess "BTPlan.exe"
      Sleep 3000
    ${Else}
      ${Break}
    ${EndIf}
    IntOp $1 $1 + 1
    ${If} $1 > 2
      ${Break}
    ${EndIf}
  ${Loop}
!macroend
