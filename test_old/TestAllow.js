// const { expectRevert } = require('@openzeppelin/test-helpers');
// const NebulaToken = artifacts.require('NebulaToken');
//
// contract('NebulaToken', (accounts) => {
//     let nebulaToken = null;
//     before(async () => {
//         nebulaToken = await NebulaToken.deployed();
//     });
//
//     it("should put 10000 MetaCoin in the first account", () =>
//         nebulaToken.deployed()
//             .then(instance => instance.getBalance.call(accounts[0]))
//             .then(balance => {
//                 assert.equal(
//                     balance.valueOf(),
//                     10000,
//                     "10000 wasn't in the first account"
//                 );
//             }));
// });
