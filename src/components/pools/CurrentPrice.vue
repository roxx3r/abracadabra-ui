<template>
  <RowSkeleton v-if="isLoading" max-width="100%" height="24px" />
  <div class="current-price" v-else-if="isSelectedTokens">
    <SwapIcon pointer fill="#7088CC" @click="toggle = !toggle" />
    <span
      >1 {{ fromTokenName }} = {{ tokensRateToShow }} {{ toTokenName }}</span
    >
    <span class="value-usd" v-if="showTokensRate">({{ price }})</span>
  </div>
  <div class="empty" v-else></div>
</template>

<script lang="ts">
import { defineAsyncComponent, type Prop } from "vue";
import { formatToFixed, formatUSD } from "@/helpers/filters";
import { formatUnits } from "viem";
type Token = {
  config: {
    contract: { address: string; abi: any };
    decimals: number;
    icon: string;
    name: string;
  };
  price: number;
  userInfo: {
    balance: bigint;
    allownce: bigint;
  };
};

const RATE_PRECISION = 4;

export default {
  props: {
    fromToken: Object as Prop<Token | any>,
    toToken: Object as Prop<Token | any>,
    currentPriceInfo: {
      default: () => ({
        midPrice: 0,
        amounts: { from: 0n, to: 0n },
        fromBase: false,
      }),
    },
    isLoading: Boolean,
  },

  data() {
    return {
      toggle: false,
    };
  },

  computed: {
    isSelectedTokens() {
      if (!this.toToken || !this.fromToken) return false;
      const { name: toTokenName } = this.toToken.config;
      const { name: fromTokenName } = this.fromToken.config;
      return ![toTokenName, fromTokenName].includes("Select Token");
    },

    tokensRateByDefelLama() {
      return this.fromToken.price / this.toToken.price;
    },

    tokensRate() {
      const { midPrice, fromBase } = this.currentPriceInfo;
      const { from, to } = this.currentPriceInfo.amounts;

      const parsedFromAmount = formatUnits(
        from,
        this.fromToken.config.decimals
      );
      const parsedToAmount = formatUnits(to, this.toToken.config.decimals);

      if (from > 0n && to > 0n) {
        return Number(parsedToAmount) / Number(parsedFromAmount);
      }

      if (midPrice === 0) return this.tokensRateByDefelLama;

      const rate = fromBase ? midPrice : 1 / midPrice;
      return rate;
    },

    tokensRateToShow() {
      return this.toggle
        ? formatToFixed(1 / this.tokensRate, RATE_PRECISION)
        : formatToFixed(this.tokensRate, RATE_PRECISION);
    },

    fromTokenName() {
      return this.toggle
        ? this.toToken.config.name
        : this.fromToken.config.name;
    },
    toTokenName() {
      return this.toggle
        ? this.fromToken.config.name
        : this.toToken.config.name;
    },

    price() {
      return this.toggle
        ? formatUSD((1 / this.tokensRate) * this.fromToken.price)
        : formatUSD(this.tokensRate * this.toToken.price);
    },

    showTokensRate() {
      return this.toggle ? !!this.fromToken.price : !!this.toToken.price;
    },
  },

  methods: {
    formatUSD,
  },

  components: {
    SwapIcon: defineAsyncComponent(
      () => import("@/components/ui/icons/SwapIcon.vue")
    ),
    RowSkeleton: defineAsyncComponent(
      () => import("@/components/ui/skeletons/RowSkeleton.vue")
    ),
  },
};
</script>

<style lang="scss" scoped>
.current-price {
  gap: 4px;
  display: flex;
  align-items: center;
  color: #878b93;
  font-weight: 500;
  line-height: normal;
}

.value-usd {
  color: #575c62;
  font-weight: 400;
  line-height: normal;
}

.empty {
  height: 24px;
}
</style>
