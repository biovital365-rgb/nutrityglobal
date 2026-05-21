const fs = require('fs');

let c = fs.readFileSync('src/actions/db-actions.ts', 'utf8');

// Replace all instances of "this." with "" since they are now standalone functions in the same module
c = c.replace(/this\./g, '');

fs.writeFileSync('src/actions/db-actions.ts', c);
console.log("Fixed 'this.' in db-actions.ts");
