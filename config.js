let fs = require('fs');

let rawConfig = fs.readFileSync("config.json");
let config = JSON.parse(rawConfig);
exports.config = config;