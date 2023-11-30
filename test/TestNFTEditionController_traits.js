const NFTPower = artifacts.require("NFTPowerMock.sol");
const OwnicCollectionPowerRewards = artifacts.require("OwnicCollectionPowerRewards.sol");
const OwnicToken = artifacts.require("OwnicToken.sol");
const PlayerCollection = artifacts.require('PlayerCollection.sol');
const OwnicController = artifacts.require('OwnicController.sol');
const EternalStorage = artifacts.require("EternalStorage.sol");
const NFTEditionLibrary = artifacts.require("NFTEditionLibrary.sol");

const BN = web3.utils.BN;
const utils = require('../script/utils');

function getByte32(string) {
    return web3.utils.fromAscii(string);
}

const zero = ["0"];

function increaseLengthByZeros(str){
    return str + zero.join("").repeat(64 - str.length + 2);
}

contract("NFTEditionController", accounts => {

    let token;
    let nft;
    let powerRewards;
    let controller;
    let nftPower;
    let storage;

    let signer = '0x4dd3a7ca8B345f712EA0Da887e8C1EA652643F45';
    const editionId = 116;
    const pId = 1;

    before(async () => {
        token = await OwnicToken.new("Ownic Test", "OWN", utils.toWei(1_000_000_000));
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

        await controller.addPlayerEdition(editionId,pId,getByte32("J. Gortesadr 2021"),6,getByte32("Goalkeeper"),1000,0);
    });


    it("should return trait value", async () => {
        await controller.addTraitToPlayerEdition(editionId, getByte32("goals"), 12);
        let a = await controller.getPlayerEditionTrait(editionId);
        assert.equal(12, a[1].toNumber())
    });


    it("should return trait name", async () => {
        await controller.addTraitToPlayerEdition(editionId, getByte32("goals"), 12);
        let a = await controller.getPlayerEditionTrait(editionId);
        assert.equal(increaseLengthByZeros(getByte32("goals")), a[0])
    });

    it("should return trait value after change", async () => {
        let oldValue = await controller.getPlayerEditionTrait(editionId);
        oldValue = oldValue[1].toNumber();
        await controller.addTraitToPlayerEdition(editionId, getByte32("goals"), oldValue + 5);
        let a = await controller.getPlayerEditionTrait(editionId);
        assert.equal(17, a[1].toNumber())
    });


});