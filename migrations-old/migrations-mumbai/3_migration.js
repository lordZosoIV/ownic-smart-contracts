const OwnicNFTMarketplace = artifacts.require("OwnicNFTMarketplace");
const NFTCategoryController = artifacts.require("NFTCategoryController");
const EternalStorage = artifacts.require("EternalStorage");
const NFTCategoriesLibrary = artifacts.require("NFTCategoriesLibrary");
const NebulaToken = artifacts.require("NebulaToken");
const NebulaDynamicCollection = artifacts.require("NebulaDynamicCollection");
const OwnicPlayerOpener = artifacts.require("OwnicPlayerOpener");


const {deployProxy} = require('@openzeppelin/truffle-upgrades');

async function getByte32(string) {
    return web3.utils.keccak256(string);
}

module.exports = async function (deployer, network, accounts) {

    let controller = await NFTCategoryController.deployed();

    let classIdA = 0;
    let classIdB = 1;
    let classIdC = 2;
    let classIdD = 3;
    let classIdE = 4;
    let classIdF = 5;
    let classIdG = 6;

    let classNameA = await getByte32("A");
    let classNameB = await getByte32("B");
    let classNameC = await getByte32("C");
    let classNameD = await getByte32("D");
    let classNameE = await getByte32("E");
    let classNameF = await getByte32("F");
    let classNameG = await getByte32("G");

    let defender = await getByte32("Defender");
    let goalkeeper = await getByte32("Goalkeeper");
    let midfielder = await getByte32("Midfielder");
    let attacker = await getByte32("Attacker");

    await controller.addPlayerClassType(classNameA,  0, 10);
    await controller.addPlayerClassType(classNameB,  1, 50);
    await controller.addPlayerClassType(classNameC,  2, 100);
    // await controller.addPlayerClassType(classNameD,  3, 100);
    // await controller.addPlayerClassType(classNameE,  4, 500);
    // await controller.addPlayerClassType(classNameF,  5, 501);
    // await controller.addPlayerClassType(classNameG,  6, 1000);

};
