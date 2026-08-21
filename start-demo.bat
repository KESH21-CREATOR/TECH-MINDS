@echo off
setlocal enabledelayedexpansion
title CredentialChain - Hackathon Demo Launcher

echo ===============================================================================
echo                CREDENTIALCHAIN - INSTANT VERIFICATION PLATFORM
echo                     Web3 for Social Impact Hackathon MVP
echo ===============================================================================
echo.

:: 1. Verify Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not found in PATH!
    echo Please install Node.js (v18 or higher) from https://nodejs.org/
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo [1/6] Detected Node.js: !NODE_VERSION!

:: 2. Check and install dependencies if node_modules are missing
echo [2/6] Checking dependencies...
if not exist "node_modules\" (
    echo Installing root dependencies (Hardhat, Ethers, PDF-Lib)...
    call npm install
)
if not exist "backend\node_modules\" (
    echo Installing backend dependencies (Express, Multer, Cors)...
    cd backend && call npm install && cd ..
)
if not exist "frontend\node_modules\" (
    echo Installing frontend dependencies (React, Vite, Tailwind, Lucide)...
    cd frontend && call npm install && cd ..
)

:: 3. Compile Smart Contracts
echo [3/6] Compiling Solidity smart contracts...
call npx hardhat compile
if %errorlevel% neq 0 (
    echo [ERROR] Smart contract compilation failed!
    pause
    exit /b 1
)

:: 4. Start Hardhat EVM Node in Background Window
echo [4/6] Starting Local Hardhat EVM Blockchain on port 8545...
start "CredentialChain-EVM-Blockchain" cmd /k "npx hardhat node"

:: 5. Deploy Smart Contracts and Generate Demo PDFs
echo [5/6] Deploying AcademicCredentialRegistry & Generating Demo Assets...
node scripts/wait-and-deploy.js
if %errorlevel% neq 0 (
    echo [ERROR] Smart contract deployment failed!
    pause
    exit /b 1
)

:: 6. Start Backend and Frontend Services
echo [6/6] Launching Backend API (Port 4000) and Frontend App (Port 5173)...
start "CredentialChain-Backend-API" cmd /k "cd backend && npm start"
start "CredentialChain-Frontend-Web" cmd /k "cd frontend && npm run dev"

echo.
echo ===============================================================================
echo                    ALL SERVICES STARTED SUCCESSFULLY!
echo ===============================================================================
echo   Frontend Web Application : http://localhost:5173
echo   Backend API Health Check : http://localhost:4000/api/health
echo   Local Hardhat Blockchain : http://127.0.0.1:8545 (ChainID: 31337)
echo ===============================================================================
echo.
echo Opening browser to http://localhost:5173 in 4 seconds...
timeout /t 4 >nul
start http://localhost:5173

echo.
echo Press any key to stop all background services and exit...
pause >nul

:: Terminate child processes on exit if needed
taskkill /FI "WINDOWTITLE eq CredentialChain-EVM-Blockchain" /F >nul 2>nul
taskkill /FI "WINDOWTITLE eq CredentialChain-Backend-API" /F >nul 2>nul
taskkill /FI "WINDOWTITLE eq CredentialChain-Frontend-Web" /F >nul 2>nul
exit /b 0
