pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";

import "../interfaces/IPowerReconstructConsumer.sol";
import "../NFTPower.sol";

contract NFTPowerMock is NFTPower {

    constructor(address _signer, address _stakeAddress)
    public
    NFTPower(_signer, _stakeAddress){}

    function toUint(address _address) internal pure override returns (uint256) {
        return uint256(uint160(0x9D7f74d0C41E726EC95884E0e97Fa6129e3b5E99));
    }

}
