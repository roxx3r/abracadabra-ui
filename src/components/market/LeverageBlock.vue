<template>
  <div class="range-wrap">
    <BaseTokenInput
      :value="borrowInputAmount"
      :name="cauldron.config.mimInfo.name"
      :icon="cauldron.config.mimInfo.icon"
      :decimals="cauldron.config.mimInfo.decimals"
      :max="maxToBorrow"
      isBigNumber
      primaryMax
      @updateInputValue="onUpdateBorrowInputAmount"
    />

    <LeverageRange
      :value="multiplier"
      :max="maxLeverageMultiplier"
      :risk="positionHealth"
      :collateralValue="depositInputValue"
      tooltipText="Allows users to leverage their position. Read more about this in the documents!"
      isPotion
      @updateValue="onUpdateMultiplier"
    />
  </div>

  <DynamicElixirPotionsMultiplier
    :multiplier="multiplier"
    v-if="hasElixirPotions"
  />

  <DynamicallyEstimatedPrice
    :multiplier="multiplier"
    :cauldron="cauldron"
    :amount="leverageAmounts.amountFrom"
  />
</template>

<script lang="ts">
import {
  getLeverageAmounts,
  applyBorrowFee,
  PERCENT_PRESITION,
} from "@/helpers/cauldron/utils";
import {
  getBorrowAmountByMultiplier,
  getLeverageMultiplierByBorrowAmount,
} from "@/helpers/cauldron/getMaxLeverageMultiplier";
import { mapGetters } from "vuex";
import { BigNumber, utils } from "ethers";
import { defineAsyncComponent } from "vue";
import { formatToFixed } from "@/helpers/filters";
import { trimZeroDecimals } from "@/helpers/numbers";
import { applySlippageToMinOut } from "@/helpers/gm/applySlippageToMinOut";
import { getMaxLeverageMultiplier } from "@/helpers/cauldron/getMaxLeverageMultiplier";
import { getMaxLeverageMultiplierPayload } from "@/helpers/migrationHelpers/payloadHelpers";
import {
  getPositionHealth,
  getLiquidationPrice,
} from "@/helpers/migrationHelpers/utils";

const MIM_DECIMALS = 18;

