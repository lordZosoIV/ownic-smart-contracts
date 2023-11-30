const {expect, should, assert} = require('chai');
const truffleAssert = require('truffle-assertions');
const increaseTime = require('../script/increaseTime');
const utils = require('../script/utils');
const OwnicToken = artifacts.require("OwnicToken.sol");
const TokenVesting = artifacts.require("TokenVesting.sol");
const CappedSaleRoundPublic = artifacts.require("CappedSaleRoundPublic.sol");
const {expectRevert, expectEvent, BN} = require('@openzeppelin/test-helpers');
const {rpcLog} = require("hardhat/internal/core/jsonrpc/types/output/log");

contract("TokenVesting", accounts => {

    let token;
    let tokenVesting;
    let sale;

    const ratePerWei = 2; // ex 1 matic = 2 ownic

    const maxCap = utils.toWei(1000);

    const admin = accounts[0];
    const teamAcc = accounts[1];
    const fundSaver = accounts[2];
    const buyer = accounts[3];
    const buyer2 = accounts[4];
    const regularUser = accounts[5];
    const hacker = accounts[7];
    const baseTime = 1645085846;

    const CREATE_VESTING_SCHEDULE = {
        baseTime: baseTime,
        startTime: baseTime,
        cliff: 0,
        duration: 1000,
        slicePeriodSeconds: 1,
        revokable: true,
        amount: utils.toWei(100),
    }

    const CREATE_VESTING_SCHEDULE_FAKE = {
        baseTime: baseTime,
        startTime: baseTime,
        cliff: baseTime,
        duration: baseTime,
        slicePeriodSeconds: 1,
        revokable: true,
        amount: utils.toWei(100),
    }

    before(async () => {
        token = await OwnicToken.new("Ownic Test", "OWN", utils.toWei(1_000_000_000));
        tokenVesting = await TokenVesting.new(token.address);
        sale = await CappedSaleRoundPublic.new(ratePerWei, maxCap, fundSaver, 2000, 10000, tokenVesting.address);
    });


    describe('Create Vesting', function () {

        it("Create team vesting", async () => {
            await expectRevert(
                tokenVesting.createVestingSchedule(
                    teamAcc,
                    CREATE_VESTING_SCHEDULE.startTime,
                    CREATE_VESTING_SCHEDULE.cliff,
                    CREATE_VESTING_SCHEDULE.duration,
                    CREATE_VESTING_SCHEDULE.slicePeriodSeconds,
                    CREATE_VESTING_SCHEDULE.revokable,
                    0
                ),
                "TokenVesting: amount must be > 0"
            );

            await expectRevert(
                tokenVesting.createVestingSchedule(
                    teamAcc,
                    CREATE_VESTING_SCHEDULE.startTime,
                    CREATE_VESTING_SCHEDULE.cliff,
                    CREATE_VESTING_SCHEDULE.duration,
                    CREATE_VESTING_SCHEDULE.slicePeriodSeconds,
                    CREATE_VESTING_SCHEDULE.revokable,
                    CREATE_VESTING_SCHEDULE.amount
                ),
                "TokenVesting: cannot create vesting schedule because not sufficient tokens"
            );

            await token.transfer(tokenVesting.address, utils.toWei(1000));

            await tokenVesting.createVestingSchedule(
                teamAcc,
                CREATE_VESTING_SCHEDULE.startTime,
                CREATE_VESTING_SCHEDULE.cliff,
                CREATE_VESTING_SCHEDULE.duration,
                CREATE_VESTING_SCHEDULE.slicePeriodSeconds,
                CREATE_VESTING_SCHEDULE.revokable,
                CREATE_VESTING_SCHEDULE.amount
            );

            assert.equal(await tokenVesting.getVestingSchedulesCount(), 1);

            assert.equal(await tokenVesting.getVestingSchedulesCountByBeneficiary(teamAcc), 1);

        });

        it("buy token and vest", async () => {

            await truffleAssert.fails(
                sale.sendTransaction({from: buyer, value: utils.toWei(0)})
            )

            await truffleAssert.fails(
                sale.sendTransaction({from: buyer, value: utils.toWei(3)}),
            )

            await tokenVesting.grantRole(utils.hash("VESTING_MANAGER"), sale.address);

            await sale.sendTransaction({from: buyer, value: utils.toWei(2.5)});

            let vestingCount = await tokenVesting.getVestingSchedulesCountByBeneficiary(buyer);
            assert.equal(vestingCount, 1);
            let lastSchedule = await tokenVesting.getLastVestingScheduleForHolder(buyer);
            assert.equal(lastSchedule.amountTotal, utils.toWei(5));

        });

        it("test cliff", async () => {

            let lastScheduleId = await tokenVesting.computeVestingScheduleIdForAddressAndIndex(buyer, 0);

            await truffleAssert.fails(tokenVesting.release(lastScheduleId, utils.toWei(2)));

            await increaseTime(4000);

            await tokenVesting.release(lastScheduleId, utils.toWei(2));

            assert.equal(await token.balanceOf(buyer), utils.toWei(2));

            await truffleAssert.fails(tokenVesting.release(lastScheduleId, utils.toWei(1)));

            await increaseTime(1900);

            await truffleAssert.fails(tokenVesting.release(lastScheduleId, utils.toWei(1)));


        });
    })

    describe('Withdraw / Release funds', function () {
        it("withdraw token", async () => {
            const withdrawalAmount = await tokenVesting.getWithdrawableAmount();
            await expectRevert(
                tokenVesting.withdraw(withdrawalAmount.add(new BN(1)), {from: teamAcc}),
                "Ownable: caller is not the owner"
            )
            await expectRevert(
                tokenVesting.withdraw(withdrawalAmount.add(new BN(1))),
                "TokenVesting: not enough withdrawable funds"
            )
            await tokenVesting.withdraw(withdrawalAmount)
            assert.equal(await tokenVesting.getWithdrawableAmount(), 0);

            await expectRevert(
                tokenVesting.createVestingSchedule(
                    teamAcc,
                    CREATE_VESTING_SCHEDULE.startTime,
                    CREATE_VESTING_SCHEDULE.cliff,
                    CREATE_VESTING_SCHEDULE.duration,
                    CREATE_VESTING_SCHEDULE.slicePeriodSeconds,
                    CREATE_VESTING_SCHEDULE.revokable,
                    1
                ),
                "TokenVesting: cannot create vesting schedule because not sufficient tokens"
            );
        });
    })

    describe('Revoke Vesting', function () {
        it("Revoke revocable vestings", async () => {
            await token.transfer(tokenVesting.address, utils.toWei(1000));
            await tokenVesting.createVestingSchedule(
                teamAcc,
                CREATE_VESTING_SCHEDULE.startTime,
                CREATE_VESTING_SCHEDULE.cliff,
                CREATE_VESTING_SCHEDULE.duration,
                CREATE_VESTING_SCHEDULE.slicePeriodSeconds,
                CREATE_VESTING_SCHEDULE.revokable,
                CREATE_VESTING_SCHEDULE.amount
            );

            let lastScheduleId = await tokenVesting.computeVestingScheduleIdForAddressAndIndex(teamAcc, 1);
            const createdVestingSchedule = await tokenVesting.getLastVestingScheduleForHolder(teamAcc);
            await assert.equal(createdVestingSchedule.revocable, true)
            await assert.equal(createdVestingSchedule.revoked, false)

            await truffleAssert.fails(
                tokenVesting.revoke(lastScheduleId, {from: teamAcc})
            );

            await tokenVesting.revoke(lastScheduleId)
            const revokedVestingSchedule = await tokenVesting.getLastVestingScheduleForHolder(teamAcc)
            await assert.equal(revokedVestingSchedule.revoked, true)
            await truffleAssert.fails(
                tokenVesting.revoke(lastScheduleId)
            );
        })

        it("Revoke non revocable vestings", async () => {
            await token.transfer(tokenVesting.address, utils.toWei(1000));
            await tokenVesting.createVestingSchedule(
                teamAcc,
                CREATE_VESTING_SCHEDULE.startTime,
                CREATE_VESTING_SCHEDULE.cliff,
                CREATE_VESTING_SCHEDULE.duration,
                CREATE_VESTING_SCHEDULE.slicePeriodSeconds,
                false,
                CREATE_VESTING_SCHEDULE.amount
            );

            let lastScheduleId = await tokenVesting.computeVestingScheduleIdForAddressAndIndex(teamAcc, 2);
            const createdVestingSchedule = await tokenVesting.getLastVestingScheduleForHolder(teamAcc);
            await assert.equal(createdVestingSchedule.revocable, false)
            await truffleAssert.fails(
                tokenVesting.revoke(lastScheduleId)
            )
            const revokedVestingSchedule = await tokenVesting.getLastVestingScheduleForHolder(teamAcc)
            await assert.equal(revokedVestingSchedule.revoked, false)
        })
    })


    describe('Vesting with edge cases', function () {
        it("release from other account", async () => {
            await token.transfer(tokenVesting.address, utils.toWei(1000));

            let lastScheduleId = await tokenVesting.computeVestingScheduleIdForAddressAndIndex(buyer, 0);

            await expectRevert(tokenVesting.release(lastScheduleId, utils.toWei(2), {from: hacker}),
                "TokenVesting: only beneficiary and owner can release vested tokens");

        });

        it("vested amount is less than passed amount", async () => {
            await token.transfer(tokenVesting.address, utils.toWei(1000));

            await tokenVesting.createVestingSchedule(
                hacker,
                CREATE_VESTING_SCHEDULE.startTime,
                500,
                CREATE_VESTING_SCHEDULE.duration,
                CREATE_VESTING_SCHEDULE.slicePeriodSeconds,
                CREATE_VESTING_SCHEDULE.revokable,
                200
            );

            let lastScheduleId = await tokenVesting.computeVestingScheduleIdForAddressAndIndex(hacker, 0);


            await expectRevert(
                tokenVesting.release(lastScheduleId, utils.toWei(300), {from: hacker}),
                "TokenVesting: cannot release ");

        });

        it("release before cliff ends up", async () => {
            await token.transfer(tokenVesting.address, utils.toWei(1000));

            await tokenVesting.createVestingSchedule(
                hacker,
                CREATE_VESTING_SCHEDULE_FAKE.startTime,
                CREATE_VESTING_SCHEDULE_FAKE.cliff,
                CREATE_VESTING_SCHEDULE_FAKE.duration,
                CREATE_VESTING_SCHEDULE_FAKE.slicePeriodSeconds,
                CREATE_VESTING_SCHEDULE_FAKE.revokable,
                CREATE_VESTING_SCHEDULE_FAKE.amount
            );

            let lastScheduleId = await tokenVesting.computeVestingScheduleIdForAddressAndIndex(hacker, 1);

            await expectRevert(
                tokenVesting.release(lastScheduleId, utils.toWei(2), {from: hacker}),
                "TokenVesting: cannot release ");

        });

        it("revoke before cliff ends up", async () => {
            await token.transfer(tokenVesting.address, utils.toWei(1000));

            await tokenVesting.createVestingSchedule(
                hacker,
                CREATE_VESTING_SCHEDULE_FAKE.startTime,
                CREATE_VESTING_SCHEDULE_FAKE.cliff,
                CREATE_VESTING_SCHEDULE_FAKE.duration,
                CREATE_VESTING_SCHEDULE_FAKE.slicePeriodSeconds,
                CREATE_VESTING_SCHEDULE_FAKE.revokable,
                CREATE_VESTING_SCHEDULE_FAKE.amount
            );

            let lastScheduleId = await tokenVesting.computeVestingScheduleIdForAddressAndIndex(hacker, 2);

            tokenVesting.revoke(lastScheduleId);
            assert.equal(await token.balanceOf(hacker), utils.toWei(0));


        });

        it("release from other's schedule", async () => {
            await token.transfer(tokenVesting.address, utils.toWei(100));

            await tokenVesting.createVestingSchedule(
                regularUser,
                CREATE_VESTING_SCHEDULE.startTime,
                CREATE_VESTING_SCHEDULE.cliff,
                CREATE_VESTING_SCHEDULE.duration,
                CREATE_VESTING_SCHEDULE.slicePeriodSeconds,
                CREATE_VESTING_SCHEDULE.revokable,
                CREATE_VESTING_SCHEDULE.amount
            );

            let lastScheduleIdForOtherUser = await tokenVesting.computeVestingScheduleIdForAddressAndIndex(regularUser, 0);

            await expectRevert(tokenVesting.release(lastScheduleIdForOtherUser, utils.toWei(2), {from: hacker}),
                "TokenVesting: only beneficiary and owner can release vested tokens");

        });

        it("release more than is allowed", async () => {
            await token.transfer(tokenVesting.address, utils.toWei(100));

            await tokenVesting.createVestingSchedule(
                regularUser,
                CREATE_VESTING_SCHEDULE.startTime,
                CREATE_VESTING_SCHEDULE.cliff,
                CREATE_VESTING_SCHEDULE.duration,
                CREATE_VESTING_SCHEDULE.slicePeriodSeconds,
                CREATE_VESTING_SCHEDULE.revokable,
                CREATE_VESTING_SCHEDULE.amount
            );

            let lastScheduleIdForOtherUser = await tokenVesting.computeVestingScheduleIdForAddressAndIndex(regularUser, 1);

            await expectRevert(tokenVesting.release(lastScheduleIdForOtherUser, utils.toWei(2), {from: hacker}),
                "TokenVesting: only beneficiary and owner can release vested tokens");

        });

        it("release after cliff", async () => {
            await token.transfer(tokenVesting.address, utils.toWei(1000));

            await tokenVesting.createVestingSchedule(
                buyer2,
                CREATE_VESTING_SCHEDULE.startTime,
                400,
                800000,
                CREATE_VESTING_SCHEDULE.slicePeriodSeconds,
                CREATE_VESTING_SCHEDULE.revokable,
                CREATE_VESTING_SCHEDULE.amount
            );

            let lastScheduleId = await tokenVesting.computeVestingScheduleIdForAddressAndIndex(buyer2, 0);

            await increaseTime(400000);

            await tokenVesting.release(lastScheduleId, utils.toWei(10));

            assert.equal(await token.balanceOf(buyer2), utils.toWei(10));

        });

    })

});

// Run tests: npx truffle test .\test\TestTokenVesting.js --network=test --compile-none