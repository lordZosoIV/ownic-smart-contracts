// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import "./VRFConsumerBase.sol";

import "./PlayerCollection.sol";
import "./interfaces/IOwnicController.sol";

// @notice added by OWNIC
contract OwnicPlayerOpener is VRFConsumerBase, Ownable {

    struct Request {
        address sender;
        uint32 openPackId;
    }

    struct Response {
        address sender;
        uint256 random;
    }

    using SafeERC20 for IERC20;

    PlayerCollection public NFT;

    IOwnicController public controller;

    ERC20Burnable public token;
    address public stakeAddress;
    address public feeAddress;

    uint256 public burnShare;
    uint256 public stakeShare;
    uint256 public feeShare;

    bytes32 internal keyHash;
    uint256 internal fee;

    uint256 public packPrice;

    uint8 public packSize;

    bytes32 subGroup;

    uint32 public nextTokenId;
    uint32 public nextOpenPackId;

    mapping(bytes32 => Request) public randomRequests;
    mapping(uint32 => Response) public randomResponses;

    event OpenPackInit(uint32 indexed openPackId, address indexed owner);
    event OpenPackEntry(uint256 indexed index, uint32 indexed editionId, address indexed owner); // TODO rename index
    event OpenPackFinish(uint32 indexed openPackId, address indexed owner);
    event RecoveredERC20(address token, uint256 amount);
    event RecoveredERC721(address token, uint256 tokenId);

    /**
     * Constructor inherits VRFConsumerBase
     *
     * https://archive.docs.chain.link/docs/vrf-contracts
     */
    constructor(
        address _token,
        address _NFT,
        address _controller,
        address _stakeAddress,
        address _feeAddress,
        address _vrfAddress,
        address _linkAddress,
        bytes32 _keyHash,
        uint256 _fee,
        uint32 _nextTokenId,
        bytes32 _subGroup
    ) VRFConsumerBase(_vrfAddress, _linkAddress) {
        keyHash = _keyHash;
        fee = _fee;

        NFT = PlayerCollection(_NFT);
        controller = IOwnicController(_controller);

        token = ERC20Burnable(_token);
        stakeAddress = _stakeAddress;
        feeAddress = _feeAddress;
        nextTokenId = _nextTokenId;

        packPrice = 25 * 10 ** (token.decimals());

        packSize = 15;

        burnShare = 25;
        stakeShare = 50;
        feeShare = 25;

        subGroup = _subGroup;
    }

    function recoverERC20(address tokenAddress, uint256 tokenAmount)
    external
    onlyOwner
    {
        IERC20(tokenAddress).safeTransfer(owner(), tokenAmount);
        emit RecoveredERC20(tokenAddress, tokenAmount);
    }

    function recoverERC721(address tokenAddress, uint256 tokenId)
    external
    onlyOwner
    {
        IERC721(tokenAddress).safeTransferFrom(address(this), owner(), tokenId);
        emit RecoveredERC721(tokenAddress, tokenId);
    }

    function openPackInit() external
    {
        require(LINK.balanceOf(address(this)) >= fee, "Not enough LINK");

        bytes32 requestId = requestRandomness(keyHash, fee);
        randomRequests[requestId] = Request(_msgSender(), nextOpenPackId);
        distributeShares(_msgSender(), packSize);

        nextOpenPackId++;

        emit OpenPackInit(nextOpenPackId - 1, _msgSender());
    }

    function openPack(uint32 _openPackId) external
    {
        uint32 randPart;
        uint32 editionId;
        uint256 randomNumber = randomResponses[_openPackId].random;

        require(randomNumber > 0, "illegal call");

        for (uint32 i = 0; i < packSize; i++) {
            randPart = uint32(randomNumber % 100000);
            randomNumber = (randomNumber - randPart) / 100000;

            editionId = uint32(controller.getEditionIdFromRandom(randPart, subGroup));

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

    function setPackPrice(uint256 _packPrice)
    public
    onlyOwner
    returns (bool)
    {
        packPrice = _packPrice;

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

    function setPackSize(uint8 _packSize)
    public
    onlyOwner
    returns (bool)
    {
        packSize = _packSize;

        return true;
    }

    function setSubGroup(bytes32 _subGroup)
    public
    onlyOwner
    returns (bool)
    {
        subGroup = _subGroup;
        return true;
    }

    function fulfillRandomness(bytes32 requestId, uint256 randomNumber)
    internal
    override
    {
        Request storage request = randomRequests[requestId];
        randomResponses[request.openPackId] = Response(_msgSender(), randomNumber);
    }

    function distributeShares(address from, uint256 amount) private {
        token.transferFrom(from, feeAddress, (amount * feeShare) / 100);

        token.transferFrom(from, stakeAddress, (amount * stakeShare) / 100);

        token.burnFrom(from, (amount * burnShare) / 100);
    }

}
