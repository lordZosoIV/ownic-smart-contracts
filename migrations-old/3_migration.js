const OwnicNFTMarketplace = artifacts.require("OwnicNFTMarketplace");
const NebulaDynamicCollection = artifacts.require("NebulaDynamicCollection");
const NebulaToken = artifacts.require("NebulaToken");

const { deployProxy } = require('@openzeppelin/truffle-upgrades');

module.exports = async function (deployer) {

  let market = await OwnicNFTMarketplace.deployed();
  let nft = await NebulaDynamicCollection.at("0x95d5eC85b37368fF142F034f567F6b0BDAeb04B4");
  let token = await NebulaToken.at("0x4fbbba2e526fd77e82f14fd142a1231acb79f2d8");

  await nft.grantRole(await nft.MINTER_ROLE.call(), market.address);
  await nft.setApprovalForAll(market.address, true);
  await token.approve(market.address, "10000000000000000000000");

};
