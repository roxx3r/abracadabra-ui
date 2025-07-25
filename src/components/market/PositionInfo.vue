<template>
  <div class="position-info">
    <h3 class="title">Open Position</h3>

    <div class="position-info-item">
      <img
        class="icon-left-top"
        src="@/assets/images/market/m-icon.svg"
        alt=""
      />
      <h4 class="item-title">
        Collateral Deposit
        <TooltipIcon
          :width="20"
          :height="20"
          fill="#878B93"
          tooltip="Total amount of Collateral Deposited in the Cauldron."
        />
      </h4>
      <p class="item-value">
        <img
          class="token-icon"
          :src="cauldron.config.icon"
          alt="Collateral icon"
        />
        {{
          formatAmount(expectedPosition.collateralAmount, collateralDecimals)
        }}
      </p>
      <p class="item-price">
        $
        {{ formatAmount(expectedCollateralInUsd, collateralDecimals) }}
      </p>
    </div>

    <div :class="['position-info-item', { 'bera-item': isBeraDesign }]">
      <img
        class="icon-right-center"
        src="@/assets/images/market/m-icon.svg"
        alt=""
      />
      <img
        v-if="isBeraDesign"
        class="bera-repay"
        src="@/assets/images/market/bera/repay-icon.png"
        alt=""
      />

      <h4 class="item-title">
        MIM to Repay
        <TooltipIcon
          :width="20"
          :height="20"
          fill="#878B93"
          tooltip="Amount of MIM minted from the cauldron."
        />
      </h4>
      <p class="item-value">
        <img
          class="token-icon"
          src="@/assets/images/tokens/MIM.png"
          alt="Mim icon"
        />
        {{ formatAmount(expectedPosition.mimAmount) }}
      </p>
    </div>

    <div
      :class="[
        'position-info-item',
        'liquidation-price',
        expectedPosition.positionHealth.status,
      ]"
    >
      <img
        class="icon-left-bottom"
        src="@/assets/images/market/m-icon.svg"
        alt=""
      />
      <img
        class="icon-right-top"
        src="@/assets/images/market/m-icon.svg"
        alt=""
      />

      <img
        v-if="isBeraDesign"
        class="bera-liquidation"
        src="@/assets/images/market/bera/liquidation-icon.png"
        alt=""
      />

      <div class="position-health">
        {{ expectedPosition.positionHealth.status }}
      </div>
      <h4 class="item-title">
        Liquidation Price
        <TooltipIcon
          :width="20"
          :height="20"
          fill="#878B93"
          tooltip="Collateral Price at which your deposited collateral is eligible for liquidation."
        />
      </h4>
      <p class="item-value">
        $ {{ formatAmount(expectedPosition.liquidationPrice) }}
      </p>
    </div>

    <div class="position-info-item">
      <img
        class="icon-right-center"
        src="@/assets/images/market/m-icon.svg"
        alt=""
      />
      <h4 class="item-title">
        Current Price
        <TooltipIcon
          :width="20"
          :height="20"
          fill="#878B93"
          tooltip="Collateral price."
        />
      </h4>
      <p class="item-value">
        <img class="token-icon" :src="cauldron.config.icon" alt="Mim icon" /> 1
        = $ {{ formatAmount(collateralPrice, collateralDecimals) }}
      </p>
    </div>
  </div>
</template>

<script lang="ts">
import { formatUnits, parseUnits } from "viem";
import { formatTokenBalance } from "@/helpers/filters";
import { defineAsyncComponent, type PropType } from "vue";
import { getAlternativeExpectedPostition } from "@/helpers/cauldron/getExpectedPosition";

type ExpectedPosition = {
  collateralAmount: bigint;
  mimAmount: bigint;
  liquidationPrice: bigint;
  positionHealth: {
    percent: bigint;
    status: string;
  };
};

export default {
  props: {
    cauldron: {
      type: Object as any,
    },
    actionConfig: {
      type: Object as any,
    },
    actionType: {
      type: String,
      default: "borrow",
    },
  },
  computed: {
    isBeraDesign() {
      return !!this.cauldron.config.cauldronSettings?.isBeraDesign;
    },

    collateralDecimals(): number {
      return this.cauldron.config.collateralInfo.decimals;
    },

    expectedPosition(): ExpectedPosition {
      return getAlternativeExpectedPostition(
        this.cauldron,
        this.actionConfig,
        this.actionType
      );
    },

    collateralPrice(): bigint {
      return this.cauldron.mainParams.collateralPrice;
    },

    expectedCollateralInUsd(): bigint {
      return (
        BigInt(this.expectedPosition.collateralAmount * this.collateralPrice) /
        parseUnits("1", this.collateralDecimals)
      );
    },
  },

  methods: {
    formatAmount(value: bigint, decimals = 18): string | number {
      return formatTokenBalance(formatUnits(value, decimals));
    },
  },

  components: {
    TooltipIcon: defineAsyncComponent(
      () => import("@/components/ui/icons/Tooltip.vue")
    ),
  },
};
</script>

