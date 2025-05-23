import { parseUnits } from "viem";
import type { Address } from "viem";
import { utils, BigNumber } from "ethers";
import { ZERO_ADDRESS } from "@/constants/gm";
import type { ContractInfo } from "@/types/global";
import { getGmInfo } from "@/helpers/cauldron/getGMInfo";
import type { AdditionalInfo } from "@/helpers/cauldron/types";
import { getFeePercent } from "@/helpers/cauldron/getFeePercent";
import { getPublicClient } from "@/helpers/chains/getChainsInfo";
import type { CauldronConfig } from "@/configs/cauldrons/configTypes";
import { getWhiteListedInfo } from "@/helpers/cauldron/getWhiteListedInfo";
import { checkIsUserCollateralLocked } from "@/helpers/cauldron/check/checkIsUserCollateralLocked";

const EMPTY_STATE = {
  isMasterContractApproved: false,
  tokensRate: utils.parseUnits("1", 18),
  maxWithdrawAmount: BigNumber.from("0"),
  whitelistedInfo: { isUserWhitelisted: false },
  isCollateralLocked: false,
  feePercent: null,
  hasActiveGmOrder: false,
  gmInfo: null,
};

export const getAdditionalInfo = async (
  chainId: number,
  config: CauldronConfig,
  account: Address | undefined,
  masterContract: ContractInfo,
  bentoBoxContract: ContractInfo
): Promise<AdditionalInfo> => {
  if (!account) return EMPTY_STATE;

  const publicClient = getPublicClient(chainId);
  const { collateralInfo, wrapInfo, cauldronSettings } = config;

  const oneEther = parseUnits("1", collateralInfo.decimals).toString();

  const contracts = [
    {
      address: bentoBoxContract.address,
      abi: bentoBoxContract.abi,
      functionName: "masterContractApproved",
      args: [masterContract.address, account],
    },
  ];

  let tokensRate = oneEther;

  if (wrapInfo) {
    const [convertToAssets, toAmount] = await publicClient.multicall({
      contracts: [
        {
          address: collateralInfo.address,
          abi: collateralInfo.abi,
          functionName: "convertToAssets",
          args: [oneEther],
        },
        {
          address: collateralInfo.address,
          abi: collateralInfo.abi,
          functionName: "toAmount",
          args: [oneEther],
        },
      ],
    });

    tokensRate = convertToAssets?.result || toAmount?.result || oneEther;
  }

  if (cauldronSettings.hasWithdrawableLimit) {
    contracts.push({
      address: collateralInfo.address,
      abi: collateralInfo.abi,
      functionName: "balanceOf",
      args: [bentoBoxContract.address],
    });
  }

  const [masterContractAllowance, withdrawAmount] =
    await publicClient.multicall({
      contracts: contracts,
    });

  const maxWithdrawAmount = withdrawAmount?.result || BigNumber.from("0");

  const whitelistedInfo = await getWhiteListedInfo(
    config,
    chainId,
    publicClient,
    account
  );

  const isCollateralLocked = await checkIsUserCollateralLocked(
    config,
    chainId,
    account
  );

  const feePercent = await getFeePercent(config, chainId, publicClient);

  const activeOrder = config.cauldronSettings.isGMXMarket
    ? await publicClient.readContract({
        address: config.contract.address,
        abi: config.contract.abi,
        functionName: "orders",
        args: [account],
      })
    : ZERO_ADDRESS;

  const hasActiveGmOrder = activeOrder !== ZERO_ADDRESS;

  // todo move to viem
  const gmInfo = config.cauldronSettings.isGMXMarket
    ? await getGmInfo(config.collateralInfo.address, chainId)
    : null;

  return {
    maxWithdrawAmount,
    tokensRate: BigNumber.from(tokensRate),
    isMasterContractApproved: masterContractAllowance?.result || false,
    whitelistedInfo,
    isCollateralLocked,
    feePercent,
    gmInfo,
    hasActiveGmOrder,
  };
};
