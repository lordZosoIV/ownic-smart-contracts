const OwnicController = artifacts.require("OwnicController.sol");
const setupController = require("../script/setupController");

// const {deployProxy} = require('@openzeppelin/truffle-upgrades');

function getByte32(string) {
    return web3.utils.fromAscii(string);
}

module.exports = async function (deployer, network, accounts) {

    if (network === "test") {
        return;
    }

    let controller = await OwnicController.deployed();
    await setupController(controller);

    // code for updating controller after changes
/*
    let storage = await EternalStorage.deployed();
    let power = await NFTPower.deployed();
    let shop = await OwnicNFTShop.deployed();
    let nft = await PlayerCollection.deployed();

    await deployer.deploy(NFTEditionLibrary);
    await deployer.link(NFTEditionLibrary, OwnicController);

    await deployer.deploy(OwnicController);
    controller = await OwnicController.deployed();
    await controller.initialize(storage.address, nft.address, power.address)
    await storage.setAssociatedContract(controller.address);
    await controller.addInflation("10000000000000000");
    await power.setControllerRole(controller.address);
    await shop.setController(controller.address);
 */

};
