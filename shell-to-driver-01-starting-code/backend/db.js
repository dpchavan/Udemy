const mongodb = require('mongodb');
let _db;
const MongoClient = mongodb.MongoClient;
const url = 'mongodb+srv://dattaprasad:dattaprasad@cluster0-kiir4.mongodb.net/shop?retryWrites=true&w=majority';
const initDb = callback => {
    if(_db){
       console.log("Database is already initialized!");
       return callback(null, _db);
    }
    MongoClient
    .connect(url, {useNewUrlParser: true, useUnifiedTopology: true})
    .then(client => {
        _db = client
        callback(null, _db);
    })
    .catch(err => {
        console.log(err);
        callback(err,null);
    })
}

const getDb = () => {
    if(!_db) {
        throw Error('Database not initilized!');
    }
    return _db;
}

module.exports = {
    initDb,
    getDb
}