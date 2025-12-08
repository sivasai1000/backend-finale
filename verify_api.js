const http = require('http');

function get(path) {
    http.get('http://localhost:5000' + path, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            console.log(`GET ${path}: Status ${res.statusCode}`);
            console.log('Body:', data);
        });
    }).on('error', (err) => console.error(err));
}

get('/api/terms');
get('/api/pages/terms');
