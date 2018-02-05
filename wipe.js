const Database = require('./database');
const database = new Database('data');

const [,, key] = process.argv;

database.wipe().then(size => {
    console.log(`Database wiped. ${size} bytes deleted`);
});