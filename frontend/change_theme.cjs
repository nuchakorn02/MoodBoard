const fs = require('fs');
const path = require('path');

function replaceColors(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceColors(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.css')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      let changed = false;
      
      if (content.includes('indigo-') || content.includes('purple-')) {
        // Replace all indigo utilities with sky
        content = content.replace(/indigo-/g, 'sky-');
        // Replace all purple utilities with blue
        content = content.replace(/purple-/g, 'blue-');
        
        fs.writeFileSync(fullPath, content);
        console.log('Updated theme colors in', fullPath);
        changed = true;
      }
    }
  }
}

const targetDir = 'C:/Users/User/Desktop/project/frontend/src';
replaceColors(targetDir);
console.log('Theme change complete.');
