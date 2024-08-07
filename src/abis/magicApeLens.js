export default [
  {
    inputs: [],
    name: "APE_COIN_CONTRACT",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "APE_COIN_STAKING_CONTRACT",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "poolRewardsPerHour", type: "uint256" },
      { internalType: "uint256", name: "stakedAmount", type: "uint256" },
    ],
    name: "computeRewardPerHour",
    outputs: [
      { internalType: "uint256", name: "rewardPerHour", type: "uint256" },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [],
    name: "getApeCoinInfo",
    outputs: [
      {
        components: [
          { internalType: "uint256", name: "apr", type: "uint256" },
          { internalType: "uint256", name: "stakedAmount", type: "uint256" },
          {
            internalType: "uint256",
            name: "poolRewardsPerHour",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "poolRewardsPerDay",
            type: "uint256",
          },
          { internalType: "uint256", name: "rewardPerHour", type: "uint256" },
          {
            internalType: "uint256",
            name: "poolRewardsPerTokenPerDay",
            type: "uint256",
          },
        ],
        internalType: "struct MagicApeLens.PoolInfo",
        name: "info",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getBAKCInfo",
    outputs: [
      {
        components: [
          { internalType: "uint256", name: "apr", type: "uint256" },
          { internalType: "uint256", name: "stakedAmount", type: "uint256" },
          {
            internalType: "uint256",
            name: "poolRewardsPerHour",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "poolRewardsPerDay",
            type: "uint256",
          },
          { internalType: "uint256", name: "rewardPerHour", type: "uint256" },
          {
            internalType: "uint256",
            name: "poolRewardsPerTokenPerDay",
            type: "uint256",
          },
        ],
        internalType: "struct MagicApeLens.PoolInfo",
        name: "info",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getBAYCInfo",
    outputs: [
      {
        components: [
          { internalType: "uint256", name: "apr", type: "uint256" },
          { internalType: "uint256", name: "stakedAmount", type: "uint256" },
          {
            internalType: "uint256",
            name: "poolRewardsPerHour",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "poolRewardsPerDay",
            type: "uint256",
          },
          { internalType: "uint256", name: "rewardPerHour", type: "uint256" },
          {
            internalType: "uint256",
            name: "poolRewardsPerTokenPerDay",
            type: "uint256",
          },
        ],
        internalType: "struct MagicApeLens.PoolInfo",
        name: "info",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getMAYCInfo",
    outputs: [
      {
        components: [
          { internalType: "uint256", name: "apr", type: "uint256" },
          { internalType: "uint256", name: "stakedAmount", type: "uint256" },
          {
            internalType: "uint256",
            name: "poolRewardsPerHour",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "poolRewardsPerDay",
            type: "uint256",
          },
          { internalType: "uint256", name: "rewardPerHour", type: "uint256" },
          {
            internalType: "uint256",
            name: "poolRewardsPerTokenPerDay",
            type: "uint256",
          },
        ],
        internalType: "struct MagicApeLens.PoolInfo",
        name: "info",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          { internalType: "uint256", name: "poolId", type: "uint256" },
          { internalType: "uint256", name: "stakedAmount", type: "uint256" },
          {
            components: [
              {
                internalType: "uint48",
                name: "startTimestampHour",
                type: "uint48",
              },
              {
                internalType: "uint48",
                name: "endTimestampHour",
                type: "uint48",
              },
              {
                internalType: "uint96",
                name: "rewardsPerHour",
                type: "uint96",
              },
              {
                internalType: "uint96",
                name: "capPerPosition",
                type: "uint96",
              },
            ],
            internalType: "struct IApeCoinStaking.TimeRange",
            name: "currentTimeRange",
            type: "tuple",
          },
        ],
        internalType: "struct IApeCoinStaking.PoolUI",
        name: "poolUI",
        type: "tuple",
      },
    ],
    name: "getPoolInfo",
    outputs: [
      {
        components: [
          { internalType: "uint256", name: "apr", type: "uint256" },
          { internalType: "uint256", name: "stakedAmount", type: "uint256" },
          {
            internalType: "uint256",
            name: "poolRewardsPerHour",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "poolRewardsPerDay",
            type: "uint256",
          },
          { internalType: "uint256", name: "rewardPerHour", type: "uint256" },
          {
            internalType: "uint256",
            name: "poolRewardsPerTokenPerDay",
            type: "uint256",
          },
        ],
        internalType: "struct MagicApeLens.PoolInfo",
        name: "info",
        type: "tuple",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
];
