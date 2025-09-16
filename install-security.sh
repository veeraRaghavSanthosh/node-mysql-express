#!/bin/bash

# Installation script for security enhancements
# This script updates the existing Node.js Express MySQL API with security features

echo "=== Installing Security Enhancements ==="

# Backup original files
echo "Creating backups..."
cp package.json package.json.backup 2>/dev/null || echo "No package.json found to backup"
cp server.js server.js.backup 2>/dev/null || echo "No server.js found to backup"

# Update package.json with new dependencies
echo "Updating package.json..."
if [ -f "package-updated.json" ]; then
    cp package-updated.json package.json
    echo "✓ Package.json updated with security dependencies"
else
    echo "✗ package-updated.json not found"
fi

# Install dependencies
echo "Installing dependencies..."
npm install

# Update server.js to include security middleware
echo "Updating server.js..."
if [ -f "server.js" ]; then
    # Add security require at the top
    if ! grep -q "require.*security" server.js; then
        sed -i '2a const security = require("./app/middleware/security");' server.js
    fi
    
    # Add security middleware after bodyParser setup
    if ! grep -q "security.securityHeaders" server.js; then
        sed -i '/app.use(bodyParser.json());/a\\napp.use(security.securityHeaders);\napp.use(security.sanitizeRequest);\napp.use(security.generalRateLimit);' server.js
    fi
    
    echo "✓ Server.js updated with security middleware"
else
    echo "✗ server.js not found"
fi

# Test the security features
echo "Testing security features..."
if [ -f "__tests__/security.test.js" ]; then
    node __tests__/security.test.js
else
    echo "✗ Security tests not found"
fi

echo ""
echo "=== Installation Complete ==="
echo "Security features added:"
echo "  ✓ Input sanitization middleware"
echo "  ✓ Rate limiting protection"  
echo "  ✓ Input validation for customer endpoints"
echo "  ✓ Security headers"
echo "  ✓ Comprehensive unit tests"
echo ""
echo "To start the server: npm start"
echo "To run tests: npm test"
echo ""
echo "See CHANGELOG.md and README.md for detailed documentation."