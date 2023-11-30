const {expect, should, assert} = require('chai');
const truffleAssert = require('truffle-assertions');
const increaseTime = require('../../script/increaseTime');
const NFTCategoryController = artifacts.require("NFTCategoryController.sol");
const OwnicNFTMarketplace = artifacts.require("OwnicNFTMarketplace.sol");
const BN = web3.utils.BN;

async function getByte32(string) {
    return web3.utils.keccak256(string);
}

contract("OwnicNFTMarketplace", accounts => {

    let controller;
    let market;

    beforeEach(async () => {
        controller = await NFTCategoryController.deployed();
        market = await OwnicNFTMarketplace.deployed();
    });

});