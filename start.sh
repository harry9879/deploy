#!/bin/bash

echo "🚀 File Sharing App - Quick Start"
echo "=================================="
echo ""

# Check if MongoDB is running
if pgrep -x "mongod" > /dev/null
then
    echo "✅ MongoDB is running"
else
    echo "❌ MongoDB is not running"
    echo "Starting MongoDB..."
    brew services start mongodb-community@7.0
    sleep 3
fi

echo ""
echo "📦 Starting servers..."
echo ""

# Start backend in new terminal
echo "🔷 Starting Backend Server..."
osascript -e 'tell application "Terminal" to do script "cd '$(pwd)'/SERVER && npm run dev"'

# Wait a bit
sleep 2

# Start frontend in new terminal
echo "🔷 Starting Frontend Server..."
osascript -e 'tell application "Terminal" to do script "cd '$(pwd)'/CLIENT && npm run dev"'

echo ""
echo "✅ Servers starting!"
echo ""
echo "📍 Backend: http://localhost:5000"
echo "📍 Frontend: http://localhost:5173"
echo "📍 MongoDB: localhost:27017"
echo ""
echo "📚 Check GETTING_STARTED.md for next steps!"
echo ""
