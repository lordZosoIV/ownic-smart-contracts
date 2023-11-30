// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";


// File: contracts/token/ERC677.sol

pragma solidity ^0.8.0;


interface ERC677 is IERC20 {
    function transferAndCall(
        address to,
        uint256 value,
        bytes memory data
    ) external returns (bool success);

    event Transfer(
        address indexed from,
        address indexed to,
        uint256 value,
        bytes data
    );
}

// File: contracts/token/ERC677Receiver.sol

pragma solidity ^0.8.0;

interface ERC677Receiver {
    function onTokenTransfer(address _sender, uint _value, bytes memory _data) external;
}

contract LinkToken is ERC20Burnable, ERC677 {

    string private constant TOKEN_NAME = "Chainlink Token";
    string private constant TOKEN_SYMBOL = "LINK";
    uint8 private constant TOKEN_DECIMALS = 18;

    constructor(uint256 initialSupply) ERC20(TOKEN_NAME, TOKEN_SYMBOL) {
        _mint(_msgSender(), initialSupply);
    }

    function transferAndCall(
        address to,
        uint256 value,
        bytes memory data
    ) public virtual override returns (bool success) {
        super.transfer(to, value);
        emit Transfer(msg.sender, to, value, data);
        contractFallback(to, value, data);
        return true;
    }

    // PRIVATE
    function contractFallback(
        address to,
        uint256 value,
        bytes memory data
    ) private {
        ERC677Receiver receiver = ERC677Receiver(to);
        receiver.onTokenTransfer(msg.sender, value, data);
    }

}
