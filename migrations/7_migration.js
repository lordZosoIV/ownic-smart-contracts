const utils = require("../script/utils");
const params = require("../script/params");
const PlayerCollection = artifacts.require("PlayerCollection.sol");
const NFTPresale = artifacts.require("NFTPresale.sol");
const NFTPresaleReveal = artifacts.require("NFTPresaleReveal.sol");
const OwnicController = artifacts.require("OwnicController.sol");
const VRFCoordinatorMock = artifacts.require("VRFCoordinatorMock.sol");
const LinkToken = artifacts.require("LinkToken.sol"); // change to basic erc-20

module.exports = async function (deployer, network, accounts) {

    // if (network === "test") {
    //     return;
    // }
    //
    // const zeroAddr = "0x0000000000000000000000000000000000000000";
    // const walletAddr = "0x144f057f62173841b590239b76212028E6AD237c";
    // const nextTokenId = 6;
    //
    //
    // // let presale = await NFTPresale.at("0x724544dcA80e76eeFa4E16cCdd0575c4c37474A7");
    // // let reveal = await NFTPresale.at("0xc1d220460c39f456eb5023fccc2d3ba6dc454052");
    // let nft = await PlayerCollection.at("0x1f2d66b6964d409d42e1f4e530303c69f0bd5fb3");
    // let controller = await OwnicController.at("0x66a12e23b0c0817a00c2f2fc7380781ad304417f");
    //
    // await deployer.deploy(NFTPresale,
    //     nft.address,
    //     zeroAddr,
    //     walletAddr,
    //     nextTokenId,
    //     web3.utils.toWei("" + 0.02),
    //     10,
    //     1,
    //     20,
    //     3,
    //     {gas : 3500000}
    // );
    //
    // let presale = await NFTPresale.deployed();
    // await nft.grantRole(await nft.MINTER_ROLE.call(), presale.address);
    //
    //
    // let linkAddress = "0x326C977E6efc84E512bB9C30f76E30c160eD06FB";
    // let vrfCoordinator = "0x8C7382F9D8f56b33781fE506E897a4F1e2d17255";
    // let keyHash = "0x6e75b569a01ef56d18cab6a8e71e6600d6ce853834d4a5748b720d06f878b3a4";
    // let vrfFee = utils.toWei(0.0001);
    //
    //
    // let reveal = await deployer.deploy(
    //     NFTPresaleReveal, presale.address, controller.address, params.SUBGROUP_PRESALE,
    //     vrfCoordinator, linkAddress, keyHash, vrfFee,
    //     {gas : 1500000}
    // );
    //
    // presale.setRevealContract(reveal.address);
    // await nft.grantRole(await nft.MINTER_ROLE.call(), reveal.address);

};
