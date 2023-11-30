pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";

import "./RewardsDistributionRecipientUpgradeable.sol";
import "./interfaces/INFTController.sol";
import "./interfaces/IPowerReconstructConsumer.sol";
import "./interfaces/ITransferProcessor.sol";
import "./storage/Owned.sol";


contract OwnicCollectionPowerRewards is
Initializable,
RewardsDistributionRecipientUpgradeable,
ReentrancyGuardUpgradeable,
IPowerReconstructConsumer,
ITransferProcessor
{

    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    /* ========== STATE VARIABLES ========== */
    INFTController public nftController;
    address public powerReconstructor;

    IERC721 public playerCollection;
    IERC20 public rewardsToken;
    uint256 public periodFinish = 0;
    uint256 public rewardRate = 0;
    uint256 public rewardsDuration = 7 days;
    uint256 public lastUpdateTime;
    uint256 public rewardPerPowerStored;

    mapping(address => uint256) public userRewardPerPowerPaid;

    // ERC-20 token already rewarded to account, can be collected by getReward
    mapping(address => uint256) public rewards;

    mapping(uint256 => bool) stakedCards;

    uint256 private _totalPower;

    // sum off cards powers by holder account
    mapping(address => uint256) private _powers;


    /* ========== CONSTRUCTOR ========== */

    constructor(
        address _rewardsDistribution,
        address _rewardsToken,
        address _playerCollection
    ) public {
        __RewardsDistributionRecipient_init();
        playerCollection = IERC721(_playerCollection);
        rewardsToken = IERC20(_rewardsToken);
        rewardsDistribution = _rewardsDistribution;
    }

    /* ========== VIEWS ========== */

    function totalPower() external view returns (uint256) {
        return _totalPower;
    }

    function lastTimeRewardApplicable() public view returns (uint256) {
        return block.timestamp < periodFinish ? block.timestamp : periodFinish;
    }

    function rewardPerPower() public view returns (uint256) {
        if (_totalPower == 0) {
            return rewardPerPowerStored;
        }
        return
        rewardPerPowerStored.add(
            lastTimeRewardApplicable().sub(lastUpdateTime).mul(rewardRate).mul(1e18).div(_totalPower)
        );
    }

    function earned(address account) public view returns (uint256) {
        return powerOf(account).mul(rewardPerPower().sub(userRewardPerPowerPaid[account])).div(1e18).add(rewards[account]);
    }

    function getRewardForDuration() external view returns (uint256) {
        return rewardRate.mul(rewardsDuration);
    }

    function powerOf(address account) public view returns (uint256){
        return _powers[account];
    }

    /* ========== MUTATIVE FUNCTIONS ========== */

    function handleTransfer(address from, address to, uint256 tokenId)
    public
    override
    nonReentrant
    updateReward(from, to)
    {
        require(address(playerCollection) == _msgSender(), "invalid caller");
        uint16 amount = nftController.getNftPower(tokenId);
        if (amount > 0) {
            if (!stakedCards[tokenId]) {
                _totalPower = _totalPower.add(amount);
                stakedCards[tokenId] = true;
            } else {
                if (to == address(0)) {
                    _totalPower = _totalPower.sub(amount);
                }
                _powers[from] -= amount;
            }
            _powers[to] += amount;
            emit StakeUpdated(tokenId, from == address(0) ? amount : 0);
        }
    }

    function handlePowerChange(uint256 tokenId, uint16 amount)
    public
    override
    nonReentrant
    updateReward(playerCollection.ownerOf(tokenId), address(0))
    {
        require(powerReconstructor == _msgSender(), "invalid caller");

        if (!stakedCards[tokenId]) {
            amount = nftController.getNftPower(tokenId);
            stakedCards[tokenId] = true;
        }

        _totalPower = _totalPower.add(amount);
        _powers[playerCollection.ownerOf(tokenId)] += amount;

        emit StakeUpdated(tokenId, amount);
    }

    function getReward() public nonReentrant updateReward(msg.sender, address(0)) {
        uint256 reward = rewards[msg.sender];
        if (reward > 0) {
            rewards[msg.sender] = 0;
            rewardsToken.safeTransfer(msg.sender, reward);
            emit RewardPaid(msg.sender, reward);
        }
    }

    /* ========== RESTRICTED FUNCTIONS ========== */

    function notifyRewardAmount(uint256 reward) external override onlyRewardsDistribution updateReward(address(0), address(0)) {
        if (block.timestamp >= periodFinish) {
            rewardRate = reward.div(rewardsDuration);
        } else {
            uint256 remaining = periodFinish.sub(block.timestamp);
            uint256 leftover = remaining.mul(rewardRate);
            rewardRate = reward.add(leftover).div(rewardsDuration);
        }

        // Ensure the provided reward amount is not more than the balance in the contract.
        // This keeps the reward rate in the right range, preventing overflows due to
        // very high values of rewardRate in the earned and rewardsPerToken functions;
        // Reward + leftover must be less than 2^256 / 10^18 to avoid overflow.
        uint balance = rewardsToken.balanceOf(address(this));
        require(rewardRate <= balance.div(rewardsDuration), "Provided reward too high");

        lastUpdateTime = block.timestamp;
        periodFinish = block.timestamp.add(rewardsDuration);
        emit RewardAdded(reward);
    }

    // Added to support recovering LP Rewards from other systems such as BAL to be distributed to holders
    function recoverERC20(address tokenAddress, uint256 tokenAmount) external onlyOwner {
        IERC20(tokenAddress).safeTransfer(owner(), tokenAmount);
        emit Recovered(tokenAddress, tokenAmount);
    }

    function setRewardsDuration(uint256 _rewardsDuration) external onlyOwner {
        require(
            block.timestamp > periodFinish,
            "Previous rewards period must be complete before changing the duration for the new period"
        );
        rewardsDuration = _rewardsDuration;
        emit RewardsDurationUpdated(rewardsDuration);
    }

    function setPowerReconstructorAddress(address _powerReconstructor) public onlyOwner {
        powerReconstructor = _powerReconstructor;
    }

    function setOwnicController(address _nftController) public onlyOwner {
        nftController = INFTController(_nftController);
    }

    /* ========== MODIFIERS ========== */

    modifier updateReward(address account, address accountSec) {
        rewardPerPowerStored = rewardPerPower();
        lastUpdateTime = lastTimeRewardApplicable();
        if (account != address(0)) {
            rewards[account] = earned(account);
            userRewardPerPowerPaid[account] = rewardPerPowerStored;
        }
        if (accountSec != address(0)) {
            rewards[accountSec] = earned(accountSec);
            userRewardPerPowerPaid[accountSec] = rewardPerPowerStored;
        }
        _;
    }

    /* ========== EVENTS ========== */

    event RewardAdded(uint256 reward);
    event RewardPaid(address indexed user, uint256 reward);
    event RewardsDurationUpdated(uint256 newDuration);
    event Recovered(address token, uint256 amount);
    event StakeUpdated(uint256 tokenId, uint256 amount);

}