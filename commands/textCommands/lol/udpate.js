const fs = require('fs');
const path = require("path");
const os = require("os");

function execute (message) {
    let args = message.content.split(" ");

    let new_api_key = args[1];

    console.log("|- " + message.author['username'] + "(#" + message.author['id'] + ") tried to update lol api key to : " + new_api_key + ".");

   let env_vars = fs.readFileSync(path.resolve(__dirname, "../../../.env"), "utf-8").split(os.EOL);

    const target = env_vars.indexOf(env_vars.find((line) => {
        return line.match("API_KEY");
    }));

    env_vars.splice(target, 1, `API_KEY="${new_api_key}"`);

    fs.writeFileSync(path.resolve(__dirname, "../../../.env"), env_vars.join(os.EOL));
    console.log("|-- api key successfully updated");
}

module.exports = {
    execute
}