export default [
  {
    inputs: [
      {
        internalType: "contract IBentoBoxLite",
        name: "_bentoBox",
        type: "address",
      },
      {
        internalType: "contract IConvexWrapper",
        name: "_wrapper",
        type: "address",
      },
      { internalType: "address", name: "_mim", type: "address" },
      {
        internalType: "enum CurvePoolInterfaceType",
        name: "_curvePoolInterfaceType",
        type: "uint8",
      },
      { internalType: "address", name: "_curvePool", type: "address" },
      { internalType: "address", name: "_curvePoolDepositor", type: "address" },
      { internalType: "address[]", name: "_poolTokens", type: "address[]" },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  { inputs: [], name: "ErrSwapFailed", type: "error" },
  { inputs: [], name: "ErrTokenNotSupported", type: "error" },
  { inputs: [], name: "ErrUnsupportedCurvePool", type: "error" },
  {
    inputs: [],
    name: "box",
    outputs: [
      { internalType: "contract IBentoBoxLite", name: "", type: "address" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "curvePool",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "curvePoolDepositor",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "curvePoolInterfaceType",
    outputs: [
      { internalType: "enum CurvePoolInterfaceType", name: "", type: "uint8" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "curveToken",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "mim",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "poolTokens",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "", type: "address" },
      { internalType: "address", name: "", type: "address" },
      { internalType: "address", name: "recipient", type: "address" },
      { internalType: "uint256", name: "shareToMin", type: "uint256" },
      { internalType: "uint256", name: "shareFrom", type: "uint256" },
      { internalType: "bytes", name: "data", type: "bytes" },
    ],
    name: "swap",
    outputs: [
      { internalType: "uint256", name: "extraShare", type: "uint256" },
      { internalType: "uint256", name: "shareReturned", type: "uint256" },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "wrapper",
    outputs: [
      { internalType: "contract IConvexWrapper", name: "", type: "address" },
    ],
    stateMutability: "view",
    type: "function",
  },
];
