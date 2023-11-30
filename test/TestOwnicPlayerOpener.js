const {expect, should, assert} = require('chai');
const truffleAssert = require('truffle-assertions');
const increaseTime = require('../script/increaseTime');
const utils = require("../script/utils");
const params = require("../script/params");
const setupController = require("../script/setupController");
const async = require("truffle/build/385.bundled");
const PlayerCollection = artifacts.require("PlayerCollection.sol");
const NFTPresale = artifacts.require("NFTPresale.sol");
// const NFTPresaleReveal = artifacts.require("NFTPresaleRevealMock.sol");
// const NFTEditionController = artifacts.require("NFTEditionControllerMock.sol");
const NFTPresaleReveal = artifacts.require("NFTPresaleReveal.sol");
const NFTEditionController = artifacts.require("OwnicController.sol");
const VRFCoordinatorMock = artifacts.require("VRFCoordinatorMock.sol");
const LinkToken = artifacts.require("LinkToken.sol"); // change to basic erc-20
const BN = web3.utils.BN;
const OwnicCollectionPowerRewards = artifacts.require("OwnicCollectionPowerRewards.sol");
const OwnicToken = artifacts.require("OwnicToken.sol");
const OwnicController = artifacts.require('OwnicController.sol');
const EternalStorage = artifacts.require("EternalStorage.sol");
const NFTEditionLibrary = artifacts.require("NFTEditionLibrary.sol");
const NFTPower = artifacts.require("NFTPower.sol");
const OwnicPlayerOpener = artifacts.require("OwnicClassPackOpenerByNetworkCoin.sol");


function getByte32(string) {
    return web3.utils.keccak256(string);
}

function toWei(amount) {
    return web3.utils.toWei("" + amount);
}

