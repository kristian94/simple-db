const Database = require('./database');
const database = new Database('data');

const [,, key, value] = process.argv;

database.write(key, value).then(res => {
    console.log(`Inserted (${value}) at (${key})`)
});