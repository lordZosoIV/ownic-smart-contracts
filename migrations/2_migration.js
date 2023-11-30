const PlayerCollection = artifacts.require("PlayerCollection.sol");
const NFTPower = artifacts.require("NFTPower.sol");
const EternalStorage = artifacts.require("EternalStorage.sol");
const NFTEditionLibrary = artifacts.require("NFTEditionLibrary.sol");
const OwnicController = artifacts.require("OwnicController.sol");

module.exports = async function (deployer, network, accounts) {

    if (network === "test") {
        return;
    }

    const zeroAddr = "0x0000000000000000000000000000000000000000";
    const signer = "0xd6ff3E38baFaaB6c177279939c49dd0E82EB2052";

    // deploy NFT
    await deployer.deploy(PlayerCollection, "OWNIC NFT Players Collection", "OWNICPLAYER", "https://ownic-nft-collection-staging.s3.eu-central-1.amazonaws.com/meta/", {gas : 3500000});

    let nft = await PlayerCollection.deployed();

    // deploy erc-20 ownic
    /*
    await deployer.deploy(OwnicToken, "OWNIC TOKEN", "OWN", "1000000000000000000000000000");
    let token = await OwnicToken.deployed();
    */

    // deploy power without consumer(staking)
    await deployer.deploy(NFTPower, signer, zeroAddr, {gas : 2000000});
    let power = await NFTPower.deployed();

    // deploy OwnicController
    await deployer.deploy(EternalStorage, accounts[0], accounts[0], {gas : 1500000});
    let storage = await EternalStorage.deployed();
    await deployer.deploy(NFTEditionLibrary, {gas : 4000000});
    await deployer.link(NFTEditionLibrary, OwnicController);
    await deployer.deploy(OwnicController, {gas : 3000000});
    let controller = await OwnicController.deployed();
    await controller.initialize(storage.address, nft.address, power.address)
    await storage.setAssociatedContract(controller.address);
    await power.setControllerRole(controller.address);

};
