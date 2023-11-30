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
    await deployer.deploy(NFTCategoriesLibrary);
    await deployer.link(NFTCategoriesLibrary, NFTCategoryController);
    await deployer.deploy(NFTCategoryController);
    let controller = await NFTCategoryController.deployed();
    await controller.initialize(storage.address, nft.address)
    await storage.setAssociatedContract(controller.address);
    await controller.addInflation(100);

    let opener = await OwnicPlayerOpener.deployed();
    opener.setController(controller.address);
    let market = await OwnicNFTMarketplace.deployed();
    market.setController(controller.address);

};
