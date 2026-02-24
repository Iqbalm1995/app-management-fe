#!/bin/bash
# Verification script for standalone deployment
# Run this on the RHEL server

echo "=== Standalone Deployment Verification ==="
echo ""

# Check if we're in the right directory
if [ ! -f "ecosystem.config.js" ]; then
    echo "❌ ERROR: ecosystem.config.js not found"
    echo "   Are you in the correct directory?"
    exit 1
fi

echo "✅ ecosystem.config.js found"

# Check server.js
if [ -f ".next/standalone/server.js" ]; then
    echo "✅ server.js found"
else
    echo "❌ ERROR: .next/standalone/server.js not found"
    exit 1
fi

# Check .next/static
if [ -d ".next/standalone/.next/static" ]; then
    echo "✅ .next/static folder exists"
    STATIC_COUNT=$(find .next/standalone/.next/static -type f | wc -l)
    echo "   Files: $STATIC_COUNT"
else
    echo "❌ ERROR: .next/standalone/.next/static not found"
    echo "   This will cause 404 errors for JS/CSS files"
    exit 1
fi

# Check public folder
if [ -d ".next/standalone/public" ]; then
    echo "✅ public folder exists"
    if [ -f ".next/standalone/public/pdf.worker.mjs" ]; then
        echo "   ✅ pdf.worker.mjs found"
    else
        echo "   ❌ pdf.worker.mjs missing"
    fi
    
    if [ -d ".next/standalone/public/img" ]; then
        IMG_COUNT=$(find .next/standalone/public/img -type f | wc -l)
        echo "   ✅ img folder found ($IMG_COUNT images)"
    else
        echo "   ❌ img folder missing"
    fi
else
    echo "❌ ERROR: .next/standalone/public not found"
    echo "   This will cause 404 errors for images"
    exit 1
fi

# Check node_modules
if [ -d ".next/standalone/node_modules" ]; then
    echo "✅ node_modules exists"
else
    echo "❌ ERROR: .next/standalone/node_modules not found"
    exit 1
fi

# Check PM2 process
echo ""
echo "=== PM2 Status ==="
pm2 list | grep app-management-fe

echo ""
echo "=== PM2 Logs (last 20 lines) ==="
pm2 logs app-management-fe --lines 20 --nostream

echo ""
echo "=== Verification Complete ==="
