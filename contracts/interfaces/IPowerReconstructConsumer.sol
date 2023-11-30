// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


interface IPowerReconstructConsumer {

    function handlePowerChange(uint256 tokenId, uint16 addedPower) external;

}