contract("OwnicPlayerOpener", accounts => {

    let controller;
    let nft;
    let linkToken;
    let vrfCoordinator;
    let lib;
    let signer = '0x4dd3a7ca8B345f712EA0Da887e8C1EA652643F45';
    let opener;
    let powerRewards;
    let nftPower;
    let storage;

    const classCommon = 1;
    const classRare = 2;

    const packSize = 4;

    const [classCommonRarity, classRareRarity] = [2, 1];

    const [common1, common2, common3, common4, common5, common6, common7, common8] = [1, 3, 5, 7, 9, 11, 13, 15];
    const [rare1, rare2, rare3, rare4] = [2, 4, 6, 8];


    const testNftId = 1;
    const zeroAddr = "0x0000000000000000000000000000000000000000";

    const key_hash = '0x6c3699283bda56ad74f6b855546325b68d482e983852a7a82979cc4807b641f4';


    before(async () => {
        nft = await PlayerCollection.new("Player NFT Collection", "OWNICPLAYER", "http://nebula-nft.test/meta");

        linkToken = await LinkToken.new('10000000000000000000000');

        vrfCoordinator = await VRFCoordinatorMock.new(linkToken.address);

        powerRewards = await OwnicCollectionPowerRewards.new(accounts[0], linkToken.address, nft.address);
        nftPower = await NFTPower.new(signer, powerRewards.address);
        storage = await EternalStorage.new(accounts[0], accounts[0]);
        lib = await NFTEditionLibrary.new();
        await OwnicController.link("NFTEditionLibrary", lib.address);
        controller = await OwnicController.new();
        await controller.initialize(storage.address, nft.address, nftPower.address)
        await storage.setAssociatedContract(controller.address);
        await powerRewards.setOwnicController(controller.address);
        await powerRewards.setPowerReconstructorAddress(nftPower.address);
        await nftPower.setControllerRole(controller.address);
        await nft.setTransferProcessor(powerRewards.address);


        // await setupController(controller);

        //setupController
        await controller.addPlayerClassType(getByte32("common"), 1, classCommonRarity, params.SUBGROUP_PACK);
        await controller.addPlayerClassType(getByte32("rare"), 2, classRareRarity, params.SUBGROUP_PACK);

        await controller.addPlayerEdition(common1, 1, getByte32("common_1"), classCommon, getByte32("Guard"), 1000, 1, 0, true);
        await controller.addPlayerEdition(common2, 2, getByte32("common_3"), classCommon, getByte32("Guard"), 1000, 1, 0, true);
        await controller.addPlayerEdition(common3, 3, getByte32("common_2"), classCommon, getByte32("Forward"), 1000, 1, 0, true);
        await controller.addPlayerEdition(common4, 4, getByte32("common_4"), classCommon, getByte32("Forward"), 1000, 1, 0, true);

        await controller.addPlayerEdition(rare1, 5, getByte32("rare_1"), classRare, getByte32("Forward"), 1000, 1, 0, true); //[2, 1] -> 2
        await controller.addPlayerEdition(rare2, 6, getByte32("rare_2"), classRare, getByte32("Guard"), 1000, 1, 0, true); //[2, 2] -> 4
        await controller.addPlayerEdition(rare3, 7, getByte32("rare_3"), classRare, getByte32("Forward"), 1000, 1, 0, true); //[2, 3] -> 6
        await controller.addPlayerEdition(rare4, 8, getByte32("rare_4"), classRare, getByte32("Guard"), 1000, 1, 0, true); //[2, 4] -> 8


        opener = await OwnicPlayerOpener.new(
            nft.address,
            controller.address,
            accounts[0],
            accounts[1],
            accounts[2],
            vrfCoordinator.address,
            linkToken.address,
            key_hash,
            1,
            1
        );

        await nft.grantRole(await nft.MINTER_ROLE.call(), opener.address);
        await controller.grantRole(await controller.MINTER_ROLE.call(), opener.address);

        await linkToken.transfer(opener.address, "100000000000000000");

        await opener.addClassType(classCommon, packSize, 1, {from: accounts[0]});
        await opener.addClassType(classRare, packSize, 1, {from: accounts[0]});

        let count = await controller.getCardsCountByClass(classRare);
        console.log("rrrr", count.toNumber());

        count = await controller.getCardsCountByClass(classCommon);
        console.log("tttt", count.toNumber());

    });


    describe('test getting edition id from class and offset', function () {
        it('should return class common 1', async () => {
            let id = await controller.getEditionIdFromClassPartAndOffsetWithClassId(0, 1);
            assert.equal(id.toNumber(), common1);
        });

        it('should return class common 2', async () => {
            let id = await controller.getEditionIdFromClassPartAndOffsetWithClassId(1, 1);
            assert.equal(id.toNumber(), common2);
        });

        it('should return class common 3', async () => {
            let id = await controller.getEditionIdFromClassPartAndOffsetWithClassId(2, 1);
            assert.equal(id.toNumber(), common3);
        });

        it('should return class common 4', async () => {
            let id = await controller.getEditionIdFromClassPartAndOffsetWithClassId(3, 1);
            assert.equal(id.toNumber(), common4);
        });

        it('should return class rare 4', async () => {
            let id = await controller.getEditionIdFromClassPartAndOffsetWithClassId(23, 2);
            assert.equal(id.toNumber(), rare4);
        });

        it('should return class rare 3', async () => {
            let id = await controller.getEditionIdFromClassPartAndOffsetWithClassId(1222, 2);
            assert.equal(id.toNumber(), rare3);
        });

        it('should return class rare 2', async () => {
            let id = await controller.getEditionIdFromClassPartAndOffsetWithClassId(1001, 2);
            assert.equal(id.toNumber(), rare2);
        });

        it('should return class rare 1', async () => {
            let id = await controller.getEditionIdFromClassPartAndOffsetWithClassId(100, 2);
            assert.equal(id.toNumber(), rare1);
        });

    });

    describe('test open pack with mocked VRFCoordinator', function () {

        it("open all rares", async () => {
            let count = await controller.getCardsCountByClass(classRare);
            console.log(count.toNumber());

            let tx = await opener.openPackInit(classRare, {value: toWei(0.2)});

            let requestID;
            let currentPackId = 1;

            truffleAssert.eventEmitted(tx, 'RandomRequested', (ev) => {
                requestID = ev.requestId;
                return ev.nextOpenPackId.toNumber() === currentPackId;
            });

            console.log("RequestID", requestID);

            await vrfCoordinator.callBackWithRandomness(requestID, "95250688022146912429659701458105696330965093922381253647056665233705758414322", opener.address);

            await opener.openPack(0);

            let b1 = await controller.getEditionCanMinted(rare1);
            assert.equal(0, b1.toNumber());

            let b2 = await controller.getEditionCanMinted(rare2);
            assert.equal(0, b2.toNumber());

            let b3 = await controller.getEditionCanMinted(rare3);
            assert.equal(0, b3.toNumber());

            let b4 = await controller.getEditionCanMinted(rare4);
            assert.equal(0, b4.toNumber());

        });

        it("edition can mint", async () => {
            let c1, c2, c3, c4, b1, b2, b3, b4

            let count = await controller.getEditionsCountByClassId(classCommon);
            assert.equal(4, count.toNumber());

            await controller.reduceEditionCanMinted(common1, 1);
            await controller.reduceEditionCanMinted(common2, 1);
            await controller.reduceEditionCanMinted(common4, 1);
            await controller.reduceEditionCanMinted(common4, 1);


            await controller.reduceEditionCanMinted(common2, 1);
            await controller.reduceEditionCanMinted(common3, 1);
            await controller.reduceEditionCanMinted(common3, 1);
            await controller.reduceEditionCanMinted(common1, 1);


            b1 = await controller.getEditionCanMinted(common1);
            b2 = await controller.getEditionCanMinted(common2);
            b3 = await controller.getEditionCanMinted(common3);
            b4 = await controller.getEditionCanMinted(common4);

            c1 = await controller.getIndexByClass(common1);
            c2 = await controller.getIndexByClass(common2);
            c3 = await controller.getIndexByClass(common3);
            c4 = await controller.getIndexByClass(common4);

            b1 = await controller.getEditionCanMinted(common1);
            assert.equal(0, b1.toNumber());

            b2 = await controller.getEditionCanMinted(common2);
            assert.equal(0, b2.toNumber());

            b3 = await controller.getEditionCanMinted(common3);
            assert.equal(0, b3.toNumber());

            b4 = await controller.getEditionCanMinted(common4);
            assert.equal(0, b4.toNumber());

        });

        it('should add again', async () => {
            let c1, c2, c3, c4, b1, b2, b3, b4

            await controller.addPlayerEdition(common5, 1, getByte32("common_1"), classCommon, getByte32("Guard"), 1000, 1, 0, true);
            await controller.addPlayerEdition(common6, 2, getByte32("common_3"), classCommon, getByte32("Guard"), 1000, 1, 0, true);
            await controller.addPlayerEdition(common7, 3, getByte32("common_2"), classCommon, getByte32("Forward"), 1000, 1, 0, true);
            await controller.addPlayerEdition(common8, 4, getByte32("common_4"), classCommon, getByte32("Forward"), 1000, 1, 0, true);

            b1 = await controller.getEditionCanMinted(common5);
            assert.equal(classCommonRarity, b1.toNumber());

            b2 = await controller.getEditionCanMinted(common6);
            assert.equal(classCommonRarity, b2.toNumber());

            b3 = await controller.getEditionCanMinted(common7);
            assert.equal(classCommonRarity, b3.toNumber());

            b4 = await controller.getEditionCanMinted(common8);
            assert.equal(classCommonRarity, b4.toNumber());
        });


        it("open all commons part1", async () => {
            let count = await controller.getCardsCountByClass(classCommon);
            console.log(count.toNumber());

            let c1, c2,c3,c4
            let b1 = await controller.getEditionCanMinted(common5);
            // assert.equal(0, b1.toNumber());

            let b2 = await controller.getEditionCanMinted(common6);
            // assert.equal(0, b2.toNumber());

            let b3 = await controller.getEditionCanMinted(common7);
            // assert.equal(0, b3.toNumber());

            let b4 = await controller.getEditionCanMinted(common8);

            c1 = await controller.getIndexByClass(common5);
            c2 = await controller.getIndexByClass(common6);
            c3 = await controller.getIndexByClass(common7);
            c4 = await controller.getIndexByClass(common8);

            console.log(b1.toNumber(), c1.toNumber());
            console.log(b2.toNumber(), c2.toNumber());
            console.log(b3.toNumber(), c3.toNumber());
            console.log(b4.toNumber(), c4.toNumber());

            console.log("###############################")

            let tx = await opener.openPackInit(classCommon, {value:toWei(0.2)});
            let requestID;
            let nextOpenPackId = 2;
            truffleAssert.eventEmitted(tx, 'RandomRequested', (ev) => {
                requestID = ev.requestId;
                return ev.nextOpenPackId.toNumber() === nextOpenPackId;
            });
            console.log("RequestID", requestID);
            await vrfCoordinator.callBackWithRandomness(requestID, "95250688022146912429659701458105696330965093922381253647056665233705758414322", opener.address);
            await opener.openPack(nextOpenPackId - 1);


            b1 = await controller.getEditionCanMinted(common5);
            // assert.equal(0, b1.toNumber());

            b2 = await controller.getEditionCanMinted(common6);
            // assert.equal(0, b2.toNumber());

            b3 = await controller.getEditionCanMinted(common7);
            // assert.equal(0, b3.toNumber());

            b4 = await controller.getEditionCanMinted(common8);


            c1 = await controller.getIndexByClass(common5);
            c2 = await controller.getIndexByClass(common6);
            c3 = await controller.getIndexByClass(common7);
            c4 = await controller.getIndexByClass(common8);


            console.log(b1.toNumber(), c1.toNumber());
            console.log(b2.toNumber(), c2.toNumber());
            console.log(b3.toNumber(), c3.toNumber());
            console.log(b4.toNumber(), c4.toNumber());
        });




        it("open all commons part2", async () => {
            let count = await controller.getCardsCountByClass(classCommon);
            console.log(count.toNumber());

            let tx = await opener.openPackInit(classCommon, {value:toWei(0.2)});
            let requestID;
            let nextOpenPackId = 3;
            truffleAssert.eventEmitted(tx, 'RandomRequested', (ev) => {
                requestID = ev.requestId;
                return ev.nextOpenPackId.toNumber() === nextOpenPackId;
            });
            console.log("RequestID", requestID);
            await vrfCoordinator.callBackWithRandomness(requestID, "95250688022146912429659701458105696330965093922381253647056665233705758414322", opener.address);

            let c1, c2,c3,c4, b1, b2, b3, b4
            b1 = await controller.getEditionCanMinted(common5);
            b2 = await controller.getEditionCanMinted(common6);
            b3 = await controller.getEditionCanMinted(common7);
            b4 = await controller.getEditionCanMinted(common8);

            c1 = await controller.getIndexByClass(common5);
            c2 = await controller.getIndexByClass(common6);
            c3 = await controller.getIndexByClass(common7);
            c4 = await controller.getIndexByClass(common8);


            console.log(b1.toNumber(), c1.toNumber());
            console.log(b2.toNumber(), c2.toNumber());
            console.log(b3.toNumber(), c3.toNumber());
            console.log(b4.toNumber(), c4.toNumber());

            await opener.openPack(nextOpenPackId - 1);

            b1 = await controller.getEditionCanMinted(common5);
            // assert.equal(0, b1.toNumber());

            b2 = await controller.getEditionCanMinted(common6);
            // assert.equal(0, b2.toNumber());

            b3 = await controller.getEditionCanMinted(common7);
            // assert.equal(0, b3.toNumber());

            b4 = await controller.getEditionCanMinted(common8);

            c1 = await controller.getIndexByClass(common5);
            c2 = await controller.getIndexByClass(common6);
            c3 = await controller.getIndexByClass(common7);
            c4 = await controller.getIndexByClass(common8);


            console.log(b1.toNumber(), c1.toNumber());
            console.log(b2.toNumber(), c2.toNumber());
            console.log(b3.toNumber(), c3.toNumber());
            console.log(b4.toNumber(), c4.toNumber());

            assert.equal(0, b1.toNumber());
            assert.equal(0, b2.toNumber());
            assert.equal(0, b2.toNumber());
            assert.equal(0, b2.toNumber());

        });


        it("open commonts again", async () => {

            let count = await controller.getCardsCountByClass(classCommon);
            console.log(count.toNumber());

            let tx = await opener.openPackInit(classCommon, {value:toWei(0.2)});
            let requestID;
            let nextOpenPackId = 4;
            truffleAssert.eventEmitted(tx, 'RandomRequested', (ev) => {
                requestID = ev.requestId;
                return ev.nextOpenPackId.toNumber() === nextOpenPackId;
            });
            console.log("RequestID", requestID);
            await vrfCoordinator.callBackWithRandomness(requestID, "95250688022146912429659701458105696330965093922381253647056665233705758414322", opener.address);

            await truffleAssert.reverts(
                opener.openPack(nextOpenPackId - 1),"not enough cards left"
            );

        });

    });

});