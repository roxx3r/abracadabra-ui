import { formatUnits } from "viem";
import type { Address } from "viem";
import orderAbi from "@/abis/gm/order";
import type { PublicClient } from "viem";
import { BigNumber, utils } from "ethers";
import lensAbi from "@/abis/marketLens.js";
import { ZERO_ADDRESS } from "@/constants/gm";
import { ARBITRUM_CHAIN_ID } from "@/constants/global";
import degenBoxInfo from "@/configs/contracts/degenBox";
import type {
  PositionHealthStatus,
  UserPositions,
} from "@/helpers/cauldron/types";
import { getPublicClient } from "@/helpers/chains/getChainsInfo";
import { getLensAddress } from "@/helpers/cauldron/getLensAddress";
import type { CauldronConfig } from "@/configs/cauldrons/configTypes";
import type { ExtendedContractInfo } from "@/configs/contracts/types";
import {
  getPositionHealth,
  getLiquidationPrice,
} from "@/helpers/migrationHelpers/utils";
import { compact } from "lodash";

const emptyPosition: UserPositions = {
  oracleRate: BigNumber.from("0"),
  collateralInfo: {
    userCollateralShare: BigNumber.from("0"),
    userCollateralAmount: BigNumber.from("0"),
  },
  borrowInfo: {
    userBorrowAmount: BigNumber.from("0"),
    userBorrowPart: BigNumber.from("0"),
  },
  liquidationPrice: "0",
  positionHealth: { percent: 0, status: "high" },
  alternativeData: {
    collateralInfo: {
      userCollateralShare: 0n,
      userCollateralAmount: 0n,
    },
    borrowInfo: {
      userBorrowPart: 0n,
      userBorrowAmount: 0n,
    },
    oracleRate: 0n,
    liquidationPrice: 0n,
    positionHealth: { percent: 0n, status: "high" },
  },
};

export const getUserPositions = async (
  configs: CauldronConfig[],
  account: Address | undefined,
  chainId: number
): Promise<Array<UserPositions>> => {
  if (!account) return configs.map(() => emptyPosition);

  const lensAddress: Address = getLensAddress(chainId);
  const publicClient: PublicClient = getPublicClient(chainId);

  const stateOverride = compact(configs.map(({ stateOverrides }) => stateOverrides)).flat();
  const userPositions: any = await publicClient.multicall({
    contracts: configs
      .map((config: CauldronConfig) => {
        return [
          {
            address: lensAddress,
            abi: lensAbi,
            functionName: "getUserPosition",
            args: [config.contract.address, account],
          },
          {
            address: lensAddress,
            abi: lensAbi,
            functionName: "getOracleExchangeRate",
            args: [config.contract.address],
          },
          {
            address: config.contract.address,
            abi: config.contract.abi,
            functionName: "userCollateralShare",
            args: [account],
          },
          {
            address: config.contract.address,
            abi: config.contract.abi,
            functionName: "userBorrowPart",
            args: [account],
          },
        ];
      })
      .flat(2),
    stateOverride,
  });

  const collaterallInOrders = await getOrdersCollateralBalance(
    configs,
    account,
    chainId
  );

  return configs.map((config: CauldronConfig, index: number) => {
    if (!userPositions) return emptyPosition;

    const decimals = config.collateralInfo.decimals;
    const mcr = config.mcr;
    const oracleExchangeRate: bigint = userPositions[index * 4 + 1].result;
    const userCollateralShare: bigint = userPositions[index * 4 + 2].result;
    const collaterallInOrder = collaterallInOrders[index];
    const userBorrowPart: bigint = userPositions[index * 4 + 3].result;

    // EDGE CASE: if cauldron is empty
    const userPosition = userPositions[index * 4].error
      ? {
          borrowValue: 0n,
          collateral: {
            amount: userCollateralShare,
          },
        }
      : userPositions[index * 4].result;

    const collateralPrice =
      1 / Number(formatUnits(oracleExchangeRate, decimals));

    const liquidationPrice = getLiquidationPrice(
      userPosition.borrowValue,
      userPosition.collateral.amount +
        BigInt(collaterallInOrders[index].amount),
      mcr,
      decimals
    );

    const formattedLiquidationPrice = Number(formatUnits(liquidationPrice, 18));

    const leftToDrop = collateralPrice - formattedLiquidationPrice;

    const positionHealth = calculatePositionHealth(
      formattedLiquidationPrice,
      collateralPrice,
      config?.cauldronSettings.healthMultiplier,
      Number(userPosition.borrowValue),
      leftToDrop
    );

    const alternativePositionHealth = getPositionHealth(
      liquidationPrice,
      oracleExchangeRate,
      decimals
    );

    const userCollateralAmount = BigNumber.from(
      userPosition.collateral.amount
    ).add(BigNumber.from(collaterallInOrders[index].amount));

    const userBorrowAmount = BigNumber.from(userPosition.borrowValue);

    const collateralDeposited = Number(
      utils.formatUnits(userCollateralAmount, config?.collateralInfo.decimals)
    );

    const collateralDepositedUsd = collateralDeposited * collateralPrice;

    const mimBorrowed = Number(utils.formatUnits(userBorrowAmount));

    return {
      collateralInfo: {
        userCollateralShare: BigNumber.from(userCollateralShare).add(
          BigNumber.from(collaterallInOrder.share)
        ),
        userCollateralAmount,
      },
      borrowInfo: {
        userBorrowAmount,
        userBorrowPart: BigNumber.from(userBorrowPart),
      },
      oracleRate: BigNumber.from(oracleExchangeRate),
      liquidationPrice: formattedLiquidationPrice,
      positionHealth,
      collateralDeposited,
      collateralDepositedUsd,
      mimBorrowed,
      hasActiveGmOrder: collaterallInOrder.activeOrder,
      alternativeData: {
        collateralInfo: {
          userCollateralShare:
            userCollateralShare + collaterallInOrder.alternativeData.share,
          userCollateralAmount:
            userPosition.collateral.amount +
            collaterallInOrders[index].alternativeData.amount,
        },
        borrowInfo: {
          userBorrowPart,
          userBorrowAmount: userPosition.borrowValue,
        },
        liquidationPrice,
        oracleRate: oracleExchangeRate,
        positionHealth: alternativePositionHealth,
      },
    };
  });
};

