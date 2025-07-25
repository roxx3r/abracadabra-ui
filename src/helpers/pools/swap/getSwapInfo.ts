import moment from "moment";
import type { Address } from "viem";
import type { TokenInfo } from "@/helpers/pools/swap/tokens";
import type { MagicLPInfo } from "@/helpers/pools/swap/types";
import { getSwapRouterByChain } from "@/configs/pools/routers";
import { calculatePriceImpact } from "@/helpers/pools/priceImpact";
import { findBestRoutes } from "@/helpers/pools/swap/findBestRoutes";
import { applySlippageToMinOutBigInt } from "@/helpers/gm/applySlippageToMinOut";

export type ActionConfig = {
  fromToken: TokenInfo;
  fromTokenAddress: Address;
  toToken: TokenInfo;
  toTokenAddress: Address;
  fromInputValue: bigint;
  toInputValue: bigint;
  slippage: bigint;
  deadline: bigint;
  fromInputAmount?: string;
  priceImpact: number;
};

export type RouteInfo = {
  inputToken: string;
  outputToken: Address;
  inputAmount: bigint;
  outputAmount: bigint;
  outputAmountWithoutFee: bigint;
  mtFee: bigint;
  lpFee: bigint;
  fee: bigint;
  fees: bigint;
  lpInfo: MagicLPInfo;
  fromBase: boolean;
  priceImpact: number;
};

export const getSwapInfo = async (
  pools: MagicLPInfo[],
  actionConfig: ActionConfig,
  chainId: number,
  account: Address
) => {
  if (!pools || !pools.length) return getSwapInfoEmptyState(actionConfig);

  const routes = await findBestRoutes(pools, actionConfig, account);
  if (!routes || routes.length === 0)
    return getSwapInfoEmptyState(actionConfig);

  const inputAmount = routes[0].inputAmount;
  const outputAmount = routes[routes?.length - 1].outputAmount;
  const outputAmountWithSlippage = applySlippageToMinOutBigInt(
    actionConfig.slippage,
    outputAmount
  );

  const transactionInfo = getTransactionInfo(
    routes,
    actionConfig,
    chainId,
    account
  );

  const priceImpact = calculatePriceImpact(routes);

  return {
    routes,
    actionConfig,
    inputAmount,
    outputAmount,
    outputAmountWithSlippage,
    transactionInfo,
    priceImpact,
  };
};

export const getSwapInfoEmptyState = (actionConfig: ActionConfig) => {
  const { fromInputValue } = actionConfig;

  return {
    routes: [],
    actionConfig,
    inputAmount: fromInputValue,
    outputAmount: fromInputValue,
    outputAmountWithSlippage: fromInputValue,
    priceImpact: 0,
    transactionInfo: {
      methodName: "",
      payload: {},
      swapRouterAddress: "0x00",
    },
  };
};

const getTransactionInfo = (
  routes: RouteInfo[],
  actionConfig: ActionConfig,
  chainId: number,
  account: Address
) => {
  const methodName = getMethodName(routes, actionConfig);
  const payload = getPayloadByMethod(methodName, routes, actionConfig, account);
  const swapRouterAddress: Address = getSwapRouterByChain(chainId);

  return {
    methodName,
    payload,
    swapRouterAddress,
  };
};

const getMethodName = (routes: RouteInfo[], actionConfig: ActionConfig) => {
  if (routes.length === 1) {
    const fromTokenAddress = actionConfig.fromToken.config.contract.address;
    const { baseToken, quoteToken } = routes[0].lpInfo;

    switch (fromTokenAddress) {
      case baseToken:
        return "sellBaseTokensForTokens";
      case quoteToken:
        return "sellQuoteTokensForTokens";
    }
  }

  return "swapTokensForTokens";
};

const getPayloadByMethod = (
  methodName: string,
  routes: RouteInfo[],
  actionConfig: ActionConfig,
  account: Address
) => {
  switch (methodName) {
    case "sellBaseTokensForTokens":
      return sellBaseTokensForTokensPayload(routes[0], actionConfig, account);
    case "sellQuoteTokensForTokens":
      return sellQuoteTokensForTokensPayload(routes[0], actionConfig, account);
    case "swapTokensForTokens":
      return swapTokensForTokensPayload(routes, actionConfig, account);
  }
};

const sellBaseTokensForTokensPayload = (
  route: RouteInfo,
  actionConfig: ActionConfig,
  account: Address
) => {
  const { lpInfo, inputAmount, outputAmount } = route;
  const deadline = moment().unix() + Number(actionConfig.deadline);
  const outputAmountWithSlippage = applySlippageToMinOutBigInt(
    actionConfig.slippage,
    outputAmount
  );

  return {
    lp: lpInfo.contract.address,
    to: account,
    amountIn: inputAmount,
    minimumOut: outputAmountWithSlippage,
    deadline,
  };
};

const sellQuoteTokensForTokensPayload = (
  route: RouteInfo,
  actionConfig: ActionConfig,
  account: Address
) => {
  const { lpInfo, inputAmount, outputAmount } = route;
  const deadline = moment().unix() + Number(actionConfig.deadline);

  const outputAmountWithSlippage = applySlippageToMinOutBigInt(
    actionConfig.slippage,
    outputAmount
  );

  return {
    lp: lpInfo.contract.address,
    to: account,
    amountIn: inputAmount,
    minimumOut: outputAmountWithSlippage,
    deadline,
  };
};

function encodeDirections(directionsArray: number[]): number {
  let encodedDirections = 0;

  // Iterate over the array and use bitwise shift to encode
  for (let i = 0; i < directionsArray.length; i++) {
    // We shift the bit to the appropriate position and add it to the result
    encodedDirections |= directionsArray[i] << i;
  }

  return encodedDirections;
}

const swapTokensForTokensPayload = (
  routes: RouteInfo[],
  actionConfig: ActionConfig,
  account: Address
) => {
  const { fromInputValue } = actionConfig;
  const path: Address[] = routes.map((route) => route.lpInfo.contract.address);
  const outputAmount = routes[routes.length - 1].outputAmount;
  const deadline = moment().unix() + Number(actionConfig.deadline);
  const directionsArray = routes.map((route) => (route.fromBase ? 0 : 1));

  return {
    to: account,
    amountIn: fromInputValue,
    path,
    directions: encodeDirections(directionsArray),
    minimumOut: outputAmount,
    deadline: deadline,
  };
};
