let fs = require('fs');

let rawConfig = fs.readFileSync("json_files/config.json");
let config = JSON.parse(rawConfig);
exports.config = config;