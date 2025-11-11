#!/bin/bash

# Running Calculator Setup Script
echo "Setting up Running Calculator..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed. Please install Node.js first:"
    echo ""
    echo "On Ubuntu/Debian:"
    echo "  curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -"
    echo "  sudo apt-get install -y nodejs"
    echo ""
    echo "On macOS:"
    echo "  brew install node"
    echo ""
    echo "Or download from: https://nodejs.org/"
    exit 1
fi

echo "Node.js version: $(node --version)"
echo "npm version: $(npm --version)"

# Install dependencies
echo "Installing dependencies..."
npm install

# Check if installation was successful
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Setup complete!"
    echo ""
    echo "To start the development server:"
    echo "  npm start"
    echo ""
    echo "To run tests:"
    echo "  npm test"
    echo ""
    echo "To build for production:"
    echo "  npm run build"
else
    echo "❌ Installation failed. Please check the error messages above."
    exit 1
fi
