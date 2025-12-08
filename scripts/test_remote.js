const https = require('https');

const CATEGORY_URL = 'https://siva-ecommerce.up.railway.app/api/products/categories';

console.log('--- Testing Remote Backend Subcategory Support ---');

https.get(CATEGORY_URL, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            const categories = JSON.parse(data);
            console.log('Current Categories structure (first 2):', JSON.stringify(categories.slice(0, 2), null, 2));

            if (categories.length > 0 && typeof categories[0] === 'string') {
                console.log('FAIL: Backend returns Array of Strings. It does NOT support subcategories.');
            } else if (categories.length > 0 && typeof categories[0] === 'object') {
                console.log('PASS: Backend returns Array of Objects. It MIGHT support subcategories.');
            } else {
                console.log('Empty or unknown format.');
            }
        } catch (e) {
            console.error('Error parsing JSON:', e.message);
            console.log('Raw data:', data);
        }
    });

}).on('error', (err) => {
    console.error('Error fetching categories:', err.message);
});
