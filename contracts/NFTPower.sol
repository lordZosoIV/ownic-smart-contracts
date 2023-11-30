pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/math/SafeCast.sol";
import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "./interfaces/IPowerReconstructConsumer.sol";
import "./interfaces/INFTPower.sol";


contract NFTPower is AccessControlEnumerable, INFTPower, Ownable {

    /* ========== STATE VARIABLES ========== */

    bytes32 public constant SIGNER_ROLE = keccak256("SIGNER_ROLE");

    bytes32 public constant OWNIC_CONTROLLER = keccak256("OWNIC_CONTROLLER");

    using SafeMath for uint256;
    using SafeCast for uint256;

    // TODO change to consumer list
    IPowerReconstructConsumer public powerReconstructConsumer;

    address private signer;

    mapping(uint256 => uint256) private nftCurrentNonce;
    mapping(uint256 => uint256) private editionCurrentNonce;

    mapping(uint256 => uint256) private nftCreatedAtEditionNonce;
    mapping(uint256 => uint256) private nftPowerUpdatedAtEditionNonce;

    mapping(bytes32 => uint256) private nftPowerByNonce;
    mapping(bytes32 => uint256) private editionPowerByNonce;


    constructor(address _signer, address _powerReconstructConsumer) public {

        signer = _signer;

        if (_powerReconstructConsumer != address(0)) {
            powerReconstructConsumer = IPowerReconstructConsumer(_powerReconstructConsumer);
        }

        _setupRole(DEFAULT_ADMIN_ROLE, signer);
        _setupRole(SIGNER_ROLE, signer);
    }


    function powerProofNft(uint256 nftId, uint256 nonce, uint256 powerAdded, bytes memory signature) external {

        require(nftCurrentNonce[nftId] + 1 == nonce, "nonce value is not valid");

        uint256 _oldPower = nftPowerByNonce[keccak256(abi.encodePacked(nftId, nonce - 1))];

        bytes32 hashWithoutPrefix = keccak256(abi.encodePacked(uint256(0), nftId, nonce, powerAdded, _oldPower, toUint(address(this))));

        verifySigner(hashWithoutPrefix, signature);

        uint256 _updatedPower = _oldPower + powerAdded;
        nftPowerByNonce[keccak256(abi.encodePacked(nftId, nonce))] = _updatedPower;

        nftCurrentNonce[nftId] = nonce;
    }

    function powerProofEdition(uint256 editionId, uint256 nonce, uint256 powerAdded, bytes memory signature) external {

        require(editionCurrentNonce[editionId] + 1 == nonce, "nonce value is not valid");

        uint256 _oldPower = editionPowerByNonce[keccak256(abi.encodePacked(editionId, nonce - 1))];

        bytes32 hashWithoutPrefix = keccak256(abi.encodePacked(uint256(1), editionId, nonce, powerAdded, _oldPower, toUint(address(this))));

        verifySigner(hashWithoutPrefix, signature);

        uint256 _updatedPower = _oldPower + powerAdded;
        editionPowerByNonce[keccak256(abi.encodePacked(editionId, nonce))] = _updatedPower;

        editionCurrentNonce[editionId] = nonce;
    }

    function setControllerRole(address ownicControllerAddress) public onlyOwner {
        _setupRole(OWNIC_CONTROLLER, ownicControllerAddress);
    }

    function setReconstructConsumer(address _powerReconstructConsumer) public onlyOwner {
        powerReconstructConsumer = IPowerReconstructConsumer(_powerReconstructConsumer);
    }

    function setEditionPower(uint256 editionId, uint256 _power) public {
        require(getNftCurrentNonce(editionId) == 0, "power already updated");
        require(_power >= 1, "power must be more the 1");
        nftCurrentNonce[editionId] = _power;
        nftPowerByNonce[keccak256(abi.encodePacked(editionId, nftCurrentNonce[editionId]))] = _power;
    }


    function getEditionCurrentNonce(uint256 editionId) public view override returns (uint256){
        return editionCurrentNonce[editionId];
    }

    function getNftCurrentNonce(uint256 nftId) public view override returns (uint256){
        return nftCurrentNonce[nftId];
    }

    function getEditionPowerByNonce(uint256 editionId, uint256 nonce) public view override returns (uint256){
        return editionPowerByNonce[keccak256(abi.encodePacked(editionId, nonce))];
    }

    function getNftPowerByNonce(uint256 nftId, uint256 nonce) public view override returns (uint256){
        return nftPowerByNonce[keccak256(abi.encodePacked(nftId, nonce))];
    }

    function getNftPower(uint256 nftId, uint256 editionId) public view override returns (uint16){
        uint256 lastPower = getEditionPowerByNonce(editionId, nftPowerUpdatedAtEditionNonce[nftId]);
        uint256 customPower = getNftCustomPower(nftId);
        uint256 createdPower = getEditionPowerByNonce(editionId, nftCreatedAtEditionNonce[nftId]);

        return SafeCast.toUint16(lastPower + customPower - createdPower);
    }

    function getNftCustomPower(uint256 nftId) public view override returns (uint16) {
        return SafeCast.toUint16(getNftPowerByNonce(nftId, getNftCurrentNonce(nftId)).sub(getNftPowerByNonce(nftId, nftCreatedAtEditionNonce[nftId])));
    }

    function getEditionPower(uint256 editionId) public view override returns (uint16) {
        return SafeCast.toUint16(getEditionPowerByNonce(editionId, getEditionCurrentNonce(editionId)));
    }

    function handleMint(uint256 editionId, uint256 nftId) public override {
        require(hasRole(OWNIC_CONTROLLER, _msgSender()), "caller must be controller");

        nftCreatedAtEditionNonce[nftId] = editionCurrentNonce[editionId];
    }

    function updatePower(uint256 editionId, uint256 nftId) public override {
        require(hasRole(OWNIC_CONTROLLER, _msgSender()), "caller must be controller");

        uint16 before = getNftPower(editionId, nftId);
        nftPowerUpdatedAtEditionNonce[nftId] = getEditionCurrentNonce(editionId);
        uint16 then = getNftPower(editionId, nftId);

        if (address(powerReconstructConsumer) != address(0)) {
            powerReconstructConsumer.handlePowerChange(nftId, then - before);
        }
    }


    function recoverSigner(bytes32 message, bytes memory sig)
    internal
    pure
    returns (address)
    {
        (uint8 v, bytes32 r, bytes32 s) = splitSignature(sig);

        return ecrecover(message, v, r, s);
    }

    function splitSignature(bytes memory sig)
    internal
    pure
    returns (uint8 v, bytes32 r, bytes32 s)
    {
        require(sig.length == 65);

        assembly {
        // first 32 bytes, after the length prefix.
            r := mload(add(sig, 32))
        // second 32 bytes.
            s := mload(add(sig, 64))
        // final byte (first byte of the next 32 bytes).
            v := byte(0, mload(add(sig, 96)))
        }

        return (v, r, s);
    }

    function verifySigner(bytes32 hashWithoutPrefix, bytes memory signature) internal view {
        // This recreates the message hash that was signed on the client.
        bytes32 hash = prefixed(hashWithoutPrefix);
        // Verify that the message's signer is the owner
        address recoveredSigner = recoverSigner(hash, signature);

        require(hasRole(SIGNER_ROLE, recoveredSigner), "must be signer");

    }

    function prefixed(bytes32 hash) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", hash));
    }

    function toUint(address _address) internal pure virtual returns (uint256) {
        return uint256(uint160(_address));
    }

}
