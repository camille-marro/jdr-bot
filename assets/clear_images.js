const fs = require("fs");
const path = require("path");

const directory = path.resolve(__dirname, "../commands/textCommands/imagine/images");

function clearImages(){
    fs.readdir(directory, (err, files) => {
        if (err) console.log(err);

        for (const file of files) {
            fs.unlink(path.join(directory, file), (err) => {
                if (err) throw err;
            });
        }
    });

    console.log("|- Images cleared !");
}

module.exports = {
    clearImages
}
