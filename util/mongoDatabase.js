// to connect dirctly to mongodb drive
const mongodb = require("mongodb");
const dotenv = require('dotenv');
dotenv.config();

let _db;

const mongodbClient = mongodb.mongodbClient();
const mongodbConnect = func => {
  mongodbClient
    .mongodbConnect(
      process.env.MONGO_URI
    )
    .then(client => {
        _db = client.db();
        func();
    })
    .catch(err => {
      console.log(err);
    });
};

getdb = () => {
    if(_db){
        return _db;
    }
    throw 'No database found';
}

module.exports = mongodbConnect;
module.exports = getdb;