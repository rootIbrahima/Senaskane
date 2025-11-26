@echo off
echo ========================================
echo Configuration de la base de donnees
echo ========================================
echo.

REM Chemin vers MySQL de XAMPP
set MYSQL_PATH=C:\xampp\mysql\bin\mysql.exe

REM Verifier si MySQL existe
if not exist "%MYSQL_PATH%" (
    echo ERREUR: MySQL introuvable dans XAMPP
    echo Verifiez que XAMPP est installe dans C:\xampp
    pause
    exit /b 1
)

echo 1. Connexion a MySQL...
echo.
echo IMPORTANT: Appuyez sur ENTREE quand le mot de passe est demande
echo (Le mot de passe est vide par defaut sur XAMPP)
echo.

REM Importer le fichier SQL
"%MYSQL_PATH%" -u root -p < bd.sql

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo Base de donnees creee avec succes!
    echo ========================================
    echo.
    echo La base 'senaskane_db' a ete creee.
    echo Vous pouvez verifier dans phpMyAdmin.
    echo.
) else (
    echo.
    echo ========================================
    echo ERREUR lors de la creation
    echo ========================================
    echo.
    echo Verifiez que:
    echo 1. MySQL est demarre dans XAMPP
    echo 2. Le mot de passe est vide (appuyez juste sur ENTREE)
    echo.
)

pause
