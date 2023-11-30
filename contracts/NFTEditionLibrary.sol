pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/math/Math.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

import "./storage/EternalStorage.sol";

// @notice added by OWNIC
library NFTEditionLibrary {

    using SafeMath for uint256;

    // get current(edition witch have at ones one item to mint) number off addition by _classId
    function getEditionsCountByClassId(address _storageContract, uint16 _classId) public view returns (uint256)
    {
        return EternalStorage(_storageContract).getUIntValue(keccak256(abi.encodePacked(_classId, "Count")));
    }

    // get current(edition witch have at ones one item to mint) number off all editions
    function getEditionsCount(address _storageContract) public view returns (uint256)
    {
        return EternalStorage(_storageContract).getUIntValue(keccak256(abi.encodePacked("AllCount")));
    }

    function getIndexByClass(address _storageContract, uint256 _editionId) public view returns (uint256)
    {
        return EternalStorage(_storageContract).getUIntValue(keccak256(abi.encodePacked("edition_index_in_class", _editionId)));
    }

    function getPlayerEdition(address _storageContract, uint256 editionId) public view returns (bytes32, uint16, bytes32, uint256, uint16, uint16, uint16)
    {
        return (
        EternalStorage(_storageContract).getBytes32Value(keccak256(abi.encodePacked("edition_name", editionId))),
        EternalStorage(_storageContract).getUInt16Value(keccak256(abi.encodePacked("edition_class", editionId))),
        EternalStorage(_storageContract).getBytes32Value(keccak256(abi.encodePacked("edition_position", editionId))),
        EternalStorage(_storageContract).getUIntValue(keccak256(abi.encodePacked("edition_price", editionId))),
        EternalStorage(_storageContract).getUInt16Value(keccak256(abi.encodePacked("edition_overall", editionId))),
        EternalStorage(_storageContract).getUInt16Value(keccak256(abi.encodePacked("edition_mint_max", editionId))),
        EternalStorage(_storageContract).getUInt16Value(keccak256(abi.encodePacked("edition_minted", editionId)))
        );
    }

    function getPlayerEditionTrait(address _storageContract, uint256 _editionId) public view returns (bytes32, uint16)
    {
        return (
        EternalStorage(_storageContract).getBytes32Value(keccak256(abi.encodePacked(_editionId, "Trait"))),
        EternalStorage(_storageContract).getUInt16Value(keccak256(abi.encodePacked(_editionId, "TraitValue")))
        );
    }

    function getPlayerEditionId(address _storageContract, uint16 _classId, bytes32 _position, uint256 _index) public view returns (uint256)
    {
        return EternalStorage(_storageContract).getUIntValue(keccak256(abi.encodePacked(_classId, _position, _index)));
    }

    function getPlayerEditionIdByClassId(address _storageContract, uint16 _classId, uint256 _index) public view returns (uint256)
    {
        return EternalStorage(_storageContract).getUIntValue(keccak256(abi.encodePacked("indexed_by_class", _classId, _index)));
    }

    function getCardsCountByClass(address _storageContract, uint16 _classId) public view returns (uint256) {
        return EternalStorage(_storageContract).getUIntValue(keccak256(abi.encodePacked("cards_count_by_class", _classId)));
    }

    function getPlayerEditionIdByNftId(address _storageContract, uint256 tokenId) public view returns (uint256)
    {
        return EternalStorage(_storageContract).getUIntValue(keccak256(abi.encodePacked("nft_edition_mapping", tokenId)));
    }

    function getEditionPrice(address _storageContract, uint256 _editionId) public view returns (uint256)
    {
        return EternalStorage(_storageContract).getUIntValue(keccak256(abi.encodePacked("edition_price", _editionId)));
    }

    function getEditionPriceCalculated(address _storageContract, uint256 _editionId, bytes32 _subGroup) public view returns (uint256)
    {
        uint256 _price = getEditionPrice(_storageContract, _editionId);

        if (_subGroup != "") {
            uint16 clasId = EternalStorage(_storageContract).getUInt16Value(keccak256(abi.encodePacked("edition_class", _editionId)));

            require(
                EternalStorage(_storageContract).getBooleanValue(keccak256(abi.encodePacked("class_type_sub_group", _subGroup, clasId))),
                "class can't minted by this subgroup"
            );
        }

        uint256 _discountStartedAt = EternalStorage(_storageContract).getUIntValue(keccak256(abi.encodePacked("discount_started_at", _editionId)));

        if (_discountStartedAt == 0) {
            return _price;
        }

        uint256 _secondsPassed = 0;

        if (block.timestamp > _discountStartedAt) {
            _secondsPassed = block.timestamp - _discountStartedAt;
        }
        uint256 _duration = EternalStorage(_storageContract).getUIntValue(keccak256(abi.encodePacked("discount_duration", _editionId)));
        uint256 _discountPrice = EternalStorage(_storageContract).getUIntValue(keccak256(abi.encodePacked("discount_price", _editionId)));
        bool _discountStatic = EternalStorage(_storageContract).getBooleanValue(keccak256(abi.encodePacked("discount_static", _editionId)));

        if (_secondsPassed >= _duration) {
            return _price;
        } else if (_discountStatic) {
            return _discountPrice;
        } else {
            uint256 _totalPriceChange = _price - _discountPrice;
            uint256 _currentPriceChange = _totalPriceChange * _secondsPassed / _duration;
            return _discountPrice + _currentPriceChange;
        }
    }

    function getEditionCanMinted(address _storageContract, uint256 _editionId) public view returns (uint16)
    {
        uint16 mintMax = EternalStorage(_storageContract).getUInt16Value(keccak256(abi.encodePacked("edition_mint_max", _editionId)));
        uint16 minted = EternalStorage(_storageContract).getUInt16Value(keccak256(abi.encodePacked("edition_minted", _editionId)));
        return mintMax - minted;
    }

    function getClassByRarity(address _storageContract, uint8 _index) public view returns (uint16, uint16)
    {
        uint16 classId = EternalStorage(_storageContract).getUInt16Value(keccak256(abi.encodePacked("class_type_id_by_rarity", _index)));

        return (
        classId,
        EternalStorage(_storageContract).getUInt16Value(keccak256(abi.encodePacked("class_type_rarity", classId)))
        );
    }

    function getClassIsInSubgroup(address _storageContract, uint16 _classId, bytes32 _subGroup) public view returns (bool)
    {
        return (EternalStorage(_storageContract).getBooleanValue(keccak256(abi.encodePacked("class_type_sub_group", _subGroup, _classId))));
    }

    function addPlayerEdition(
        address _storageContract,
        uint256 editionId, uint256 _playerId, bytes32 _name, uint16 _classId, bytes32 _position, uint16 _overall) public returns (uint256)
    {
        require(editionId > 0 && _classId > 0 && _playerId > 0);
        uint256 savedPlayer = EternalStorage(_storageContract).getUIntValue(keccak256(abi.encodePacked("edition_player_id", editionId)));

        require(savedPlayer == 0, "edition already saved");

        uint16 mintMax = getMintMax(_storageContract, _classId);
        require(mintMax > 0);

        saveEditionInfo(_storageContract, editionId, _playerId, _name, _classId, _position, _overall, mintMax);
        updateCountByClassId(_storageContract, editionId, _classId);
        updateTotalPlayersCount(_storageContract);

        return editionId;
    }

    function addPriceToPlayerEdition(address _storageContract, uint256 editionId, uint256 _price, bool _zeroAllowed) public
    {
        require(_price > 0 || _zeroAllowed == true);
        EternalStorage(_storageContract).setUIntValue(keccak256(abi.encodePacked("edition_price", editionId)), _price);
    }

    function getMintMax(address _storageContract, uint16 _classId) public view returns (uint16){
        return EternalStorage(_storageContract).getUInt16Value(keccak256(abi.encodePacked("class_type_rarity", _classId)));
    }

    // TODO add sport type
    function saveEditionInfo(address _storageContract, uint256 editionId, uint256 _playerId, bytes32 _name, uint16 _classId, bytes32 _position, uint16 _overall, uint16 mintMax) public {
        EternalStorage(_storageContract).setBytes32Value(keccak256(abi.encodePacked("edition_name", editionId)), _name);
        EternalStorage(_storageContract).setUIntValue(keccak256(abi.encodePacked("edition_player_id", editionId)), _playerId);
        EternalStorage(_storageContract).setUInt16Value(keccak256(abi.encodePacked("edition_class", editionId)), _classId);
        EternalStorage(_storageContract).setBytes32Value(keccak256(abi.encodePacked("edition_position", editionId)), _position);
        EternalStorage(_storageContract).setUInt16Value(keccak256(abi.encodePacked("edition_mint_max", editionId)), mintMax);
        EternalStorage(_storageContract).setUInt16Value(keccak256(abi.encodePacked("edition_minted", editionId)), 0);
        EternalStorage(_storageContract).setUInt16Value(keccak256(abi.encodePacked("edition_overall", editionId)), _overall);
        EternalStorage(_storageContract).setBooleanValue(keccak256(abi.encodePacked("edition_enabled", editionId)), true);
    }

    function updateCountByClassId(address _storageContract, uint256 editionId, uint16 _classId) public {
        uint256 countAllByClass = getEditionsCountByClassId(_storageContract, _classId);
        uint256 allCardsByClass = getCardsCountByClass(_storageContract, _classId);
        uint16 mintMax = getMintMax(_storageContract, _classId);

        EternalStorage(_storageContract).setUIntValue(keccak256(abi.encodePacked("cards_count_by_class", _classId)), allCardsByClass + mintMax);
        EternalStorage(_storageContract).setUIntValue(keccak256(abi.encodePacked(_classId, "Count")), countAllByClass + 1);
        EternalStorage(_storageContract).setUIntValue(keccak256(abi.encodePacked("indexed_by_class", _classId, countAllByClass + 1)), editionId);
        EternalStorage(_storageContract).setUIntValue(keccak256(abi.encodePacked("edition_index_in_class", editionId)), countAllByClass + 1);
    }

    function updateTotalPlayersCount(address _storageContract) public {
        uint256 countAll = getEditionsCount(_storageContract);
        EternalStorage(_storageContract).setUIntValue(keccak256(abi.encodePacked("AllCount")), countAll + 1);
    }

    function addTraitToPlayerEdition(address _storageContract, uint256 _editionId, bytes32 _trait, uint16 _value) public
    {
        EternalStorage(_storageContract).setBytes32Value(keccak256(abi.encodePacked(_editionId, "Trait")), _trait);
        EternalStorage(_storageContract).setUInt16Value(keccak256(abi.encodePacked(_editionId, "TraitValue")), _value);
    }

    function addPlayerEditionDiscount(
        address _storageContract, uint256 _editionId,
        uint256 _discountStartedAt, uint256 _duration, uint256 _discountPrice, bool _discountStatic) public returns (uint256)
    {
        EternalStorage(_storageContract).setUIntValue(keccak256(abi.encodePacked("discount_started_at", _editionId)), _discountStartedAt);
        EternalStorage(_storageContract).setUIntValue(keccak256(abi.encodePacked("discount_duration", _editionId)), _duration);
        EternalStorage(_storageContract).setUIntValue(keccak256(abi.encodePacked("discount_price", _editionId)), _discountPrice);
        EternalStorage(_storageContract).setBooleanValue(keccak256(abi.encodePacked("discount_static", _editionId)), _discountStatic);
        return getEditionPriceCalculated(_storageContract, _editionId, "");
    }

    // change
    function reduceEditionCanMinted(address _storageContract, uint256 _editionId, uint256 _tokenId) public
    {
        uint16 _classId = EternalStorage(_storageContract).getUInt16Value(keccak256(abi.encodePacked("edition_class", _editionId)));

        uint256 allCardsByClass = EternalStorage(_storageContract).getUIntValue(keccak256(abi.encodePacked("cards_count_by_class", _classId)));
        EternalStorage(_storageContract).setUIntValue(keccak256(abi.encodePacked("cards_count_by_class", _classId)), allCardsByClass - 1);

        uint16 minted = EternalStorage(_storageContract).getUInt16Value(keccak256(abi.encodePacked("edition_minted", _editionId)));
        EternalStorage(_storageContract).setUInt16Value(keccak256(abi.encodePacked("edition_minted", _editionId)), minted + 1);

        uint16 mintMax = EternalStorage(_storageContract).getUInt16Value(keccak256(abi.encodePacked("edition_mint_max", _editionId)));

        EternalStorage(_storageContract).setUIntValue(keccak256(abi.encodePacked("nft_edition_mapping", _tokenId)), _editionId);

        if (mintMax - minted == 1) {
            bytes32 _position = EternalStorage(_storageContract).getBytes32Value(keccak256(abi.encodePacked("edition_position", _editionId)));

            // get all counts
            uint256 countByClass = getEditionsCountByClassId(_storageContract, _classId);

            // reduce all counts
            EternalStorage(_storageContract).setUIntValue(keccak256(abi.encodePacked(_classId, "Count")), countByClass - 1);


            // get editions current indexes to swap with last
            uint256 indexByClass = EternalStorage(_storageContract).getUIntValue(keccak256(abi.encodePacked("edition_index_in_class", _editionId)));

            // get last indexes to swap with current
            uint256 lastEditionToSwapIndexByClass = EternalStorage(_storageContract).getUIntValue(keccak256(abi.encodePacked("indexed_by_class", _classId, countByClass)));

            // swap
            EternalStorage(_storageContract).setUIntValue(keccak256(abi.encodePacked("indexed_by_class", _classId, indexByClass)), lastEditionToSwapIndexByClass);

            // last slot clear
            EternalStorage(_storageContract).setUIntValue(keccak256(abi.encodePacked("indexed_by_class", _classId, countByClass)), 0);

            // clear current edition legacy index data
            EternalStorage(_storageContract).setUIntValue(keccak256(abi.encodePacked("edition_index_in_class", _editionId)), 0);

            // change index to item witch moved from last position to cleared edition position
            if (_editionId != lastEditionToSwapIndexByClass) {
                EternalStorage(_storageContract).setUIntValue(keccak256(abi.encodePacked("edition_index_in_class", lastEditionToSwapIndexByClass)), indexByClass);
            }
        }
    }

    function addPlayerClassType(address _storageContract, bytes32 _name, uint16 _typeId, uint16 _rarity, bytes32 _subGroup) public
    {
        // TODO add check _typeId > 0

        EternalStorage(_storageContract).setUInt16Value(keccak256(abi.encodePacked("class_type_id", _typeId)), _typeId);
        EternalStorage(_storageContract).setBytes32Value(keccak256(abi.encodePacked("class_type_name", _typeId)), _name);
        EternalStorage(_storageContract).setUInt16Value(keccak256(abi.encodePacked("class_type_rarity", _typeId)), _rarity);
        EternalStorage(_storageContract).setUInt16Value(keccak256(abi.encodePacked("class_type_rarity", _typeId)), _rarity);
        EternalStorage(_storageContract).setBooleanValue(keccak256(abi.encodePacked("class_type_sub_group", _subGroup, _typeId)), true);

        bool alreadyInserted = false;
        uint16 lastClassRarity = 0;
        uint16 lastClassIdByRarity = 0;

        for (uint8 i = 0; i < 100; i++) {

            uint16 curClassIdByRarity = EternalStorage(_storageContract).getUInt16Value(keccak256(abi.encodePacked("class_type_id_by_rarity", i)));
            uint16 curClassRarity = 0;

            if (curClassIdByRarity > 0) {
                curClassRarity = EternalStorage(_storageContract).getUInt16Value(keccak256(abi.encodePacked("class_type_rarity", curClassIdByRarity)));
            }

            if (!alreadyInserted) {
                if (_rarity > curClassRarity) {
                    EternalStorage(_storageContract).setUInt16Value(keccak256(abi.encodePacked("class_type_id_by_rarity", i)), _typeId);
                    alreadyInserted = true;
                }
            } else {

                EternalStorage(_storageContract).setUInt16Value(keccak256(abi.encodePacked("class_type_id_by_rarity", i)), lastClassIdByRarity);
            }

            lastClassRarity = curClassRarity;
            lastClassIdByRarity = curClassIdByRarity;

            if (curClassIdByRarity == 0) {
                break;
            }
        }
    }

}
