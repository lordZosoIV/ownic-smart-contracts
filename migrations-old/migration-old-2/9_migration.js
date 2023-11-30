const OwnicNFTMarketplace = artifacts.require("OwnicNFTMarketplace");
const NFTCategoryController = artifacts.require("NFTCategoryController");
const NebulaToken = artifacts.require("NebulaToken");
const NebulaDynamicCollection = artifacts.require("NebulaDynamicCollection");


const {deployProxy} = require('@openzeppelin/truffle-upgrades');

module.exports = async function (deployer, network, accounts) {

    let token = await NebulaToken.deployed();
    let nft = await NebulaDynamicCollection.deployed();
    let controller = await NFTCategoryController.deployed();

    await deployProxy(OwnicNFTMarketplace,
        [token.address, nft.address, controller.address, accounts[0], 0, 10000000],
        {deployer, initializer: 'initialize'}
    );

};