const getOrdersCollateralBalance = async (
  configs: Array<CauldronConfig | undefined>,
  account: string | undefined,
  chainId: number
) => {
  if (!configs || !configs.length) return [];
  if (chainId !== ARBITRUM_CHAIN_ID || !account) {
    return configs.map(() => {
      return {
        share: BigNumber.from(0),
        amount: BigNumber.from(0),
        alternativeData: {
          amount: 0n,
          share: 0n,
        },
      };
    });
  }

  const publicClient = getPublicClient(ARBITRUM_CHAIN_ID);

  const degenBoxContractInfo = degenBoxInfo.find(
    (contractInfo: ExtendedContractInfo) =>
      contractInfo.chainId === ARBITRUM_CHAIN_ID
  );

  const orders = await publicClient.multicall({
    contracts: configs.map((config: any) => {
      return {
        address: config.contract.address,
        abi: config.contract.abi,
        functionName: "orders",
        args: [account],
      };
    }),
  });

  const collaterallInOrders: any = await publicClient.multicall({
    contracts: orders.map((response: any) => {
      return {
        address: response?.error ? ZERO_ADDRESS : response?.result,
        abi: orderAbi,
        functionName: "orderValueInCollateral",
        args: [],
      };
    }),
  });

  const collaterallInShare: any = await publicClient.multicall({
    contracts: collaterallInOrders.map((response: any, index: number) => {
      const collateral = configs[index]!.collateralInfo.address;
      const amount = response?.error ? BigNumber.from(0) : response?.result;
      return {
        address: degenBoxContractInfo?.address,
        abi: degenBoxContractInfo?.abi,
        functionName: "toShare",
        args: [collateral, amount, false],
      };
    }),
  });

  return collaterallInOrders.map((response: any, index: number) => {
    const activeOrder =
      orders[index]?.error || orders[index]?.result.includes(ZERO_ADDRESS)
        ? false
        : orders[index]?.result;

    return {
      amount: response?.error
        ? BigNumber.from(0)
        : BigNumber.from(response?.result),
      share: BigNumber.from(collaterallInShare[index].result),
      activeOrder,
      alternativeData: {
        amount: response?.error ? 0n : response?.result,
        share: collaterallInShare[index]?.result || 0n,
      },
    };
  });
};

const calculatePositionHealth = (
  liquidationPrice: number,
  collateralPrice: number,
  healthMultiplier: any,
  userBorrowAmount: number,
  leftToDrop: number
): { percent: number; status: PositionHealthStatus } => {
  if (userBorrowAmount.toString() === "0" || isNaN(+liquidationPrice))
    return { percent: 100, status: "high" };

  const priceToDrop = leftToDrop * healthMultiplier;
  let percent = (priceToDrop / collateralPrice) * 100;
  if (percent > 100) percent = 100;
  if (percent < 0) percent = 0;

  let status: PositionHealthStatus = "high";

  if (percent >= 0 && percent <= 70) status = "safe";
  if (percent > 70 && percent <= 90) status = "medium";

  return { percent, status };
};
