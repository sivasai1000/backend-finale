const fs = require('fs');
try {
    console.log('Loading pages...');
    require('./routes/pages');
    console.log('Pages loaded.');
} catch (e) {
    fs.writeFileSync('error.log', e.stack);
}
