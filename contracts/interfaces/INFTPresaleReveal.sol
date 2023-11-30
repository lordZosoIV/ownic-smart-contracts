// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// @notice added by OWNIC
interface INFTPresaleReveal {

    function requestVRF() external returns(bytes32);

    function calculateAndAssignEdition(uint256 tokenId, bytes32 requestId, uint8 index) external returns (uint256);

}
