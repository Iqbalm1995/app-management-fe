const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Detect platform
const isWindows = process.platform === 'win32';

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) {
    console.error(`Source not found: ${src}`);
    process.exit(1);
  }

  // Try native commands first (faster)
  try {
    if (isWindows) {
      // Windows: use xcopy
      execSync(`xcopy "${src}" "${dest}" /E /I /Y /Q`, { stdio: 'ignore' });
      console.log(`✅ Copied ${src} (using xcopy)`);
      return;
    } else {
      // Unix: use cp
      execSync(`cp -r "${src}" "${dest}"`, { stdio: 'ignore' });
      console.log(`✅ Copied ${src} (using cp)`);
      return;
    }
  } catch (err) {
    // Fallback to Node.js if native commands fail
    console.log(`Using Node.js fallback for ${src}...`);
  }

  // Node.js fallback (works everywhere)
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
  console.log(`✅ Copied ${src} (using Node.js)`);
}

console.log(`Platform: ${isWindows ? 'Windows' : 'Unix'}`);
console.log('Copying .next/static to .next/standalone/.next/static...');
copyRecursive('.next/static', '.next/standalone/.next/static');

console.log('Copying public to .next/standalone/public...');
copyRecursive('public', '.next/standalone/public');

console.log('✅ Standalone build ready!');

