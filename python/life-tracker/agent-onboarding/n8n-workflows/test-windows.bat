@echo off
setlocal enabledelayedexpansion

REM ========================================
REM Life Tracker n8n Workflows - Test Script
REM Script para testar os workflows
REM ========================================

echo.
echo ========================================
echo Life Tracker n8n Workflows - Testes
echo ========================================
echo.

REM Configurações
set BASE_URL=http://localhost:5678/webhook
set USER_ID=test_user_%RANDOM%
set SESSION_ID=test_session_%RANDOM%

echo [INFO] Configurações de teste:
echo    Base URL: %BASE_URL%
echo    User ID: %USER_ID%
echo    Session ID: %SESSION_ID%
echo.

REM Verificar se n8n está rodando
echo [INFO] Verificando se n8n está rodando...
curl -f http://localhost:5678/healthz >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] n8n não está rodando. Execute deploy-windows.bat primeiro.
    pause
    exit /b 1
)
echo [OK] n8n está rodando

echo.
echo ========================================
echo Executando testes...
echo ========================================
echo.

REM Teste 1: Status do serviço
echo [TESTE 1] Status do serviço...
curl -s -X GET "%BASE_URL%/onboarding-status"
if %errorlevel% equ 0 (
    echo [OK] Teste 1 passou
) else (
    echo [ERROR] Teste 1 falhou
)
echo.

REM Teste 2: Listar templates
echo [TESTE 2] Listar templates...
curl -s -X GET "%BASE_URL%/onboarding-templates"
if %errorlevel% equ 0 (
    echo [OK] Teste 2 passou
) else (
    echo [ERROR] Teste 2 falhou
)
echo.

REM Teste 3: Onboarding completo
echo [TESTE 3] Onboarding completo...
curl -s -X POST "%BASE_URL%/onboarding-complete" ^
    -H "Content-Type: application/json" ^
    -d "{\"user_id\":\"%USER_ID%\",\"session_id\":\"%SESSION_ID%\",\"questions_and_answers\":[{\"question_id\":\"concentration\",\"question_text\":\"Você acha difícil se concentrar em tarefas por longos períodos?\",\"question_type\":\"text\",\"question_category\":\"general\",\"answer\":\"medium-focus\",\"answered_at\":\"2024-01-15T10:30:00Z\",\"context\":{\"step\":15,\"required\":true}},{\"question_id\":\"lifestyle\",\"question_text\":\"Quão satisfeito você está com seu estilo de vida atual?\",\"question_type\":\"text\",\"question_category\":\"general\",\"answer\":\"somewhat-satisfied\",\"answered_at\":\"2024-01-15T10:30:00Z\",\"context\":{\"step\":16,\"required\":true}},{\"question_id\":\"energy\",\"question_text\":\"Como é seu nível de energia ao longo do dia?\",\"question_type\":\"text\",\"question_category\":\"general\",\"answer\":\"high-energy\",\"answered_at\":\"2024-01-15T10:30:00Z\",\"context\":{\"step\":17,\"required\":true}}],\"user_metadata\":{\"source\":\"test-script\",\"timestamp\":\"2024-01-15T10:30:00Z\"}}"
if %errorlevel% equ 0 (
    echo [OK] Teste 3 passou
) else (
    echo [ERROR] Teste 3 falhou
)
echo.

REM Teste 4: Análise de perfil
echo [TESTE 4] Análise de perfil...
curl -s -X POST "%BASE_URL%/onboarding-analyze" ^
    -H "Content-Type: application/json" ^
    -d "{\"user_id\":\"%USER_ID%_analyze\",\"answers\":{\"concentration\":\"high-focus\",\"lifestyle\":\"very-satisfied\",\"energy\":\"high-energy\",\"wakeup_time\":\"06:00\",\"sleep_time\":\"22:00\",\"personal_interests\":[\"technology\",\"fitness\"],\"financial_goals\":[\"passive-income\"],\"life_goals\":[\"financial-freedom\"],\"monthly_income\":5000,\"monthly_savings\":1000,\"time_availability\":10}}"
if %errorlevel% equ 0 (
    echo [OK] Teste 4 passou
) else (
    echo [ERROR] Teste 4 falhou
)
echo.

REM Teste 5: Geração de plano
echo [TESTE 5] Geração de plano...
curl -s -X POST "%BASE_URL%/onboarding-generate" ^
    -H "Content-Type: application/json" ^
    -d "{\"user_id\":\"%USER_ID%_generate\",\"answers\":{\"concentration\":\"low-focus\",\"lifestyle\":\"not-satisfied\",\"energy\":\"low-energy\",\"wakeup_time\":\"08:00\",\"sleep_time\":\"23:30\",\"personal_interests\":[\"health\",\"wellness\"],\"financial_goals\":[\"emergency-fund\"],\"life_goals\":[\"better-health\"],\"monthly_income\":3000,\"monthly_savings\":200,\"time_availability\":5}}"
if %errorlevel% equ 0 (
    echo [OK] Teste 5 passou
) else (
    echo [ERROR] Teste 5 falhou
)
echo.

REM Teste 6: Recuperar plano do usuário
echo [TESTE 6] Recuperar plano do usuário...
curl -s -X GET "%BASE_URL%/onboarding-user-plan/%USER_ID%"
if %errorlevel% equ 0 (
    echo [OK] Teste 6 passou
) else (
    echo [ERROR] Teste 6 falhou
)
echo.

REM Teste 7: Recuperar perfil do usuário
echo [TESTE 7] Recuperar perfil do usuário...
curl -s -X GET "%BASE_URL%/onboarding-user-profile/%USER_ID%"
if %errorlevel% equ 0 (
    echo [OK] Teste 7 passou
) else (
    echo [ERROR] Teste 7 falhou
)
echo.

echo.
echo ========================================
echo Testes concluídos!
echo ========================================
echo.
echo 📊 Dados de teste criados:
echo    User ID: %USER_ID%
echo    Session ID: %SESSION_ID%
echo.
echo 🔗 URLs testadas:
echo    Base URL: %BASE_URL%
echo    Complete: %BASE_URL%/onboarding-complete
echo    Analyze: %BASE_URL%/onboarding-analyze
echo    Generate: %BASE_URL%/onboarding-generate
echo    Templates: %BASE_URL%/onboarding-templates
echo    User Plan: %BASE_URL%/onboarding-user-plan
echo    User Profile: %BASE_URL%/onboarding-user-profile
echo    Status: %BASE_URL%/onboarding-status
echo.

pause
