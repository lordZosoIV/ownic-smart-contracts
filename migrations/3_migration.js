const utils = require("../script/utils");
const params = require("../script/params");
const PlayerCollection = artifacts.require("PlayerCollection.sol");
const NFTPresale = artifacts.require("NFTPresale.sol");
const NFTPresaleReveal = artifacts.require("NFTPresaleReveal.sol");
const OwnicController = artifacts.require("OwnicController.sol");
const VRFCoordinatorMock = artifacts.require("VRFCoordinatorMock.sol");
const LinkToken = artifacts.require("LinkToken.sol"); // change to basic erc-20

module.exports = async function (deployer, network, accounts) {

    if (network === "test") {
        return;
    }

    const zeroAddr = "0x0000000000000000000000000000000000000000";
    const walletAddr = "0x130B3C33490F44AcC435e0f05cEE293b8A97eb27"; //TODO change
    const nextTokenId = 1;

    let nft = await PlayerCollection.deployed();
    let controller = await OwnicController.deployed();

    // deploy NFTPresale

    await deployer.deploy(NFTPresale,
        nft.address,
        zeroAddr,
        walletAddr,
        nextTokenId,
        web3.utils.toWei("" + 0.035), //TODO change
        10,
        1,
        20,
        3,
        {gas : 3500000}
    );

    let presale = await NFTPresale.deployed();
    await nft.grantRole(await nft.MINTER_ROLE.call(), presale.address);


    // Deploy NFTPresaleReveal

    let linkAddress;
    let vrfCoordinator;
    let keyHash;
    let vrfFee;

    if (network === "mumbai") {
        linkAddress = "0x326C977E6efc84E512bB9C30f76E30c160eD06FB";
        vrfCoordinator = "0x8C7382F9D8f56b33781fE506E897a4F1e2d17255";
        keyHash = "0x6e75b569a01ef56d18cab6a8e71e6600d6ce853834d4a5748b720d06f878b3a4";
        vrfFee = utils.toWei(0.0001);
    } else if (network === "polygon_main") {
        linkAddress = "0xb0897686c545045afc77cf20ec7a532e3120e0f1";
        vrfCoordinator = "0x3d2341ADb2D31f1c5530cDC622016af293177AE0";
        keyHash = "0xf86195cf7690c55907b2b611ebb7343a6f649bff128701cc542f0569e2c549da";
        vrfFee = utils.toWei(0.0001);
    } else {
        const linkToken = await deployer.deploy(LinkToken, "10000000000000000000000");
        const vrfCoordinatorMock = await deployer.deploy(VRFCoordinatorMock, linkToken.address);
        linkAddress = linkToken.address;
        vrfCoordinator = vrfCoordinatorMock.address;
        keyHash = "0x6c3699283bda56ad74f6b855546325b68d482e983852a7a82979cc4807b641f4";
        vrfFee = utils.toWei(0.1);
    }

    let reveal = await deployer.deploy(
        NFTPresaleReveal, presale.address, controller.address, params.SUBGROUP_PRESALE,
        vrfCoordinator, linkAddress, keyHash, vrfFee,
        {gas : 1500000}
    );

    presale.setRevealContract(reveal.address);
    await nft.grantRole(await nft.MINTER_ROLE.call(), reveal.address);

};
