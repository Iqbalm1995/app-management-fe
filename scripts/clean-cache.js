const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Detect platform
const isWindows = process.platform === 'win32';
const cachePath = '.next/cache';

if (!fs.existsSync(cachePath)) {
  console.log('✅ Cache already clean');
  process.exit(0);
}

// Try native commands first (faster)
try {
  if (isWindows) {
    // Windows: use rmdir
    execSync(`rmdir /S /Q "${cachePath}"`, { stdio: 'ignore' });
    console.log('✅ Cache deleted (using rmdir)');
    process.exit(0);
  } else {
    // Unix: use rm
    execSync(`rm -rf "${cachePath}"`, { stdio: 'ignore' });
    console.log('✅ Cache deleted (using rm)');
    process.exit(0);
  }
} catch (err) {
  // Fallback to Node.js if native commands fail
  console.log('Using Node.js fallback...');
}

// Node.js fallback (works everywhere)
function deleteRecursive(dirPath) {
  if (!fs.existsSync(dirPath)) {
    return;
  }

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      deleteRecursive(fullPath);
    } else {
      fs.unlinkSync(fullPath);
    }
  }

  fs.rmdirSync(dirPath);
}

console.log('Cleaning .next/cache...');
deleteRecursive(cachePath);
console.log('✅ Cache deleted (using Node.js)');

