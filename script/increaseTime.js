/**
 * Increase EVM time in ganache-cli to simulate calls in the future
 * @param integer Number of seconds to increase time by
 */
async function increaseTime(integer) {
    // First we increase the time
    await web3.currentProvider.send({
        jsonrpc: '2.0',
        method: 'evm_increaseTime',
        params: [integer],
        id: 0,
    }, () => {});

    // Then we mine a block to actually get the time change to occurs
    // See this issue: https://github.com/trufflesuite/ganache-cli/issues/394
    await web3.currentProvider.send({
        jsonrpc: '2.0',
        method: 'evm_mine',
        params: [],
        id: 0,
    }, () => { });

    // This does not seem to work properly. After using this function the
    // ganache-cli timestamp is updated properly, but the timestamp returned
    // from the contract itself is not updated. See this issue:
    // https://github.com/trufflesuite/ganache-cli/issues/336

    /* Note: witout the blank callbacks you get:
         Error: No callback provided to provider's send function. As of web3
         1.0, provider.send is no longer synchronous and must be passed a
        callback as its final argument. */
} // end increaseTime

module.exports = increaseTime;