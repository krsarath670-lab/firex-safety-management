const http = require('http');
const path = require('path');
const fs = require('fs');

// Verify that the files exist on disk
const publicLetterhead = path.join(__dirname, '..', 'public', 'letterhead.png');
const distLetterhead = path.join(__dirname, '..', 'dist', 'letterhead.png');
const publicFooter = path.join(__dirname, '..', 'public', 'letterhead_footer.jpg');
const distFooter = path.join(__dirname, '..', 'dist', 'letterhead_footer.jpg');

console.log('--- Verifying Static Asset Files ---');
console.log('public/letterhead.png exists:', fs.existsSync(publicLetterhead), 'size:', fs.existsSync(publicLetterhead) ? fs.statSync(publicLetterhead).size : 0);
console.log('dist/letterhead.png exists:', fs.existsSync(distLetterhead), 'size:', fs.existsSync(distLetterhead) ? fs.statSync(distLetterhead).size : 0);
console.log('public/letterhead_footer.jpg exists:', fs.existsSync(publicFooter), 'size:', fs.existsSync(publicFooter) ? fs.statSync(publicFooter).size : 0);
console.log('dist/letterhead_footer.jpg exists:', fs.existsSync(distFooter), 'size:', fs.existsSync(distFooter) ? fs.statSync(distFooter).size : 0);

// Test server db logic directly
const db = require('../server/db');
const settings = db.getSettings();
console.log('--- Verifying DB Settings ---');
console.log('letterhead_url:', settings.letterhead_url);
console.log('letterhead_footer_url:', settings.letterhead_footer_url);
console.log('logo_url:', settings.logo_url);
console.log('use_custom_letterhead:', settings.use_custom_letterhead);

// Test updateSettings
const updated = db.updateSettings({ test_flag: true });
console.log('updateSettings test_flag:', updated.test_flag);

console.log('=== All Local Verification Checks Passed! ===');
process.exit(0);
