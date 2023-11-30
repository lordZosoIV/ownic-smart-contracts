const {assert} = require('chai');
const truffleAssert = require('truffle-assertions');
const utils = require("../script/utils");
const params = require("../script/params");
const setupController = require("../script/setupController");
const {MerkleTree} = require("merkletreejs");
const keccak256 = require("keccak256");
const {expectRevert, expectEvent} = require("@openzeppelin/test-helpers");
const PlayerCollection = artifacts.require("PlayerCollection.sol");
const NFTPresale = artifacts.require("NFTPresale.sol");
const NFTPresaleReveal = artifacts.require("NFTPresaleReveal.sol");
const VRFCoordinatorMock = artifacts.require("VRFCoordinatorMock.sol");
const LinkToken = artifacts.require("LinkToken.sol"); // change to basic erc-20
const OwnicCollectionPowerRewards = artifacts.require("OwnicCollectionPowerRewards.sol");
const OwnicController = artifacts.require('OwnicController.sol');
const EternalStorage = artifacts.require("EternalStorage.sol");
const NFTEditionLibrary = artifacts.require("NFTEditionLibrary.sol");
const NFTPower = artifacts.require("NFTPower.sol");


function getByte32(string) {
    return web3.utils.keccak256(string);
}

function toWei(amount) {
    return web3.utils.toWei("" + amount);
}

contract("NFTPresale", accounts => {

    let presale;
    let controller;
    let reveal;
    let nft;
    let linkToken;
    let vrfCoordinator;
    let lib;
    let signer = '0x4dd3a7ca8B345f712EA0Da887e8C1EA652643F45';

    
    const zeroAddr = "0x0000000000000000000000000000000000000000";

    const pausedState = 0;
    const startedWhitelistSale = 1;
    const [admin, guest, someone, someone1] = accounts;


    before(async () => {
        nft = await PlayerCollection.new("Player NFT Collection", "OWNICPLAYER", "http://nebula-nft.test/meta");
        presale = await NFTPresale.new(nft.address, zeroAddr, admin, 1, 10, 9, 9, 55, 5);

        linkToken = await LinkToken.new('10000000000000000000000');

        vrfCoordinator = await VRFCoordinatorMock.new(linkToken.address);

        powerRewards = await OwnicCollectionPowerRewards.new(admin, linkToken.address, nft.address);
        nftPower = await NFTPower.new(signer, powerRewards.address);
        storage = await EternalStorage.new(admin, admin);
        lib = await NFTEditionLibrary.new();
        await OwnicController.link("NFTEditionLibrary", lib.address);
        controller = await OwnicController.new();
        await controller.initialize(storage.address, nft.address, nftPower.address)
        await storage.setAssociatedContract(controller.address);
        await powerRewards.setOwnicController(controller.address);
        await powerRewards.setPowerReconstructorAddress(nftPower.address);
        await nftPower.setControllerRole(controller.address);
        await nft.setTransferProcessor(powerRewards.address);

        await setupController(controller);

        reveal = await NFTPresaleReveal.new(presale.address, controller.address, params.SUBGROUP_PRESALE, vrfCoordinator.address, linkToken.address,
            '0x6c3699283bda56ad74f6b855546325b68d482e983852a7a82979cc4807b641f4',
            utils.toWei(0.1));

        await presale.setRevealContract(reveal.address);

        await nft.grantRole(await nft.MINTER_ROLE.call(), reveal.address);

        await controller.addPlayerClassType(getByte32("TEST"), 1110, 2, params.SUBGROUP_PRESALE);
        await controller.addPlayerClassType(getByte32("TEST"), 2110, 1, params.SUBGROUP_PRESALE);
        await controller.addPlayerClassType(getByte32("TEST"), 3123, 3, params.SUBGROUP_PRESALE);


        await controller.addPlayerEdition(1110, 6346, getByte32("J. Gortesadr 2021"), 1110, getByte32("Goalkeeper"), 1000, 1, 0, true);
        await controller.addPlayerEdition(2110, 6346, getByte32("J. Gortesadr 2021"), 2110, getByte32("Goalkeeper"), 1000, 1, 0, true);
        await controller.addPlayerEdition(3123, 6346, getByte32("J. Gortesadr 2021"), 3123, getByte32("Goalkeeper"), 1000, 1, 0, true);

    });


    describe('Test presale', function () {
        let editionIds = [];
        let allowedList = [];

        allowedList.push(admin);
        allowedList.push(guest);
        allowedList.push(someone);



        it("reveal after whitelist sale", async () => {
            await nft.grantRole(await nft.MINTER_ROLE.call(), presale.address);

            const merkleTree = new MerkleTree(allowedList, keccak256, {hashLeaves: true, sortPairs: true});

            const root = merkleTree.getHexRoot();

            await presale.setMerkleRoot(root);

            const proof = merkleTree.getHexProof(keccak256(admin));

            await presale.startWhitelistSale();

            await presale.mintNFTInWhitelistSale(9, proof, {from: admin, value: toWei(0.56)});


            await presale.startReveal();

            await linkToken.transfer(reveal.address, "100000000000000000");

            let tx2 = await presale.requestVRFForNFTs([1, 2, 3, 4, 5, 6, 7]);

            let requestID;

            truffleAssert.eventEmitted(tx2, 'RandomRequested', (ev) => {
                requestID = ev.requestId;
                return true;
            });


            await vrfCoordinator.callBackWithRandomness(requestID, "95250688022146912429659701458105696330965093922381253647056665233705758414322", reveal.address);

            let tx3 = await presale.revealNFT(1);

            truffleAssert.eventEmitted(tx3, 'Reveal', (ev) => {
                let edition_id = ev.editionId.toNumber();
                editionIds.push(edition_id);
                return true;
            });

            let tx4 = await presale.revealNFT(2);

            truffleAssert.eventEmitted(tx4, 'Reveal', (ev) => {
                let edition_id = ev.editionId.toNumber();
                editionIds.push(edition_id);
                return true;
            });

            let tx5 = await presale.revealNFT(3);

            truffleAssert.eventEmitted(tx5, 'Reveal', (ev) => {
                let edition_id = ev.editionId.toNumber();
                editionIds.push(edition_id);
                return true;
            });

            let tx6 = await presale.revealNFT(4);

            truffleAssert.eventEmitted(tx6, 'Reveal', (ev) => {
                let edition_id = ev.editionId.toNumber();
                editionIds.push(edition_id);
                return true;
            });

            let tx7 = await presale.revealNFT(5);

            truffleAssert.eventEmitted(tx7, 'Reveal', (ev) => {
                let edition_id = ev.editionId.toNumber();
                editionIds.push(edition_id);
                return true;
            });

            let tx8= await presale.revealNFT(6);

            truffleAssert.eventEmitted(tx8, 'Reveal', (ev) => {
                let edition_id = ev.editionId.toNumber();
                editionIds.push(edition_id);
                return true;
            });

            console.log(editionIds);

        });

        it("gavasxi", async () => {

            let tx9= await presale.revealNFT(7);

            truffleAssert.eventEmitted(tx9, 'Reveal', (ev) => {
                let edition_id = ev.editionId.toNumber();
                editionIds.push(edition_id);
                return true;
            });

        });



    })

});