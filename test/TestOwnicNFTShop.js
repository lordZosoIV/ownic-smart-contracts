const {assert} = require("chai");
const utils = require("../script/utils");
const setupController = require('../script/setupController');
const params = require("../script/params");
const {prevAll} = require("truffle/build/658.bundled");
const OwnicNFTShop = artifacts.require("OwnicNFTShop.sol");
const OwnicToken = artifacts.require("OwnicToken.sol");
const PlayerCollection = artifacts.require("PlayerCollection.sol");
const OwnicController = artifacts.require("OwnicController.sol");
const NFTPower = artifacts.require("NFTPower.sol");
const EternalStorage = artifacts.require("EternalStorage.sol");
const NFTEditionLibrary = artifacts.require("NFTEditionLibrary.sol");
const OwnicCollectionPowerRewards = artifacts.require("OwnicCollectionPowerRewards.sol");


function getByte32(string) {
    return web3.utils.fromAscii(string);
}

function toWei(amount) {
    return web3.utils.toWei("" + amount);
}

contract("OwnicNFTShop", ([admin, collector]) => {
    let token, nft, controller, shop, nftPower, storage, powerRewards;
    let signer = '0x4dd3a7ca8B345f712EA0Da887e8C1EA652643F45';
    let tokenId = 0;
    const [messi1, messi2] = [1, 2];
    before(async () => {
        token = await OwnicToken.new("Ownic Test", "OWN", utils.toWei(1_000_000_000));
        nft = await PlayerCollection.new("Player NFT Collection", "OWNICPLAYER", "http://nebula-nft.test/meta");
        powerRewards = await OwnicCollectionPowerRewards.new(admin, token.address, nft.address);
        nftPower = await NFTPower.new(signer, powerRewards.address);
        storage = await EternalStorage.new(admin, admin);
        let lib = await NFTEditionLibrary.new();
        await OwnicController.link("NFTEditionLibrary", lib.address);
        controller = await OwnicController.new();
        await controller.initialize(storage.address, nft.address, nftPower.address)
        await storage.setAssociatedContract(controller.address);
        await powerRewards.setOwnicController(controller.address);
        await powerRewards.setPowerReconstructorAddress(nftPower.address);
        await nftPower.setControllerRole(controller.address);
        await nft.setTransferProcessor(powerRewards.address);

        await setupController(controller)

        await controller.addPlayerEdition(messi1,1,getByte32("J. Gortesadr 2021"), 7, params.POSITION_GOALKEEPER, 1000, 6, toWei(5), false);
        await controller.addPlayerEdition(messi2,2,getByte32("J. Gortesadr 2021"), 7, params.POSITION_GOALKEEPER, 1000, 1, toWei(5), true);
    });


    describe('Initialize', function () {
        it('should initialize', async function () {
            shop = await OwnicNFTShop.new();
            await shop.initialize(
                nft.address,
                controller.address,
                collector,
                tokenId,
                params.SUBGROUP_SHOP
                );
            await nft.setMinterRole(shop.address);
        });

        it('should purchase', async function () {
            let collectBalBeforePurchase = await web3.eth.getBalance(collector);

            await shop.purchase(1, {value:toWei(5)});

            let collectBalAfterPurchase = await web3.eth.getBalance(collector);

            assert.equal(Number(collectBalAfterPurchase), Number(collectBalBeforePurchase) + Number(toWei(5)));

        });
    });
})