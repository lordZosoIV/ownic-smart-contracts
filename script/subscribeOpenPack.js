eth = require('web3-eth')

var options = {fromBlock: 0, address: "0x1eec130925e5Ec119Ab9e6B3b9FE907DA03D83D8", topics: ["0x1f58510cae7da5625291e1bed651fa7cf4b00d9682778f254f54901df169c0f4", null, null]};
eth.subscribe('logs', options, function (error, result) {if (!error) console.log(result);}).on("data", function (log) {console.log(log);}).on("changed", function (log) {});
