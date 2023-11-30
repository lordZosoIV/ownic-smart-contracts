// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

import "./VRFConsumerBase.sol";

import "./PlayerCollection.sol";
import "./interfaces/IOwnicController.sol";

// @notice added by OWNIC
contract OwnicClassPackOpenerByNetworkCoin is VRFConsumerBase, Ownable {

    struct Request {
        address sender;
        uint32 openPackId;
        uint16 classId;
    }

    struct Response {
        address sender;
        uint256 random;
        uint16 classId;
    }

    //TODO change struct name
    struct PackType {
        uint16 classId;
        uint16 packSize;
        uint256 price;
    }

    PlayerCollection public NFT;

    IOwnicController public controller;

    address payable collectAddress;
    address public stakeAddress;
    address public feeAddress;

    uint256 public burnShare;
    uint256 public stakeShare;
    uint256 public feeShare;

    bytes32 internal keyHash;
    uint256 internal fee;

    uint32 public nextTokenId;
    uint32 public nextOpenPackId;

    mapping(bytes32 => Request) public randomRequests;
    mapping(uint32 => Response) public randomResponses;
    mapping(uint16 => PackType) public packTypes;


    event OpenPackInit(uint32 indexed openPackId, address indexed owner);
    event OpenPackEntry(uint256 indexed index, uint32 indexed editionId, address indexed owner); // TODO rename index
    event OpenPackFinish(uint32 indexed openPackId, address indexed owner);
    event RandomRequested(uint256 indexed nextOpenPackId, bytes32 requestId);

    /**
     * Constructor inherits VRFConsumerBase
     *
     * https://archive.docs.chain.link/docs/vrf-contracts
     */
    constructor(
        address _NFT,
        address _controller,
        address payable _collectAddress,
        address _stakeAddress,
        address _feeAddress,
        address _vrfAddress,
        address _linkAddress,
        bytes32 _keyHash,
        uint256 _fee,
        uint32 _nextTokenId
    ) VRFConsumerBase(_vrfAddress, _linkAddress) {
        keyHash = _keyHash;
        fee = _fee;

        NFT = PlayerCollection(_NFT);
        controller = IOwnicController(_controller);

        collectAddress = _collectAddress;
        stakeAddress = _stakeAddress;
        feeAddress = _feeAddress;
        nextTokenId = _nextTokenId;

        burnShare = 25;
        stakeShare = 50;
        feeShare = 25;

    }


    function openPackInit(uint16 _classId) external payable
    {
        PackType storage pack = packTypes[_classId];
        uint256 packOpenPrice = pack.price;

        require(msg.value >= packOpenPrice, "Not enough value for open pack");
        require(LINK.balanceOf(address(this)) >= fee, "Not enough LINK");

        bytes32 requestId = requestRandomness(keyHash, fee);
        randomRequests[requestId] = Request(_msgSender(), nextOpenPackId, _classId);
        _forwardFunds();

        nextOpenPackId++;

        emit RandomRequested(nextOpenPackId, requestId);
        emit OpenPackInit(nextOpenPackId - 1, _msgSender());
    }

    function openPack(uint32 _openPackId) external
    {
        uint32 randPart;
        uint32 editionId;
        uint256 randomNumber = randomResponses[_openPackId].random;
        uint16 classId = randomResponses[_openPackId].classId;
        uint16 packSize = packTypes[classId].packSize;

        require(randomNumber > 0, "illegal call");

        //TODO pack size for last pack
        uint256 cardsLeft = controller.getCardsCountByClass(classId);
        require(packSize <= cardsLeft, "not enough cards left");

        for (uint16 i = 0; i < packSize; i++) {
            randPart = uint32(randomNumber % 100000);
            randomNumber = (randomNumber - randPart) / 100000;

            editionId = uint32(controller.getEditionIdFromRandomWithClassId(randPart, classId));

            controller.handleMint(editionId, nextTokenId + i);
            NFT.mint(_msgSender(), nextTokenId + i);
            emit OpenPackEntry(nextTokenId + i, editionId, _msgSender());
        }

        nextTokenId += packSize;
        randomResponses[_openPackId].random = 0;

        emit OpenPackFinish(_openPackId, _msgSender());
    }

    function setShares(
        uint256 _burnShare,
        uint256 _stakeShare,
        uint256 _feeShare
    ) public onlyOwner {
        require(
            burnShare + stakeShare + feeShare == 100,
            "Doesn't add up to 100"
        );

        burnShare = _burnShare;
        stakeShare = _stakeShare;
        feeShare = _feeShare;
    }

    function setStakeAddress(address _stakeAddress)
    public
    onlyOwner
    returns (bool)
    {
        stakeAddress = _stakeAddress;

        return true;
    }

    function setFeeAddress(address _feeAddress)
    public
    onlyOwner
    returns (bool)
    {
        feeAddress = _feeAddress;

        return true;
    }

    function setController(address _controller)
    public
    onlyOwner
    returns (bool)
    {
        controller = IOwnicController(_controller);

        return true;
    }

    function setPackPrice(uint16 _classId, uint256 _packPrice)
    public
    onlyOwner
    returns (bool)
    {
        packTypes[_classId].price = _packPrice;

        return true;
    }

    function setNextTokenId(uint256 _nextTokenId)
    public
    onlyOwner
    returns (bool)
    {
        nextTokenId = nextTokenId;

        return true;
    }

    function setPackSize(uint16 _classId, uint16 _packSize)
    public
    onlyOwner
    returns (bool)
    {
        packTypes[_classId].packSize = _packSize;

        return true;
    }

    function addClassType(uint16 _classId, uint16 _classSize, uint256 _price) public onlyOwner {
        packTypes[_classId] = PackType(_classId, _classSize, _price);
    }

    function fulfillRandomness(bytes32 requestId, uint256 randomNumber)
    internal
    override
    {
        Request storage request = randomRequests[requestId];
        randomResponses[request.openPackId] = Response(_msgSender(), randomNumber, request.classId);
    }

    function _forwardFunds() internal {
        collectAddress.transfer(msg.value);
    }

}
