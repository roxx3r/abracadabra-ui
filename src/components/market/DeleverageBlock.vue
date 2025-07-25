<template>
  <div class="deleverage-block">
    <div>
      <div class="row">
        <div class="title-wrap">
          <h3 class="title">To repay</h3>

          <SlippagePopup
            :amount="slippage"
            @updateSlippage="onUpdateSlippage"
          />
        </div>

        <Toggle
          :selected="true"
          text="Deleverage"
          @updateToggle="onToggleDeleverage"
        />
      </div>

      <h4 class="subtitle">Chose the amount of MIM you want to repay</h4>
    </div>

    <BaseTokenInput
      :value="inputAmount"
      :name="cauldron.config.mimInfo.name"
      :icon="cauldron.config.mimInfo.icon"
      :decimals="cauldron.config.mimInfo.decimals"
      :max="maxToRepay"
      isBigNumber
      primaryMax
      @updateInputValue="onUpdateInputAmount"
    />

    <div class="dynamic-wrap" v-if="showDynamicBlock">
      <DynamicFee
        v-if="!hideDynamicFee"
        :isClose="true"
        :amount="deleverageAmounts.amountToMin"
        :mimAddress="cauldron.config.mimInfo.address"
        :chainId="cauldron.config.chainId"
        :cauldron="cauldron"
      />

      <GmPriceImpact
        v-if="cauldron.config.cauldronSettings.isGMXMarket"
        :cauldronObject="cauldron"
        :amount="deleverageAmounts.amountFrom"
        :actionType="2"
      />
    </div>

    <Warning
      mark="exclamation"
      v-tooltip="
        'Deleveraging is dependent on sdeUSD/deUSD liquidity. Please verify current liquidity levels before proceeding to ensure minimal slippage.'
      "
      v-if="showDeleverageWarning"
    >
      Liquidity-Dependent Action
    </Warning>
  </div>
</template>

<script lang="ts">
import { mapGetters } from "vuex";
import type { PropType } from "vue";
import { BigNumber, utils } from "ethers";
import { defineAsyncComponent } from "vue";
import { trimZeroDecimals } from "@/helpers/numbers";
import type { CauldronInfo } from "@/helpers/cauldron/types";
import { getDeleverageAmounts } from "@/helpers/cauldron/utils";
import { BERA_BARTIO_CHAIN_ID, KAVA_CHAIN_ID } from "@/constants/global";

export default {
  props: {
    cauldron: {
      type: Object as PropType<CauldronInfo>,
      required: true,
    },
    slippage: {
      type: BigNumber,
    },
    deleverageAmounts: {
      default: {
        amountFrom: BigNumber.from(0),
        amountToMin: BigNumber.from(0),
      },
    },
    withdrawAmount: {
      type: BigNumber,
      default: BigNumber.from(0),
    },
  },

  data() {
    return {
      value: BigNumber.from(0),
    };
  },

  emits: ["updateDeleverageAmounts", "updateSlippage", "updateToggle"],

  computed: {
    ...mapGetters({
      account: "getAccount",
      chainId: "getChainId",
    }),

    inputAmount() {
      const repayAmount = this.deleverageAmounts.amountToMin
        ? this.deleverageAmounts.amountToMin
        : BigNumber.from(0);
      if (repayAmount.eq(BigNumber.from(0))) {
        return "";
      }
      return trimZeroDecimals(
        utils.formatUnits(repayAmount, this.cauldron.config.mimInfo.decimals)
      );
    },

    showDynamicBlock() {
      return (
        !this.hideDynamicFee ||
        this.cauldron.config.cauldronSettings.isGMXMarket
      );
    },

    hideDynamicFee() {
      const disabledChains = [KAVA_CHAIN_ID, BERA_BARTIO_CHAIN_ID];

      return disabledChains.indexOf(this.cauldron.config.chainId) !== -1;
    },

    maxToRepay() {
      const { userBorrowAmount } = this.cauldron.userPosition.borrowInfo;
      return userBorrowAmount;
    },

    showDeleverageWarning() {
      console.log(this.cauldron);
      const cauldronAddress = this.cauldron.config.contract.address;

      return (
        cauldronAddress == "0x00380CB5858664078F2289180CC32F74440AC923" ||
        cauldronAddress == "0x38E7D1e4E2dE5b06b6fc9A91C2c37828854A41bb"
      );
    },
  },

  watch: {
    slippage() {
      this.updateDeleverageAmounts(this.value);
    },
  },

  methods: {
    onUpdateInputAmount(value: BigNumber) {
      this.value = value;
      this.updateDeleverageAmounts(value);
    },

    onUpdateSlippage(slippage: BigNumber) {
      this.$emit("updateSlippage", slippage);
    },

    onToggleDeleverage() {
      this.$emit("updateToggle", "useDeleverage", true);
    },

    updateDeleverageAmounts(value: BigNumber) {
      const { oracleExchangeRate } = this.cauldron.mainParams;

      const deleverageAmounts = getDeleverageAmounts(
        value,
        this.slippage!,
        BigNumber.from(oracleExchangeRate)
      );

      this.$emit("updateDeleverageAmounts", deleverageAmounts);
    },
  },

  components: {
    BaseTokenInput: defineAsyncComponent(
      () => import("@/components/base/BaseTokenInput.vue")
    ),
    DynamicFee: defineAsyncComponent(
      () => import("@/components/market/DynamicFee.vue")
    ),
    GmPriceImpact: defineAsyncComponent(
      () => import("@/components/market/GmPriceImpact.vue")
    ),
    SlippagePopup: defineAsyncComponent(
      () => import("@/components/popups/SlippagePopup.vue")
    ),
    Toggle: defineAsyncComponent(() => import("@/components/ui/Toggle.vue")),
    Warning: defineAsyncComponent(
      () => import("@/components/ui/info/Warning.vue")
    ),
  },
};
</script>

<style lang="scss" scoped>
.deleverage-block {
  gap: 16px;
  display: flex;
  flex-direction: column;
}

.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.title-wrap {
  gap: 16px;
  display: flex;
  align-items: center;
}

.title {
  font-size: 18px;
  font-weight: 500;
  line-height: 150%;
}

.subtitle {
  color: #878b93;
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
}

.dynamic-wrap {
  border-radius: 8px;
  border: 1px solid #2d4a96;
  background: linear-gradient(
    90deg,
    rgba(45, 74, 150, 0.12) 0%,
    rgba(116, 92, 210, 0.12) 100%
  );
  padding: 5px 12px;
}

.warning-wrap {
  padding: 4px 8px;
  cursor: pointer;
}
</style>
