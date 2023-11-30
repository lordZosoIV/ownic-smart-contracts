const {assert} = require('chai');
const utils = require('../script/utils');
const {expectRevert, expectEvent, BN} = require('@openzeppelin/test-helpers');
const setupController = require("../script/setupController");
const NFTPower = artifacts.require("NFTPowerMock.sol");
const OwnicCollectionPowerRewards = artifacts.require("OwnicCollectionPowerRewards.sol");
const OwnicToken = artifacts.require("OwnicToken.sol");
const PlayerCollection = artifacts.require('PlayerCollection.sol');
const OwnicController = artifacts.require('OwnicController.sol');
const EternalStorage = artifacts.require("EternalStorage.sol");
const NFTEditionLibrary = artifacts.require("NFTEditionLibrary.sol");


function getByte32(string) {
    return web3.utils.fromAscii(string);
}

contract("OwnicCollectionPowerRewards", accounts => {

    let token;
    let nft;
    let powerRewards;
    let controller;
    let nftPower;
    let storage;

    let signer = '0x4dd3a7ca8B345f712EA0Da887e8C1EA652643F45';

    const user1 = accounts[0];
    const user2 = accounts[1];
    const user3 = accounts[2];

    const [edition1] = [1];
    const [messi1, messi2, kvara1] = [1, 2, 3];


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

        await setupController(controller)


        await controller.addPlayerEdition(messi1,1,getByte32("J. Gortesadr 2021"),6,getByte32("Goalkeeper"),1000,0);
        await controller.addPlayerEdition(messi2,2,getByte32("J. Gortesadr 2021"),6,getByte32("Goalkeeper"),1000,0);
        await controller.addPlayerEdition(kvara1,3,getByte32("J. Gortesadr 2021"),6,getByte32("Goalkeeper"),1000,0);


    });

    describe("Initial State", () => {
        it("check earned before transfers for user1", async () => {
            let earned = await powerRewards.earned(user1);
            assert.equal(0, earned.toNumber());
        });

        it("check earned before transfers for user2", async () => {
            let earned = await powerRewards.earned(user2);
            assert.equal(0, earned.toNumber());
        });

        it("should initial period finish zero", async () => {
            const periodInitial = await powerRewards.periodFinish.call();
            assert.equal(0, periodInitial.toNumber());
        });

        it("should initial period duration zero", async () => {
            const rewardDuration = await powerRewards.rewardsDuration.call();
            assert.equal(7 * 24 * 60 * 60, rewardDuration.toNumber());
        });

        it("should initial last update item zero", async () => {
            const lastUpdate = await powerRewards.lastUpdateTime();
            assert.equal(0, lastUpdate.toNumber());
        });

        it("should initial reward rate zero", async () => {
            const rewardRate = await powerRewards.rewardRate();
            assert.equal(0, rewardRate.toNumber());
        });

        it("should initial reward per token zero", async () => {
            const rewardPerPowerStored = await  powerRewards.rewardPerPowerStored();
            assert.equal(0, rewardPerPowerStored.toNumber());
        });

        it("should initial total supply zero", async () => {
            const totalPower = await powerRewards.totalPower();
            assert.equal(0, totalPower.toNumber());
        });

        it("should earned zero before stake", async () => {
            const earned = await powerRewards.earned(user1);
            assert.equal(0, earned.toNumber());
        });

        it("should reward per token zero before stake", async () => {
            const rewardPerPower = await powerRewards.rewardPerPower();
            assert.equal(0, rewardPerPower.toNumber());
        });

        it("should last Time Reward Applicable before stake", async () => {
            const lastTime = await powerRewards.lastTimeRewardApplicable();
            assert.equal(0, lastTime.toNumber());
        });
    });

    describe("handle transfer", () => {

        it("configure states for tests", async () => {
            await controller.handleMint(edition1, messi1);
            await controller.handleMint(edition1, messi2);

            await nftPower.powerProofEdition(edition1, 1, 0, '0x54cf34199d0f6b84a689ab7c02cf99151366e4dc4d52b234f53f01f0a6d283e5627612866a48fe4deb0a472bbcb8a633c057a0fd112f53dd8adacc3a0c5ada011c');

            await nftPower.powerProofNft(messi1, 1, 100, '0x88b1ac94f16663af20e81120c47bd3833be13b614fc30daaf672e12ab4749e1d64eaab31da290716f737affc6b913eeaba9b05d06fc0edd017d3ddc4a814b3bd1c');
            await nftPower.powerProofNft(messi2, 1, 100, '0x5327538a3d3683bc87d1ac7e528c5d26aa280fc77d6d697d57e5d51167bb34cf1be770f336e30aab7a411e0700a640ce48ef05ab35901aa42690aefa327367071c');
            await nftPower.powerProofNft(kvara1, 1, 100, '0x76d0295284541f1875bd4e5517a1bab302272e43ca61d699d2dd1269d639071f3975742b999b2a270538cdd4e0859ed05a996537519de55e5e7d4efbfa18d8f91b');

            await controller.addPlayerClassType(getByte32("classHallOfFame_name"), 1, 2);

            await nft.mint(user1, messi1);
            await nft.mint(user1, messi2);
            await nft.mint(user1, kvara1);

        });


        it("check totalPower after mints", async () => {
            const totalPower = await powerRewards.totalPower();
            assert.equal(300, totalPower.toNumber());
        });

        it("check earned of user1 after mints", async () => {
            const balance = await powerRewards.powerOf(user1);
            assert.equal(300, balance.toNumber());
        });

        it("should not stake non-owner nft", async () => {
            await expectRevert(
                powerRewards.handleTransfer(user1, user2, 120),
                "invalid caller"
            );
        });

        it("handle transfer from user1 to user2", async () => {
            await nft.transferFrom(user1, user2, messi1);
            const balance = await powerRewards.powerOf(user1);
            assert.equal(200, balance.toNumber());
            const balance2 = await powerRewards.powerOf(user2);
            assert.equal(100, balance2.toNumber());
        });

        it("transfer from user2 to user3", async () => {
            await nft.transferFrom(user2, user3, messi1, {from: user2});
            const balance = await powerRewards.powerOf(user2);
            assert.equal(0, balance.toNumber());
            const balance2 = await powerRewards.powerOf(user3);
            assert.equal(100, balance2.toNumber());
        });

        it("tryina transfer from non-owner address", async () => {
            await expectRevert(
                nft.transferFrom(user2, user3, messi1, {from: user1}),
                "transfer caller is not owner nor approved"
            );
        });

    });

    describe("Reward", () => {
        it("should last Time Reward Applicable after 0 day", async () => {
            const lastTime = await powerRewards.lastTimeRewardApplicable();
            assert.equal(0, lastTime.toNumber());
        });

        it("should reward per token zero after 0 day", async () => {
            const rewardPerPower = await powerRewards.rewardPerPower();
            assert.equal(0, rewardPerPower.toNumber());
        });

        it("should earns zero after 0 day", async () => {
            const rewards = await powerRewards.earned(user1);
            assert.equal(0, rewards.toNumber());
        });
    });

    describe("update power", () => {
        it("update with 10 p", async function () {
            await nftPower.powerProofEdition(edition1, 2, 10, '0xff53270a41578b8d6c25a7b0a8e9eebf8c85c8126c1ff99558f00c440779d633051188060b0076eff21dafdd94dc29ee961bc42e75b48f77b82d096721ccb26b1c');

            await controller.updatePower(edition1, messi1);
            const totalPower = await powerRewards.totalPower();
            assert.equal(310, totalPower.toNumber());
            const balance = await powerRewards.powerOf(user3);
            assert.equal(110, balance.toNumber());
        });

        it("transfer updated nft", async function () {
            await nft.transferFrom(user3, user1, 1, {from: user3});

            const balanceUser3 = await powerRewards.powerOf(user3);
            assert.equal(0, balanceUser3.toNumber());

            const balanceUser1 = await powerRewards.powerOf(user1);
            assert.equal(310, balanceUser1.toNumber());
        });

    });

    describe("Notify", () => {
        it("should notify Reward Amount by non-reward distribution", async function () {
            await expectRevert(
                powerRewards.notifyRewardAmount(2, {from: user3}),
                "Caller is not RewardsDistribution contract"
            );
        });

    });

    describe("burn", () => {
        it("should deacrease balance and totalsupply after burn", async function () {
            await nft.burn(messi1,{from : user1});
            let balanceUser1Aft = await powerRewards.powerOf(user1);
            let totalPowerAft = await powerRewards.totalPower();
            assert.equal(200, balanceUser1Aft.toNumber());
            assert.equal(200, totalPowerAft.toNumber())
        });

    });




});

