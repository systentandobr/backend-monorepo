@echo off
setlocal enabledelayedexpansion

REM ========================================
REM Life Tracker n8n Workflows - Menu Principal
REM Menu interativo para gerenciar os workflows
REM ========================================

:menu
cls
echo.
echo ========================================
echo Life Tracker n8n Workflows - Menu Principal
echo ========================================
echo.
echo 1. Deploy completo (iniciar todos os serviços)
echo 2. Parar todos os serviços
echo 3. Testar workflows
echo 4. Ver logs do n8n
echo 5. Ver logs do MongoDB
echo 6. Ver logs do PostgreSQL
echo 7. Ver logs do Redis
echo 8. Verificar status dos serviços
echo 9. Limpar dados (CUIDADO!)
echo 0. Sair
echo.
set /p choice="Escolha uma opção: "

if "%choice%"=="1" goto deploy
if "%choice%"=="2" goto stop
if "%choice%"=="3" goto test
if "%choice%"=="4" goto logs_n8n
if "%choice%"=="5" goto logs_mongo
if "%choice%"=="6" goto logs_postgres
if "%choice%"=="7" goto logs_redis
if "%choice%"=="8" goto status
if "%choice%"=="9" goto clean
if "%choice%"=="0" goto exit
goto menu

:deploy
echo.
echo [INFO] Iniciando deploy completo...
call deploy-windows.bat
goto menu

:stop
echo.
echo [INFO] Parando todos os serviços...
call stop-windows.bat
goto menu

:test
echo.
echo [INFO] Executando testes...
call test-windows.bat
goto menu

:logs_n8n
echo.
echo [INFO] Mostrando logs do n8n...
docker logs -f life-tracker-n8n
goto menu

:logs_mongo
echo.
echo [INFO] Mostrando logs do MongoDB...
docker logs -f life-tracker-mongo
goto menu

:logs_postgres
echo.
echo [INFO] Mostrando logs do PostgreSQL...
docker logs -f life-tracker-postgres
goto menu

:logs_redis
echo.
echo [INFO] Mostrando logs do Redis...
docker logs -f life-tracker-redis
goto menu

:status
echo.
echo [INFO] Verificando status dos serviços...
echo.
echo === Status dos Containers ===
docker ps --filter "name=life-tracker" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo.
echo === Verificando conectividade ===
echo.
echo [INFO] Testando n8n...
curl -f http://localhost:5678/healthz >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] n8n está respondendo
) else (
    echo [ERROR] n8n não está respondendo
)

echo [INFO] Testando MongoDB...
docker exec life-tracker-mongo mongosh --eval "db.adminCommand('ping')" >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] MongoDB está respondendo
) else (
    echo [ERROR] MongoDB não está respondendo
)

echo [INFO] Testando PostgreSQL...
docker exec life-tracker-postgres pg_isready -U n8n >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] PostgreSQL está respondendo
) else (
    echo [ERROR] PostgreSQL não está respondendo
)

echo [INFO] Testando Redis...
docker exec life-tracker-redis redis-cli ping >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Redis está respondendo
) else (
    echo [ERROR] Redis não está respondendo
)

echo.
pause
goto menu

:clean
echo.
echo [WARNING] ATENÇÃO: Esta operação irá remover TODOS os dados!
echo Isso inclui:
echo - Todos os containers
echo - Todos os volumes de dados
echo - Configurações do n8n
echo - Dados do MongoDB
echo - Dados do PostgreSQL
echo.
set /p confirm="Tem certeza? Digite 'SIM' para confirmar: "
if not "%confirm%"=="SIM" (
    echo [INFO] Operação cancelada
    pause
    goto menu
)

echo [INFO] Removendo containers...
docker stop life-tracker-n8n life-tracker-mongo life-tracker-postgres life-tracker-redis 2>nul
docker rm life-tracker-n8n life-tracker-mongo life-tracker-postgres life-tracker-redis 2>nul

echo [INFO] Removendo volumes...
docker volume rm n8n_data mongo_data postgres_data 2>nul

echo [INFO] Removendo diretórios locais...
if exist "n8n_data" rmdir /s /q n8n_data
if exist "mongo_data" rmdir /s /q mongo_data
if exist "postgres_data" rmdir /s /q postgres_data

echo [INFO] Limpeza concluída
pause
goto menu

:exit
echo.
echo [INFO] Saindo...
exit /b 0
