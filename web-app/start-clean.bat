@echo off
echo ========================================
echo Nettoyage du cache Vite et demarrage
echo ========================================

REM Supprime le cache Vite
if exist "node_modules\.vite" (
    echo Suppression du cache Vite...
    rd /s /q "node_modules\.vite"
    echo Cache supprime!
)

echo Demarrage du serveur frontend...
npm run dev -- --force
