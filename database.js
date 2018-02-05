const fs = require('fs');
// const sha = require('sha256');

function Database(path){
    this.path = path;
    this.mapPath = path + '-map';
    this.hashMap = {};
    this.assertion = assertFileAsync(path); // create file if not present
    this.mapAssertion = assertFileAsync(this.mapPath);
    this.hashMapPromise = loadHashMap.call(this, this.mapPath);
    this.hashMapPromise.then((hashMap = {}) => {
        Object.assign(this.hashMap, hashMap)
    });

}

async function loadHashMap(mapPath){
    return new Promise(async (resolve, reject) => {
        await this.mapAssertion;
        const map = {};
        const size = await this.getByteSize(this.mapPath);
        if(size == 0){
            resolve(map);
        }else{
            fs.createReadStream(mapPath).on('data', (chunk) => {
                const reg = /([^:]*):([^,]*)\,([^;]*)\;/g;

                while(match = reg.exec(chunk)){
                    const [, hash, from, to] = match;
                    map[hash] = { from, to }
                }
                resolve(map)
            });
        }

    })
}

async function assertFileAsync(path){
    return new Promise((resolve, reject) => {
        if(!fs.existsSync(path)){
            fs.writeFile(path, '', function (err) {
                if (err) throw err;
                resolve(path);
            });
        }else{
            resolve(path)
        }
    })
}

Database.prototype.readDataAt = async function(from, to){
    const {path} = this;
    return this.assertion.then(_ => {
        return new Promise((resolve, reject) => {
            fs.createReadStream(path, {
                start: from,
                end: to
            }).on('data', function(chunk){
                resolve(chunk);
            })
        })
    })
};


Database.prototype.getByteSize = async function(path){
    return new Promise((resolve, reject) => {
        fs.stat(path, function(err, stats){
            if(err){
                reject(err)
            }else{
                resolve(stats.size);
            }
        })
    })
};



// entry format: {key}:{value}
Database.prototype.write = async function(key, value){
    return new Promise(async (resolve, reject) => {
        await this.hashMapPromise;

        if(!!this.hashMap[key]){
            throw new Error('Key already exists in db');
        }

        const entry = `${key}:${value}`;
        value = undefined;

        const path = await this.assertion;
        const sizePre = await this.getByteSize(path);

        fs.appendFile(path, entry, () => {
            this.getByteSize(path).then(sizePost => {
                this.hashMap[key] = {
                    from: sizePre,
                    to: sizePost
                };
                this.saveToHashMap(key, sizePre, sizePost);
                resolve();
            })
        });
    })
};

Database.prototype.read = async function(key){
    try{
        await this.assertion;
        await this.mapAssertion;
        await this.hashMapPromise;

        if(!this.hashMap[key]){
            return Promise.reject(`No value exists at key (${key})`)
        }

        const {from, to} = this.hashMap[key];
        return this.readDataAt(Number(from), Number(to-1)).then(d => {
            return new Promise((resolve) => {
                const reg = /^[^:]*\:(.*)/;
                const entry = d.toString();
                const match = reg.exec(entry);
                const [,value] = match;

                resolve(value);
            })
        });
    }catch(err){
        console.error(err);
    }
};

Database.prototype.wipe = async function(){
    const {path, mapPath} = this;

    return new Promise(async (resolve, reject) => {
        const size = await this.getByteSize(path);
        let count = 0;
        fs.createWriteStream(path).write('', () => {
            if(++count == 2){
                resolve(size);
            }
        });
        fs.createWriteStream(mapPath).write('', () => {
            if(++count == 2){
                resolve(size);
            }
        });
    })
};

// hashMap entry format: {hash}:{from},{to};
Database.prototype.saveToHashMap = async function(key, from, to){
    return new Promise(async (resolve, reject) => {
        const path = await this.mapAssertion;
        const entry = `${key}:${from},${to};`;

        fs.appendFile(path, entry, () => {
            resolve(entry);
        })
    })
};

module.exports = Database;