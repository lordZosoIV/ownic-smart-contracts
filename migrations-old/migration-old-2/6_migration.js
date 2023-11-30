const OwnicNFTMarketplace = artifacts.require("OwnicNFTMarketplace");
const NFTCategoryController = artifacts.require("NFTCategoryController");
const EternalStorage = artifacts.require("EternalStorage");
const NFTCategoriesLibrary = artifacts.require("NFTCategoriesLibrary");
const NebulaToken = artifacts.require("NebulaToken");
const NebulaDynamicCollection = artifacts.require("NebulaDynamicCollection");
const OwnicPlayerOpener = artifacts.require("OwnicPlayerOpener");


async function getByte32(string) {
    return web3.utils.keccak256(string);
}

module.exports = async function (deployer, network, accounts) {

    let controller = await NFTCategoryController.deployed();

    let classIdD = 3;
    let classIdE = 4;
    let classIdF = 5;
    let classIdG = 6;


    let defender = await getByte32("Defender");
    let goalkeeper = await getByte32("Goalkeeper");
    let midfielder = await getByte32("Midfielder");
    let attacker = await getByte32("Attacker");

    await controller.addPlayerCategory(await getByte32("Test D goalkeeper 2021"), classIdD, goalkeeper, 80, 0);
    await controller.addPlayerCategory(await getByte32("Test E goalkeeper 2021"), classIdE, goalkeeper, 75, 0);
    await controller.addPlayerCategory(await getByte32("Test F goalkeeper 2021"), classIdF, goalkeeper, 70, 0);
    await controller.addPlayerCategory(await getByte32("Test G goalkeeper 2021"), classIdG, goalkeeper, 65, 0);

    await controller.addPlayerCategory(await getByte32("Test D defender 2021"), classIdD, defender, 80, 0);
    await controller.addPlayerCategory(await getByte32("Test E defender 2021"), classIdE, defender, 75, 0);
    await controller.addPlayerCategory(await getByte32("Test F defender 2021"), classIdF, defender, 70, 0);
    await controller.addPlayerCategory(await getByte32("Test G defender 2021"), classIdG, defender, 65, 0);

    await controller.addPlayerCategory(await getByte32("Test D midfielder 2021"), classIdD, midfielder, 80, 0);
    await controller.addPlayerCategory(await getByte32("Test E midfielder 2021"), classIdE, midfielder, 75, 0);
    await controller.addPlayerCategory(await getByte32("Test F midfielder 2021"), classIdF, midfielder, 70, 0);
    await controller.addPlayerCategory(await getByte32("Test G midfielder 2021"), classIdG, midfielder, 65, 0);

    await controller.addPlayerCategory(await getByte32("Test D attacker 2021"), classIdD, attacker, 80, 0);
    await controller.addPlayerCategory(await getByte32("Test E attacker 2021"), classIdE, attacker, 75, 0);
    await controller.addPlayerCategory(await getByte32("Test F attacker 2021"), classIdF, attacker, 70, 0);
    await controller.addPlayerCategory(await getByte32("Test G attacker 2021"), classIdG, attacker, 65, 0);


};
