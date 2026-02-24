const fs = require('fs');

console.log('Copying ecosystem.config.js to .next/standalone/...');
fs.copyFileSync('ecosystem.config.js', '.next/standalone/ecosystem.config.js');
console.log('✅ ecosystem.config.js copied');
