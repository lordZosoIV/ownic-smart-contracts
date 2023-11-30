const { expect, should, assert } = require('chai');
const truffleAssert = require('truffle-assertions');
const RainforestNFT = artifacts.require("RainforestNFT");

/*
 * uncomment accounts to access the test accounts made available by the
 * Ethereum client
 * See docs: https://www.trufflesuite.com/docs/truffle/testing/writing-tests-in-javascript
 */
contract("RainforestNFT", accounts => {
    let instance;

    beforeEach(async () => {
        instance = await RainforestNFT.new();
    });

    it("should assert true", async () => {
        return assert.isTrue(true);
    });

    it("should have name", async () => {
        return assert.equal("RainforestNFT", await instance.name());
    });

    it("should have symbol", async () => {
        return assert.equal("RNF", await instance.symbol());
    });

    it("should give permission to chairman to mint a new tokens", async () => {
        // Get initial balances of first and second account.
        const [account_one, account_two] = accounts;

        const response = await instance.mint(account_one, 'https://nft.token/1', { from: account_one });
        expect(response?.tx).to.be.a('string');
    });

    it("should not give permission anyone other than chairman to mint tokens", async () => {
        // Get initial balances of first and second account.
        const [account_one, account_two] = accounts;

        // const response = await instance.mint(account_one, 'https://nft.token/1', { from: account_two });
        await truffleAssert.reverts(
            instance.mint(account_one, 'https://nft.token/1', { from: account_two }),
            "Only chairman has permission to mint tokens -- Reason given: Only chairman has permission to mint tokens"
        );
    });

    it("should return tokenURI by providing tokenId", async () => {
        // Get initial balances of first and second account.
        const [account_one] = accounts;

        await instance.mint(account_one, 'https://nft.token/1');

        assert.equal("https://nft.token/1", await instance.tokenURI(1));
    });

    it("should allow one account to send NFT to another account", async () => {
        // Get initial balances of first and second account.
        const [account_one, account_two] = accounts;

        await instance.mint(account_one, 'https://nft.token/1');

        // Transfer from account_onw to account_two
        await instance.transferFrom(account_one, account_two, 1, { from: account_one });

        assert.equal(account_two, await instance.ownerOf(1));
    });

    it("should check total number of NFTs on one account", async () => {
        // Get initial balances of first and second account.
        const [account_one] = accounts;

        await instance.mint(account_one, 'https://nft.token/1');

        const totalNumberOfNFTsOwned = await instance.balanceOf.call(account_one)
        assert.equal(totalNumberOfNFTsOwned.toNumber(), 1);
    });
});