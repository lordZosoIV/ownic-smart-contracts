const {expect, should, assert} = require('chai');
const truffleAssert = require('truffle-assertions');
const increaseTime = require('../script/increaseTime');
const OwnicController = artifacts.require("OwnicController.sol");
const BN = web3.utils.BN;
const utils = require("../script/utils");
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

    let messi2021Id = 1;
    let tornike2021Id = 2;
    let irakli2021Id = 3;
    let givi2021Id = 4;
    let davit2021Id = 5;

    let nft;
    let token;
    let powerRewards;
    let controller;
    let nftPower;
    let storage;

    const zeroAddress = '0x0000000000000000000000000000000000000000';
    let signer = '0x4dd3a7ca8B345f712EA0Da887e8C1EA652643F45';

    const subGroup = getByte32("TEST_SUBGROUP");


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
    });


    it("should assert true", async () => {
        return assert.isTrue(true);
    });

    it('Test deployed NFTEditionController', async () => {
        const playersCount = await controller.getEditionsCount();
        return assert.equal(0, playersCount);
    });

    it("zero class should be empty", async () => {
        const response = await controller.getClassByRarity(0);
        const id = response[0];
        return assert.equal(0, id);
    });

    it("add class RookiePlayer", async () => {

        await controller.addPlayerClassType(classRookiePlayer_name, classRookiePlayer_id, classRookiePlayer_rarity, subGroup);

        let response = await controller.getClassByRarity(0);
        let id = response[0];
        return assert.equal(classRookiePlayer_id, id)
    });

    it("add class RegularStarter", async () => {

        await controller.addPlayerClassType(classRegularStarter_name, classRegularStarter_id, classRegularStarter_rarity, subGroup);

        let response = await controller.getClassByRarity(0);
        let id = response[0];

        return assert.equal(classRegularStarter_id, id);
    });


    it("check class 0", async () => {

        let response = await controller.getClassByRarity(0);
        let id = response[0];

        return assert.equal(classRegularStarter_id, id);
    });

    it("add all types check max rarity id", async () => {

        await controller.addPlayerClassType(classHallOfFame_name, classHallOfFame_id, classHallOfFame_rarity, subGroup);
        await controller.addPlayerClassType(classSquadPlayer_name, classSquadPlayer_id, classSquadPlayer_rarity, subGroup);
        await controller.addPlayerClassType(classLegend_name, classLegend_id, classLegend_rarity, subGroup);
        await controller.addPlayerClassType(classGoldenBoy_name, classGoldenBoy_id, classGoldenBoy_rarity, subGroup);
        await controller.addPlayerClassType(classStarPlayer_name, classStarPlayer_id, classStarPlayer_rarity, subGroup);
        await controller.addPlayerClassType(classVintage_name, classVintage_id, classVintage_rarity, subGroup);
        await controller.addPlayerClassType(classWorldClass_name, classWorldClass_id, classWorldClass_rarity, subGroup);
        await controller.addPlayerClassType(classElite_name, classElite_id, classElite_rarity, subGroup);


        let response = await controller.getClassByRarity(0);
        let id = response[0];

        return assert.equal(classSquadPlayer_id, id);
    });


    it("check sum off rarities", async () => {
        let response;
        let id;
        let rarity;

        let sum = new BN();

        for (let i = 0; i < 12; i++) {
            response = await controller.getClassByRarity(i);
            id = response[0];
            rarity = response[1];

            // console.log(id.toNumber() + "'s  rarity = " + rarity.toNumber());

            sum = sum.add(rarity);
        }

        return assert.equal(287, sum.toNumber());
    });

    it("add 4 player", async () => {

        await controller.addPlayerEdition(messi2021Id, 1, await getByte32("Messi2021"), classLegend_id, attacker, 99, 3, 2, true);
        await controller.addPlayerEdition(givi2021Id, 1, await getByte32("Givi2021"), classElite_id, attacker, 85, 3, 2, true);
        await controller.addPlayerEdition(davit2021Id, 1, await getByte32("Davit2021"), classElite_id, attacker, 86, 3, 2, true);
        await controller.addPlayerEdition(tornike2021Id, 2, await getByte32("Tornike2021"), classRookiePlayer_id, midfielder, 94, 3, 2, true);
        await controller.addPlayerEdition(irakli2021Id, 3, await getByte32("Irakli2021"), classRegularStarter_id, defender, 91, 3, 2, true);

        const countAll = await controller.getEditionsCount();
        return assert.equal(5, countAll.toNumber());
    });

    it("count RegularStarter Defender players", async () => {
        // const count = await controller.getPlayersCountByFilter(classRegularStarter_id, defender);
        // return assert.equal(1, count.toNumber());
    });

    it('test can minted messi2021 classLegend_rarity = 1 ', async () => {
        const count = await controller.getEditionCanMinted(messi2021Id);
        assert.equal(classLegend_rarity, count.toNumber())
    });

    it('test can minted irakli2021Id classRegularStarter_rarity = 64 ', async () => {
        const count = await controller.getEditionCanMinted(irakli2021Id);
        assert.equal(classRegularStarter_rarity, count.toNumber())
    });

    // it('test can minted after one buy 9', async () => {
    //     const count = await controller.getCategoryCanMinted(0);
    //     assert.equal(9, count.toNumber())
    // });

    it('test getCategoryIdFromRandom 12500', async () => {
        const categoryId = await controller.getEditionIdFromRandomWithClassId(12500, classRegularStarter_id);
        assert.equal(irakli2021Id, categoryId.toNumber())
    });

    it('test getCategoryIdFromRandom 12000', async () => {
        const categoryId = await controller.getEditionIdFromRandomWithClassId(12000, classRookiePlayer_id);
        assert.equal(tornike2021Id, categoryId.toNumber())
    });


    it("check open pack 660 (66) = 9 (F)", async () => {

        const number = new BN(660);
        let assignedId = 0;

        const totalCardsOnPosition = await controller.getCardsInitialCountByPosition(defender);
        let classRarityOffset = new BN(0);

        for (let i = 0; i < 10; i++) {
            response = await controller.getClassByRarity(i);
            id = response[0];
            rarity = response[1];

            let countByPosition = await controller.getPlayersCountByFilter(id, defender);

            // console.log("getClassByRarity_id", id.toNumber());
            // console.log("getClassByRarity_rarity", rarity.toNumber());
            // console.log("countByPosition", countByPosition.toNumber());

            classRarityOffset = classRarityOffset.add(countByPosition.mul(rarity).mul(new BN(1000)).div(totalCardsOnPosition));

            // console.log("getClassByRarity_classRarityOffset", classRarityOffset.toNumber());

            if (number.lt(classRarityOffset)) {
                console.log(number.toNumber() + " < rarity = " + classRarityOffset.toNumber())
                assignedId = id;
                break;
            }
        }
        return assert.equal(classRegularStarter_id, assignedId.toNumber());
    });

    it("check open pack 950 (95) = 7 (D)", async () => {

        const number = new BN(950);
        let assignedId = 0;

        const totalCardsOnPosition = await controller.getCardsInitialCountByPosition(attacker);
        let classRarityOffset = new BN(0);

        for (let i = 0; i < 10; i++) {
            response = await controller.getClassByRarity(i);
            id = response[0];
            rarity = response[1];

            let countByPosition = await controller.getPlayersCountByFilter(id, attacker);
            classRarityOffset = classRarityOffset.add(countByPosition.mul(rarity).mul(new BN(1000)).div(totalCardsOnPosition));

            // console.log("getClassByRarity_id", id.toNumber());
            // console.log("getClassByRarity_rarity", rarity.toNumber());
            // console.log("countByPosition", countByPosition.toNumber());
            // console.log("totalCardsOnPosition", totalCardsOnPosition.toNumber());
            // console.log("getClassByRarity_classRarityOffset", classRarityOffset.toNumber());

            if (number.lt(classRarityOffset)) {
                console.log(number.toNumber() + " < rarity = " + classRarityOffset.toNumber())
                assignedId = id;
                break;
            }
        }

        return assert.equal(classElite_id, assignedId.toNumber());
    });
    //
    // it("check open pack 992 (002) = 5 (B)", async () => {
    //
    //     const number = new BN(992);
    //     let assignedId = 0;
    //
    //     for (let i = 0; i < 10; i++) {
    //         response = await controller.getClassByRarity(i);
    //         id = response[0];
    //         rarity = response[1];
    //
    //         let bn = (number.mul(new BN(10_000_000))).sub(new BN(100));
    //         if (bn.lt(rarity)) {
    //             // console.log(bn.toNumber() + " < rarity = " + rarity.toNumber())
    //             assignedId = id;
    //             break;
    //         }
    //         // console.log(bn + " > rarity = " + rarity.toNumber())
    //     }
    //
    //     return assert.equal(5, assignedId.toNumber());
    // });
    //
    // it("check open pack 996 (006) = 4 (A)", async () => {
    //
    //     const number = new BN(996);
    //     let assignedId = 0;
    //
    //     for (let i = 0; i < 10; i++) {
    //         response = await controller.getClassByRarity(i);
    //         id = response[0];
    //         rarity = response[1];
    //
    //         let bn = (number.mul(new BN(10_000_000))).sub(new BN(100));
    //         if (bn.lt(rarity)) {
    //             // console.log(bn.toNumber() + " < rarity = " + rarity.toNumber())
    //             assignedId = id;
    //             break;
    //         }
    //         // console.log(bn + " > rarity = " + rarity.toNumber())
    //     }
    //
    //     return assert.equal(4, assignedId.toNumber());
    // });
    //


    //
    // it("check price messi2021CategoryId", async () => {
    //     const price = await controller.getCategoryPriceDiscounted(0);
    //     // ((99 + 0) / 10) * 100 = 990
    //     return assert.equal(990, price.toNumber());
    // });
    //
    // it("check static discount price messi2021CategoryId", async () => {
    //     await controller.addPlayerCategoryDiscount(0, 1000, 100, true);
    //
    //     const price = await controller.getCategoryPriceDiscounted(0);
    //     return assert.equal(100, price.toNumber());
    // });
    //
    // it("check static discount price messi2021CategoryId after time ends", async () => {
    //     await increaseTime(1000);
    //     const price = await controller.getCategoryPriceDiscounted(0);
    //     return assert.equal(990, price.toNumber());
    // });
    //
    // it("check discount price messi2021CategoryId", async () => {
    //     await controller.addPlayerCategoryDiscount(0, 1000, 10, false);
    //     await increaseTime(500);
    //     // await timeTravel(500);
    //     const price = await controller.getCategoryPriceDiscounted(0);
    //     assert.equal(500, price.toNumber())
    // });
    //
    // it('test marketplace price', async () => {
    //     const price = await market.getPurchasePrice(0);
    //     assert.equal(500, price.toNumber())
    // });
    //
    //
    //
    // it('test marketplace purchase', async () => {
    //
    //     // let tx = await casino.bet(betNumber, { from: bettingAccount, value: betSize });
    //     //
    //     // // player should be the same as the betting account, and the betted number should not equal the winning number
    //     // truffleAssert.eventEmitted(tx, 'Play', (ev) => {
    //     //     return ev.player === bettingAccount && !ev.betNumber.eq(ev.winningNumber);
    //     // });
    //     // // there should be no payouts
    //     // truffleAssert.eventNotEmitted(tx, 'Payout');
    //
    //     await increaseTime(500);
    //
    //     let tx = await market.purchase(0);
    //
    //     truffleAssert.eventEmitted(tx, 'ShopPurchase', (ev) => {
    //         return ev._buyer === accounts[0] && ev._price.toNumber() === 990;
    //     });
    // });
    //


});