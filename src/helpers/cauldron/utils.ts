import { BigNumber } from "ethers";
import { parseUnits } from "viem";
import { expandDecimals } from "../gm/fee/expandDecials";
import { applySlippageToMinOut } from "@/helpers/gm/applySlippageToMinOut";

const MIM_DECIMALS = 18;
const COLATERIZATION_PRESITION = 5;
const BORROW_OPENING_FEE_PRECISION = 5;
export const PERCENT_PRESITION = 2;

const FENCING_AGAINST_LIQUIDATION = expandDecimals(1, PERCENT_PRESITION); // 1% of mcr

type SwapAmounts = {
  amountFrom: BigNumber;
  amountToMin: BigNumber;
};

export const getLiquidationPrice = (
  borrowAmount: BigNumber,
  collateralAmount: BigNumber,
  mcr: number,
  collateralDecimals: number
): BigNumber => {
  if (borrowAmount.eq(0) || collateralAmount.eq(0)) return BigNumber.from(0);

  const colaterizationRate = BigNumber.from(mcr)
    .mul(expandDecimals(1, COLATERIZATION_PRESITION))
    .div(100);

  const liquidationPrice = borrowAmount
    .mul(expandDecimals(1, collateralDecimals + COLATERIZATION_PRESITION))
    .div(collateralAmount)
    .div(colaterizationRate);

  return liquidationPrice;
};

export const getAlternativeLiquidationPrice = (
  borrowAmount: bigint,
  collateralAmount: bigint,
  mcr: number,
  collateralDecimals: number
): bigint => {
  if (!borrowAmount || !collateralAmount) return 0n;

  const expandDecimals = parseUnits("1", collateralDecimals);
  return (
    (borrowAmount * expandDecimals * 100n) / collateralAmount / BigInt(mcr)
  );
};

// TODO: add userMaxBorrow check
export const getMaxToBorrow = (
  collateralAmount: BigNumber,
  userBorrowAmount: BigNumber,
  mcr: BigNumber,
  oracleExchangeRate: BigNumber
): BigNumber => {
  const collateralInMim = expandDecimals(collateralAmount, MIM_DECIMALS).div(
    oracleExchangeRate
  );

  const maxToBorrow = collateralInMim
    .div(100)
    .mul(mcr.sub(FENCING_AGAINST_LIQUIDATION))
    .div(expandDecimals(1, PERCENT_PRESITION));

  const maxToBorrowLeft = maxToBorrow.sub(userBorrowAmount);

  return maxToBorrowLeft.lt(0) ? BigNumber.from(0) : maxToBorrowLeft;
};

export const getUserLtv = (
  collateralAmount: BigNumber,
  userBorrowAmount: BigNumber,
  oracleExchangeRate: BigNumber
): BigNumber => {
  if (collateralAmount.isZero()) return BigNumber.from(0);

  const collateralInMim = expandDecimals(collateralAmount, MIM_DECIMALS).div(
    oracleExchangeRate
  );

  const ltv = expandDecimals(userBorrowAmount, PERCENT_PRESITION)
    .mul(100)
    .div(collateralInMim);

  return ltv;
};

export const getMimToBorrowByLtv = (
  ltv: BigNumber,
  mcr: BigNumber,
  collateralAmount: BigNumber,
  userBorrowAmount: BigNumber,
  oracleExchangeRate: BigNumber
): BigNumber => {
  if (ltv.gt(mcr)) return BigNumber.from(0);

  const currentLtv = getUserLtv(
    collateralAmount,
    userBorrowAmount,
    oracleExchangeRate
  );

  if (ltv.lte(currentLtv)) return BigNumber.from(0);

  const collateralInMim = expandDecimals(collateralAmount, MIM_DECIMALS).div(
    oracleExchangeRate
  );

  const leftToBorrow = getMaxToBorrow(
    collateralAmount,
    userBorrowAmount,
    mcr,
    oracleExchangeRate
  );
  const mimPerPercent = collateralInMim.div(100);

  const mimToBorrow = mimPerPercent
    .mul(ltv.sub(currentLtv))
    .div(expandDecimals(1, PERCENT_PRESITION));

  if (mimToBorrow.gt(leftToBorrow)) return leftToBorrow;
  return mimToBorrow;
};

