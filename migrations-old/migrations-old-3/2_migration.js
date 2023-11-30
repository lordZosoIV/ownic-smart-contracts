const OwnicNFTMarketplace = artifacts.require("OwnicNFTMarketplace");
const NFTCategoryController = artifacts.require("NFTCategoryController");
const EternalStorage = artifacts.require("EternalStorage");
const NFTCategoriesLibrary = artifacts.require("NFTCategoriesLibrary");
const NebulaToken = artifacts.require("NebulaToken");
const NebulaDynamicCollection = artifacts.require("NebulaDynamicCollection");
const OwnicPlayerOpener = artifacts.require("OwnicPlayerOpener");


const {deployProxy} = require('@openzeppelin/truffle-upgrades');

module.exports = async function (deployer, network, accounts) {

    // await deployProxy(OwnicNFTMarketplace, ["0x4fbbba2e526fd77e82f14fd142a1231acb79f2d8", "0x95d5ec85b37368ff142f034f567f6b0bdaeb04b4", "0xA113aa7739637b2a4beF8570B694D2b8527d66C8", 10110], {deployer, initializer: 'initialize'});

    await deployer.deploy(NebulaToken, "Nebula Test Token", "NEB", "1000000000000000000000000000");
    let token = await NebulaToken.deployed();

    await deployer.deploy(NebulaDynamicCollection, "Nebula Dynamic NFT Collection", "NEC", "http://nebula-nft.test/meta");
    let nft = await NebulaDynamicCollection.deployed();

    await deployer.deploy(EternalStorage, accounts[0], accounts[0])
    let storage = await EternalStorage.deployed();
    await deployer.deploy(NFTCategoriesLibrary);
    await deployer.link(NFTCategoriesLibrary, NFTCategoryController);
    await deployer.deploy(NFTCategoryController);
    let controller = await NFTCategoryController.deployed();
    await controller.initialize(storage.address, nft.address)
    await storage.setAssociatedContract(controller.address);
    await controller.addInflation(100);


    await deployProxy(OwnicNFTMarketplace,
        [token.address, nft.address, controller.address, accounts[0], 0, 10000000],
        {deployer, initializer: 'initialize'}
    );

    let market = await OwnicNFTMarketplace.deployed();

    await token.approve(market.address, "10000000000000000000000");
    await nft.grantRole(await nft.MINTER_ROLE.call(), market.address);
    await nft.setApprovalForAll(market.address, true);

    await deployer.deploy(
        OwnicPlayerOpener, token.address, nft.address, controller.address, accounts[0],
        accounts[0], "0x8C7382F9D8f56b33781fE506E897a4F1e2d17255", "0x326C977E6efc84E512bB9C30f76E30c160eD06FB", "0x6e75b569a01ef56d18cab6a8e71e6600d6ce853834d4a5748b720d06f878b3a4",
        100000000000000,
        100
    );
    let opener = await OwnicPlayerOpener.deployed();

    await token.approve(opener.address, "10000000000000000000000");
    await nft.grantRole(await nft.MINTER_ROLE.call(), opener.address);
    await nft.setApprovalForAll(opener.address, true);

};
