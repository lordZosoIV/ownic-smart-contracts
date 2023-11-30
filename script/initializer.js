const fs = require("fs");
const HDWalletProvider = require('@truffle/hdwallet-provider');
const Web3 = require('web3');
const {exit} = require("truffle/build/495.bundled");

const path = "./merkle_data.txt";
const contractAbiPath = "../abi/NFTPresale.abi";
const contractAddress = "0x770A8a48E4dC77427F012A37d7583F66EfE2e69C";
const privateKeys = ["d4608adb81313c1aba14a8dc17c11503b5d7dd7da6c38f9a694d575d89cac138",
    "487155d238ed5c6580a862b0fc00ab3a41ee02ec7724b4444e6d1bab9ead44dd"];
const providerUrl = 'https://polygon-mumbai.infura.io/v3/06522c4d05884fe69d154949e84e360e';


async function getAbi() {
    let data = fs.readFileSync(contractAbiPath, 'utf8');
    return JSON.parse(data.toString());
}

const provider = new HDWalletProvider({
    privateKeys: privateKeys,
    providerOrUrl: providerUrl,
    chainId: 80001
});

const web3 = new Web3(provider);


const init = async () => {
    let accounts = await web3.eth.getAccounts();
    web3.eth.defaultAccount = accounts[0];

    let abi = await getAbi();
    return {
        "contract": new web3.eth.Contract(abi, contractAddress, {from: accounts[0]}),
        "accounts": accounts
    };
}

module.exports = {init}
