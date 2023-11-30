const fs = require("fs");


const path = "./merkle_data.txt";

function getFileData() {
    let result = fs.readFileSync(path).toString('utf-8').split("\n");
    result.pop();
    return result;
}

const remove = (searchKeyword) => {
    fs.readFile(path, {encoding: 'utf-8'}, function (err, data) {
        if (err) throw error;

        let dataArray = data.split('\n');
        let lastIndex = -1;

        for (let index = 0; index < dataArray.length; index++) {
            if (dataArray[index].includes(searchKeyword)) {
                lastIndex = index;
                break;
            }
        }

        dataArray.splice(lastIndex, 1);

        const updatedData = dataArray.join('\n');
        fs.writeFile(path, updatedData, (err) => {
            if (err) throw err;
        });

    });
}

const add = async (content) => {
    fs.writeFile(path, content + '\n', {flag: 'a+'}, err => {
    });
}


module.exports = {add, remove, getFileData}

