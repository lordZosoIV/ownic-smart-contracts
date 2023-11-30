const OwnicController = artifacts.require("OwnicController.sol");
const PlayerCollection = artifacts.require("PlayerCollection.sol");


function getByte32(string) {
    return web3.utils.fromAscii(string);
}


module.exports = async function (deployer, network, accounts) {

    if (network === "test") {
        return;
    }

    let controller = await OwnicController.deployed();
    let nft = await PlayerCollection.deployed();

    await controller.addPlayerEdition(1, 1, await getByte32("Messi2021"), 2, getByte32("Defender"), 99, 3, 2, true);
    await controller.handleMint(1, 1);
    await nft.mint("0x4B6e4FF17e2070b09D659cA37Dc6ba1a5c06C7f5", 1);





};
