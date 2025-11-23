@echo off
REM Force Windows PowerShell 5 (pas pwsh)
setlocal
set PS=%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe
"%PS%" -NoProfile -ExecutionPolicy Bypass -File "%~dp0install-dev-basics_robuste.ps1" %*
set INSTALLER_EXIT_CODE=%ERRORLEVEL%
echo.
echo Press any key to close this window...
pause >nul
endlocal & exit /b %INSTALLER_EXIT_CODE%
