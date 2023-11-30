const OwnicNFTMarketplace = artifacts.require("OwnicNFTMarketplace");
const NFTCategoryController = artifacts.require("NFTCategoryController");
const EternalStorage = artifacts.require("EternalStorage");
const NFTCategoriesLibrary = artifacts.require("NFTCategoriesLibrary");
const NebulaToken = artifacts.require("NebulaToken");
const NebulaDynamicCollection = artifacts.require("NebulaDynamicCollection");
const OwnicPlayerOpener = artifacts.require("OwnicPlayerOpener");

module.exports = async function (deployer, network, accounts) {


    let nft = await NebulaDynamicCollection.deployed();
    let storage = await EternalStorage.deployed();
    await deployer.link(NFTCategoriesLibrary, NFTCategoryController);
    await deployer.deploy(NFTCategoryController);
    let controller = await NFTCategoryController.deployed();
    await controller.initialize(storage.address, nft.address)
    await storage.setAssociatedContract(controller.address);
    await controller.addInflation(100);

    let token = await NebulaToken.deployed();

    await deployer.deploy(
        OwnicPlayerOpener, token.address, nft.address, controller.address, accounts[0],
        accounts[0], "0x8C7382F9D8f56b33781fE506E897a4F1e2d17255", "0x326C977E6efc84E512bB9C30f76E30c160eD06FB", "0x6e75b569a01ef56d18cab6a8e71e6600d6ce853834d4a5748b720d06f878b3a4",
        100000000000000,
        110
    );
    let opener = await OwnicPlayerOpener.deployed();

    await token.approve(opener.address, "10000000000000000000000");
    await nft.grantRole(await nft.MINTER_ROLE.call(), opener.address);
    await nft.setApprovalForAll(opener.address, true);

};
