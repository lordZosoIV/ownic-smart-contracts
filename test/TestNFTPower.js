const {assert} = require('chai');
const utils = require('../script/utils');
const {expectRevert} = require('@openzeppelin/test-helpers');
const NFTPowerMock = artifacts.require("NFTPowerMock.sol");
const NFTStaking = artifacts.require("NFTStaking.sol");
const OwnicToken = artifacts.require("OwnicToken.sol");
const PlayerCollection = artifacts.require('PlayerCollection.sol')
const NFTUtilsMock = artifacts.require("NFTUtilsMock.sol");

contract("NFTPower", accounts => {

    let token;
    let nft;
    let staking;
    let nftPowerMock;
    let utilsMock;

    let signer = '0x4dd3a7ca8B345f712EA0Da887e8C1EA652643F45';

    before(async () => {
        token = await OwnicToken.new("Ownic Test", "OWN", utils.toWei(1_000_000_000));
        nft = await PlayerCollection.new("Player NFT Collection", "OWNICPLAYER", "http://nebula-nft.test/meta");
        staking = await NFTStaking.new();
        nftPowerMock = await NFTPowerMock.new(signer, staking.address)
        utilsMock = await NFTUtilsMock.new();
        await staking.initialize(token.address, nft.address, nftPowerMock.address, utilsMock.address);
    });


    describe('test nft power', function () {

        it("check nonce for edition", async () => {
            let nonce = await nftPowerMock.getEditionCurrentNonce(3);
            assert.equal(nonce.toNumber(), 0)

        });

        it("check nonce for nft", async () => {
            let nonce = await nftPowerMock.getNftCurrentNonce(3);
            assert.equal(nonce.toNumber(), 0)

        });

        it("nft power with invalid nonce", async () => {
            await expectRevert(
                nftPowerMock.powerProofNft(1, 14, 3, '0x182f2ab4ed89e3d179ccecfe1fbdbb45559b18efd61d3e8197a78b10fec395145bce462d1ef3aad4d0cc39ea63f076c86ed7d4aba397371189a5f9e15ed5ac761b'),
                "nonce value is not valid"
            )
        });

        it("edition power with invalid nonce", async () => {
            await expectRevert(
                nftPowerMock.powerProofEdition(1, 14, 3, '0x182f2ab4ed89e3d179ccecfe1fbdbb45559b18efd61d3e8197a78b10fec395145bce462d1ef3aad4d0cc39ea63f076c86ed7d4aba397371189a5f9e15ed5ac761b'),
                "nonce value is not valid"
            )
        });

        it("nft power with invalid signature", async () => {
            await expectRevert(
                nftPowerMock.powerProofNft(1, 1, 3, '0x222f2ab4ed89e3d179ccecfe1fbdbb45559b18efd61d3e8197a78b10fec395145bce462d1ef3aad4d0cc39ea63f076c86ed7d4aba397371189a5f9e15ed5ac761b'),
                "must be signer"
            )
        });

        it("nft with valid nonce", async () => {
            await nftPowerMock.powerProofNft(1, 1, 3, '0x182f2ab4ed89e3d179ccecfe1fbdbb45559b18efd61d3e8197a78b10fec395145bce462d1ef3aad4d0cc39ea63f076c86ed7d4aba397371189a5f9e15ed5ac761b');
            let nonce = await nftPowerMock.getNftCurrentNonce(1);
            assert.equal(nonce.toNumber(), 1);
        });

        it("nft power", async () => {
            let power = await nftPowerMock.getNftPowerByNonce(1, 1);
            assert.equal(power.toNumber(), 3);
        });

        it("edition with valid nonce", async () => {
            await nftPowerMock.powerProofEdition(1, 1, 3, '0x43c1c0cdf352f3179bdda80ea89c13dafbc48484ef73bad9f8b8999dc61e019f2e1e3c62f6c351dd85edf587c6eba3c9efe78386839dbe54a0a509203f95ef021b');
            let nonce = await nftPowerMock.getEditionCurrentNonce(1);
            assert.equal(nonce.toNumber(), 1);
        });

        it("edition power", async () => {
            let power = await nftPowerMock.getEditionPowerByNonce(1, 1);
            assert.equal(power.toNumber(), 3);
        });

        it("update nft power", async () => {
            await nftPowerMock.powerProofEdition(1, 2, 4, '0x42818001f06549750b6e01cfdc93ec1359421324934fa005c5947a39f6a06f2570ac4d7412bae98953c1eaa73eb5c626d9a88d38d05fd64db375f136805eb55e1c');
            let power = await nftPowerMock.getEditionPowerByNonce(1, 2);
            assert.equal(power.toNumber(), 7);
        });

        it("update nft power again", async () => {
            await nftPowerMock.powerProofEdition(1, 3, 5, '0xa4bc72ea63c37a7f9798be96e2665146cd79d4b3265c554557e9499f20a12c937f2b11af15cb90b9e40b5795094fc4c3f4667de8ea8e3fe88b4974e3700756441b');
            let power = await nftPowerMock.getEditionPowerByNonce(1, 3);
            assert.equal(power.toNumber(), 12);
        });

        it("other edition with nonce", async () => {
            await nftPowerMock.powerProofEdition(14, 1, 100, '0xf9b7724f7e480e8754392d6539994be0ed5897c7e8b9933bf545d1b30abce1b5713b366a6bb1eb84bd824ab6aa418d184df4895be6ffdce4bcc1d721cec8fe681c');
            let nonce = await nftPowerMock.getEditionCurrentNonce(14);
            assert.equal(nonce.toNumber(), 1);
        });

        it("other edition power", async () => {
            let power = await nftPowerMock.getEditionPowerByNonce(14, 1);
            assert.equal(power.toNumber(), 100);
        });




    })


});

