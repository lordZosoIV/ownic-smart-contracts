// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/utils/math/Math.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "./RewardsDistributionRecipientUpgradeable.sol";

import "./interface/IStakingRewards.sol";
import "./interface/IDefiCityPower.sol";

contract StakingRewardsUpgradeable is
    IStakingRewards,
    Initializable,
    RewardsDistributionRecipientUpgradeable,
    ReentrancyGuardUpgradeable,
    PausableUpgradeable
{
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    /* ========== STATE VARIABLES ========== */

    IERC20 public token;
    IERC721 public defiCityCollection;

    IDefiCityPower public defiPower;

    uint256 public periodFinish;
    uint256 public rewardsDuration;
    uint256 public lastUpdateTime;
    uint256 public rewardRate;
    uint256 public rewardPerTokenStored;

    mapping(uint256 => uint256) public userRewardPerTokenPaid;
    mapping(uint256 => uint256) public rewards;

    uint256 private _totalSupply;
    mapping(uint256 => uint256) private _balances;

    /* ========== MODIFIERS ========== */

    modifier updateReward(uint256 tokenId, bool isUser) {
        rewardPerTokenStored = rewardPerToken();
        lastUpdateTime = lastTimeRewardApplicable();

        if (isUser) {
            rewards[tokenId] = earned(tokenId);
            userRewardPerTokenPaid[tokenId] = rewardPerTokenStored;
        }
        _;
    }

    modifier isNftOwner(uint256 tokenId, address account) {
        require(
            defiCityCollection.ownerOf(tokenId) == account,
            "You aren't owner of the given NFT"
        );
        _;
    }

    /* ========== EVENTS ========== */

    event RewardAdded(uint256 newReward, uint256 timestamp);
    // event StakeRewardChange(uint256 rewardPerDay, uint256 timestamp);
    event Staked(uint256 indexed tokenId, uint256 amount);
    event Withdrawn(uint256 indexed tokenId, uint256 amount);
    event RewardPaid(uint256 indexed tokenId, uint256 reward);
    event RewardsDurationUpdated(uint256 newDuration);
    event RecoveredERC20(address token, uint256 amount);
    event RecoveredERC721(address token, uint256 tokenId);

    function initialize(address _token, address _defiCityCollection)
        external
        initializer
    {
        __Context_init();
        __Ownable_init_unchained();
        __Pausable_init_unchained();
        __ReentrancyGuard_init_unchained();
        __RewardsDistributionRecipient_init_unchained();

        rewardsDistribution = _msgSender();

        token = IERC20(_token);
        defiCityCollection = IERC721(_defiCityCollection);
    }

    function totalSupply() external view override returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(uint256 tokenId)
        external
        view
        override
        returns (uint256)
    {
        return _balances[tokenId];
    }

    function getRewardForDuration() external view override returns (uint256) {
        return rewardRate.mul(rewardsDuration);
    }

    function reconstructCity(
        uint256 tokenId,
        uint16 oldPower,
        uint16 newPower
    ) external {
        require(address(defiPower) == _msgSender(), "invalid caller");

        uint256 balance = _balances[tokenId];
        _totalSupply = _totalSupply.add(balance.mul(newPower)).sub(
            balance.mul(oldPower)
        );
    }

    function stake(uint256 tokenId, uint256 amount)
        external
        override
        whenNotPaused
        nonReentrant
        isNftOwner(tokenId, _msgSender())
        updateReward(tokenId, true)
    {
        require(amount > 0, "Cannot stake zero");

        _totalSupply = _totalSupply.add(
            amount.mul(defiPower.getCityPower(tokenId))
        );
        _balances[tokenId] = _balances[tokenId].add(amount);

        token.safeTransferFrom(_msgSender(), address(this), amount);

        emit Staked(tokenId, amount);
    }

    function exit(uint256 tokenId)
        external
        override
        isNftOwner(tokenId, _msgSender())
    {
        withdraw(tokenId, _balances[tokenId]);
        getReward(tokenId);
    }

    function notifyRewardAmount(uint256 rewardPerDay_, uint256 days_)
        external
        override
        onlyRewardsDistribution
        updateReward(0, false)
    {
        require(days_ > 0, "Days must be more than zero");

        if (block.timestamp >= periodFinish) {
            rewardsDuration = days_.mul(86400);
            rewardRate = rewardPerDay_.div(86400);
        } else {
            uint256 remaining = periodFinish.sub(block.timestamp);
            uint256 leftOver = remaining.mul(rewardRate);

            rewardsDuration = remaining.add(days_.mul(86400));
            rewardRate = leftOver.add(rewardPerDay_.mul(days_)).div(
                rewardsDuration
            );
        }

        uint256 balance = token.balanceOf(address(this));
        require(
            rewardRate <= balance.div(rewardsDuration),
            "Provided reward too high"
        );

        lastUpdateTime = block.timestamp;
        periodFinish = block.timestamp.add(rewardsDuration);

        emit RewardAdded(rewardRate * rewardsDuration, block.timestamp);
    }

    // function changeRewardRate(uint256 rewardPerDay_) external onlyRewardsDistribution {
    //     rewardPerTokenStored = rewardPerToken();
    //     lastUpdateTime = lastTimeRewardApplicable();

    //     rewardRate = rewardPerDay_.div(86400);

    //     uint256 balance = token.balanceOf(address(this));
    //     require(rewardRate <= balance.div(periodFinish.sub(block.timestamp)), "Provided reward too high");

    //     emit StakeRewardChange(rewardRate, block.timestamp);
    // }

    function updatePeriodFinish(uint256 timestamp)
        external
        onlyOwner
        updateReward(0, false)
    {
        periodFinish = timestamp;
    }

    function recoverERC20(address tokenAddress, uint256 tokenAmount)
        external
        onlyOwner
    {
        require(
            tokenAddress != address(token),
            "Cannot withdraw the staking token"
        );
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

    function setRewardsDuration(uint256 _rewardsDuration) external onlyOwner {
        require(
            block.timestamp > periodFinish,
            "Previous rewards period must be complete before changing the duration for the new period"
        );
        rewardsDuration = _rewardsDuration;

        emit RewardsDurationUpdated(rewardsDuration);
    }

    function setPowerAddress(address _powerAddress)
        external
        onlyOwner
        returns (bool)
    {
        defiPower = IDefiCityPower(_powerAddress);

        return true;
    }

    function pause() external onlyOwner whenNotPaused {
        _pause();
    }

    function unpause() external onlyOwner whenPaused {
        _unpause();
    }

    function lastTimeRewardApplicable() public view override returns (uint256) {
        return Math.min(block.timestamp, periodFinish);
    }

    function rewardPerToken() public view override returns (uint256) {
        if (_totalSupply == 0) {
            return rewardPerTokenStored;
        }
        return
            rewardPerTokenStored.add(
                lastTimeRewardApplicable()
                    .sub(lastUpdateTime)
                    .mul(rewardRate)
                    .mul(1e18)
                    .div(_totalSupply)
            );
    }

    function earned(uint256 tokenId) public view override returns (uint256) {
        return
            _balances[tokenId]
                .mul(defiPower.getCityPower(tokenId))
                .mul(rewardPerToken().sub(userRewardPerTokenPaid[tokenId]))
                .div(1e18)
                .add(rewards[tokenId]);
    }

    function withdraw(uint256 tokenId, uint256 amount)
        public
        override
        nonReentrant
        isNftOwner(tokenId, _msgSender())
        updateReward(tokenId, true)
    {
        require(amount > 0, "Cannot withdraw 0");

        _totalSupply = _totalSupply.sub(
            amount.mul(defiPower.getCityPower(tokenId))
        );
        _balances[tokenId] = _balances[tokenId].sub(amount);

        token.safeTransfer(_msgSender(), amount);

        emit Withdrawn(tokenId, amount);
    }

    function getReward(uint256 tokenId)
        public
        override
        nonReentrant
        isNftOwner(tokenId, _msgSender())
        updateReward(tokenId, true)
    {
        uint256 reward = rewards[tokenId];

        if (reward > 0) {
            rewards[tokenId] = 0;

            token.safeTransfer(_msgSender(), reward);

            emit RewardPaid(tokenId, reward);
        }
    }
}
