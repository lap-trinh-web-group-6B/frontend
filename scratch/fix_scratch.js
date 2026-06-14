const fs = require('fs');
const files = [
  'scratch/wallets_page_new.tsx',
  'scratch/budgets_page_new.tsx',
  'scratch/transactions_page_new.tsx'
];
files.forEach(f => {
  let c = fs.readFileSync(f, 'utf8');
  c = c.split('\\`').join('`');
  c = c.split('\\${').join('${');
  fs.writeFileSync(f, c, 'utf8');
});
