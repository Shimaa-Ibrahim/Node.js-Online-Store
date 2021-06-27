const fs = require('fs');

const path = require('./path');

exports.deleteFile = (filePath) => {
    fs.unlink(path + '/' + filePath, err => {
        if(err) {
            throw (err)
        }
    })
}