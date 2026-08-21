#!/usr/bin/env bash

set -e

echo "==============================================================================="
echo "               CREDENTIALCHAIN - INSTANT VERIFICATION PLATFORM                 "
echo "                    Web3 for Social Impact Hackathon MVP                       "
echo "==============================================================================="
echo ""

# Check node
if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js is not installed. Please install Node.js (v18+) from https://nodejs.org/"
    exit 1
fi

echo "[1/6] Node.js detected: $(node -v)"

# Install dependencies if needed
echo "[2/6] Checking dependencies..."
if [ ! -d "node_modules" ]; then
    echo "Installing root dependencies..."
    npm install
fi

if [ ! -d "backend/node_modules" ]; then
    echo "Installing backend dependencies..."
    (cd backend && npm install)
fi

if [ ! -d "frontend/node_modules" ]; then
    echo "Installing frontend dependencies..."
    (cd frontend && npm install)
fi

# Compile contracts
echo "[3/6] Compiling Solidity smart contracts..."
npx hardhat compile

# Start Hardhat node in background
echo "[4/6] Starting Hardhat EVM node on port 8545..."
npx hardhat node > hardhat.log 2>&1 &
HARDHAT_PID=$!

# Deploy contracts and generate demo assets
echo "[5/6] Deploying AcademicCredentialRegistry & Generating Demo Assets..."
node scripts/wait-and-deploy.js

# Start backend in background
echo "[6/6] Launching Backend API (Port 4000) and Frontend App (Port 5173)..."
(cd backend && npm start) > backend.log 2>&1 &
BACKEND_PID=$!

# Start frontend in background
(cd frontend && npm run dev) > frontend.log 2>&1 &
FRONTEND_PID=$!

echo ""
echo "==============================================================================="
echo "                   ALL SERVICES STARTED SUCCESSFULLY!                          "
echo "==============================================================================="
echo "  Frontend Web Application : http://localhost:5173"
echo "  Backend API Health Check : http://localhost:4000/api/health"
echo "  Local Hardhat Blockchain : http://127.0.0.1:8545 (ChainID: 31337)"
echo "==============================================================================="
echo ""

# Open browser if supported
if command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:5173 &
elif command -v open &> /dev/null; then
    open http://localhost:5173 &
fi

# Cleanup on exit
trap "kill $HARDHAT_PID $BACKEND_PID $FRONTEND_PID 2>/dev/null || true; exit" INT TERM EXIT

echo "Press Ctrl+C to stop all services."
wait
