@echo off
echo Building BTPlan for Windows...

:: Cleanup
echo Cleaning up previous builds...
if exist "release" rd /s /q "release"
if exist "dist" rd /s /q "dist"

:: Install dependencies
echo Installing dependencies...
call npm install

:: Build Angular app
echo Building Angular app...
call ng build --configuration production

:: Build Electron app
echo Building Electron app...
call tsc electron/main.ts

:: Create Windows installer
echo Creating Windows installer...
call electron-builder build --win

echo Build complete! Check the release folder for the installer.
pause
