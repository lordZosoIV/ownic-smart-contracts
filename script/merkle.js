const fs = require("fs");
const {expect} = require("chai");
const {MerkleTree} = require('merkletreejs');
const keccak256 = require('keccak256');
const HDWalletProvider = require('@truffle/hdwallet-provider');
const web3 = require('web3');
const {BN} = require('@openzeppelin/test-helpers')
const {exit} = require("truffle/build/495.bundled");

const initializer = require("./initializer");
const merkleLeaves = require("./merkleTreeLeaves")

function toWei(amount) {
    return web3.utils.toWei("" + amount);
}

let merkleTree;

async function mintNFTInWhitelistSale(numOfTokens, addr) {
    let list = merkleLeaves.getFileData();
    initializer.init().then(async response => {
        let contract = response["contract"];
        let accounts = response["accounts"];
        merkleTree = new MerkleTree(list, keccak256, {hashLeaves: true, sortPairs: true});
        const root = merkleTree.getHexRoot();
        let proof = merkleTree.getHexProof(keccak256(addr));
        contract.methods.mintNFTInWhitelistSale(numOfTokens, proof).send({from: addr, value: toWei(0.18)}).then(() => {
            process.exit(1);
        })
    });
}

const updateMerkleTree = async () => {
    let list = merkleLeaves.getFileData();
    initializer.init().then(async response => {
        let contract = response["contract"];
        let accounts = response["accounts"];
        merkleTree = new MerkleTree(list, keccak256, {hashLeaves: true, sortPairs: true});
        const root = merkleTree.getHexRoot();
        contract.methods.setMerkleRoot(root).send({from: accounts[0]}).then(() => {
            process.exit(1);
        })
    });
}



module.exports = {mintNFTInWhitelistSale, updateMerkleTree}

