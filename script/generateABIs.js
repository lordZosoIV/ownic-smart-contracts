const fs = require('fs');
const ownicController = JSON.parse(fs.readFileSync('build/contracts/OwnicController.json', 'utf8'));
fs.writeFileSync('abi/OwnicController.abi', JSON.stringify(ownicController.abi));

const ownicNftShop = JSON.parse(fs.readFileSync('build/contracts/OwnicNFTShop.json', 'utf8'));
fs.writeFileSync('abi/OwnicNFTShop.abi', JSON.stringify(ownicNftShop.abi));

//
// const ownicPlayerOpener = JSON.parse(fs.readFileSync('build/contracts/OwnicPlayerOpener.json', 'utf8'));
// fs.writeFileSync('abi/OwnicPlayerOpener.abi', JSON.stringify(ownicPlayerOpener.abi));

const nftPresale = JSON.parse(fs.readFileSync('build/contracts/NFTPresale.json', 'utf8'));
fs.writeFileSync('abi/NFTPresale.abi', JSON.stringify(nftPresale.abi));

// const ownicToken = JSON.parse(fs.readFileSync('build/contracts/OwnicToken.json', 'utf8'));
// fs.writeFileSync('abi/OwnicToken.abi', JSON.stringify(ownicToken.abi));

const playerCollection = JSON.parse(fs.readFileSync('build/contracts/PlayerCollection.json', 'utf8'));
fs.writeFileSync('abi/PlayerCollection.abi', JSON.stringify(playerCollection.abi));

