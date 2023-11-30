const {expect, should, assert} = require('chai');
const truffleAssert = require('truffle-assertions');
const increaseTime = require('../../script/increaseTime');
const OwnicPlayerOpener = artifacts.require("OwnicPlayerOpener.sol");
const NFTCategoryController = artifacts.require("NFTCategoryController.sol");
const BN = web3.utils.BN;

async function getByte32(string) {
    return web3.utils.keccak256(string);
}

contract("OwnicPlayerOpener", accounts => {

    let controller;
    let opener;

    let defender;
    let goalkeeper;
    let midfielder;
    let attacker;

    beforeEach(async () => {
        let opener = await OwnicPlayerOpener.deployed();
        controller = await NFTCategoryController.deployed();

        defender = await getByte32("Defender");
        goalkeeper = await getByte32("Goalkeeper");
        midfielder = await getByte32("Midfielder");
        attacker = await getByte32("Attacker");
    });

    // it('test _getClassAndOffsetFromRandom 14322', async () => {
    //     const response = await controller._getClassAndOffsetFromRandom(14322);
    //     console.log("Class", response[0].toNumber());
    //     console.log("Offset", response[1].toNumber());
    //
    //     for (let i = 0; i < 5; i++) {
    //         const response1 = await controller.getClassByRarity(i);
    //
    //         console.log("classIdByRarity" + i, response1[0].toNumber());
    //         console.log("classRarity" + i, response1[1].toNumber());
    //     }
    // });
    //
    // let categoryIds = [];
    //
    // it('test getCategoryIdFromRandom 12500', async () => {
    //
    //     let arrayPosition = [
    //         goalkeeper,goalkeeper,
    //         defender,defender,defender,defender,defender,
    //         midfielder,midfielder,midfielder,midfielder,midfielder,
    //         attacker,attacker,attacker
    //     ];
    //
    //     let randomNumber = new BN("95250688022146912429659701458105696330965093922381253647056665233705758414322");
    //     let number;
    //
    //     for (let i = 0; i < 15; i++) {
    //         console.log("randomNumber", randomNumber.toString());
    //
    //         number = randomNumber.mod(new BN(100000));
    //         randomNumber = (randomNumber.sub(number)).div(new BN(100000));
    //         let position = arrayPosition[i];
    //         console.log("number/position", number.toNumber(), position);
    //         const categoryId = await controller.getCategoryIdFromRandom(number.toNumber(), position);
    //         categoryIds[i] = categoryId;
    //         console.log("categoryId", categoryId.toNumber())
    //     }
    //
    // });
    //
    // it("check openPack 0", async () => {
    //
    //     let tx = await opener.openPackInit();
    //
    //     truffleAssert.eventEmitted(tx, 'OpenPackInit', (ev) => {
    //         return ev.openPackId.toNumber() === 0;
    //     });
    // });
    //
    // it("check fulfillRandomness < 1m", async () => {
    //
    //     let tx = await opener.fulfillRandomness("0xc89efdaa54c0f20c7adf612882df0950f5a951637e0307cdcb4c672f298b8bc6", "95250688022146912429659701458105696330965093922381253647056665233705758414322");
    //
    //     const gasUsed = tx.receipt.gasUsed;
    //     console.log(`GasUsed: ${tx.receipt.gasUsed}`);
    //
    //     assert.isBelow(gasUsed, 1000000);
    // });

    it("check openPack < 1m", async () => {

        let tx = await opener.openPack(0);

        truffleAssert.eventEmitted(tx, 'OpenPackFinish', (ev) => {
            return ev.openPackId.toNumber() === 0;
        });
    });

});