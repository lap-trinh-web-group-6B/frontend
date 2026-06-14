const fs = require('fs');
const path = require('path');
function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.tsx')) results.push(file);
    }
  });
  return results;
}
const files = walk('src/app');
files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  if (content.includes('\\`') || content.includes('\\${')) {
    content = content.split('\\`').join('`');
    content = content.split('\\${').join('${');
    fs.writeFileSync(f, content, 'utf8');
    console.log('Fixed', f);
  }
});
