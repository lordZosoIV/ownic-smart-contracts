// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// @notice added by OWNIC
interface IOwnicController {

    // TODO test 2
    function addPlayerEdition(uint256 editionId, uint256 _playerId, bytes32 _name, uint16 _class, bytes32 _position, uint16 _overall, uint256 _powerRate, uint256 _price, bool _isZeroAllowed) external;

    function addPriceToPlayerEdition(uint256 editionId, uint256 _price, bool _isZeroAllowed) external;

    function addPlayerEditionDiscount(uint256 _editionId, uint256 _duration, uint256 _discountPrice, bool _discountStatic) external;

    function addTraitToPlayerEdition(uint256 _editionId, bytes32 _trait, uint16 _value) external;

    // TODO test 1
    function addPlayerClassType(bytes32 _name, uint16 _typeId, uint16 _mintMax, bytes32 _subGroup) external;

    function handleMint(uint256 _editionId, uint256 _tokenId) external;

    function updatePower(uint256 _editionId, uint256 _tokenId) external;

    function getPlayerEdition(uint256 editionId) external returns (bytes32, uint16, bytes32, uint256, uint16, uint16, uint16);

    function getPlayerEditionTrait(uint256 editionId) external returns (bytes32, uint16);

    function getPlayerEditionId(uint16 _class, bytes32 _position, uint256 _index) external returns (uint256);

    function getPlayerEditionIdByClassId(uint16 _class, uint256 _index) external view returns (uint256);

    function getEditionPrice(uint256 _editionId) external view returns (uint256);

    function getEditionPriceCalculated(uint256 _editionId, bytes32 _subGroup) external view returns (uint256);

    function getEditionCanMinted(uint256 _editionId) external view returns (uint256);

    function getEditionIdFromRandom(uint256 _seed, bytes32 _subGroup) external view returns (uint256);

    function getEditionIdFromRandomWithClassId(uint256 _seed, uint16 _classId) external view returns (uint256);

    function getClassByRarity(uint8 _index) external view returns (uint16, uint16);

    function getEditionsCount() external view returns (uint256);

    function getCardsCountByClass(uint16 _classId) external view returns (uint256);

}
