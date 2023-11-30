// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import "./VRFConsumerBase.sol";

import "./PlayerCollection.sol";
import "./interfaces/INFTPresaleReveal.sol";
import "./interfaces/IOwnicController.sol";

// @notice added by OWNIC
contract NFTPresaleReveal is INFTPresaleReveal, VRFConsumerBase, Ownable {

    struct Request {
        bytes32 revealId;
    }

    struct Response {
        uint256 random;
    }

    using SafeERC20 for IERC20;

    address public presale;
    IOwnicController public controller;

    bytes32 internal keyHash;
    uint256 internal fee;

    bytes32 subGroup;

    mapping(bytes32 => Response) public randomResponses;

    event RecoveredERC20(address token, uint256 amount);
    event RecoveredERC721(address token, uint256 tokenId);

    event RandomFulfillness(bytes32 requestId, uint256 randomNumber);

    /**
     * Constructor inherits VRFConsumerBase
     *
     * https://archive.docs.chain.link/docs/vrf-contracts
     */
    constructor(
        address _presale,
        address _controller,
        bytes32 _subGroup,
        address _vrfAddress,
        address _linkAddress,
        bytes32 _keyHash,
        uint256 _fee
    ) VRFConsumerBase(_vrfAddress, _linkAddress) {
        keyHash = _keyHash;
        fee = _fee;

        presale = _presale;
        controller = IOwnicController(_controller);
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


    function requestVRF() external override returns(bytes32)
    {
        require(_msgSender() == presale, "Only Presale can call revel");
        require(LINK.balanceOf(address(this)) >= fee, "Not enough LINK");
        return requestRandomness(keyHash, fee);
    }

    function calculateAndAssignEdition(uint256 tokenId, bytes32 requestId, uint8 index) external override returns (uint256)
    {
        require(_msgSender() == presale, "Only Presale can call revel");

        uint256 randomNumber = randomResponses[requestId].random;

        require(randomNumber > 0, "random-response must be filled");

        uint32 randPart;
        for (uint32 i = 0; i <= index; i++) {
            randPart = uint32(randomNumber % 100000);
            randomNumber = (randomNumber - randPart) / 100000;
        }

        uint256 editionId = controller.getEditionIdFromRandom(randPart, subGroup);
        controller.handleMint(editionId, tokenId);
        return editionId;
    }

    function setController(address _controller)
    public
    onlyOwner
    returns (bool)
    {
        controller = IOwnicController(_controller);

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

    // TODO test with gas limits (200k must be max)
    function fulfillRandomness(bytes32 requestId, uint256 randomNumber)
    internal
    override
    {
        randomResponses[requestId] = Response(randomNumber);
        emit RandomFulfillness(requestId, randomNumber);
    }

}
