const truffleAssert = require('truffle-assertions');
const {assert} = require('chai')
const PlayerCollection = artifacts.require("PlayerCollection.sol");
const NFTPresale = artifacts.require("NFTPresale.sol");
const {expectRevert, expectEvent, BN} = require('@openzeppelin/test-helpers')
const {MerkleTree} = require('merkletreejs');
const keccak256 = require('keccak256');

function getByte32(string) {
    return web3.utils.keccak256(string);
}

function toWei(amount) {
    return web3.utils.toWei("" + amount);
}

contract("NFTPresale", accounts => {

    let presale;
    let nft;
    const pausedState = 0;
    const startedWhitelistSale = 1;
    const zeroAddr = "0x0000000000000000000000000000000000000000";
    const [admin, outOfWhiteListUser, walletAddr, someone] = accounts;
    const nextTokenId = 0;
    const price = toWei(0.02);
    let list;

    before(async () => {
        nft = await PlayerCollection.new("Player NFT Collection", "OWNICPLAYER", "http://nebula-nft.test/meta");
        presale = await NFTPresale.new("" + nft.address, zeroAddr, walletAddr, nextTokenId, price, 10, 1, 20, 3);
        list = [accounts[0], "0x7B8b1D4Df96FeB167901F4e8ae2d0F053E3E9f1f","0xb066410484eECca130c82f51692FFD5e43ED3B60","0xb152ec8f0CEE188DA4306b67cbb25995c4d78F0d","0x87CB657909f28F4b163A5f658582649461b4fD2c","0x1273743ECc5d519d036D7C5e2dE85892127c4e85","0x8e053a7832A0B7214236C261ceb6747D03C11b78","0x49f17dCe7278ca8C54f68B7BE98a9a521086FbFc","0x144f057f62173841b590239b76212028E6AD237c"];
    });

    describe('Mint', function () {

        it('should be paused presale state ', async () => {
            const state = await presale.state();
            assert.equal(state.toNumber(), pausedState);
        });

        it('should allow admin start whitelistSale', async function () {
            await presale.startWhitelistSale();
        });

        it("change state when not paused", async function () {
            const role = await nft.MINTER_ROLE();
            const expectedRoleGranted = await nft.grantRole(role, presale.address);

            const merkleTree = new MerkleTree(list, keccak256, {hashLeaves: true, sortPairs: true});

            const root = merkleTree.getHexRoot();


            await truffleAssert.reverts(
                presale.setMerkleRoot(root),
                "You can not perform action when contract is not on Paused state"
            );
        });

        it("proof whiteListed", async function () {
            const role = await nft.MINTER_ROLE();
            const expectedRoleGranted = await nft.grantRole(role, presale.address);

            const merkleTree = new MerkleTree(list, keccak256, {hashLeaves: true, sortPairs: true});

            const root = merkleTree.getHexRoot();

            console.log(root);

            await presale.pauseSale();

            await presale.setMerkleRoot(root);

            await presale.startWhitelistSale();

            const proof = merkleTree.getHexProof(keccak256(admin));

            await presale.mintNFTInWhitelistSale(1, proof, {from: admin,  value: toWei(0.2)});
        });

        it("proof not whiteListed", async function () {
            const role = await nft.MINTER_ROLE();
            const expectedRoleGranted = await nft.grantRole(role, presale.address);

            const merkleTree = new MerkleTree(list, keccak256, {hashLeaves: true, sortPairs: true});

            const root = merkleTree.getHexRoot();

            await presale.pauseSale();

            await presale.setMerkleRoot(root);

            await presale.startWhitelistSale();

            const proof = merkleTree.getHexProof(keccak256(outOfWhiteListUser));

            await truffleAssert.reverts(
                presale.mintNFTInWhitelistSale(1, proof, {from: outOfWhiteListUser,  value: toWei(0.2)}),
                "Address not whitelisted"
            );
        });

    })
})