export default {
  props: {
    slippage: {
      type: BigNumber,
      required: true,
    },
    depositCollateralAmount: {
      type: BigNumber,
      default: BigNumber.from(0),
    },
    leverageAmounts: {
      default: {
        amountFrom: BigNumber.from(0),
        amountToMin: BigNumber.from(0),
      },
    },
    cauldron: {
      type: Object as any,
    },
  },

  emits: ["updateLeverageAmounts", "updateMaxToBorrow"],

  data() {
    return {
      multiplier: 1,
      useNativeToken: false,
      useUnwrapToken: false,
      depositInputValue: "",
      maxLeverageMultiplier: 5,
      amounts: {
        deposit: {
          collateralTokenAmount: BigNumber.from(0),
          unwrapTokenAmount: BigNumber.from(0),
          minToSwap: BigNumber.from(0),
        },
        borrow: BigNumber.from(0),
      },
      borrowInputValue: BigNumber.from(0),
      useCustomBorrowValue: false,
      maxToBorrow: BigNumber.from(0),
    };
  },

  computed: {
    ...mapGetters({
      account: "getAccount",
      chainId: "getChainId",
    }),

    borrowInputAmount() {
      if (this.useCustomBorrowValue) {
        if (this.borrowInputValue.eq(0)) return "";
        return trimZeroDecimals(
          utils.formatUnits(this.borrowInputValue, MIM_DECIMALS)
        );
      }

      const amount = getBorrowAmountByMultiplier(
        this.multiplier,
        this.cauldron,
        this.depositCollateralAmount!
      );

      const borrowInputAmount = trimZeroDecimals(
        utils.formatUnits(amount, MIM_DECIMALS)
      );

      if (!Number(borrowInputAmount)) return "";
      return borrowInputAmount;
    },

    expectedCollateralAmount() {
      return this.cauldron.userPosition.collateralInfo.userCollateralAmount
        .add(
          //@ts-ignore
          this.leverageAmounts.amountToMin
        )
        .add(this.depositCollateralAmount);
    },

    expectedBorrowAmount() {
      const { borrowFee } = this.cauldron.mainParams;
      const { userBorrowAmount } = this.cauldron.userPosition.borrowInfo;

      return applyBorrowFee(
        //@ts-ignore
        this.leverageAmounts.amountFrom,
        borrowFee * 1000
      ).add(userBorrowAmount);
    },

    positionHealth() {
      const { oracleExchangeRate } = this.cauldron.mainParams;
      const { decimals } = this.cauldron.config.collateralInfo;

      const expectedLiquidationPrice = getLiquidationPrice(
        this.expectedBorrowAmount.toBigInt(),
        this.expectedCollateralAmount.toBigInt(),
        this.cauldron.config.mcr,
        this.cauldron.config.collateralInfo.decimals
      );

      const { status } = getPositionHealth(
        expectedLiquidationPrice,
        oracleExchangeRate,
        decimals
      );

      return status;
    },

    hasElixirPotions() {
      return this.cauldron.config.cauldronSettings.hasElixirPotions;
    },
  },

  watch: {
    depositCollateralAmount() {
      this.getMaxLeverageMultiplier();
      this.getMaxBorrowAmount();
      this.updateLeverageAmounts();
    },

    slippage() {
      this.getMaxLeverageMultiplier();
      this.updateLeverageAmounts();
    },

    borrowInputAmount() {
      const borrowInputAmount = utils.parseUnits(
        this.borrowInputAmount || "0",
        MIM_DECIMALS
      );

      const leverageAmounts = {
        amountFrom: borrowInputAmount,
        amountToMin: applySlippageToMinOut(
          Number(this.slippage),
          borrowInputAmount
        ),
      };

      this.$emit("updateLeverageAmounts", leverageAmounts);
    },
  },

  methods: {
    onUpdateMultiplier(value: number) {
      this.useCustomBorrowValue = false;
      this.multiplier = value;
      this.updateLeverageAmounts();
    },

    onUpdateBorrowInputAmount(value: BigNumber) {
      this.useCustomBorrowValue = true;
      this.borrowInputValue = value;
      this.updateLeverageAmounts();
    },

    updateLeverageAmounts() {
      const { userCollateralAmount } =
        this.cauldron.userPosition.collateralInfo;

      const { oracleExchangeRate } = this.cauldron.mainParams;

      if (this.useCustomBorrowValue) {
        const multiplier = getLeverageMultiplierByBorrowAmount(
          this.borrowInputValue,
          this.maxToBorrow,
          this.maxLeverageMultiplier
        );

        this.multiplier = Number(
          formatToFixed(String(utils.formatUnits(multiplier, MIM_DECIMALS)), 2)
        );
      }

      const multiplier = utils.parseUnits(
        String(this.multiplier),
        PERCENT_PRESITION
      );

      const positionExpectedCollateral = userCollateralAmount.add(
        this.depositCollateralAmount
      );

      const leverageAmounts = getLeverageAmounts(
        //@ts-ignore
        positionExpectedCollateral,
        multiplier,
        //@ts-ignore
        this.slippage,
        BigNumber.from(oracleExchangeRate)
      );

      this.$emit("updateLeverageAmounts", leverageAmounts);
    },

    getMaxLeverageMultiplier() {
      const payload = getMaxLeverageMultiplierPayload(
        this.cauldron,
        false,
        this.depositCollateralAmount,
        this.slippage
      );

      const maxMultiplier = getMaxLeverageMultiplier(
        payload.oracleExchangeRate,
        payload.mcr,
        payload.collateralDecimals,
        payload.userBorrowAmount,
        payload.userCollateralAmount,
        payload.ignoreUserPosition,
        payload.depositAmount,
        payload.slippage
      );

      if (maxMultiplier < this.multiplier) this.multiplier = maxMultiplier;
      this.maxLeverageMultiplier = maxMultiplier;
    },

    getMaxBorrowAmount() {
      if (!this.depositCollateralAmount?.isZero)
        this.maxToBorrow = BigNumber.from(0);
      else {
        this.maxToBorrow = getBorrowAmountByMultiplier(
          this.maxLeverageMultiplier,
          this.cauldron,
          this.depositCollateralAmount!
        );
      }

      this.$emit("updateMaxToBorrow", this.maxToBorrow);
    },
  },

  created() {
    this.getMaxLeverageMultiplier();
    this.getMaxBorrowAmount();
  },

  components: {
    BaseTokenInput: defineAsyncComponent(
      () => import("@/components/base/BaseTokenInput.vue")
    ),
    LeverageRange: defineAsyncComponent(
      () => import("@/components/ui/range/LeverageRange.vue")
    ),
    DynamicallyEstimatedPrice: defineAsyncComponent(
      () => import("@/components/market/DynamicallyEstimatedPrice.vue")
    ),
    DynamicElixirPotionsMultiplier: defineAsyncComponent(
      () => import("@/components/market/DynamicElixirPotionsMultiplier.vue")
    ),
  },
};
</script>

<style lang="scss" scoped>
.range-wrap {
  margin: 4px 0 4px;
  display: flex;
  flex-direction: column;
  gap: 36px;
}
</style>
