@echo off
setlocal
title Inkspirations Studios Photo Index - Live Progress
cd /d "%~dp0"

echo Inkspirations Studios Complete Photo and Lightroom Index
echo Source drives are read-only. Evidence files will not be changed.
echo Results are written continuously to a timestamped run folder.
echo.

powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0PhotoIndex.ps1"
set "RESULT=%ERRORLEVEL%"

echo.
if not "%RESULT%"=="0" (
  echo The scan stopped or failed verification.
  echo Partial results and SCAN_STATUS.log remain under PHOTO_INDEX_OUTPUT.
) else (
  echo The scan completed and CSV row counts were verified.
  echo Open PHOTO_INDEX_OUTPUT\LATEST_RUN.txt for the exact result folder.
)
echo.
echo This window will remain open until you press a key.
pause
exit /b %RESULT%
