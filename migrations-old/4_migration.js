const OwnicPlayerOpener = artifacts.require("OwnicPlayerOpener");
const NebulaCollection = artifacts.require("NebulaCollection");
const NebulaToken = artifacts.require("NebulaToken");

module.exports = async function (deployer) {

    await deployer.deploy(OwnicPlayerOpener,
        "0x4fbbba2e526fd77e82f14fd142a1231acb79f2d8", "0x95d5ec85b37368ff142f034f567f6b0bdaeb04b4",
        "0x5b89457500a276be1256788B1d478581d8A555Ad", "0x5b89457500a276be1256788B1d478581d8A555Ad",
        "0x8C7382F9D8f56b33781fE506E897a4F1e2d17255", "0x326C977E6efc84E512bB9C30f76E30c160eD06FB",
        "0x6e75b569a01ef56d18cab6a8e71e6600d6ce853834d4a5748b720d06f878b3a4", "100000000000000", 2000
    );

    let opener = await OwnicPlayerOpener.deployed();

    let nft = await NebulaCollection.at("0x95d5eC85b37368fF142F034f567F6b0BDAeb04B4");
    let token = await NebulaToken.at("0x4fbbba2e526fd77e82f14fd142a1231acb79f2d8");

    await nft.grantRole(await nft.MINTER_ROLE.call(), opener.address);
    await nft.setApprovalForAll(opener.address, true);
    await token.approve(opener.address, "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");

};
