// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";

import "./NFTEditionLibrary.sol";
import "./interfaces/IOwnicController.sol";
import "./interfaces/INFTController.sol";

import "./NFTPower.sol";

contract OwnicController is IOwnicController, INFTController, Initializable, AccessControlUpgradeable {

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    using NFTEditionLibrary for address;
    address public eternalStorage;
    NFTPower public nftPower;

    event PlayerEditionAdded(uint256 indexed _editionId);
    event PlayerEditionDiscountAdded(uint256 indexed _editionId);
    event PlayerClassTypeAdded(uint256 indexed _typeId);
    event InflationChanged(uint256 _inflationRate);
    event EditionItemMinted(uint256 indexed _editionId, uint256 indexed _tokenId);

    address public dynamicNFTCollectionAddress;

    function initialize(address _eternalStorage, address _dynamicNFTCollectionAddress, address _nftPower) public initializer {
        eternalStorage = _eternalStorage;
        dynamicNFTCollectionAddress = _dynamicNFTCollectionAddress;
        nftPower = NFTPower(_nftPower);

        __AccessControl_init();
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
    }

    function addPlayerEdition(
        uint256 editionId, uint256 _playerId, bytes32 _name, uint16 _classId, bytes32 _position,
        uint16 _overall, uint256 _powerRate, uint256 _price, bool _zeroAllowed) external override onlyRole(DEFAULT_ADMIN_ROLE)
    {

        uint256 _editionId = eternalStorage.addPlayerEdition(editionId, _playerId, _name, _classId, _position, _overall);

        eternalStorage.addPriceToPlayerEdition(editionId, _price, _zeroAllowed);
        nftPower.setEditionPower(editionId, _powerRate);

        emit PlayerEditionAdded(_editionId);
    }

    function addPriceToPlayerEdition(uint256 editionId, uint256 _price, bool _zeroAllowed) external override onlyRole(DEFAULT_ADMIN_ROLE)
    {
        eternalStorage.addPriceToPlayerEdition(editionId, _price, _zeroAllowed);
    }

    function addTraitToPlayerEdition(uint256 _editionId, bytes32 _trait, uint16 _value) external override onlyRole(DEFAULT_ADMIN_ROLE)
    {
        eternalStorage.addTraitToPlayerEdition(_editionId, _trait, _value);
    }

    function addPlayerEditionDiscount(uint256 _editionId, uint256 _duration, uint256 _discountPrice, bool _discountStatic) external override onlyRole(DEFAULT_ADMIN_ROLE)
    {
        eternalStorage.addPlayerEditionDiscount(_editionId, block.timestamp, _duration, _discountPrice, _discountStatic);
        emit PlayerEditionDiscountAdded(_editionId);
    }

    function addPlayerClassType(bytes32 _name, uint16 _typeId, uint16 _mintMax, bytes32 _subGroup) external override onlyRole(DEFAULT_ADMIN_ROLE)
    {
        eternalStorage.addPlayerClassType(_name, _typeId, _mintMax, _subGroup);
        emit PlayerClassTypeAdded(_typeId);
    }

    function handleMint(uint256 _editionId, uint256 _tokenId) external override {
        require(
            IAccessControlUpgradeable(dynamicNFTCollectionAddress).hasRole(MINTER_ROLE, _msgSender()),
            "invalid caller"
        );

        require(eternalStorage.getEditionCanMinted(_editionId) > 0, string(abi.encodePacked("Edition ", Strings.toString(uint256(_editionId)), " can't be minted")));

        eternalStorage.reduceEditionCanMinted(_editionId, _tokenId);
        nftPower.handleMint(_editionId, _tokenId);
        emit EditionItemMinted(_editionId, _tokenId);
    }

    function updatePower(uint256 _editionId, uint256 _tokenId) public override {
        nftPower.updatePower(_editionId, _tokenId);
    }

    function getPlayerEdition(uint256 editionId) external override view returns (bytes32, uint16, bytes32, uint256, uint16, uint16, uint16)
    {
        return eternalStorage.getPlayerEdition(editionId);
    }

    function getEditionPower(uint256 editionId) external view override returns (uint16)
    {
        return nftPower.getEditionPower(editionId);
    }

    function getNftPower(uint256 nftId) external view override returns (uint16)
    {
        return nftPower.getNftPower(nftId, eternalStorage.getPlayerEditionIdByNftId(nftId));
    }

    function getNftCustomPower(uint256 nftId) external view override returns (uint16)
    {
        return nftPower.getNftCustomPower(nftId);
    }

    function getEditionId(uint256 tokenId) external override view returns (uint256) {
        return eternalStorage.getPlayerEditionIdByNftId(tokenId);
    }

    function getPlayerEditionTrait(uint256 editionId) external override view returns (bytes32, uint16)
    {
        return eternalStorage.getPlayerEditionTrait(editionId);
    }

    function getPlayerEditionId(uint16 _class, bytes32 _position, uint256 _index) external override view returns (uint256)
    {
        return eternalStorage.getPlayerEditionId(_class, _position, _index);
    }

    function getPlayerEditionIdByClassId(uint16 _class, uint256 _index) external override view returns (uint256)
    {
        return eternalStorage.getPlayerEditionIdByClassId(_class, _index);
    }

    function getEditionPrice(uint256 _editionId) external override view returns (uint256)
    {
        return eternalStorage.getEditionPrice(_editionId);
    }

    function getEditionPriceCalculated(uint256 _editionId, bytes32 _subGroup) external override view returns (uint256)
    {
        return eternalStorage.getEditionPriceCalculated(_editionId, _subGroup);
    }

    function getEditionCanMinted(uint256 _editionId) external override view returns (uint256)
    {
        return eternalStorage.getEditionCanMinted(_editionId);
    }

    function getEditionIdFromRandom(uint256 _seed, bytes32 _subGroup) external override view returns (uint256)
    {
        uint256 classPart = _getRandom(_seed, keccak256("ClassPart"));
        uint256 offsetPart = _getRandom(_seed, keccak256("OffsetPart"));

        return getEditionIdFromClassPartAndOffset(classPart, offsetPart, _subGroup);
    }

    function getEditionIdFromRandomWithClassId(uint256 _seed, uint16 _classId) external override view returns (uint256)
    {
        uint256 offsetPart = _getRandom(_seed, keccak256("OffsetByClassPart"));
        return getEditionIdFromClassPartAndOffsetWithClassId(offsetPart, _classId);
    }

    function getClassByRarity(uint8 _index) external override view returns (uint16, uint16)
    {
        return eternalStorage.getClassByRarity(_index);
    }

    function getEditionsCount() external override view returns (uint256)
    {
        return eternalStorage.getEditionsCount();
    }

    function getCardsCountByClass(uint16 _classId) public override view returns (uint256) {
        return eternalStorage.getCardsCountByClass(_classId);
    }

    function getEditionIdFromClassPartAndOffset(uint256 classPart, uint256 offsetPart, bytes32 _subGroup) public view returns (uint256)
    {
        uint16 classIdByRarity;
        uint16 classRarity;
        uint256 totalCardsOnPosition;

        for (uint8 i = 0; i < 100; i++) {
            (classIdByRarity, classRarity) = eternalStorage.getClassByRarity(i);

            if (_subGroup != "" && !eternalStorage.getClassIsInSubgroup(classIdByRarity, _subGroup)) {
                continue;
            }

            totalCardsOnPosition += eternalStorage.getCardsCountByClass(classIdByRarity);
        }

        uint256 classOffset = classPart % totalCardsOnPosition;
        uint256 currentClassOffset = 0;
        uint256 countByClass = 0;

        for (uint8 i = 0; i < 100; i++) {
            (classIdByRarity, classRarity) = eternalStorage.getClassByRarity(i);

            if (_subGroup != "" && !eternalStorage.getClassIsInSubgroup(classIdByRarity, _subGroup)) {
                continue;
            }

            countByClass = eternalStorage.getEditionsCountByClassId(classIdByRarity);

            currentClassOffset += countByClass * classRarity;

            if (countByClass == 0) {
                continue;
            }

            if (classOffset < currentClassOffset) {
                break;
            }
        }

        return eternalStorage.getPlayerEditionIdByClassId(classIdByRarity, (offsetPart % countByClass) + 1);
    }

    function getEditionIdFromClassPartAndOffsetWithClassId(uint256 offsetPart, uint16 _classId) public view returns (uint256)
    {
        uint256 countByClass = eternalStorage.getEditionsCountByClassId(_classId);
        return eternalStorage.getPlayerEditionIdByClassId(_classId, (offsetPart % countByClass) + 1);
    }

    function getEditionsCountByClassId(uint16 _classId) public view returns (uint256){
        return eternalStorage.getEditionsCountByClassId(_classId);
    }

    function _getRandom(uint256 _seed, bytes32 order) public view returns (uint256)
    {
        return uint256(keccak256(abi.encodePacked(block.timestamp, tx.origin, _seed, order)));
    }

    function getIndexByClass(uint256 _editionId) public view returns (uint256){
        return eternalStorage.getIndexByClass(_editionId);
    }

    function reduceEditionCanMinted(uint256 _editionId, uint256 _tokenId) public {
        eternalStorage.reduceEditionCanMinted(_editionId, _tokenId);
    }


}
