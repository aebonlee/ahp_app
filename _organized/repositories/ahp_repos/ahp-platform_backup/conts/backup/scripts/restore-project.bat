@echo off
echo ============================================
echo AHP Research Platform - Project Restore
echo ============================================
echo.

set "BACKUP_DIR=C:\Users\ASUS\ahp-research-platform\backup"
set "PROJECT_DIR=C:\Users\ASUS\ahp-research-platform"

echo Select restore method:
echo 1. Git tag restore (Recommended)
echo 2. Stable version archive
echo 3. Latest complete backup
echo 4. Cancel
echo.
set /p choice="Enter choice (1-4): "

if "%choice%"=="4" goto :cancel
if "%choice%"=="" goto :cancel

echo.
echo Selected method: %choice%
echo.

if "%choice%"=="1" goto :git_restore
if "%choice%"=="2" goto :stable_archive
if "%choice%"=="3" goto :latest_backup
goto :invalid_choice

:git_restore
echo Git Tag Restore - v1.0-evaluation-test-complete
echo.
cd /d "%PROJECT_DIR%"
if errorlevel 1 (
    echo Error: Could not access project directory
    echo Please ensure the project exists at: %PROJECT_DIR%
    goto :end
)

git checkout v1.0-evaluation-test-complete
if errorlevel 1 (
    echo Warning: Git tag restore failed. Trying stable archive...
    goto :stable_archive
)

echo Git restore successful!
goto :install_deps

:stable_archive
echo Stable Version Archive Restore
echo.
cd /d "C:\Users\ASUS"

echo Backing up current project...
if exist "%PROJECT_DIR%" (
    if exist "%PROJECT_DIR%-backup" rmdir /s /q "%PROJECT_DIR%-backup"
    move "%PROJECT_DIR%" "%PROJECT_DIR%-backup"
)

echo Extracting stable version...
tar -xzf "%BACKUP_DIR%\stable-versions\v1.0-evaluation-test-complete-20250829\v1.0-evaluation-test-complete-20250829-source.tar.gz"
if errorlevel 1 (
    echo Error: Failed to extract stable version
    if exist "%PROJECT_DIR%-backup" move "%PROJECT_DIR%-backup" "%PROJECT_DIR%"
    goto :end
)

cd /d "%PROJECT_DIR%"
goto :install_deps

:latest_backup
echo Latest Complete Backup Restore
echo.
cd /d "C:\Users\ASUS"

echo Finding latest backup...
for /f "tokens=*" %%i in ('dir /b /o-n "%BACKUP_DIR%\ahp-project\ahp-research-platform-complete-*.tar.gz" 2^>nul') do (
    set "LATEST_BACKUP=%%i"
    goto :found_latest
)

echo Error: No complete backup found!
goto :end

:found_latest
echo Found latest backup: %LATEST_BACKUP%
echo.

echo Backing up current project...
if exist "%PROJECT_DIR%" (
    if exist "%PROJECT_DIR%-backup" rmdir /s /q "%PROJECT_DIR%-backup"
    move "%PROJECT_DIR%" "%PROJECT_DIR%-backup"
)

echo Extracting latest backup...
tar -xzf "%BACKUP_DIR%\ahp-project\%LATEST_BACKUP%"
if errorlevel 1 (
    echo Error: Failed to extract latest backup
    if exist "%PROJECT_DIR%-backup" move "%PROJECT_DIR%-backup" "%PROJECT_DIR%"
    goto :end
)

cd /d "%PROJECT_DIR%"
goto :install_deps

:install_deps
echo.
echo Installing dependencies...
npm install
if errorlevel 1 (
    echo Warning: npm install encountered issues
    echo Please check manually
)

echo.
echo Testing build...
npm run build:frontend
if errorlevel 1 (
    echo Warning: Build test failed
    echo Please verify project configuration
    goto :end
)

echo.
echo ============================================
echo Restore completed successfully!
echo.
echo Project location: %PROJECT_DIR%
echo GitHub: https://github.com/aebonlee/ahp-research-platform
echo.
echo To start development server: npm start
echo ============================================
goto :end

:invalid_choice
echo Invalid choice. Please select 1-4.
goto :end

:cancel
echo Restore cancelled.
goto :end

:end
echo.
pause