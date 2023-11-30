// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface INFTController {

    // Views
    function getNftPower(uint256 nftId) external view returns (uint16);

    function getNftCustomPower(uint256 nftId) external view returns (uint16);

    function getEditionPower(uint256 editionId) external view returns (uint16);

    function getEditionId(uint256 tokenId) external view returns (uint256);

}
