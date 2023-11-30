// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

import "./interfaces/INFTPresaleReveal.sol";
import "./PlayerCollection.sol";

// @notice added by OWNIC
contract NFTPresale is Ownable, ReentrancyGuard {
    enum SaleState {
        Paused, // initial state. add/remove whitelist. price change..
        WhitelistSale,
        PublicSale,
        Reveal
    }

    struct SoldNFT {
        bool whitelistMinted;
        bool randomRequested;
        bool revealed;
        bytes32 revealId;
        uint8 index;
    }

    using SafeERC20 for IERC20;

    using MerkleProof for bytes32[];

    SaleState public state; // current state

    // one nft price static
    uint256 public purchasePrice;

    // walletAddress where funds are forwarded
    address public walletAddress; // TODO make alternative solution??

    // token id which will assigned to next minted nft on purchase
    uint256 public nextTokenId;

    // aggregate data of whitelist address
    bytes32 merkleRoot;

    // maximum quantity of NFTs to sell on whitelist, can be changed by owner
    uint32 public whitelistMaxSale;

    // maximum quantity of NFTs to sell on whitelist per address, can be changed by owner
    uint8 public whitelistMaxSalePerAddr;

    // counter sold NFTs sum on whitelist stage
    uint32 public whitelistSoldAllCount;

    // counter sold NFTs per address on whitelist stage
    mapping(address => uint8) public whitelistSoldCount;

    // maximum quantity of NFTs to sell on publicSale, can be changed by owner
    uint32 public publicMaxSale;

    // maximum quantity of NFTs to sell on publicSale per address, can be changed by owner
    uint8 public publicMaxSalePerAddr;

    // counter sold NFTs sum on publicSale stage
    uint32 public publicSoldAllCount;

    // counter sold NFTs per address on publicSale stage
    mapping(address => uint8) public publicSoldCount;

    mapping(uint256 => SoldNFT) soldNFTs;

    PlayerCollection public NFT;
    INFTPresaleReveal public revealContract;

    event WhitelistedAddressAdded(address addr);
    event WhitelistedAddressRemoved(address addr);

    event RecoveredERC20(address token, uint256 amount);
    event RecoveredERC721(address token, uint256 tokenId);

    event PresaleMint(
        address minter,
        uint8 numberOfTokensMinted,
        SaleState state,
        uint256 firstTokenId
    );
    event RandomRequested(uint256[] tokenIds, bytes32 requestId);
    event Reveal(uint256 indexed tokenId, uint256 indexed editionId);
    event RevealBatch(uint256[] tokenIds, uint256[] editionIds);

    event StateChange(SaleState from, SaleState to);

    constructor(
        address _NFT, // dynamic nft
        address _revealContract, // reveal contract initially may be 0x
        address _walletAddress, // address where u can collect/forward funds
        uint32 _nextTokenId, // token id assigned to next minted nft by this contract
        uint256 _purchasePrice, // price of single nft mint
        uint32 _whitelistMaxSale, // see on params
        uint8 _whitelistMaxSalePerAddr, // see on params
        uint32 _publicMaxSale, // see on params
        uint8 _publicMaxSalePerAddr // see on params
    ) {
        NFT = PlayerCollection(_NFT);
        revealContract = INFTPresaleReveal(_revealContract);

        walletAddress = _walletAddress;
        nextTokenId = _nextTokenId;
        purchasePrice = _purchasePrice;

        state = SaleState.Paused;

        whitelistMaxSale = _whitelistMaxSale;
        whitelistMaxSalePerAddr = _whitelistMaxSalePerAddr;
        publicMaxSale = _publicMaxSale;
        publicMaxSalePerAddr = _publicMaxSalePerAddr;
    }

    modifier whenSalePaused() {
        require(
            state == SaleState.Paused,
            "You can not perform action when contract is not on Paused state"
        );
        _;
    }

    modifier atState(SaleState _state) {
        require(state == _state, "Wrong state. Action not allowed.");
        _;
    }

    /// Pause sale.
    function pauseSale() external onlyOwner {
        SaleState currentState = state;
        state = SaleState.Paused;
        emit StateChange(currentState, state);
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

    function setMerkleRoot(bytes32 _root) onlyOwner whenSalePaused public
    {
        merkleRoot = _root;
    }

    function setWalletAddress(address _walletAddress)
    public
    onlyOwner
    whenSalePaused
    returns (bool)
    {
        walletAddress = _walletAddress;

        return true;
    }

    function setRevealContract(address _revealContract)
    public
    onlyOwner
    whenSalePaused
    returns (bool)
    {
        revealContract = INFTPresaleReveal(_revealContract);

        return true;
    }

    function setPurchasePrice(uint256 _purchasePrice)
    public
    onlyOwner
    whenSalePaused
    returns (bool)
    {
        require(_purchasePrice > 0, "Invalid price");
        purchasePrice = _purchasePrice;
        return true;
    }

    function setNextTokenId(uint256 _nextTokenId)
    public
    onlyOwner
    whenSalePaused
    returns (bool)
    {
        nextTokenId = _nextTokenId;
        return true;
    }

    function setWhitelistMaxSale(uint32 _whitelistMaxSale)
    public
    onlyOwner
    whenSalePaused
    returns (bool)
    {
        whitelistMaxSale = _whitelistMaxSale;
        return true;
    }

    function setWhitelistMaxSalePerAddr(uint8 _whitelistMaxSalePerAddr)
    public
    onlyOwner
    whenSalePaused
    returns (bool)
    {
        whitelistMaxSalePerAddr = _whitelistMaxSalePerAddr;
        return true;
    }

    function setPublicMaxSale(uint32 _publicMaxSale)
    public
    onlyOwner
    whenSalePaused
    returns (bool)
    {
        publicMaxSale = _publicMaxSale;
        return true;
    }

    function setPublicMaxSalePerAddr(uint8 _publicMaxSalePerAddr)
    public
    onlyOwner
    whenSalePaused
    returns (bool)
    {
        publicMaxSalePerAddr = _publicMaxSalePerAddr;
        return true;
    }

    function getMerkleRoot()
    external view onlyOwner returns (bytes32)
    {
        return merkleRoot;
    }

    /// Start Whitelist Sale
    function startWhitelistSale() external onlyOwner {
        SaleState currentState = state;
        state = SaleState.WhitelistSale;
        emit StateChange(currentState, state);
    }

    /// Start public Sale
    function startPublicSale() external onlyOwner {
        SaleState currentState = state;
        state = SaleState.PublicSale;
        emit StateChange(currentState, state);
    }

    /// Start Reveal
    function startReveal() external onlyOwner {
        SaleState currentState = state;
        state = SaleState.Reveal;
        emit StateChange(currentState, state);
    }

    function reclaimFunds() external onlyOwner {
        assert(payable(walletAddress).send(address(this).balance));
    }

    function mintNFTInWhitelistSale(uint8 numberOfTokens, bytes32[] memory proof)
    public
    payable
    nonReentrant
    {
        require(state == SaleState.WhitelistSale, "Minting not allowed");

        require(
            whitelistSoldAllCount + numberOfTokens <= whitelistMaxSale,
            "More than max allowed in whitelist"
        );

        address buyer = msg.sender;
        uint256 value = msg.value;

        require(purchasePrice * numberOfTokens <= value, "Not enough Funds");

        require(proof.verify(merkleRoot, keccak256(abi.encodePacked(msg.sender))), "Address not whitelisted");

        require(
            whitelistSoldCount[buyer] + numberOfTokens <=
            whitelistMaxSalePerAddr,
            "More than max allowed in whitelist for this address"
        );

        whitelistSoldCount[buyer] += numberOfTokens;
        whitelistSoldAllCount += numberOfTokens;

        for (uint256 i = 0; i < numberOfTokens; i++) {
            NFT.mint(_msgSender(), nextTokenId + i);
            soldNFTs[nextTokenId + i] = SoldNFT(true, false, false, 0, 0);
        }

        emit PresaleMint(buyer, numberOfTokens, state, nextTokenId);

        nextTokenId += numberOfTokens;
    }

    function mintNFTInPublicSale(uint8 numberOfTokens)
    public
    payable
    nonReentrant
    {
        require(state == SaleState.PublicSale, "Minting not allowed");

        require(
            publicSoldAllCount + numberOfTokens <= publicMaxSale,
            "More than max allowed in public Sale"
        );

        address buyer = msg.sender;
        uint256 value = msg.value;

        require(purchasePrice * numberOfTokens <= value, "Not enough Funds");

        require(
            publicSoldCount[buyer] + numberOfTokens <= publicMaxSalePerAddr,
            "More than max allowed in public sale for this address"
        );

        publicSoldCount[buyer] += numberOfTokens;
        publicSoldAllCount += numberOfTokens;

        for (uint256 i = 0; i < numberOfTokens; i++) {
            NFT.mint(_msgSender(), nextTokenId + i);
            soldNFTs[nextTokenId + i] = SoldNFT(false, false, false, 0, 0);
        }

        emit PresaleMint(buyer, numberOfTokens, state, nextTokenId);
        nextTokenId += numberOfTokens;
    }

    function requestVRFForNFTs(uint256[] memory _ids) public {

        require(state == SaleState.Reveal, "Reveal not allowed");

        bool isAdmin = owner() == _msgSender();

        for (uint8 i = 0; i < _ids.length; i++) {

            require(
                NFT.ownerOf(_ids[i]) == _msgSender() || isAdmin,
                "You aren't owner (neither admin) of the given NFT"
            );

            require(
                !soldNFTs[_ids[i]].randomRequested,
                "Random already requested for this NFT"
            );
        }

        bytes32 requestId = revealContract.requestVRF();

        for (uint8 i = 0; i < _ids.length; i++) {
            soldNFTs[_ids[i]].index = i;
            soldNFTs[_ids[i]].revealId = requestId;
            soldNFTs[_ids[i]].randomRequested = true;
        }

        emit RandomRequested(_ids, requestId);
    }

    function revealNFTs(uint256[] memory _ids) public {

        require(state == SaleState.Reveal, "Reveal not allowed");

        uint256[] memory editionIds = new uint256[](_ids.length);

        for (uint8 i = 0; i < _ids.length; i++) {
            editionIds[i] = _revealNFT(_ids[i]);
        }

        emit RevealBatch(_ids, editionIds);

    }

    function revealNFT(uint256 tokenId) public {
        require(state == SaleState.Reveal, "Reveal not allowed");
        uint256 editionId = _revealNFT(tokenId);
        emit Reveal(tokenId, editionId);
    }

    function _revealNFT(uint256 tokenId) private returns (uint256) {
        require(
            NFT.ownerOf(tokenId) == _msgSender() || owner() == _msgSender(),
            "You aren't owner (neither admin) of the given NFT"
        );

        require(!soldNFTs[tokenId].revealed, "NFT Already revealed");

        uint256 editionId = revealContract.calculateAndAssignEdition(tokenId, soldNFTs[tokenId].revealId, soldNFTs[tokenId].index);

        soldNFTs[tokenId].revealed = true;

        return editionId;
    }

}