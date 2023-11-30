// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IStakingRewards {
    // Views

    function balanceOf(uint256 tokenId) external view returns (uint256);

    function earned(uint256 tokenId) external view returns (uint256);

    function getRewardForDuration() external view returns (uint256);

    function lastTimeRewardApplicable() external view returns (uint256);

    function rewardPerToken() external view returns (uint256);

    function totalSupply() external view returns (uint256);

    // Mutative

    function exit(uint256 tokenId) external;

    function getReward(uint256 tokenId) external;

    function stake(uint256 tokenId, uint256 amount) external;

    function withdraw(uint256 tokenId, uint256 amount) external;
}
