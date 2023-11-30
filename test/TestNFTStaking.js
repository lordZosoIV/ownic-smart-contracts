const truffleAssert = require("truffle-assertions");
const { assert } = require("chai");
const { expectRevert, expectEvent, BN } = require("@openzeppelin/test-helpers");
const utils = require("../script/utils");
const NFTStaking = artifacts.require("NFTStaking.sol");
const OwnicToken = artifacts.require("OwnicToken.sol");
const PlayerCollection = artifacts.require("PlayerCollection.sol");
const NFTUtilsMock = artifacts.require("NFTUtilsMock.sol");

contract("NFTStaking", ([admin, guest, hacker]) => {
  let staking, token, nft;
  const [messi1, messi2, kvara1, kvara2] = [1, 2, 3, 4];
  const [edition1, edition2, edition3] = [1, 2, 3];
  const [pwmessi1, pwmessi2, pwkvara1, pwkvara2] = [100, 200, 300, 1];

  const amount = 50;
  let mustBeTotalSupply = 0;
  let mustBeBalance = {};

  before(async () => {
    token = await OwnicToken.new(
      "Ownic Test",
      "OWN",
      utils.toWei(1_000_000_000)
    );
    nft = await PlayerCollection.new(
      "Player NFT Collection",
      "OWNICPLAYER",
      "http://nebula-nft.test/meta"
    );
    await nft.mint(admin, messi1);
    await nft.mint(admin, messi2);
    await nft.mint(admin, kvara1);
    await nft.mint(admin, kvara2);
    const utilsMock = await NFTUtilsMock.new();
    await utilsMock.setEditionId(messi1, edition1);
    await utilsMock.setEditionId(messi2, edition1);
    await utilsMock.setEditionId(kvara1, edition2);
    await utilsMock.setEditionId(kvara2, edition3);

    await utilsMock.setPower(messi1, pwmessi1);
    await utilsMock.setPower(messi2, pwmessi2);
    await utilsMock.setPower(kvara1, pwkvara1);
    await utilsMock.setPower(kvara2, pwkvara2);

    staking = await NFTStaking.new();
    await staking.initialize(
      token.address,
      nft.address,
      admin,
      utilsMock.address
    );
    // await staking.setNFTUtilsAddress(utilsMock.address);
    await token.approve(
      staking.address,
      new BN(
        "fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
      )
    );
  });

  describe("Initial State", () => {
    it("should initial period finish zero", async () => {
      const periodInitial = await staking.periodFinish();
      assert.equal(0, periodInitial.toNumber());
    });

    it("should initial period duration zero", async () => {
      const rewardDuration = await staking.rewardsDuration();
      assert.equal(0, rewardDuration.toNumber());
    });

    it("should initial last update item zero", async () => {
      const lastUpdate = await staking.lastUpdateTime();
      assert.equal(0, lastUpdate.toNumber());
    });

    it("should initial reward rate zero", async () => {
      const rewardRate = await staking.rewardRate();
      assert.equal(0, rewardRate.toNumber());
    });

    it("should initial reward per token zero", async () => {
      const rewardPerTokenStored = await staking.rewardPerTokenStored();
      assert.equal(0, rewardPerTokenStored.toNumber());
    });

    it("should initial total supply zero", async () => {
      const totalSupply = await staking.totalSupply();
      assert.equal(0, totalSupply.toNumber());
    });

    it("should initial user reward per token paid zero", async () => {
      const userRewardPerTokenPaid = await staking.userRewardPerTokenPaid(1);
      assert.equal(0, userRewardPerTokenPaid.toNumber());
    });

    it("should rewards zero", async () => {
      const rewards = await staking.rewards(1);
      assert.equal(0, rewards.toNumber());
    });

    it("should balance zero before stake", async () => {
      const balance = await staking.balanceOf(1);
      assert.equal(0, balance.toNumber());
    });

    it("should earned zero before stake", async () => {
      const earned = await staking.earned(1);
      assert.equal(0, earned.toNumber());
    });

    it("should reward per token zero before stake", async () => {
      const rewardPerToken = await staking.rewardPerToken();
      assert.equal(0, rewardPerToken.toNumber());
    });

    it("should last Time Reward Applicable before stake", async () => {
      const lastTime = await staking.lastTimeRewardApplicable();
      assert.equal(0, lastTime.toNumber());
    });
  });

  describe("Pause/Resume", () => {
    it("should not paused contract non owner ", async () => {
      await expectRevert(
        staking.pause({ from: hacker }),
        "Ownable: caller is not the owner"
      );
    });

    it("should owner pause contract", async () => {
      const paused = await staking.pause();
      expectEvent(paused, "Paused", { account: admin });
    });

    it("should not call stake when contract paused", async () => {
      await expectRevert(staking.stake(1, 1), "Pausable: paused");
    });

    it("should not pause paused contract", async () => {
      await expectRevert(staking.pause(), "Pausable: paused");
    });

    it("should resume contract", async () => {
      const unpaused = await staking.unpause();
      await expectEvent(unpaused, "Unpaused", { account: admin });
    });
  });

  describe("Stake", () => {
    it("should not stake non-owner nft", async () => {
      await expectRevert(
        staking.stake(1, 1, { from: guest }),
        "You aren't owner of the given NFT"
      );
    });

    it("should not stake nft when amount is 0", async () => {
      await expectRevert(
        staking.stake(messi1, 0, { from: admin }),
        "Cannot stake zero."
      );
    });

    it("should owner stake nft", async () => {
      const stake = await staking.stake(messi2, amount, { from: admin });
      await expectEvent(stake, "Staked", {
        tokenId: new BN(messi2),
        amount: new BN(amount),
      });
      mustBeTotalSupply += amount * pwmessi2;
      mustBeBalance = {
        ...mustBeBalance,
        [messi2]: amount,
      };
    });

    it("should increase total supply after stake nft", async () => {
      const totalSupply = await staking.totalSupply();
      assert.equal(mustBeTotalSupply, totalSupply.toNumber());
    });

    it("should increase balance by tokenID after stake nft - messi2", async () => {
      const balance = await staking.balanceOf(messi2);
      assert.equal(mustBeBalance[messi2], balance.toNumber());
    });

    it("should owner stake nft - messi1", async () => {
      const stake = await staking.stake(messi1, amount, { from: admin });
      await expectEvent(stake, "Staked", {
        tokenId: new BN(messi1),
        amount: new BN(amount),
      });
      mustBeTotalSupply += amount * pwmessi1;
      mustBeBalance = {
        ...mustBeBalance,
        [messi1]: amount,
      };
    });

    it("should increase balance by tokenID after stake nft", async () => {
      const balance = await staking.balanceOf(messi1);
      assert.equal(mustBeBalance[messi1], balance.toNumber());
    });

    it("should owner stake nft - kvara1", async () => {
      const stake = await staking.stake(kvara1, amount, { from: admin });
      await expectEvent(stake, "Staked", {
        tokenId: new BN(kvara1),
        amount: new BN(amount),
      });
      mustBeTotalSupply += amount * pwkvara1;
      mustBeBalance = {
        ...mustBeBalance,
        [kvara1]: amount,
      };
    });

    it("should owner stake nft - kvara2", async () => {
      const stake = await staking.stake(kvara2, amount, { from: admin });
      await expectEvent(stake, "Staked", {
        tokenId: new BN(kvara2),
        amount: new BN(amount),
      });
      mustBeTotalSupply += amount * pwkvara2;
      mustBeBalance = {
        ...mustBeBalance,
        [kvara2]: amount,
      };
    });

    it("should increase total supply after stake nfts", async () => {
      const totalSupply = await staking.totalSupply();
      assert.equal(mustBeTotalSupply, totalSupply.toNumber());
    });
  });

  describe("Withdraw", () => {
    it("should not withdraw by non-owner of nft", async () => {
      await expectRevert(
        staking.withdraw(messi1, amount, { from: guest }),
        "You aren't owner of the given NFT"
      );
    });

    it("should not withdraw when amount is 0", async () => {
      await expectRevert(staking.withdraw(messi1, 0), "Cannot withdraw 0");
    });

    it("should owner withdraw nft - kvara2", async () => {
      const withdrawn = await staking.withdraw(kvara2, amount);
      await expectEvent(withdrawn, "Withdrawn", {
        tokenId: new BN(kvara2),
        amount: new BN(mustBeBalance[kvara2]),
      });
      mustBeTotalSupply -= amount * pwkvara2;
      mustBeBalance = {
        ...mustBeBalance,
        [kvara2]: mustBeBalance[kvara2] - amount,
      };
    });

    it("should decrease balance by tokenID after withdraw nft", async () => {
      const balance = await staking.balanceOf(kvara2);
      assert.equal(mustBeBalance[kvara2], balance.toNumber());
    });

    it("should decrease total supply after withdraw nft", async () => {
      const totalSupply = await staking.totalSupply();
      assert.equal(mustBeTotalSupply, totalSupply.toNumber());
    });
  });

  describe("Reward", () => {
    it("should last Time Reward Applicable after 0 day", async () => {
      const lastTime = await staking.lastTimeRewardApplicable();
      assert.equal(0, lastTime.toNumber());
    });

    it("should reward per token zero after 0 day", async () => {
      const rewardPerToken = await staking.rewardPerToken();
      assert.equal(0, rewardPerToken.toNumber());
    });

    it("should earned equal to 0 after 0 day - messi1", async () => {
      const earned = await staking.earned(messi1);
      assert.equal(0, earned.toNumber());
    });

    it("should rewards zero after 0 day", async () => {
      const rewards = await staking.rewards(messi1);
      assert.equal(0, rewards.toNumber());
    });

    it("should not get Reward by non-owner of nft", async () => {
      await expectRevert(
        staking.getReward(messi1, { from: guest }),
        "You aren't owner of the given NFT"
      );
    });
  });

  describe("Exit", () => {
    it("should not exit by non-owner of nft", async () => {
      await expectRevert(
        staking.exit(messi1, { from: guest }),
        "You aren't owner of the given NFT"
      );
    });

    it("should owner exit nft - messi2", async () => {
      const exited = await staking.exit(messi2);

      await expectEvent(exited, "Withdrawn", {
        tokenId: new BN(messi2),
        amount: new BN(mustBeBalance[messi2]),
      });
      mustBeTotalSupply -= amount * pwmessi2;
      mustBeBalance = {
        ...mustBeBalance,
        [messi2]: mustBeBalance[messi2] - amount,
      };
    });

    it("should be 0 balance by tokenID after exit nft - messi2", async () => {
      const balance = await staking.balanceOf(messi2);
      assert.equal(0, balance.toNumber());
    });
  });

  describe("Notify", () => {
    it("should notify Reward Amount by non-reward distribution", async function () {
      await expectRevert(
        staking.notifyRewardAmount(2, 1, { from: guest }),
        "Caller is not RewardsDistribution contract"
      );
    });

    it("should not notify Reward Amount by reward distribution after 0 day", async function () {
      await expectRevert(
        staking.notifyRewardAmount(2, 0),
        "Days must be more than zero"
      );
    });

    it("should notify Reward Amount by reward distribution", async function () {
      // const rewardAdded = await staking.notifyRewardAmount(2, 1);
      // console.log(rewardAdded);
      // await expectEvent(rewardAdded, "RewardAdded", {
      //   tokenId: new BN(kvara2),
      //   amount: new BN(mustBeBalance[kvara2]),
      // });
      // mustBeTotalSupply -= amount * pwkvara2;
      // mustBeBalance = {
      //   ...mustBeBalance,
      //   [kvara2]: mustBeBalance[kvara2] - amount,
      // };
    });
  });
});
