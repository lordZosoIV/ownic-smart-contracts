const NFTPresale = artifacts.require("NFTPresale.sol");
const getMerkleRoot = require("../script/setupMerkleTree");


module.exports = async function (deployer, network, accounts) {

    if (network === "test") {
        return;
    }

    let presale = await NFTPresale.deployed();
    let root = await getMerkleRoot();
    await presale.setMerkleRoot(root);

};
