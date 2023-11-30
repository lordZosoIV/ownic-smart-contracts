const {expect, should, assert} = require('chai');
const truffleAssert = require('truffle-assertions');
const increaseTime = require('../../script/increaseTime');
const NFTCategoryController = artifacts.require("NFTCategoryController.sol");
const OwnicNFTMarketplace = artifacts.require("OwnicNFTMarketplace.sol");
const BN = web3.utils.BN;

async function getByte32(string) {
    return web3.utils.keccak256(string);
}

contract("NFTCategoryController", accounts => {


    let controller;
    let market;

    let classNameA;
    let classNameB;
    let classNameC;
    let classNameD;
    let classNameE;
    let classNameF;
    let classNameG;
    let classNameSUP;

    let defender;
    let goalkeeper;
    let midfielder;
    let attacker;

    beforeEach(async () => {
        controller = await NFTCategoryController.deployed();
        market = await OwnicNFTMarketplace.deployed();

        classNameA = await getByte32("A");
        classNameB = await getByte32("B");
        classNameC = await getByte32("C");
        classNameD = await getByte32("D");
        classNameE = await getByte32("E");
        classNameF = await getByte32("F");
        classNameG = await getByte32("G");
        classNameSUP = await getByte32("SUP");

        defender = await getByte32("Defender");
        goalkeeper = await getByte32("Goalkeeper");
        midfielder = await getByte32("Midfielder");
        attacker = await getByte32("Attacker");
    });


    it("should assert true", async () => {
        return assert.isTrue(true);
    });

    it('Test deployed NFTCategoryController', async () => {
        const playersCount = await controller.getPlayersCount();
        return assert.equal(0, playersCount);
    });

    it("zero class should be empty", async () => {
        const response = await controller.getClassByRarity(0);
        const id = response[0];
        return assert.equal(0, id);
    });

    it("add class A", async () => {

        await controller.addPlayerClassType(
            classNameA, 4, 10
        );

        let response = await controller.getClassByRarity(0);
        let id = response[0];
        return assert.equal(4, id)
    });

    it("add class C", async () => {

        await controller.addPlayerClassType(
            classNameC, 6, 100
        );

        let response = await controller.getClassByRarity(0);
        let id = response[0];

        return assert.equal(6, id);
    });


    it("check class 0", async () => {

        let response = await controller.getClassByRarity(0);
        let id = response[0];

        return assert.equal(6, id);
    });

    it("add all types check max for rarity", async () => {

        await controller.addPlayerClassType(classNameB, 5, 50);
        await controller.addPlayerClassType(classNameD, 7, 100);
        await controller.addPlayerClassType(classNameE, 8, 500);
        await controller.addPlayerClassType(classNameF, 9, 501);
        await controller.addPlayerClassType(classNameG, 10, 1000);
        await controller.addPlayerClassType(classNameSUP, 11, 2);

        let response = await controller.getClassTypeMintMaxAll();

        return assert.equal(2263, response.toNumber());
    });


    it("check sum off rarities", async () => {
        let response;
        let id;
        let rarity;

        let sum = new BN();

        for (let i = 0; i < 10; i++) {
            response = await controller.getClassByRarity(i);
            id = response[0];
            rarity = response[1];

            // console.log(id.toNumber() + "'s  rarity = " + rarity.toNumber())

            sum = sum.add(rarity);
        }

        return assert.equal(68842244786, sum.toNumber());
    });

    it("check open pack 660 (66) = 9 (F)", async () => {

        const number = new BN(660);
        let assignedId = 0;

        for (let i = 0; i < 10; i++) {
            response = await controller.getClassByRarity(i);
            id = response[0];
            rarity = response[1];

            if ((number.mul(new BN(10_000_000))).lt(rarity)) {
                // console.log(number.mul(new BN(100_000_000)).toNumber() + " < rarity = " + rarity.toNumber())
                assignedId = id;
                break;
            }
            // console.log(number.mul(new BN(100_000_000)).toNumber() + " > rarity = " + rarity.toNumber())
        }

        return assert.equal(9, assignedId.toNumber());
    });

    it("check open pack 950 (95) = 7 (D)", async () => {

        const number = new BN(950);
        let assignedId = 0;

        for (let i = 0; i < 10; i++) {
            response = await controller.getClassByRarity(i);
            id = response[0];
            rarity = response[1];

            let bn = (number.mul(new BN(10_000_000))).sub(new BN(100));
            if (bn.lt(rarity)) {
                // console.log(bn.toNumber() + " < rarity = " + rarity.toNumber())
                assignedId = id;
                break;
            }
            // console.log(bn + " > rarity = " + rarity.toNumber())
        }

        return assert.equal(7, assignedId.toNumber());
    });

    it("check open pack 992 (002) = 5 (B)", async () => {

        const number = new BN(992);
        let assignedId = 0;

        for (let i = 0; i < 10; i++) {
            response = await controller.getClassByRarity(i);
            id = response[0];
            rarity = response[1];

            let bn = (number.mul(new BN(10_000_000))).sub(new BN(100));
            if (bn.lt(rarity)) {
                // console.log(bn.toNumber() + " < rarity = " + rarity.toNumber())
                assignedId = id;
                break;
            }
            // console.log(bn + " > rarity = " + rarity.toNumber())
        }

        return assert.equal(5, assignedId.toNumber());
    });

    it("check open pack 996 (006) = 4 (A)", async () => {

        const number = new BN(996);
        let assignedId = 0;

        for (let i = 0; i < 10; i++) {
            response = await controller.getClassByRarity(i);
            id = response[0];
            rarity = response[1];

            let bn = (number.mul(new BN(10_000_000))).sub(new BN(100));
            if (bn.lt(rarity)) {
                // console.log(bn.toNumber() + " < rarity = " + rarity.toNumber())
                assignedId = id;
                break;
            }
            // console.log(bn + " > rarity = " + rarity.toNumber())
        }

        return assert.equal(4, assignedId.toNumber());
    });

    it("add 3 player", async () => {

        await controller.addPlayerCategory(
            0, await getByte32("Messi2021"), 4, attacker, 99, 0
        );
        await controller.addPlayerCategory(
            1, await getByte32("Tornike2021"), 5, midfielder, 94, 0
        );
        await controller.addPlayerCategory(
            2, await getByte32("Irakli2021"), 4, defender, 91, 0
        );

        const countAll = await controller.getPlayersCount();
        return assert.equal(3, countAll.toNumber());
    });

    it("count A Defender players", async () => {
        const count = await controller.getPlayersCountByFilter(4, defender);
        return assert.equal(1, count.toNumber());
    });

    it("check price messi2021CategoryId", async () => {
        const price = await controller.getCategoryPriceDiscounted(0);
        // ((99 + 0) / 10) * 100 = 990
        return assert.equal(990, price.toNumber());
    });

    it("check static discount price messi2021CategoryId", async () => {
        await controller.addPlayerCategoryDiscount(0, 1000, 100, true);

        const price = await controller.getCategoryPriceDiscounted(0);
        return assert.equal(100, price.toNumber());
    });

    it("check static discount price messi2021CategoryId after time ends", async () => {
        await increaseTime(1000);
        const price = await controller.getCategoryPriceDiscounted(0);
        return assert.equal(990, price.toNumber());
    });

    it("check discount price messi2021CategoryId", async () => {
        await controller.addPlayerCategoryDiscount(0, 1000, 10, false);
        await increaseTime(500);
        // await timeTravel(500);
        const price = await controller.getCategoryPriceDiscounted(0);
        assert.equal(500, price.toNumber())
    });

    it('test marketplace price', async () => {
        const price = await market.getPurchasePrice(0);
        assert.equal(500, price.toNumber())
    });

    it('test can minted initial 10', async () => {
        const count = await controller.getCategoryCanMinted(0);
        assert.equal(10, count.toNumber())
    });


    it('test marketplace purchase', async () => {

        // let tx = await casino.bet(betNumber, { from: bettingAccount, value: betSize });
        //
        // // player should be the same as the betting account, and the betted number should not equal the winning number
        // truffleAssert.eventEmitted(tx, 'Play', (ev) => {
        //     return ev.player === bettingAccount && !ev.betNumber.eq(ev.winningNumber);
        // });
        // // there should be no payouts
        // truffleAssert.eventNotEmitted(tx, 'Payout');

        await increaseTime(500);

        let tx = await market.purchase(0);

        truffleAssert.eventEmitted(tx, 'ShopPurchase', (ev) => {
            return ev._buyer === accounts[0] && ev._price.toNumber() === 990;
        });
    });

    it('test can minted after one buy 9', async () => {
        const count = await controller.getCategoryCanMinted(0);
        assert.equal(9, count.toNumber())
    });

    it('test _getClassAndOffsetFromRandom 12345', async () => {
        const response = await controller._getClassAndOffsetFromRandom(12345);
        assert.equal(450, response[0].toNumber())
    });

    it('test _getClassAndOffsetFromRandom 12345', async () => {
        const response = await controller._getClassAndOffsetFromRandom(12345);
        assert.equal(123, response[1].toNumber())
    });

    it('test _getClassAndOffsetFromRandom 12340', async () => {
        const response = await controller._getClassAndOffsetFromRandom(12340);
        assert.equal(400, response[0].toNumber())
    });

    it('test _getClassAndOffsetFromRandom 12340', async () => {
        const response = await controller._getClassAndOffsetFromRandom(12340);
        assert.equal(123, response[1].toNumber())
    });

    it('test _getClassAndOffsetFromRandom 12300', async () => {
        const response = await controller._getClassAndOffsetFromRandom(12300);
        assert.equal(993, response[0].toNumber())
    });

    it('test _getClassAndOffsetFromRandom 12300', async () => {
        const response = await controller._getClassAndOffsetFromRandom(12300);
        assert.equal(12, response[1].toNumber())
    });


    it('test _getClassAndOffsetFromRandom 1230', async () => {
        const response = await controller._getClassAndOffsetFromRandom(1230);
        assert.equal(300, response[0].toNumber())
    });

    it('test _getClassAndOffsetFromRandom 1230', async () => {
        const response = await controller._getClassAndOffsetFromRandom(1230);
        assert.equal(12, response[1].toNumber())
    });

    it('test _getClassAndOffsetFromRandom 1230', async () => {
        const response = await controller._getClassAndOffsetFromRandom(1200);
        assert.equal(992, response[0].toNumber())
    });

    it('test _getClassAndOffsetFromRandom 1230', async () => {
        const response = await controller._getClassAndOffsetFromRandom(1200);
        assert.equal(1, response[1].toNumber())
    });

    it('test getCategoryIdFromRandom 12500', async () => {
        const categoryId = await controller.getCategoryIdFromRandom(12500, defender);
        assert.equal(2, categoryId.toNumber())
    });

    it('test getCategoryIdFromRandom 12000', async () => {
        const categoryId = await controller.getCategoryIdFromRandom(12000, midfielder);
        assert.equal(1, categoryId.toNumber())
    });


});