<style lang="scss" scoped>
.position-info {
  max-width: 410px;
  padding: 24px;
  width: 100%;
  // max-height: 577px;
  display: flex;
  gap: 16px;
  flex-direction: column;
  justify-content: space-between;
  border-radius: 16px;
  border: 1px solid #00296b;
  background: linear-gradient(
    146deg,
    rgba(0, 10, 35, 0.07) 0%,
    rgba(0, 80, 156, 0.07) 101.49%
  );
  box-shadow: 0px 4px 32px 0px rgba(103, 103, 103, 0.14);
  backdrop-filter: blur(12.5px);
}

.title {
  text-align: left;
  font-size: 18px;
  font-weight: 500;
  line-height: 150%;
}

.position-info-item {
  width: 100%;
  padding: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  border-radius: 16px;
  border: 1px solid #00296b;
  background: linear-gradient(
    146deg,
    rgba(0, 10, 35, 0.07) 0%,
    rgba(0, 80, 156, 0.07) 101.49%
  );
  box-shadow: 0px 4px 32px 0px rgba(103, 103, 103, 0.14);
  backdrop-filter: blur(12.5px);
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.bera-item {
  padding-left: 30px;
}

.liquidation-price {
  padding-top: 24px;
}

.icon-left-top {
  position: absolute;
  top: 17px;
  left: -11px;
}

.icon-left-bottom {
  position: absolute;
  top: 86px;
  left: 0;
}
.icon-right-center {
  position: absolute;
  top: 65px;
  right: -21px;
}

.bera-repay {
  position: absolute;
  top: 0;
  left: 0;
  width: 114px;
  height: 114px;
}

.bera-liquidation {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 90px;
}

.icon-right-top {
  position: absolute;
  top: 13px;
  right: -13px;
}

.item-title {
  color: #99a0b2;
  text-align: center;
  font-weight: 500;
  line-height: 150%;
  display: flex;
  gap: 4px;
  align-items: center;
  justify-content: center;
}

.item-value {
  text-align: center;
  font-size: 32px;
  font-weight: 500;
  line-height: 150%;
  display: flex;
  gap: 4px;
  align-items: center;
  justify-content: center;
}

.token-icon {
  width: 32px;
  height: 32px;
}

.item-price {
  color: #878b93;
  text-align: center;
  font-size: 14px;
  font-weight: 500;
  line-height: 150%;
}

.position-health {
  position: absolute;
  top: 0;
  left: 0;
  padding: 3px 5px;
  min-width: 86px;
  text-align: center;
  border-radius: 16px 0px;
  background: #67a069;
  font-size: 14px;
  line-height: 150%;
  color: #fff;
  text-transform: capitalize;
  transition: all 0.3s ease;
}

.safe {
  border: 1px solid rgba(103, 160, 105, 0.7);

  .item-value {
    color: #67a069;
  }
}

.medium {
  border: 1px solid rgba(167, 131, 0, 0.7);

  .item-value {
    color: #a78300;
  }

  .position-health {
    background: #a78300;
  }
}

.high {
  border: 1px solid rgba(140, 64, 64, 0.5);

  .item-value {
    color: #8c4040;
  }

  .position-health {
    background: #8c4040;
  }
}

@media screen and (max-width: 1024px) {
  .position-info {
    max-width: 640px;
    width: 100%;
  }
}

@media screen and (max-width: 600px) {
  .position-info-item {
    padding: 20px;
    height: auto;
  }

  .liquidation-price {
    padding-top: 40px;
  }

  .item-title {
    font-size: 14px;
  }

  .item-value {
    font-size: 28px;
  }

  .token-icon {
    width: 28px;
    height: 28px;
  }

  .item-price {
    font-size: 16px;
  }

  .bera-liquidation,
  .bera-repay {
    z-index: -1;
  }
}
</style>
