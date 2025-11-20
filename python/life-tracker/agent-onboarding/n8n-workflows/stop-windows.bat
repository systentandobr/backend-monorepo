@echo off
setlocal enabledelayedexpansion

REM ========================================
REM Life Tracker n8n Workflows - Stop Services
REM Script para parar todos os serviços
REM ========================================

echo.
echo ========================================
echo Life Tracker n8n Workflows - Parando Serviços
echo ========================================
echo.

echo [INFO] Parando containers...

REM Parar n8n
echo [INFO] Parando n8n...
docker stop life-tracker-n8n 2>nul
if %errorlevel% equ 0 (
    echo [OK] n8n parado
) else (
    echo [INFO] n8n não estava rodando
)

REM Parar MongoDB
echo [INFO] Parando MongoDB...
docker stop life-tracker-mongo 2>nul
if %errorlevel% equ 0 (
    echo [OK] MongoDB parado
) else (
    echo [INFO] MongoDB não estava rodando
)

REM Parar PostgreSQL
echo [INFO] Parando PostgreSQL...
docker stop life-tracker-postgres 2>nul
if %errorlevel% equ 0 (
    echo [OK] PostgreSQL parado
) else (
    echo [INFO] PostgreSQL não estava rodando
)

REM Parar Redis
echo [INFO] Parando Redis...
docker stop life-tracker-redis 2>nul
if %errorlevel% equ 0 (
    echo [OK] Redis parado
) else (
    echo [INFO] Redis não estava rodando
)

echo.
echo [INFO] Removendo containers...

REM Remover containers
docker rm life-tracker-n8n 2>nul
docker rm life-tracker-mongo 2>nul
docker rm life-tracker-postgres 2>nul
docker rm life-tracker-redis 2>nul

echo [OK] Containers removidos

echo.
echo ========================================
echo Todos os serviços foram parados!
echo ========================================
echo.

pause
