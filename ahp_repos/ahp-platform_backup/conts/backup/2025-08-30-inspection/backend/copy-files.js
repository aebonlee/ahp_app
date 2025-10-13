const fs = require('fs');
const path = require('path');

// Create dist/database directory if it doesn't exist
const distDbDir = path.join(__dirname, 'dist', 'database');
if (!fs.existsSync(distDbDir)) {
  fs.mkdirSync(distDbDir, { recursive: true });
}

// Copy migrations folder
const srcMigrations = path.join(__dirname, 'src', 'database', 'migrations');
const destMigrations = path.join(__dirname, 'dist', 'database', 'migrations');

if (fs.existsSync(srcMigrations)) {
  if (!fs.existsSync(destMigrations)) {
    fs.mkdirSync(destMigrations, { recursive: true });
  }
  
  const files = fs.readdirSync(srcMigrations);
  files.forEach(file => {
    const srcFile = path.join(srcMigrations, file);
    const destFile = path.join(destMigrations, file);
    fs.copyFileSync(srcFile, destFile);
    console.log(`Copied ${file} to dist/database/migrations/`);
  });
  
  console.log('✅ Migration files copied successfully');
} else {
  console.log('⚠️ No migrations folder found');
}