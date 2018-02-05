const Database = require('./database');
const database = new Database('data');

const [,, key] = process.argv;

database.read(key).then(d => {
    console.log(d);
}).catch(e => {
    console.error(e)
});