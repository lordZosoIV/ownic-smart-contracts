// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface INFTPower {

    // Views
    function getEditionCurrentNonce(uint256 editionId) external view returns (uint256);

    function getNftCurrentNonce(uint256 nftId) external view returns (uint256);

    function getEditionPowerByNonce(uint256 editionId, uint256 nonce) external view returns (uint256);

    function getNftPowerByNonce(uint256 nftId, uint256 nonce) external view returns (uint256);

    function getNftPower(uint256 tokenId, uint256 editionId) external view returns (uint16);

    function getNftCustomPower(uint256 tokenId) external view returns (uint16);

    function getEditionPower(uint256 editionId) external view returns (uint16);



    function handleMint(uint256 editionId, uint256 tokenId) external;

    function updatePower(uint256 editionId, uint256 tokenId) external;

}
