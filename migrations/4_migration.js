const {deployProxy} = require("@openzeppelin/truffle-upgrades");

const utils = require("../script/utils");
const params = require("../script/params");

const OwnicNFTShop = artifacts.require("OwnicNFTShop");
const PlayerCollection = artifacts.require("PlayerCollection.sol");
const OwnicController = artifacts.require("OwnicController.sol");

module.exports = async function (deployer, network, accounts) {

    if (network === "test") {
        return;
    }

    let nft = await PlayerCollection.deployed();
    let controller = await OwnicController.deployed();

    // deploy shop
    await deployProxy(OwnicNFTShop,
        [nft.address, controller.address, accounts[0], 10000000, params.SUBGROUP_SHOP],
        {deployer, initializer: 'initialize'}
    );
    let shop = await OwnicNFTShop.deployed();
    await nft.grantRole(await nft.MINTER_ROLE.call(), shop.address);

    // deploy p2p marketplace
    /*
       await deployProxy(OwnicNFTP2PMarketplace,
            [token.address, nft.address, controller.address, accounts[0], 0],
            {deployer, initializer: 'initialize'}
        );

        let market = await OwnicNFTP2PMarketplace.deployed();
        await nft.grantRole(await nft.MINTER_ROLE.call(), market.address);
        await token.approve(market.address, "10000000000000000000000");
        await nft.setApprovalForAll(market.address, true);
        */

    // deploy token presale
    /*
    await deployer.deploy(NFTPresale,
        nft.address,
        zeroAddr,
        walletAddr,
        nextTokenId,
        web3.utils.toWei("" + 0.02),
        10,
        1,
        20,
        3
    );
    let presale = await NFTPresale.deployed();
    await nft.grantRole(await nft.MINTER_ROLE.call(), presale.address);
    */


    // deploy vesting
    /*
        const OPTIONS = {
        rate: 2,
        maxCap: utils.toWei(200_000),
        fundSaver: "0x1273743ECc5d519d036D7C5e2dE85892127c4e85",
        cliff: 300,
        duration: 3000,
        }

        await deployer.deploy(OwnicToken, "Ownic Test", "OWN", utils.toWei(1_000_000_000));
        let token = await OwnicToken.deployed();
        await deployer.deploy(TokenVesting, token.address);
        let tokenVesting = await TokenVesting.deployed();
        await deployer.deploy(CappedSaleRoundPublic, OPTIONS.rate, OPTIONS.maxCap, OPTIONS.fundSaver, OPTIONS.cliff, OPTIONS.duration, tokenVesting.address);
        let sale = await CappedSaleRoundPublic.deployed();
        await tokenVesting.grantRole(utils.hash("VESTING_MANAGER"), sale.address);
        await token.transfer(tokenVesting.address, OPTIONS.maxCap);
     */

};
