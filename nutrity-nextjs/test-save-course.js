const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env.local') });
const { saveCourse } = require('./src/actions/db-actions.ts');
const crypto = require('crypto');

// polyfill crypto for Node 18 if needed
if (!globalThis.crypto) {
    globalThis.crypto = crypto;
}

async function test() {
    try {
        console.log("Testing saveCourse...");
        const res = await saveCourse({
            title: 'Test Course Local',
            description: 'Test description local',
            thumbnail: 'https://test.com/image.png',
            category: 'Bienestar',
            price: 19.9,
            paypalUrl: 'https://paypal.com/test'
        });
        console.log("Success:", res.id);
    } catch (e) {
        console.error("FAILED EXACT ERROR:", e);
    }
}

test();
