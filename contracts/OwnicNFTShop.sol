pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";

import "./PlayerCollection.sol";
import "./interfaces/IOwnicController.sol";

// @notice added by OWNIC
contract OwnicNFTShop is Initializable, PausableUpgradeable, OwnableUpgradeable {

    using SafeMathUpgradeable for uint256;
    using SafeERC20Upgradeable for IERC20Upgradeable;

    IERC20Upgradeable public token;

    mapping(address => bool) public nftContracts;

    IOwnicController public controller;

    PlayerCollection public nft;

    address payable  collectAddress;

    uint256 public nextTokenId;

    bytes32 subGroup;

    /* ========== EVENTS ========== */

    event ShopPurchase(uint256 _tokenId, uint256 _editionId, address _buyer, uint256 _price);

    event RecoveredERC20(address token, uint256 amount);
    event RecoveredERC721(address token, uint256 tokenId);

    function initialize(
        address _nft,
        address _controller,
        address _collectAddress,
        uint256 _nextTokenId,
        bytes32 _subGroup
    ) public initializer {

        nft = PlayerCollection(_nft);
        controller = IOwnicController(_controller);
        collectAddress = payable(_collectAddress);

        nextTokenId = _nextTokenId;
        subGroup = _subGroup;

        __Pausable_init();
        __Ownable_init();
    }

    function recoverERC20(address tokenAddress, uint256 tokenAmount)
    external
    onlyOwner
    {
        IERC20Upgradeable(tokenAddress).safeTransfer(owner(), tokenAmount);
        emit RecoveredERC20(tokenAddress, tokenAmount);
    }

    function recoverERC721(address tokenAddress, uint256 tokenId)
    external
    onlyOwner
    {
        require(!nftContracts[tokenAddress], "Cannot withdraw the supported nft");
        IERC721(tokenAddress).safeTransferFrom(address(this), owner(), tokenId);
        emit RecoveredERC721(tokenAddress, tokenId);
    }

    function purchase(uint256 _editionId) external payable whenNotPaused {
        uint256 weiAmount = msg.value;
        require(weiAmount >= _getPurchasePrice(_editionId));
        controller.handleMint(_editionId, nextTokenId + 1);
        nft.mint(_msgSender(), nextTokenId + 1);
        nextTokenId += 1;
        emit ShopPurchase(nextTokenId, _editionId, _msgSender(), weiAmount);
        _forwardFunds();
    }

    function getPurchasePrice(uint256 _editionId)
    external view returns (uint256)
    {
        return _getPurchasePrice(_editionId);
    }

    function setCollectAddress(address _collectAddress)
    public
    onlyOwner
    returns (bool)
    {
        collectAddress = payable(_collectAddress);

        return true;
    }

    function addSupportedNFT(address _nft)
    public
    onlyOwner
    returns (bool)
    {
        nftContracts[_nft] = true;

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

    function _getPurchasePrice(uint256 _editionId)
    internal view returns (uint256)
    {
        return controller.getEditionPriceCalculated(_editionId, subGroup);
    }

    function setSubGroup(bytes32 _subGroup)
    public
    onlyOwner
    returns (bool)
    {
        subGroup = _subGroup;
        return true;
    }

    /**
     * @dev Determines how ETH is stored/forwarded on purchases.
     */
    function _forwardFunds() internal {
        collectAddress.transfer(msg.value);
    }

}
