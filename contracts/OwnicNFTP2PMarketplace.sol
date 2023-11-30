pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/IERC721ReceiverUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";

import "./PlayerCollection.sol";
import "./interfaces/IOwnicController.sol";

// @notice added by OWNIC
contract OwnicNFTP2PMarketplace is Initializable, PausableUpgradeable, OwnableUpgradeable, IERC721Receiver {


    struct Auction {
        address seller;
        uint128 startingPrice;
        uint128 endingPrice;
        uint64 duration;
        uint64 startedAt;
        //
        //        address bestOfferMaker;
        //        uint128 bestOfferPrice;
    }

    using SafeMathUpgradeable for uint256;
    using SafeERC20Upgradeable for IERC20Upgradeable;

    IERC20Upgradeable public token;

    mapping(address => bool) public nftContracts;

    IOwnicController public controller;

    PlayerCollection public nft;

    address payable  collectAddress;

    // Cut owner takes on each auction, measured in basis points (1/100 of a percent).
    // Values 0-10,000 map to 0%-100%
    uint256 public ownerCut;

    mapping(address => mapping(uint256 => Auction)) public auctions;

    /* ========== MODIFIERS ========== */

    modifier isNftOwner(address _nftAddress, uint256 _tokenId) {
        require(
            IERC721(_nftAddress).ownerOf(_tokenId) == _msgSender(),
            "You aren't owner of the given NFT"
        );
        _;
    }

    modifier isNftSupported(address _nftAddress) {
        require(nftContracts[_nftAddress], "This is not supported NFT address");
        _;
    }

    modifier canBeStoredWith64Bits(uint256 _value) {
        require(_value <= 18446744073709551615);
        _;
    }

    modifier canBeStoredWith128Bits(uint256 _value) {
        require(_value < 340282366920938463463374607431768211455);
        _;
    }

    /* ========== EVENTS ========== */

    event AuctionCreated(address indexed _nftAddress, uint256 indexed _tokenId, uint256 _startingPrice, uint256 _endingPrice, uint256 _duration, address _seller);
    event AuctionSuccessful(address indexed _nftAddress, uint256 indexed _tokenId, uint256 _totalPrice, address _winner);
    event AuctionCancelled(address indexed _nftAddress, uint256 indexed _tokenId);

    event RecoveredERC20(address token, uint256 amount);
    event RecoveredERC721(address token, uint256 tokenId);

    function initialize(
        address _token,
        address _nft,
        address _controller,
        address _collectAddress,
        uint256 _ownerCut
    ) public initializer {

        token = IERC20Upgradeable(_token);
        nft = PlayerCollection(_nft);
        nftContracts[_nft] = true;
        controller = IOwnicController(_controller);
        collectAddress = payable(_collectAddress);

        require(_ownerCut <= 10000);
        ownerCut = _ownerCut;

        __Pausable_init();
        __Ownable_init();
    }

    function onERC721Received(address, address, uint256, bytes memory) public virtual override returns (bytes4) {
        return this.onERC721Received.selector;
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

    function getAuction(address _nftAddress, uint256 _tokenId)
    external view isNftSupported(_nftAddress) returns (address seller, uint256 startingPrice, uint256 endingPrice, uint256 duration, uint256 startedAt)
    {
        Auction storage _auction = auctions[_nftAddress][_tokenId];
        require(_isOnAuction(_auction));
        return (_auction.seller, _auction.startingPrice, _auction.endingPrice, _auction.duration, _auction.startedAt);
    }

    function getCurrentPrice(address _nftAddress, uint256 _tokenId)
    external view isNftSupported(_nftAddress) returns (uint256)
    {
        Auction storage _auction = auctions[_nftAddress][_tokenId];
        require(_isOnAuction(_auction));
        return _getCurrentPrice(_auction);
    }

    function createAuction(address _nftAddress, uint256 _tokenId, uint256 _startingPrice, uint256 _endingPrice, uint256 _duration
    )
    external whenNotPaused canBeStoredWith128Bits(_startingPrice) canBeStoredWith128Bits(_endingPrice) canBeStoredWith64Bits(_duration) isNftSupported(_nftAddress) isNftOwner(_nftAddress, _tokenId)
    {

        require(_duration >= 1 minutes);

        address _seller = _msgSender();

        IERC721(_nftAddress).safeTransferFrom(_seller, address(this), _tokenId);

        Auction memory _auction = Auction(
            _seller,
            uint128(_startingPrice),
            uint128(_endingPrice),
            uint64(_duration),
            uint64(block.timestamp)
        );

        auctions[_nftAddress][_tokenId] = _auction;

        emit AuctionCreated(_nftAddress, _tokenId, _startingPrice, _endingPrice, _duration, _seller);
    }

    function cancelAuction(address _nftAddress, uint256 _tokenId)
    external isNftSupported(_nftAddress)
    {
        Auction storage _auction = auctions[_nftAddress][_tokenId];
        require(_isOnAuction(_auction));
        require(_msgSender() == _auction.seller);
        _cancelAuction(_nftAddress, _tokenId, _auction.seller);
    }

    function cancelAuctionWhenPaused(address _nftAddress, uint256 _tokenId)
    external whenPaused onlyOwner
    {
        Auction storage _auction = auctions[_nftAddress][_tokenId];
        require(_isOnAuction(_auction));
        _cancelAuction(_nftAddress, _tokenId, _auction.seller);
    }

    // todo add amount as a param
    function bid(address _nftAddress, uint256 _tokenId)
    external whenNotPaused isNftSupported(_nftAddress)
    {
        Auction storage _auction = auctions[_nftAddress][_tokenId];

        require(_isOnAuction(_auction));

        uint256 _price = _getCurrentPrice(_auction);
        address _seller = _auction.seller;

        _removeAuction(_nftAddress, _tokenId);

        if (_price > 0) {

            uint256 _auctioneerCut = _computeCut(_price);
            uint256 _sellerProceeds = _price - _auctioneerCut;

            if (_auctioneerCut > 0) {
                token.transferFrom(_msgSender(), collectAddress, _auctioneerCut);
            }
            token.transferFrom(_msgSender(), _seller, _sellerProceeds);
        }

        IERC721(_nftAddress).safeTransferFrom(address(this), _msgSender(), _tokenId);

        emit AuctionSuccessful(_nftAddress, _tokenId, _price, _msgSender());
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

    /// @param _ownerCut - percent cut the owner takes on each auction, must be
    ///  between 0-10,000.
    function changeOwnerCut(uint256 _ownerCut)
    public
    onlyOwner
    returns (bool)
    {
        require(_ownerCut <= 10000);
        ownerCut = _ownerCut;
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

    function _removeAuction(address _nftAddress, uint256 _tokenId)
    internal
    {
        delete auctions[_nftAddress][_tokenId];
    }


    function _cancelAuction(address _nftAddress, uint256 _tokenId, address _seller)
    internal
    {
        _removeAuction(_nftAddress, _tokenId);
        IERC721(_nftAddress).safeTransferFrom(address(this), _seller, _tokenId);
        emit AuctionCancelled(_nftAddress, _tokenId);
    }

    function _isOnAuction(Auction storage _auction)
    internal view returns (bool)
    {
        return (_auction.startedAt > 0);
    }

    function _getCurrentPrice(Auction storage _auction)
    internal view returns (uint256)
    {
        uint256 _secondsPassed = 0;

        if (block.timestamp > _auction.startedAt) {
            _secondsPassed = block.timestamp - _auction.startedAt;
        }

        return _computeCurrentPrice(
            _auction.startingPrice,
            _auction.endingPrice,
            _auction.duration,
            _secondsPassed
        );
    }

    function _computeCurrentPrice(uint256 _startingPrice, uint256 _endingPrice, uint256 _duration, uint256 _secondsPassed)
    internal pure returns (uint256)
    {
        if (_secondsPassed >= _duration) {
            return _endingPrice;
        } else {
            int256 _totalPriceChange = int256(_endingPrice) - int256(_startingPrice);
            int256 _currentPriceChange = _totalPriceChange * int256(_secondsPassed) / int256(_duration);
            int256 _currentPrice = int256(_startingPrice) + _currentPriceChange;
            return uint256(_currentPrice);
        }
    }

    function _computeCut(uint256 _price) internal view returns (uint256) {
        return _price * ownerCut / 10000;
    }

}
