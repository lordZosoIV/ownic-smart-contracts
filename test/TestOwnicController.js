const OwnicController = artifacts.require("OwnicController.sol");
const utils = require("../script/utils");
const setupController = require("../script/setupController");
const {expectRevert} = require("@openzeppelin/test-helpers");
const NFTPower = artifacts.require("NFTPowerMock.sol");
const OwnicCollectionPowerRewards = artifacts.require("OwnicCollectionPowerRewards.sol");
const OwnicToken = artifacts.require("OwnicToken.sol");
const PlayerCollection = artifacts.require('PlayerCollection.sol');
const EternalStorage = artifacts.require("EternalStorage.sol");
const NFTEditionLibrary = artifacts.require("NFTEditionLibrary.sol");

function getByte32(string) {
    return web3.utils.fromAscii(string);
}

contract("NFTEditionController", accounts => {
    let attacker = getByte32("Attacker");
    let messi2021Id = 1;
    let messi2022Id = 2;
    let nft;
    let token;
    let powerRewards;
    let controller;
    let nftPower;
    let storage;

    let signer = '0x4dd3a7ca8B345f712EA0Da887e8C1EA652643F45';


    before(async () => {
        token = await OwnicToken.new("Ownic Test", "OWN", utils.toWei(1));
        nft = await PlayerCollection.new("Player NFT Collection", "OWNICPLAYER", "http://nebula-nft.test/meta");
        powerRewards = await OwnicCollectionPowerRewards.new(accounts[0], token.address, nft.address);
        nftPower = await NFTPower.new(signer, powerRewards.address);
        storage = await EternalStorage.new(accounts[0], accounts[0]);
        let lib = await NFTEditionLibrary.new();
        await OwnicController.link("NFTEditionLibrary", lib.address);
        controller = await OwnicController.new();
        await controller.initialize(storage.address, nft.address, nftPower.address)
        await storage.setAssociatedContract(controller.address);
        await powerRewards.setOwnicController(controller.address);
        await powerRewards.setPowerReconstructorAddress(nftPower.address);
        await nftPower.setControllerRole(controller.address);
        await nft.setTransferProcessor(powerRewards.address);
        await setupController(controller);
        await controller.addPlayerEdition(messi2021Id, 1, await getByte32("Messi2021"), 7, attacker, 99, 3, 2, true);
        await controller.addPlayerEdition(messi2022Id, 1, await getByte32("Messi2022"), 1, attacker, 99, 3, 2, true);
    });

    it('should calculate valid edition price by subgroup', async () => {
        const result = await controller.getEditionPriceCalculated(messi2021Id, getByte32('SHOP'));
        console.log(result.toNumber());
    });
    it('should not calculate valid edition price by incorrect subgroup', async () => {
        await expectRevert(controller.getEditionPriceCalculated(messi2022Id, getByte32('SHOP')),
            'class can\'t minted by this subgroup');
    });

    it('should not calculate valid edition price by different incorrect subgroup', async () => {
        await expectRevert(controller.getEditionPriceCalculated(messi2021Id, getByte32('PRESALE')),
            'class can\'t minted by this subgroup');
    });
});