export const getMaxCollateralToRemove = (
  collateralAmount: BigNumber,
  userBorrowAmount: BigNumber,
  mcr: BigNumber,
  oracleExchangeRate: BigNumber
) => {
  if (userBorrowAmount.eq(0)) return collateralAmount;

  const currentLtv = getUserLtv(
    collateralAmount,
    userBorrowAmount,
    oracleExchangeRate
  );

  const minCollateralAmount = currentLtv
    .mul(collateralAmount)
    .div(mcr.sub(FENCING_AGAINST_LIQUIDATION));

  const maxToRemoveLeft = collateralAmount.sub(minCollateralAmount);

  const maxToRemove = maxToRemoveLeft.lt(0)
    ? BigNumber.from(0)
    : maxToRemoveLeft;

  return maxToRemove.gt(collateralAmount) ? collateralAmount : maxToRemove;
};

export const getLeverageAmounts = (
  collateralAmount: BigNumber,
  leverageMultiplyer: BigNumber, // 1e2
  slippage: BigNumber, // 1e2
  oracleExchangeRate: BigNumber
): SwapAmounts => {
  if (collateralAmount.eq(0))
    return { amountFrom: BigNumber.from(0), amountToMin: BigNumber.from(0) };

  const collateralToSwap = collateralAmount
    .mul(leverageMultiplyer)
    .div(expandDecimals(1, 2))
    .sub(collateralAmount);

  const amountFrom = expandDecimals(collateralToSwap, MIM_DECIMALS).div(
    oracleExchangeRate
  );

  const amountToMin = applySlippageToMinOut(Number(slippage), collateralToSwap);

  return {
    amountFrom, // MIM amount to borrow & swap
    amountToMin, // min expected collateral amount
  };
};

export const getDeleverageAmounts = (
  mimToRepayAmount: BigNumber,
  slippage: BigNumber, // 1e2
  oracleExchangeRate: BigNumber
): SwapAmounts => {
  if (mimToRepayAmount.eq(0))
    return { amountFrom: BigNumber.from(0), amountToMin: BigNumber.from(0) };

  const collateralToSwapMin = mimToRepayAmount
    .mul(oracleExchangeRate)
    .div(expandDecimals(1, MIM_DECIMALS));

  const additionalSlippageAmount = collateralToSwapMin
    .mul(slippage)
    .div(expandDecimals(100, PERCENT_PRESITION));

  const collaterapToSwapAmount = collateralToSwapMin.add(
    additionalSlippageAmount
  );

  return {
    amountFrom: collaterapToSwapAmount, // collateral amount to remove & swap
    amountToMin: mimToRepayAmount, // min expected MIM amount
  };
};

export const applyBorrowFee = (
  borrowAmount: BigNumber,
  borrowOpeningFee: number // 1% === 1000
): BigNumber => {
  if (borrowAmount.isZero()) return BigNumber.from(0);

  const fee = borrowAmount
    .mul(borrowOpeningFee)
    .div(expandDecimals(1, BORROW_OPENING_FEE_PRECISION));

  return borrowAmount.add(fee);
};

export const alternativeApplyBorrowFee = (
  borrowAmount: bigint,
  borrowOpeningFee: number // 1% === 1000
): bigint => {
  if (!borrowAmount) return 0n;

  const fee =
    (borrowAmount * parseUnits(borrowOpeningFee.toString(), 0)) /
    parseUnits("1", BORROW_OPENING_FEE_PRECISION);

  return borrowAmount + fee;
};
