const {expect, should, assert} = require('chai');
const truffleAssert = require('truffle-assertions');
const increaseTime = require('../script/increaseTime');
const {expectEvent} = require("@openzeppelin/test-helpers");
const setupController = require("../script/setupController");
const utils = require("../script/utils");
const OwnicController = artifacts.require('OwnicController.sol');
const BN = web3.utils.BN;
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
    let nft;
    let token;
    let powerRewards;
    let controller;
    let nftPower;
    let storage;

    const [admin, guest] = accounts;

    let classRookiePlayer_name = getByte32("ROOKIE_PLAYER");
    let classWorldClass_name = getByte32("WORLD_CLASS");
    let classStarPlayer_name = getByte32("STAR_PLAYER");
    let classGoldenBoy_name = getByte32("GOLDEN_BOY");
    let classRegularStarter_name = getByte32("REGULAR_STARTER");
    let classSquadPlayer_name = getByte32("SQUAD_PLAYER");
    let classElite_name = getByte32("ELITE");
    let classLegend_name = getByte32("LEGEND");
    let classVintage_name = getByte32("VINTAGE");
    let classHallOfFame_name = getByte32("HALL_OF_FAME");

    let classRookiePlayer_id = 1;
    let classWorldClass_id = 2;
    let classStarPlayer_id = 3;
    let classGoldenBoy_id = 4;
    let classRegularStarter_id = 5;
    let classSquadPlayer_id = 6;
    let classElite_id = 7;
    let classLegend_id = 8;
    let classVintage_id = 9;
    let classHallOfFame_id = 10;

    let classRookiePlayer_rarity = 32;
    let classWorldClass_rarity = 4;
    let classStarPlayer_rarity = 8;
    let classGoldenBoy_rarity = 16;
    let classRegularStarter_rarity = 64;
    let classSquadPlayer_rarity = 128;
    let classElite_rarity = 16;
    let classLegend_rarity = 1;
    let classVintage_rarity = 16;
    let classHallOfFame_rarity = 2;

    let defender = getByte32("Defender");
    let goalkeeper = getByte32("Goalkeeper");
    let midfielder = getByte32("Midfielder");
    let attacker = getByte32("Attacker");

    let raatsie = 116;
    let gorter = 119;
    let rico = 456;

    let edition1 = 1;
    let messi1 = 1;


    const zeroAddress = '0x0000000000000000000000000000000000000000';
    let signer = '0x4dd3a7ca8B345f712EA0Da887e8C1EA652643F45';

    const [ratsieEdition, gorterEdition, ricoEdition] = [1, 2, 3];

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
        await setupController(controller);

        await controller.addPlayerEdition(ratsieEdition, raatsie, getByte32("J. Gortesadr 2021"), classWorldClass_id, goalkeeper, 1000, 0);
        await controller.addPlayerEdition(gorterEdition, gorter, getByte32("J. Gortesadr 2021"), classWorldClass_id, goalkeeper, 1000, 0);
        await controller.addPlayerEdition(ricoEdition, rico, getByte32("J. Gortesadr 2021"), classWorldClass_id, goalkeeper, 1000, 0);
    });


    it("mint defender squad_player ratie", async () => {
        const categoryId1 = await controller.getEditionIdFromClassPartAndOffset(17, 0, goalkeeper);
        const categoryId2 = await controller.getEditionIdFromClassPartAndOffset(17, 1, goalkeeper);
        const categoryId3 = await controller.getEditionIdFromClassPartAndOffset(17, 2, goalkeeper);
        console.log(categoryId1.toNumber(), categoryId2.toNumber(), categoryId3.toNumber());

        const role = await nft.MINTER_ROLE()
        const expectedRoleGranted = await nft.grantRole(role, guest, {from: admin})
        expectEvent(expectedRoleGranted, 'RoleGranted', {
            role: role,
            account: guest,
            sender: admin,
        });

        let i;
        let count;
        for (i = 0; i < classWorldClass_rarity; i++) {
            count = await controller.getEditionCanMinted(ratsieEdition);
            assert.equal(classWorldClass_rarity - i, count.toNumber())
            await controller.handleMint(ratsieEdition, raatsie);
        }

        count = await controller.getEditionCanMinted(raatsie);

        assert.equal(0, count.toNumber());
    });

    it('total number of player by class pos', async () => {
        let countByPosition = await controller.getPlayersCountByFilter(classWorldClass_id, goalkeeper);
        assert.equal(2, countByPosition.toNumber());
    });

    it('total number of player by class pos', async () => {
        let index0 = await controller.getPlayerEditionId(classWorldClass_id, goalkeeper, 0);
        let index1 = await controller.getPlayerEditionId(classWorldClass_id, goalkeeper, 1);
        let index2 = await controller.getPlayerEditionId(classWorldClass_id, goalkeeper, 2);

        console.log("index0", index0.toNumber());
        console.log("index1", index1.toNumber());
        console.log("index2", index2.toNumber());
    });

    it('check rico  after swap', async () => {
        let a1= await controller.getPlayerEdition(raatsie)
        let a2 = await controller.getPlayerEdition(gorter)
        let a3 = await controller.getPlayerEdition(rico)

        console.log(a1[5].toNumber(), "raatsie");
        // console.log(a2[5].toNumber(), a2[6].toNumber(), "gorter")
        // console.log(a3[5].toNumber(), a3[6].toNumber(), "rico")
    
        const categoryId1 = await controller.getEditionIdFromClassPartAndOffset(17, 0, goalkeeper);
        const categoryId2 = await controller.getEditionIdFromClassPartAndOffset(17, 1, goalkeeper);
        const categoryId3 = await controller.getEditionIdFromClassPartAndOffset(17, 2, goalkeeper);
        console.log(categoryId1.toNumber(), categoryId2.toNumber(), categoryId3.toNumber());

        assert.equal(ricoEdition, categoryId1.toNumber());
    });


});