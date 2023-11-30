const fs = require("fs");
const {MerkleTree} = require("merkletreejs");
const keccak256 = require("keccak256");
const path = require("path");


const fileName = "./merkle_data.txt";

function getFileData() {
    return fs.readFileSync(path.resolve(__dirname, fileName)).toString('utf-8').split("\r\n");
}

const getMerkleRoot = async () => {
    const list = getFileData();
    const merkleTree = new MerkleTree(list, keccak256, {hashLeaves: true, sortPairs: true});
    console.log(merkleTree.getHexRoot());
    return merkleTree.getHexRoot();
}

module.exports = getMerkleRoot;